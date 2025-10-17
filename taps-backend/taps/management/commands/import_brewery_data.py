import csv
import io

import requests
from django.core.management.base import BaseCommand

from taps.models import Brewery, BrewerySource

OBDB_USA_URL_PREFIX = "https://raw.githubusercontent.com/openbrewerydb/openbrewerydb/refs/heads/master/data/united-states"

STATE_ABBR_TO_FILENAME = {
    "AL": "alabama.csv",
    "AK": "alaska.csv",
    "AZ": "arizona.csv",
    "AR": "arkansas.csv",
    "CA": "california.csv",
    "CO": "colorado.csv",
    "CT": "connecticut.csv",
    "DE": "delaware.csv",
    "DC": "district-of-columbia.csv",
    "FL": "florida.csv",
    "GA": "georgia.csv",
    "HI": "hawaii.csv",
    "ID": "idaho.csv",
    "IL": "illinois.csv",
    "IN": "indiana.csv",
    "IA": "iowa.csv",
    "KS": "kansas.csv",
    "KY": "kentucky.csv",
    "LA": "louisiana.csv",
    "ME": "maine.csv",
    "MD": "maryland.csv",
    "MA": "massachusetts.csv",
    "MI": "michigan.csv",
    "MN": "minnesota.csv",
    "MS": "mississippi.csv",
    "MO": "missouri.csv",
    "MT": "montana.csv",
    "NE": "nebraska.csv",
    "NV": "nevada.csv",
    "NH": "new-hampshire.csv",
    "NJ": "new-jersey.csv",
    "NM": "new-mexico.csv",
    "NY": "new-york.csv",
    "NC": "north-carolina.csv",
    "ND": "north-dakota.csv",
    "OH": "ohio.csv",
    "OK": "oklahoma.csv",
    "OR": "oregon.csv",
    "PA": "pennsylvania.csv",
    "RI": "rhode-island.csv",
    "SC": "south-carolina.csv",
    "SD": "south-dakota.csv",
    "TN": "tennessee.csv",
    "TX": "texas.csv",
    "UT": "utah.csv",
    "VT": "vermont.csv",
    "VA": "virginia.csv",
    "WA": "washington.csv",
    "WV": "west-virginia.csv",
    "WI": "wisconsin.csv",
    "WY": "wyoming.csv",
}


class Command(BaseCommand):
    help = "Imports brewery data from OpenBreweryDB"

    def add_arguments(self, parser):
        parser.add_argument(
            "--state",
            required=True,
            choices=STATE_ABBR_TO_FILENAME.keys(),
            help="State to import data for",
        )

    def handle(self, *args, **options):
        state = options["state"]
        obdb_filename = STATE_ABBR_TO_FILENAME.get(state)
        if not obdb_filename:
            self.stderr.write("Invalid state code passed")
            return

        import_url = f"{OBDB_USA_URL_PREFIX}/{obdb_filename}"

        self.stdout.write(f"\nStarting data import for {state} from {import_url}!\n")

        contents = requests.get(import_url).text
        total_count = contents.count("\n") - 1

        reader = csv.DictReader(io.StringIO(contents))

        breweries_created = []
        breweries_existing = []
        breweries_invalid = []

        for row in reader:
            total_processed = (
                len(breweries_created)
                + len(breweries_existing)
                + len(breweries_invalid)
            )

            if total_processed != 0 and total_processed % 10 == 0:
                self.stdout.write(f"Processed {total_processed} / {total_count}...")

            brewery_raw = {"external_id": row["id"], "name": row["name"]}

            exists = Brewery.objects.filter(external_id=row["id"]).exists()
            if exists:
                # TODO handle data updates?
                breweries_existing.append(brewery_raw)
                continue

            invalid_reasons = self.validate_brewery(row)
            if len(invalid_reasons) > 0:
                self.stdout.write(
                    f'Skipping brewery "{row["name"]}" b/c invalid. Reasons: {", ".join(invalid_reasons)}',  # noqa: E501
                )
                breweries_invalid.append(brewery_raw)
                continue

            Brewery.objects.create(
                name=row["name"],
                location=f"{row['city']}, {row['state_province']}",
                address_1=row["address_1"],
                address_2=row["address_2"],
                city=row["city"],
                state_province=row["state_province"],
                postal_code=row["postal_code"],
                country=row["country"],
                longitude=row["longitude"] if row["longitude"] else None,
                latitude=row["latitude"] if row["latitude"] else None,
                phone=row["phone"],
                website=row["website_url"],
                external_id=row["id"],
                external_source=BrewerySource.OPEN_BREWERY_DB,
            )

            breweries_created.append(brewery_raw)

        total_processed = (
            len(breweries_created) + len(breweries_existing) + len(breweries_invalid)
        )
        self.stdout.write(f"Total processed: {total_processed}")
        self.stdout.write(f"Total created: {len(breweries_created)}")
        self.stdout.write(f"Total existing: {len(breweries_existing)}")
        self.stdout.write(f"Total invalid: {len(breweries_invalid)}")

    def validate_brewery(self, brewery_row):
        """Performs validations on raw brewery data before inserting."""
        invalid_reasons = []

        website_url = brewery_row["website_url"]

        if not website_url:
            invalid_reasons.append("no_website_url")
        else:
            # Check if website loads
            try:
                requests.get(brewery_row["website_url"], timeout=10)
            except (
                requests.exceptions.ConnectionError,
                requests.exceptions.ReadTimeout,
            ):
                invalid_reasons.append("website_not_loading")

        return invalid_reasons
