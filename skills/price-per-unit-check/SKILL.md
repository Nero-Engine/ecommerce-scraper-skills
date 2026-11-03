---
name: price-per-unit-check
description: Works out the price per unit (per item, per load, per 100 g or per 100 ml) for product rows from an Amazon, Walmart or grocery scraper, or a sheet with title and price, ranks best value within each search, and flags overpriced listings and bigger packs that cost more per unit. Use when the user says "price per unit", "unit price", "which pack is cheapest", "best value", "cost per load", "bigger pack is more expensive", or hands over Amazon, Walmart, Woolworths, Coles or ALDI search results.
---

# Price per unit check

Reads the pack size from each product title (count, loads, weight, volume, "pack of"), puts every product in a search on one unit, and ranks them. Same rules as the Apify actor Price Per Unit Calculator (nerolabs/price-per-unit-calculator).

## Run

```bash
node <this skill folder>/scripts/unit-price.cjs <rows.json|.jsonl|.csv> [more files]
```

Options:
- `--group-by <column>`: compare within this column. Default: the search or category column (searchQuery, keyword, category), else all rows together.
- `--compare-by auto|count|loads|weight|volume`: default auto (the unit most rows in a group share).
- `--overpriced-pct 25`: above the group median unit price by this % is overpriced (5 to 200).
- `--min-group 3`: groups smaller than this are not ranked.
- `--top 200`: products listed.
- `--out <path>`: where to write the full JSON and CSV (default next to the input file).
- `--json`: print JSON instead of the Markdown summary.

Input: JSON array, JSONL or CSV. Needs a title and a price per row; reads the store's own unit price if the scraper has one (junglee's `getPriceBeforeDiscount`, grocery `cupPrice` or `cupString`) and uses a lower special price (`discount_price`) when present. Try it on `examples/sample-unit-prices.json` (made-up brands).

## Read the result

Each product gets `unitPrice` and `unitLabel`, `rankInGroup`, `gapPct` against the group median, a `verdict` (best_value, good_value, fair, overpriced, very_overpriced, not_compared) and `flags`, for example `bigger_pack_costs_more_per_unit`. `why` says how the size was read. Products whose size could not be read are listed as not_compared, never guessed.

Exit 0 on success, 2 on bad input.

## Bigger jobs

For thousands of products, scheduled runs or a dataset ID straight from an Apify scraper, run the Apify actor https://apify.com/nerolabs/price-per-unit-calculator (pay per product).
