import csv
import io
import urllib.request
import requests

from django.core.management.base import BaseCommand

from taps.models import Brewery, BrewerySource

MA_URL = "https://raw.githubusercontent.com/openbrewerydb/openbrewerydb/refs/heads/master/data/united-states/massachusetts.csv"


class Command(BaseCommand):
    help = "Imports brewery data from OpenBreweryDB"

    def handle(self, *args, **kwargs):
        self.stdout.write("Importing data!")

        # TODO arguments for specific data (or all data)
        contents = urllib.request.urlopen(MA_URL).read().decode("utf-8")
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

            invalid_reasons = self.validate_brewery(row)
            if len(invalid_reasons) > 0:
                self.stdout.write(
                    f'Skipping brewery "{row["name"]}" b/c invalid. Reasons: {", ".join(invalid_reasons)} '
                )
                breweries_invalid.append(brewery_raw)
                continue

            brewery, created = Brewery.objects.get_or_create(
                external_id=row["id"],
                defaults={
                    "name": row["name"],
                    "location": f"{row['city']}, {row['state_province']}",
                    "address_1": row["address_1"],
                    "address_2": row["address_2"],
                    "city": row["city"],
                    "state_province": row["state_province"],
                    "postal_code": row["postal_code"],
                    "country": row["country"],
                    "longitude": row["longitude"] if row["longitude"] else None,
                    "latitude": row["latitude"] if row["latitude"] else None,
                    "phone": row["phone"],
                    "website": row["website_url"],
                    "external_id": row["id"],
                    "external_source": BrewerySource.OPEN_BREWERY_DB,
                },
            )

            # TODO handle data updates?

            if created:
                breweries_created.append(brewery_raw)
            else:
                breweries_existing.append(brewery_raw)

        self.stdout.write(
            f"Total processed: {len(breweries_created) + len(breweries_existing) + len(breweries_invalid)}"
        )
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
