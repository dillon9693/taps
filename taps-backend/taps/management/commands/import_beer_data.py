import csv
from typing import Any

from django.core.management.base import BaseCommand, CommandParser

from taps.models import Beer, BeerSource, Brewery

STYLE_MAPPING: list[tuple[list[str], str]] = [
    (["double", "imperial ipa", "dipa"], "DIPA"),
    (["india pale ale", " ipa"], "IPA"),
    (["stout"], "STOUT"),
    (["porter"], "PORTER"),
    (["lager"], "LAGER"),
    (["pilsner", "pilsen"], "PILSNER"),
    (["wheat", "witbier", "hefeweizen"], "WHEAT"),
    (["sour", "gose", "lambic"], "SOUR"),
]


def map_style(kaggle_style: str) -> str:
    style_lower = kaggle_style.lower()
    for keywords, beer_style in STYLE_MAPPING:
        if any(kw in style_lower for kw in keywords):
            return beer_style
    return "OTHER"


class Command(BaseCommand):
    help = "Imports beer data from the Kaggle craft-cans CSV dataset"

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument(
            "--file",
            required=True,
            help="Path to the Kaggle craft-cans CSV file",
        )

    def handle(self, *args: Any, **options: Any) -> None:
        file_path: str = options["file"]

        created = 0
        skipped_existing = 0
        skipped_no_brewery = 0
        skipped_invalid = 0

        with open(file_path, newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                external_id = row.get("id", "").strip()
                name = row.get("name", "").strip()
                brewery_name = row.get("brewery_name", "").strip()
                style_raw = row.get("style", "").strip()
                abv_raw = row.get("abv", "").strip()
                ibu_raw = row.get("ibu", "").strip()

                if not name or not brewery_name:
                    skipped_invalid += 1
                    continue

                if (
                    external_id
                    and Beer.objects.filter(
                        external_id=external_id,
                        external_source=BeerSource.KAGGLE_CRAFT_CANS,
                    ).exists()
                ):
                    skipped_existing += 1
                    continue

                brewery = Brewery.objects.filter(name__icontains=brewery_name).first()
                if brewery is None:
                    skipped_no_brewery += 1
                    continue

                abv = None
                if abv_raw:
                    try:
                        abv = (
                            round(float(abv_raw) * 100, 1)
                            if float(abv_raw) <= 1
                            else round(float(abv_raw), 1)
                        )
                    except ValueError:
                        pass

                ibu = None
                if ibu_raw:
                    try:
                        ibu = int(float(ibu_raw))
                    except ValueError:
                        pass

                Beer.objects.create(
                    name=name,
                    brewery=brewery,
                    style=map_style(style_raw),
                    abv=abv,
                    ibu=ibu,
                    external_id=external_id,
                    external_source=BeerSource.KAGGLE_CRAFT_CANS,
                )
                created += 1

        self.stdout.write(f"Created: {created}")
        self.stdout.write(f"Skipped (already exists): {skipped_existing}")
        self.stdout.write(f"Skipped (no brewery match): {skipped_no_brewery}")
        self.stdout.write(f"Skipped (invalid row): {skipped_invalid}")
