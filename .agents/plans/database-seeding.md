**Date created:** 2026-02-23
**Date updated:** 2026-02-23

# Description

Populate the production database with real beer data and set up a mechanism to
periodically refresh brewery data as new entries are added to OpenBreweryDB.

Currently the database has a small number of handcrafted beers from
`add_sample_data.py`. The goal is to seed meaningful beer data at scale.

**Github issue:** https://github.com/dillon9693/taps/issues/52

# Data Sources

## Breweries (existing, scale-out needed)

OpenBreweryDB is already integrated via `import_brewery_data`. The command
currently runs per-state on demand. All 50 states + DC should be imported to
maximise brewery coverage for beer matching.

## Beers (new — Kaggle seed dataset)

**Primary source:** [Craft Beers Dataset](https://www.kaggle.com/datasets/nickhould/craft-cans)
by nickhould (~2,400 US craft beers).

Fields available: `abv`, `ibu`, `id` (external), `name`, `style`, `brewery_name`

Fields not available (will be NULL initially): `description`, `average_rating`,
`image_url`

**Acknowledged limitation:** Dataset is from 2017. Some beers may be discontinued
and some breweries may have closed. This is acceptable for initial seeding —
the app benefits from volume even if a fraction of records are stale.

**Long-term path:** Evaluate a live API (e.g. Untappd) for ongoing beer data
freshness. Out of scope for this plan.

# Changes Required

## 1. Beer model — add provenance fields

Add a `BeerSource` TextChoices enum and two nullable fields on `Beer`:

```python
class BeerSource(models.TextChoices):
    KAGGLE_CRAFT_CANS = "KAGGLE_CRAFT_CANS"

# on Beer model:
external_id = models.CharField(max_length=50, blank=True, null=True)
external_source = models.CharField(
    max_length=50, choices=BeerSource.choices, blank=True, null=True
)
```

This mirrors the existing `Brewery.external_id` / `Brewery.external_source`
pattern and enables idempotent re-runs.

Create and apply migration.

## 2. `import_all_breweries` management command

A convenience wrapper that runs `import_brewery_data` for every state in
`STATE_ABBR_TO_FILENAME`. Needed both for initial full import and for the
Railway cron refresh.

Arguments: none (imports all 50 states + DC in sequence)

## 3. `import_beer_data` management command

A new management command that reads a Kaggle CSV and seeds `Beer` records.

**Arguments:**
- `--file` (required): path to the downloaded Kaggle CSV

**Logic:**
1. Parse CSV row by row.
2. Skip row if a `Beer` with matching `external_id` already exists (idempotent).
3. Match brewery by name (case-insensitive `icontains`) against existing
   `Brewery` records. Skip the beer if no match is found (avoids creating
   orphaned or duplicate breweries).
4. Map the Kaggle `style` string to the closest `BeerStyle` enum value using
   a keyword-based lookup table (see style mapping below). Unmapped styles fall
   back to `BeerStyle.OTHER`.
5. Create the `Beer` record with `abv`, `ibu`, `name`, and the mapped style.
   Leave `description`, `average_rating`, and `image_url` as NULL.
6. Report counts: created, skipped (existing), skipped (no brewery match),
   skipped (invalid).

**Style mapping (Kaggle → BeerStyle):**

| Kaggle keywords | BeerStyle |
|---|---|
| "double" / "imperial ipa" / "dipa" | DIPA |
| "india pale ale" / " ipa" | IPA |
| "stout" | STOUT |
| "porter" | PORTER |
| "lager" | LAGER |
| "pilsner" / "pilsen" | PILSNER |
| "wheat" / "witbier" / "hefeweizen" | WHEAT |
| "sour" / "gose" / "lambic" | SOUR |
| anything else | OTHER |

## 4. Railway cron job — monthly brewery refresh

Configure a Railway cron service to run `import_all_breweries` on a monthly
schedule (e.g. first of the month at 02:00 UTC):

```
0 2 1 * *  python manage.py import_all_breweries
```

This re-fetches the OpenBreweryDB CSVs and creates any new breweries added
since the last run. Existing breweries are skipped (idempotent).

Beer data from Kaggle is static and does not need periodic refresh under this
plan.

## 5. One-time production seed

Run the following in sequence (via `docker compose exec` locally or Railway
console in production):

```bash
# 1. Import all US breweries (~11,000 records; takes several minutes)
python manage.py import_all_breweries

# 2. Download craft-cans.csv from Kaggle and import beers
python manage.py import_beer_data --file /path/to/craft-cans.csv
```

# Risks & Considerations

- **Brewery name matching**: Kaggle brewery names often differ slightly from
  OpenBreweryDB names (e.g. "Anheuser-Busch" vs "Anheuser Busch Inc"). Beers
  whose brewery can't be matched will be skipped — this may reduce coverage.
  A fuzzy-match pass could recover some skipped beers but is out of scope for
  v1.
- **Style enum coverage**: The current `BeerStyle` enum has 9 values. Kaggle
  uses ~100 style strings. The keyword-based mapping will catch the most common
  styles; less common ones fall to `OTHER`.
- **Stale data**: The Kaggle dataset is from 2017. Some beers and breweries
  will no longer exist. This is acceptable for a discovery app at this stage.
- **Import runtime**: Importing all 50 states of brewery data makes ~50 HTTP
  requests and validates each brewery website (10s timeout). Expect a runtime
  of 30–60+ minutes for a full brewery import. Consider disabling website
  validation for the `import_all_breweries` command or adding a `--skip-validation`
  flag if runtime becomes a blocker.
- **Railway cron costs**: Railway cron services count against usage minutes.
  Monthly runs should be well within free tier limits.

# Alternatives

## A. Punk API instead of Kaggle

BrewDog's Punk API is free, well-structured, and easy to integrate (~325
beers). Rejected because all beers are from a single brewery (BrewDog), which
limits the discovery value of the app.

## B. Scraping brewery websites

Pairing each imported brewery with beers scraped from their own site would
give high data quality and freshness. Rejected for v1 because of high
maintenance burden, ToS ambiguity, and engineering complexity.

## C. GitHub Actions scheduled workflow instead of Railway cron

A `schedule:` workflow in `.github/workflows/` could trigger `import_all_breweries`
via a Railway deploy hook. Rejected in favour of Railway cron because Railway
cron is simpler (no extra secrets/tokens), keeps deployment concerns on the
platform, and doesn't require a GitHub dependency.
