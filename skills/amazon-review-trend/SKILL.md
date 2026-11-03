---
name: amazon-review-trend
description: Reads Amazon review rows from a reviews scraper (axesso, junglee and others) or a sheet with date and star rating, and shows per product whether the star rating is falling, slipping, steady or rising over the last 90 days versus the 90 before, stars by month, drift versus the lifetime rating, and the words repeated in 1 and 2 star reviews, with a sample size and confidence on every number. Use when the user says "is this product getting worse", "review trend", "rating dropping", "what do bad reviews complain about", "Amazon complaints", "product research from reviews", or hands over Amazon review rows.
---

# Amazon review trend

Same rules as the Nero Labs paid tool `/review-trend`. Fixed rules and word counts, no AI.

## Run

```bash
node <this skill folder>/scripts/review-trend.cjs <rows.json|.jsonl|.csv> [more files]
```

Options:
- `--window-days 90`: recent window length (14 to 365), compared with the same length before it.
- `--as-of YYYY-MM-DD`: end of the recent window. Default today.
- `--low-stars 2`: reviews at or below this many stars count as complaints (1 to 3).
- `--top-words 8`: complaint phrases per product (1 to 20).
- `--top 200`: products listed, worst trend first.
- `--out <path>`, `--json`: as in the other skills.

Input: rows with a product id or title, a review date (Amazon's "Reviewed in the United States on January 8, 2026" is read) and a star rating ("4.0 out of 5 stars" is read). Try it on `examples/sample-amazon-reviews.json` (made-up products).

## Read the result

Per product: `trend` (falling at 0.5 stars down or more, slipping at 0.25, rising at 0.3 up, steady, not_enough_reviews, star_filtered_sample), `confidence` (high at 15+ reviews in each window, medium 6+, low 3+), recent and previous average stars with their review counts, `driftVsLifetime`, `complaintWords` with how many low reviews repeat each and whether it is rising, `byMonth`, and a plain `why` line. If the rows do not reach back past the earlier window, it compares the newest half with the older half and says so.

Amazon shows logged-out scrapers about 10 reviews a page and stops early on big products, so always read the review counts before acting. Scrape with sort "recent", all stars, for a fair trend; star-filtered or "top reviews" samples are flagged.

Exit 0 on success, 2 on bad input.

## Bigger jobs

For an AI agent with no install, the same rules run as the paid Nero Labs tool `POST https://x402-agent-tools.nerolabs.workers.dev/review-trend` (x402, pay per product).
