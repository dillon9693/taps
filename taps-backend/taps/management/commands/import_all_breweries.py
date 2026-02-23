from typing import Any

from django.core.management import call_command
from django.core.management.base import BaseCommand

from taps.management.commands.import_brewery_data import STATE_ABBR_TO_FILENAME


class Command(BaseCommand):
    help = "Imports brewery data from OpenBreweryDB for all US states and DC"

    def handle(self, *args: Any, **options: Any) -> None:
        states = list(STATE_ABBR_TO_FILENAME.keys())
        total = len(states)

        self.stdout.write(f"Starting brewery import for all {total} states + DC\n")

        for i, state in enumerate(states, start=1):
            self.stdout.write(f"\n[{i}/{total}] Importing {state}...")
            call_command("import_brewery_data", state=state, stdout=self.stdout)

        self.stdout.write(self.style.SUCCESS("\nFinished importing all breweries."))
