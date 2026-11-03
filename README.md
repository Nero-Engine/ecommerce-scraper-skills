# Ecommerce Scraper Skills

Four Agent Skills for Claude Code and other AI agents that turn ecommerce scraper rows into answers. They run locally with fixed rules: no API key, no AI fee, zero dependencies, Node 18+.

| Skill | Give it | You get |
| --- | --- | --- |
| `price-per-unit-check` | Amazon, Walmart or grocery search rows (title and price) | Price per item, load, 100 g or 100 ml, best value per search, overpriced listings, bigger packs that cost more per unit |
| `amazon-review-trend` | Amazon review rows (date and stars) | Rating falling, slipping, steady or rising (last 90 days vs the 90 before), stars by month, repeated complaints in 1 and 2 star reviews, confidence per number |
| `winning-ads-finder` | Facebook Ad Library rows | Ads ranked by days running, copies and still live: proven winners vs ads stopped early, per advertiser summary |
| `reddit-most-recommended` | Reddit comment rows | Products and brands Reddit recommends most, by mentions, upvotes and positive vs negative mentions, with the best quote |

Each skill writes the full result as JSON and CSV next to your file and prints a short Markdown table.

## Install

Claude Code plugin:

```
/plugin marketplace add Nero-Engine/ecommerce-scraper-skills
/plugin install ecommerce-scraper-skills@nero-labs-ecommerce
```

Any agent that reads Agent Skills:

```
npx skills add Nero-Engine/ecommerce-scraper-skills
```

Or run a script yourself:

```
node skills/price-per-unit-check/scripts/unit-price.cjs examples/sample-unit-prices.json
node skills/amazon-review-trend/scripts/review-trend.cjs examples/sample-amazon-reviews.json
node skills/winning-ads-finder/scripts/winning-ads.cjs examples/sample-meta-ads.json
node skills/reddit-most-recommended/scripts/reddit-recommends.cjs examples/sample-reddit-comments.json
```

Input can be a JSON array, JSONL or CSV export. Column names are read loosely (snake_case, camelCase, nested), so rows from the common Apify scrapers work as they come. The example files use made-up brands.

## Where the rows come from

Scrape them with any Apify Store actor (Amazon search, Amazon reviews, Facebook Ad Library, Reddit), or export a sheet. If your agent already has the Apify MCP server, it can fetch the rows and hand them to these skills.

## Bigger jobs

The same rules run in the cloud, pay per result, for thousands of rows, schedules and a dataset ID straight from a scraper:

- Price per unit: https://apify.com/nerolabs/price-per-unit-calculator
- Winning ads: https://apify.com/nerolabs/winning-ads-finder
- Review trend and Reddit recommends: paid agent tools at `https://x402-agent-tools.nerolabs.workers.dev` (`/review-trend`, `/reddit-recommends`, x402)
- Reddit questions from the same threads: https://apify.com/nerolabs/reddit-questions-finder

More skills from Nero Labs: [site-check-skills](https://github.com/Nero-Engine/site-check-skills), [social-media-analytics-skills](https://github.com/Nero-Engine/social-media-analytics-skills).

## License

MIT. Made by [Nero Labs](https://apify.com/nerolabs).
