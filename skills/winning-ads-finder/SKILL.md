---
name: winning-ads-finder
description: Ranks Facebook and Instagram ads from Meta Ad Library scraper rows (or a sheet with advertiser and start date) by how long each ad has run, how many copies the advertiser made and whether it is still live, so you find the proven winners a brand keeps paying for. Use when the user says "winning ads", "find winning Facebook ads", "which ads are working", "longest running ads", "spy on competitor ads", "ad library research", "dropshipping product research from ads", or hands over Facebook Ad Library rows.
---

# Winning ads finder

An ad that has run for months, in many copies, and is still live is one the advertiser keeps paying for. This skill scores that. Same rules as the Apify actor Winning Ads Finder (nerolabs/winning-ads-finder).

## Run

```bash
node <this skill folder>/scripts/winning-ads.cjs <rows.json|.jsonl|.csv> [more files]
```

Options:
- `--min-days 0`: list only ads that ran at least this many days.
- `--only-live`: list only ads still running.
- `--as-of YYYY-MM-DD`: the day to measure from. Default: the newest live ad's date in the rows (the scrape day), else today.
- `--out <path>`, `--json`: as in the other skills.

Input: rows from any Facebook Ad Library scraper (snake_case like `ad_archive_id`, `page_name`, `start_date` or camelCase), or a sheet with advertiser and startDate columns. The same ad scraped twice is merged. Try it on `examples/sample-meta-ads.json` (made-up brands).

## Read the result

Per ad: `winnerScore` (0 to 100), `tier` (proven_winner: live 30+ days or ran 90+; scaling: live with 3+ copies; promising: live 14+ days; testing: live, newer; stopped_early: stopped within 14 days; ran_a_while), `daysRunning`, `stillLive`, `copies`, `vsAdvertiserMedian` (how much longer it ran than that advertiser's typical ad), and a plain `reason`. `advertisers` sums up each brand: live ads, proven winners, median and longest days running, new ads in the last 7 and 30 days, share stopped early, top landing domains and formats.

Exit 0 on success, 2 on bad input.

## Bigger jobs

For many advertisers, scheduled runs or a dataset ID straight from an Apify Ad Library scraper, run the Apify actor https://apify.com/nerolabs/winning-ads-finder (pay per ad).
