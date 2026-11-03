---
name: reddit-most-recommended
description: Ranks the products and brands that Reddit comments recommend, from Reddit scraper comment and post rows or a sheet with a text column: mentions, upvotes on those mentions, positive and negative mentions, a recommend score, model versions and the best quote. Use when the user says "what does Reddit recommend", "best X according to Reddit", "most recommended products", "which brand do people like", "Reddit product research", or hands over Reddit comment rows from a thread or search.
---

# Reddit most recommended

Fixed rules, no AI: it spots product and brand names in comments (capitalised names, model numbers, names you give it), counts who recommends and who warns against each, and weights by upvotes. Same rules as the Nero Labs paid tool `/reddit-recommends`.

## Run

```bash
node <this skill folder>/scripts/reddit-recommends.cjs <rows.json|.jsonl|.csv> [more files]
```

Options:
- `--brands "Brand A,Brand B"`: names to always look for (helps lower-case or one-word brands).
- `--ignore "word,word"`: names to drop.
- `--min-mentions 2`: drop names mentioned fewer times.
- `--include-posts`: also read post titles and bodies, not only comments.
- `--max 50`: results listed.
- `--out <path>`, `--json`: as in the other skills.

Input: rows from a Reddit scraper (`body` or `text`, `upVotes` or `score`, `dataType` comment or post). AutoModerator and bot comments are skipped. Try it on `examples/sample-reddit-comments.json` (made-up products).

## Read the result

Per name: `kind` (product or brand), `mentions`, `upvotesOnMentions`, `positive`, `negative`, `sentiment`, `recommendScore` (0 to 100), `versions` seen (for example "4"), `alsoWrittenAs`, and `topQuote` with its upvotes. Read the mention counts: a name with 2 mentions is a hint, not a verdict.

Exit 0 on success, 2 on bad input.

## Bigger jobs

For an AI agent with no install, the same rules run as the paid Nero Labs tool `POST https://x402-agent-tools.nerolabs.workers.dev/reddit-recommends` (x402, pay per comment). To pull the questions people ask in the same threads, see https://apify.com/nerolabs/reddit-questions-finder.
