import io
import tempfile
from unittest.mock import MagicMock, patch

from django.core.management import call_command
from django.test import TestCase

from taps.management.commands.import_beer_data import map_style
from taps.models import Beer, BeerSource, Brewery


class MapStyleTestCase(TestCase):
    def test_ipa_keywords(self):
        self.assertEqual(map_style("India Pale Ale"), "IPA")
        self.assertEqual(map_style("American IPA"), "IPA")

    def test_dipa_keywords(self):
        self.assertEqual(map_style("Double IPA"), "DIPA")
        self.assertEqual(map_style("Imperial IPA"), "DIPA")
        self.assertEqual(map_style("DIPA"), "DIPA")

    def test_stout(self):
        self.assertEqual(map_style("Milk Stout"), "STOUT")
        self.assertEqual(map_style("Oatmeal Stout"), "STOUT")

    def test_porter(self):
        self.assertEqual(map_style("Robust Porter"), "PORTER")

    def test_lager(self):
        self.assertEqual(map_style("American Lager"), "LAGER")

    def test_pilsner(self):
        self.assertEqual(map_style("German Pilsner"), "PILSNER")
        self.assertEqual(map_style("Bohemian Pilsen"), "PILSNER")

    def test_wheat(self):
        self.assertEqual(map_style("Hefeweizen"), "WHEAT")
        self.assertEqual(map_style("American Wheat Beer"), "WHEAT")
        self.assertEqual(map_style("Witbier"), "WHEAT")

    def test_sour(self):
        self.assertEqual(map_style("Berliner Weisse (Sour)"), "SOUR")
        self.assertEqual(map_style("Gose"), "SOUR")
        self.assertEqual(map_style("Lambic"), "SOUR")

    def test_other_fallback(self):
        self.assertEqual(map_style("Barleywine"), "OTHER")
        self.assertEqual(map_style(""), "OTHER")
        self.assertEqual(map_style("Belgian Tripel"), "OTHER")

    def test_dipa_takes_priority_over_ipa(self):
        self.assertEqual(map_style("Double India Pale Ale"), "DIPA")


class ImportBeerDataCommandTestCase(TestCase):
    def setUp(self):
        self.brewery = Brewery.objects.create(
            name="Test Brewery",
            city="Portland",
            state_province="OR",
            country="United States",
            website="https://testbrewery.com",
        )

    def _make_csv(self, rows: list[dict]) -> str:
        header = "id,abv,ibu,name,style,brewery_name\n"
        lines = [
            ",".join(
                [
                    r.get("id", ""),
                    r.get("abv", ""),
                    r.get("ibu", ""),
                    r.get("name", ""),
                    r.get("style", ""),
                    r.get("brewery_name", ""),
                ]
            )
            for r in rows
        ]
        return header + "\n".join(lines) + "\n"

    def _run_command(self, csv_content: str) -> str:
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".csv", delete=False, encoding="utf-8"
        ) as f:
            f.write(csv_content)
            tmp_path = f.name

        out = io.StringIO()
        call_command("import_beer_data", file=tmp_path, stdout=out)
        return out.getvalue()

    def test_creates_beer_with_matching_brewery(self):
        csv = self._make_csv(
            [
                {
                    "id": "1",
                    "abv": "6.5",
                    "ibu": "40",
                    "name": "Hazy IPA",
                    "style": "India Pale Ale",
                    "brewery_name": "Test Brewery",
                }
            ]
        )
        output = self._run_command(csv)
        self.assertIn("Created: 1", output)
        beer = Beer.objects.get(
            external_id="1", external_source=BeerSource.KAGGLE_CRAFT_CANS
        )
        self.assertEqual(beer.name, "Hazy IPA")
        self.assertEqual(beer.style, "IPA")
        self.assertEqual(float(beer.abv), 6.5)
        self.assertEqual(beer.ibu, 40)
        self.assertEqual(beer.brewery, self.brewery)

    def test_skips_existing_beer(self):
        Beer.objects.create(
            name="Old Beer",
            brewery=self.brewery,
            style="LAGER",
            external_id="99",
            external_source=BeerSource.KAGGLE_CRAFT_CANS,
        )
        csv = self._make_csv(
            [
                {
                    "id": "99",
                    "abv": "5.0",
                    "ibu": "",
                    "name": "Old Beer",
                    "style": "Lager",
                    "brewery_name": "Test Brewery",
                }
            ]
        )
        output = self._run_command(csv)
        self.assertIn("Skipped (already exists): 1", output)
        self.assertEqual(Beer.objects.filter(external_id="99").count(), 1)

    def test_skips_beer_with_no_brewery_match(self):
        csv = self._make_csv(
            [
                {
                    "id": "2",
                    "abv": "5.0",
                    "ibu": "",
                    "name": "Mystery Beer",
                    "style": "Lager",
                    "brewery_name": "Unknown Brewery XYZ",
                }
            ]
        )
        output = self._run_command(csv)
        self.assertIn("Skipped (no brewery match): 1", output)
        self.assertFalse(Beer.objects.filter(name="Mystery Beer").exists())

    def test_skips_row_with_missing_name(self):
        csv = self._make_csv(
            [
                {
                    "id": "3",
                    "abv": "5.0",
                    "ibu": "",
                    "name": "",
                    "style": "Lager",
                    "brewery_name": "Test Brewery",
                }
            ]
        )
        output = self._run_command(csv)
        self.assertIn("Skipped (invalid row): 1", output)

    def test_skips_row_with_missing_brewery_name(self):
        csv = self._make_csv(
            [
                {
                    "id": "4",
                    "abv": "5.0",
                    "ibu": "",
                    "name": "Some Beer",
                    "style": "Lager",
                    "brewery_name": "",
                }
            ]
        )
        output = self._run_command(csv)
        self.assertIn("Skipped (invalid row): 1", output)

    def test_abv_stored_as_decimal(self):
        csv = self._make_csv(
            [
                {
                    "id": "5",
                    "abv": "7.2",
                    "ibu": "",
                    "name": "Big Beer",
                    "style": "Stout",
                    "brewery_name": "Test Brewery",
                }
            ]
        )
        self._run_command(csv)
        beer = Beer.objects.get(external_id="5")
        self.assertEqual(float(beer.abv), 7.2)

    def test_abv_as_fraction_converted(self):
        csv = self._make_csv(
            [
                {
                    "id": "6",
                    "abv": "0.065",
                    "ibu": "",
                    "name": "Fraction Beer",
                    "style": "IPA",
                    "brewery_name": "Test Brewery",
                }
            ]
        )
        self._run_command(csv)
        beer = Beer.objects.get(external_id="6")
        self.assertEqual(float(beer.abv), 6.5)

    def test_brewery_match_is_case_insensitive(self):
        csv = self._make_csv(
            [
                {
                    "id": "7",
                    "abv": "5.0",
                    "ibu": "",
                    "name": "Case IPA",
                    "style": "IPA",
                    "brewery_name": "test brewery",
                }
            ]
        )
        output = self._run_command(csv)
        self.assertIn("Created: 1", output)

    def test_idempotent_on_second_run(self):
        csv = self._make_csv(
            [
                {
                    "id": "8",
                    "abv": "5.0",
                    "ibu": "30",
                    "name": "Idempotent IPA",
                    "style": "IPA",
                    "brewery_name": "Test Brewery",
                }
            ]
        )
        self._run_command(csv)
        output = self._run_command(csv)
        self.assertIn("Skipped (already exists): 1", output)
        self.assertEqual(Beer.objects.filter(external_id="8").count(), 1)

    def test_multiple_rows_mixed_outcomes(self):
        csv = self._make_csv(
            [
                {
                    "id": "10",
                    "abv": "5.0",
                    "ibu": "",
                    "name": "Good Beer",
                    "style": "Lager",
                    "brewery_name": "Test Brewery",
                },
                {
                    "id": "11",
                    "abv": "5.0",
                    "ibu": "",
                    "name": "No Match",
                    "style": "Lager",
                    "brewery_name": "Ghost Brewery",
                },
                {
                    "id": "12",
                    "abv": "5.0",
                    "ibu": "",
                    "name": "",
                    "style": "Lager",
                    "brewery_name": "Test Brewery",
                },
            ]
        )
        output = self._run_command(csv)
        self.assertIn("Created: 1", output)
        self.assertIn("Skipped (no brewery match): 1", output)
        self.assertIn("Skipped (invalid row): 1", output)


class ImportAllBreweriesCommandTestCase(TestCase):
    @patch("taps.management.commands.import_all_breweries.call_command")
    def test_calls_import_brewery_data_for_all_states(
        self, mock_call_command: MagicMock
    ) -> None:
        out = io.StringIO()
        call_command("import_all_breweries", stdout=out)

        from taps.management.commands.import_brewery_data import STATE_ABBR_TO_FILENAME

        expected_states = list(STATE_ABBR_TO_FILENAME.keys())
        self.assertEqual(mock_call_command.call_count, len(expected_states))

        called_states = [c.kwargs["state"] for c in mock_call_command.call_args_list]
        self.assertEqual(called_states, expected_states)

    @patch("taps.management.commands.import_all_breweries.call_command")
    def test_outputs_progress_messages(self, mock_call_command: MagicMock) -> None:
        out = io.StringIO()
        call_command("import_all_breweries", stdout=out)
        output = out.getvalue()

        self.assertIn("Starting brewery import", output)
        self.assertIn("Finished importing all breweries", output)
