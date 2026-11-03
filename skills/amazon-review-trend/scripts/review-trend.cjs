#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../../actors/review-trend/src/reviewtrend.ts
var DAY = 864e5;
var norm = (k) => k.toLowerCase().replace(/[^a-z0-9]/g, "");
var round = (n, d = 2) => {
  const m = 10 ** d;
  return Math.round(n * m) / m;
};
function flatten(row) {
  const out = /* @__PURE__ */ new Map();
  const walk = (v, path2, leaf, depth) => {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      if (depth > 3) return;
      for (const [k, x] of Object.entries(v)) walk(x, path2 ? path2 + "." + k : k, k, depth + 1);
      return;
    }
    if (Array.isArray(v)) return;
    const p = norm(path2), l = norm(leaf);
    if (p && !out.has(p)) out.set(p, v);
    if (l && !out.has("~" + l)) out.set("~" + l, v);
  };
  for (const [k, v] of Object.entries(row)) walk(v, k, k, 0);
  return out;
}
function pick(f, names) {
  for (const pass of [0, 1]) for (const n of names) {
    const v = f.get(pass === 0 ? norm(n) : "~" + norm(n.split(".").pop()));
    if (v !== void 0 && v !== null && v !== "") return v;
  }
  return void 0;
}
var MONTHS = {};
var monthLists = [
  "january february march april may june july august september october november december",
  "jan feb mar apr may jun jul aug sep oct nov dec",
  "enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre",
  "januar februar m\xE4rz april mai juni juli august september oktober november dezember",
  "janvier f\xE9vrier mars avril mai juin juillet ao\xFBt septembre octobre novembre d\xE9cembre",
  "gennaio febbraio marzo aprile maggio giugno luglio agosto settembre ottobre novembre dicembre",
  "janeiro fevereiro mar\xE7o abril maio junho julho agosto setembro outubro novembro dezembro",
  "januari februari maart april mei juni juli augustus september oktober november december"
];
for (const list of monthLists) list.split(" ").forEach((m, i) => {
  if (!(m in MONTHS)) MONTHS[m] = i;
});
MONTHS["sept"] = 8;
MONTHS["setiembre"] = 8;
function parseDate(v) {
  if (typeof v === "number" && Number.isFinite(v)) {
    const ms = v > 1e12 ? v : v > 1e9 ? v * 1e3 : NaN;
    return Number.isFinite(ms) ? ms : null;
  }
  if (typeof v !== "string") return null;
  const s2 = v.trim();
  let m = /(\d{4})-(\d{2})-(\d{2})/.exec(s2);
  if (m) return Date.UTC(+m[1], +m[2] - 1, +m[3]);
  m = /(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/.exec(s2);
  if (m) return Date.UTC(+m[1], +m[2] - 1, +m[3]);
  const low = s2.toLowerCase();
  m = /([a-zäéèûçãáíóú]+)\.?\s+(\d{1,2}),?\s+(\d{4})/.exec(low);
  if (m && m[1] in MONTHS) return Date.UTC(+m[3], MONTHS[m[1]], +m[2]);
  m = /(\d{1,2})\.?\s+(?:de\s+)?([a-zäéèûçãáíóú]+)\.?\s+(?:de\s+)?(\d{4})/.exec(low);
  if (m && m[2] in MONTHS) return Date.UTC(+m[3], MONTHS[m[2]], +m[1]);
  m = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s2);
  if (m) return Date.UTC(+m[3], +m[1] - 1, +m[2]);
  return null;
}
function parseStars(v) {
  let n = null;
  if (typeof v === "number") n = v;
  else if (typeof v === "string") {
    const m = /(\d(?:[.,]\d)?)/.exec(v);
    if (m) n = Number(m[1].replace(",", "."));
  }
  return n !== null && Number.isFinite(n) && n >= 1 && n <= 5 ? n : null;
}
var ASIN_RE = /\/(?:dp|gp\/product|product-reviews)\/([A-Z0-9]{10})/;
var PRODUCT_FIELDS = ["productAsin", "productOriginalAsin", "asin", "parentAsin", "product.asin", "productId", "product_id", "itemId", "sku", "gtin"];
var URL_FIELDS = ["productUrl", "product.url", "input", "url", "reviewCategoryUrl"];
var TITLE_FIELDS = ["productTitle", "productName", "product.title", "product.name", "itemName"];
var DATE_FIELDS = ["date", "reviewDate", "reviewedIn", "review_date", "publishedAt", "publishedAtDate", "createdAt", "submissionTime", "time", "datePublished"];
var STAR_FIELDS = ["ratingScore", "rating", "stars", "reviewRating", "review_rating", "starRating", "score", "reviewStars"];
var TEXT_FIELDS = ["reviewDescription", "text", "reviewText", "review_text", "body", "content", "review", "comment", "description"];
var RTITLE_FIELDS = ["reviewTitle", "review_title", "headline", "title"];
function productKey(f) {
  const id = pick(f, PRODUCT_FIELDS);
  if (typeof id === "string" && id.trim()) return id.trim();
  if (typeof id === "number") return String(id);
  for (const k of URL_FIELDS) {
    const u = pick(f, [k]);
    if (typeof u === "string") {
      const m = ASIN_RE.exec(u);
      if (m) return m[1];
    }
  }
  const t = pick(f, TITLE_FIELDS);
  return typeof t === "string" && t.trim() ? t.trim().slice(0, 200) : null;
}
function toReview(row) {
  const f = flatten(row);
  let t = null;
  for (const k of DATE_FIELDS) {
    t = parseDate(pick(f, [k]));
    if (t !== null) break;
  }
  const stars = parseStars(pick(f, STAR_FIELDS));
  if (t === null || stars === null) return null;
  const product = productKey(f) ?? "all reviews";
  const title = pick(f, TITLE_FIELDS);
  const body = pick(f, TEXT_FIELDS);
  const rt = pick(f, RTITLE_FIELDS);
  const reviewTitle = rt !== void 0 && rt !== title ? String(rt) : "";
  const fr = pick(f, ["filterByRating", "filterByStar", "filters.filterByStar", "filters.reviewerType"]);
  const filtered = typeof fr === "string" && fr.trim() !== "" && !/^all/i.test(fr.trim());
  const sortv = pick(f, ["sortStrategy", "sortBy", "sort"]);
  const vf = pick(f, ["isVerified", "verified", "verifiedPurchase", "isVerifiedPurchase"]);
  const vn = pick(f, ["isAmazonVine", "vine", "isVine"]);
  return {
    product,
    title: typeof title === "string" ? title.slice(0, 200) : null,
    t,
    stars,
    text: (reviewTitle + " . " + (typeof body === "string" ? body : "")).slice(0, 4e3),
    verified: typeof vf === "boolean" ? vf : null,
    vine: typeof vn === "boolean" ? vn : null,
    filtered,
    helpfulSort: typeof sortv === "string" && /helpful|top/i.test(sortv)
  };
}
function lifetimeOf(rows2) {
  for (const row of rows2) {
    const f = flatten(row);
    const pr = pick(f, ["productRating", "product.rating", "productStars", "averageRating", "productAverageRating", "overallRating"]);
    const cnt = pick(f, ["countRatings", "totalCategoryRatings", "totalRatings", "ratingsCount", "productRatingsCount"]);
    const ratings = typeof cnt === "number" ? cnt : typeof cnt === "string" ? Number(cnt.replace(/[^\d]/g, "")) || null : null;
    const r2 = parseStars(pr);
    if (r2 !== null) return { rating: r2, ratings, source: "row rating field" };
    const sum = row.reviewSummary;
    if (sum && typeof sum === "object") {
      const keys = [["fiveStar", 5], ["fourStar", 4], ["threeStar", 3], ["twoStar", 2], ["oneStar", 1]];
      let tot = 0, w = 0;
      for (const [k, s2] of keys) {
        const p = Number(sum[k]?.percentage ?? sum[k]);
        if (Number.isFinite(p)) {
          tot += p;
          w += p * s2;
        }
      }
      if (tot > 50) return { rating: round(w / tot, 2), ratings, source: "star percentages" };
    }
    if (ratings) return { rating: null, ratings, source: null };
  }
  return { rating: null, ratings: null, source: null };
}
var STOP = new Set("a an the and or but if then so of to in on at for from by with without about into over under than too very just also not no nor i me my mine we our you your he she it its they them their this that these those there here is are was were be been being am do does did done doing have has had having will would should could can may might must shall get got gets getting go went goes one two three all any some more most much many few other such only own same again ever still even really quite pretty thing things product item amazon buy bought buying purchase purchased order ordered review reviews star stars use used using like good great well work works worked working im ive dont didnt doesnt wont cant isnt wasnt its it's i'm don't didn't doesn't won't can't after before when what which who how why because while back now new time times day days month months year years first last make made way lot bit something anything nothing every out up down off what's that's there's let get got am pm ago another since though actually literally someone anyone everything everyone around maybe sure yes far ok okay el la los las un una unos unas y o de del en con por para que es muy no se lo le su sus al mi me pero como mas m\xE1s der die das und oder ein eine ist nicht mit f\xFCr auf ich es sie zu den dem im sehr aber auch le les des et est pas pour une dans il elle je ne qui sur au avec tr\xE8s mais du di che non per con una il gli sono ho \xE8 um uma os as e n\xE3o para com".split(/\s+/));
function tokens(text) {
  return text.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9äöüßáéíóúñçàèìòùâêôãõ' ]+/g, " ").split(/\s+/).map((w) => w.replace(/^'+|'+$/g, "")).filter((w) => w.length > 1);
}
function complaintTerms(low, titleWords, recentStart, prevStart, top) {
  const df = /* @__PURE__ */ new Map();
  low.forEach((r2, i) => {
    const w = tokens(r2.text);
    const seen = /* @__PURE__ */ new Set();
    for (let j = 0; j < w.length; j++) {
      const a = w[j];
      const okA = !STOP.has(a) && !titleWords.has(a) && !/^\d+$/.test(a) && a.length > 2;
      if (okA) seen.add(a);
      const b = w[j + 1];
      if (b && !STOP.has(b) && !STOP.has(a) && !(titleWords.has(a) && titleWords.has(b)) && !/^\d+$/.test(b) && (a.length > 2 || b.length > 2)) seen.add(a + " " + b);
    }
    for (const s2 of seen) {
      let set = df.get(s2);
      if (!set) df.set(s2, set = /* @__PURE__ */ new Set());
      set.add(i);
    }
  });
  const minDf = Math.max(2, Math.ceil(low.length * 0.08));
  let cands = [...df.entries()].filter(([, s2]) => s2.size >= minDf).map(([term, s2]) => ({ term, set: s2 }));
  const bigrams = cands.filter((c) => c.term.includes(" "));
  cands = cands.filter((c) => c.term.includes(" ") || !bigrams.some((b) => b.term.split(" ").includes(c.term) && b.set.size >= c.set.size * 0.7));
  cands.sort((x, y) => y.set.size - x.set.size || (y.term.includes(" ") ? 1 : 0) - (x.term.includes(" ") ? 1 : 0) || x.term.localeCompare(y.term));
  return cands.slice(0, top).map(({ term, set }) => {
    const idx = [...set];
    const recent = idx.filter((i) => low[i].t > recentStart).length;
    const prev = idx.filter((i) => low[i].t > prevStart && low[i].t <= recentStart).length;
    const recentLow = low.filter((r2) => r2.t > recentStart).length;
    const prevLow = low.filter((r2) => r2.t > prevStart && r2.t <= recentStart).length;
    const rising = recent >= 2 && (prevLow === 0 ? recent >= 2 && recentLow >= 3 : recent / Math.max(1, recentLow) >= prev / prevLow * 1.5 + 0.1);
    const src = low[idx[0]].text.replace(/^\s*\.\s*/, "").replace(" . ", ": ");
    const pos = src.toLowerCase().indexOf(term.split(" ")[0]);
    const start = Math.max(0, pos - 50);
    const example = (start > 0 ? "\u2026" : "") + src.slice(start, start + 130).replace(/\s+/g, " ").trim() + (src.length > start + 130 ? "\u2026" : "");
    return { term, reviews: set.size, share: round(set.size / low.length, 2), recentReviews: recent, previousReviews: prev, rising, example };
  });
}
var avg = (xs) => xs.length ? round(xs.reduce((s2, r2) => s2 + r2.stars, 0) / xs.length, 2) : null;
var lowShare = (xs, low) => xs.length ? round(xs.filter((r2) => r2.stars <= low).length / xs.length, 2) : null;
var ymd = (t) => new Date(t).toISOString().slice(0, 10);
function reviewTrends(rows2, opt = {}) {
  const windowDays = Math.min(365, Math.max(14, Math.round(opt.windowDays ?? 90)));
  const lowStars = Math.min(3, Math.max(1, Math.round(opt.lowStars ?? 2)));
  const topWords = Math.min(20, Math.max(1, Math.round(opt.topWords ?? 8)));
  const topN = Math.min(1e3, Math.max(1, Math.round(opt.topN ?? 200)));
  const asOfT = opt.asOf ? parseDate(opt.asOf) : null;
  const asOf = asOfT ?? Date.UTC((/* @__PURE__ */ new Date()).getUTCFullYear(), (/* @__PURE__ */ new Date()).getUTCMonth(), (/* @__PURE__ */ new Date()).getUTCDate()) + DAY - 1;
  const recentStart = asOf - windowDays * DAY;
  const prevStart = recentStart - windowDays * DAY;
  const byProduct = /* @__PURE__ */ new Map();
  let skipped = 0, dupes = 0;
  const seenIds = /* @__PURE__ */ new Set();
  for (const row of rows2) {
    const id = typeof row.reviewId === "string" ? row.reviewId : typeof row.id === "string" ? row.id : null;
    if (id) {
      if (seenIds.has(id)) {
        dupes++;
        continue;
      }
      seenIds.add(id);
    }
    const r2 = toReview(row);
    if (!r2) {
      skipped++;
      continue;
    }
    let g = byProduct.get(r2.product);
    if (!g) byProduct.set(r2.product, g = { reviews: [], rows: [] });
    g.reviews.push(r2);
    g.rows.push(row);
  }
  const products = [...byProduct.entries()].map(([product, { reviews, rows: prow }]) => {
    reviews.sort((a2, b2) => b2.t - a2.t);
    const title = reviews.find((r2) => r2.title)?.title ?? null;
    const titleWords = new Set(tokens(title ?? product).filter((w) => w.length > 2));
    const life = lifetimeOf(prow);
    const filtered = reviews.some((r2) => r2.filtered);
    const helpfulSort = reviews.every((r2) => r2.helpfulSort);
    const recent = reviews.filter((r2) => r2.t > recentStart && r2.t <= asOf);
    const prev = reviews.filter((r2) => r2.t > prevStart && r2.t <= recentStart);
    let method = "none";
    let a = [], b = [];
    if (recent.length >= 3 && prev.length >= 3) {
      method = "windows";
      a = recent;
      b = prev;
    } else if (reviews.length >= 6) {
      method = "halves";
      const h = Math.floor(reviews.length / 2);
      a = reviews.slice(0, h);
      b = reviews.slice(h);
    }
    const recentAvg = avg(a), prevAvg = avg(b);
    const change = recentAvg !== null && prevAvg !== null ? round(recentAvg - prevAvg, 2) : null;
    const nMin = Math.min(a.length, b.length);
    const confidence = filtered ? "none" : nMin >= 15 ? "high" : nMin >= 6 ? "medium" : nMin >= 3 ? "low" : "none";
    let trend = "not_enough_reviews";
    if (filtered) trend = "star_filtered_sample";
    else if (change !== null && nMin >= 3) trend = change <= -0.5 ? "falling" : change <= -0.25 ? "slipping" : change >= 0.3 ? "rising" : "steady";
    const recentForDrift = method === "windows" ? recent : a;
    const driftAvg = avg(recentForDrift);
    const drift = !filtered && life.rating !== null && driftAvg !== null && recentForDrift.length >= 3 ? round(driftAvg - life.rating, 2) : null;
    const monthsMap = /* @__PURE__ */ new Map();
    for (const r2 of reviews) {
      const k = ymd(r2.t).slice(0, 7);
      let m = monthsMap.get(k);
      if (!m) monthsMap.set(k, m = []);
      m.push(r2);
    }
    const byMonth = [...monthsMap.entries()].sort((x, y) => y[0].localeCompare(x[0])).slice(0, 12).map(([month, xs]) => ({ month, reviews: xs.length, avgStars: filtered ? null : avg(xs), lowShare: filtered ? null : lowShare(xs, lowStars) }));
    const lows = reviews.filter((r2) => r2.stars <= lowStars);
    const complaints = lows.length >= 2 ? complaintTerms(lows, titleWords, recentStart, prevStart, topWords) : [];
    const rising = complaints.filter((c) => c.rising).map((c) => c.term);
    const verifiedShare = reviews.some((r2) => r2.verified !== null) ? round(reviews.filter((r2) => r2.verified).length / reviews.length, 2) : null;
    const vineShare = reviews.some((r2) => r2.vine !== null) ? round(reviews.filter((r2) => r2.vine).length / reviews.length, 2) : null;
    const flags2 = [];
    if (filtered) flags2.push("star_filtered_sample: rows were scraped with a star filter, so averages are not shown; scrape all stars for a trend");
    if (helpfulSort) flags2.push("top_reviews_sort: rows are Amazon top reviews, not newest; scrape with sort recent for a fair trend");
    if (drift !== null && drift <= -0.7) flags2.push("recent_far_below_lifetime");
    if (life.ratings && reviews.length < 30 && life.ratings > 1e3) flags2.push("small_sample_of_big_product: Amazon shows scrapers few reviews when logged out; read the counts before acting");
    if (reviews[0] && asOf - reviews[0].t > 120 * DAY) flags2.push("no_review_in_120_days");
    if (vineShare !== null && vineShare >= 0.3) flags2.push("many_vine_reviews");
    const span = `${a.length} reviews`;
    let why;
    if (filtered) why = `Rows were scraped with a star filter, so stars are not averaged. Complaint words from ${lows.length} low reviews only.`;
    else if (trend === "not_enough_reviews") why = `Only ${reviews.length} dated reviews read; scrape more with sort recent for a trend.`;
    else {
      const w = method === "windows" ? `last ${windowDays} days` : "newest half";
      why = `${trend === "falling" ? "Falling" : trend === "slipping" ? "Slipping" : trend === "rising" ? "Rising" : "Steady"}: ${recentAvg} stars in the ${w} (${span}) vs ${prevAvg} before (${b.length})`;
      if (life.rating !== null) why += `, lifetime ${life.rating}`;
      why += ".";
      if (complaints.length) why += ` 1 and 2 star reviews repeat: ${complaints.slice(0, 3).map((c) => `'${c.term}' (${c.reviews})`).join(", ")}.`;
      if (rising.length) why += ` Rising: ${rising.slice(0, 3).map((t) => `'${t}'`).join(", ")}.`;
    }
    const score = trend === "falling" ? 3 : trend === "slipping" ? 2 : 0;
    return {
      product,
      title,
      reviewsRead: reviews.length,
      newestReview: ymd(reviews[0].t),
      oldestReview: ymd(reviews[reviews.length - 1].t),
      lifetimeRating: life.rating,
      lifetimeRatings: life.ratings,
      trend,
      confidence,
      comparedBy: method,
      recentAvgStars: recentAvg,
      recentReviews: a.length,
      previousAvgStars: prevAvg,
      previousReviews: b.length,
      change,
      driftVsLifetime: drift,
      recentLowShare: filtered ? null : lowShare(a, lowStars),
      previousLowShare: filtered ? null : lowShare(b, lowStars),
      lowStarReviews: lows.length,
      complaintWords: complaints,
      risingComplaints: rising,
      byMonth,
      verifiedShare,
      vineShare,
      flags: flags2,
      why,
      _rank: score * 10 + (change !== null ? -change : 0) + (drift !== null && drift < 0 ? -drift / 2 : 0)
    };
  });
  products.sort((x, y) => y._rank - x._rank || y.reviewsRead - x.reviewsRead);
  const out = products.slice(0, topN).map(({ _rank, ...p }) => p);
  const count = (t) => products.filter((p) => p.trend === t).length;
  return {
    summary: {
      products: products.length,
      reviewsRead: products.reduce((s2, p) => s2 + p.reviewsRead, 0),
      rowsSkipped: skipped,
      duplicateReviews: dupes,
      windowDays,
      asOf: ymd(asOf),
      falling: count("falling"),
      slipping: count("slipping"),
      steady: count("steady"),
      rising: count("rising"),
      notEnoughReviews: count("not_enough_reviews"),
      starFiltered: count("star_filtered_sample"),
      worstProduct: products[0] && ["falling", "slipping"].includes(products[0].trend) ? products[0].product : null,
      note: "Amazon shows logged-out scrapers about 10 reviews a page and stops early on big products, so every number has its review count and a confidence label."
    },
    products: out
  };
}

// common.ts
var fs = __toESM(require("node:fs"));
var path = __toESM(require("node:path"));
function parseArgs(argv) {
  const files2 = [];
  const flags2 = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      if (eq > 0) flags2[a.slice(2, eq)] = a.slice(eq + 1);
      else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) flags2[a.slice(2)] = argv[++i];
      else flags2[a.slice(2)] = "true";
    } else files2.push(a);
  }
  return { files: files2, flags: flags2 };
}
function parseCsv(text) {
  const t = text.replace(/^﻿/, "");
  const firstLine = t.split(/\r?\n/, 1)[0] ?? "";
  const counts = [",", ";", "	", "|"].map((d) => [d, firstLine.split(d).length]);
  const delim = counts.sort((a, b) => b[1] - a[1])[0][0];
  const records = [];
  let field = "";
  let rec = [];
  let q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          field += '"';
          i++;
        } else q = false;
      } else field += c;
    } else if (c === '"') q = true;
    else if (c === delim) {
      rec.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      rec.push(field);
      field = "";
      if (rec.some((x) => x !== "")) records.push(rec);
      rec = [];
    } else field += c;
  }
  rec.push(field);
  if (rec.some((x) => x !== "")) records.push(rec);
  if (records.length === 0) return [];
  const head = records[0].map((h) => h.trim());
  return records.slice(1).map((r2) => {
    const o = {};
    head.forEach((h, j) => {
      const v = (r2[j] ?? "").trim();
      if (h === "") return;
      o[h] = v === "" ? null : /^-?\d+(\.\d+)?$/.test(v) && v.length < 16 ? Number(v) : v;
    });
    return o;
  });
}
function loadRows(files2) {
  if (files2.length === 0) fail("Give at least one file: a JSON array, JSONL or CSV export of your scraper rows.");
  const rows2 = [];
  for (const f of files2) {
    if (!fs.existsSync(f)) fail(`File not found: ${f}`);
    const text = fs.readFileSync(f, "utf8");
    const trimmed = text.trimStart();
    let items;
    if (/\.csv$|\.tsv$/i.test(f) || !/^[[{]/.test(trimmed)) items = parseCsv(text);
    else if (trimmed.startsWith("[")) items = JSON.parse(text);
    else {
      try {
        const one = JSON.parse(text);
        items = Array.isArray(one) ? one : Array.isArray(one?.items) ? one.items : Array.isArray(one?.rows) ? one.rows : [one];
      } catch {
        items = text.split(/\r?\n/).filter((l) => l.trim() !== "").map((l) => JSON.parse(l));
      }
    }
    for (const it of items) if (it && typeof it === "object" && !Array.isArray(it)) rows2.push(it);
  }
  return rows2;
}
function num(v, lo, hi, d) {
  const x = Number(v);
  return v !== void 0 && Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : d;
}
function clean(v) {
  if (typeof v === "string") return v.replace(/\s*Not charged\.?/g, "").replace(/\s*Charged once per [^.]*\./g, "").trim();
  if (Array.isArray(v)) return v.map(clean);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)]));
  return v;
}
function fail(msg) {
  process.stderr.write(`Error: ${msg}
`);
  process.exit(2);
}
function cell(v) {
  if (v === null || v === void 0) return "";
  const s2 = Array.isArray(v) ? v.map((x) => typeof x === "object" ? JSON.stringify(x) : String(x)).join("; ") : typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\n\r]/.test(s2) ? `"${s2.replace(/"/g, '""')}"` : s2;
}
function toCsv(rows2) {
  const cols = [];
  for (const r2 of rows2) for (const k of Object.keys(r2)) if (!cols.includes(k)) cols.push(k);
  return [cols.join(","), ...rows2.map((r2) => cols.map((c) => cell(r2[c])).join(","))].join("\n") + "\n";
}
function writeOutputs(firstInput, tool, result, tableRows, outFlag) {
  const base = outFlag ? outFlag.replace(/\.(json|csv)$/i, "") : path.join(path.dirname(firstInput), `${path.basename(firstInput).replace(/\.[^.]+$/, "")}.${tool}`);
  fs.writeFileSync(`${base}.json`, JSON.stringify(result, null, 2));
  fs.writeFileSync(`${base}.csv`, toCsv(tableRows));
  return { json: `${base}.json`, csv: `${base}.csv` };
}
function mdTable(rows2, cols) {
  const esc = (v) => cell(v).replace(/\|/g, "/").replace(/^"|"$/g, "").slice(0, 80);
  return [`| ${cols.join(" | ")} |`, `| ${cols.map(() => "---").join(" | ")} |`, ...rows2.map((r2) => `| ${cols.map((c) => esc(r2[c])).join(" | ")} |`)].join("\n");
}

// reviewtrend.ts
var { files, flags } = parseArgs(process.argv.slice(2));
if (flags.help) {
  console.log("Usage: node review-trend.cjs <rows.json|.jsonl|.csv> [more files] [--window-days 90] [--as-of YYYY-MM-DD] [--low-stars 2] [--top-words 8] [--top 200] [--out path] [--json]");
  process.exit(0);
}
var rows = loadRows(files);
var r = reviewTrends(rows, {
  windowDays: num(flags["window-days"], 14, 365, 90),
  asOf: flags["as-of"],
  lowStars: num(flags["low-stars"], 1, 3, 2),
  topWords: Math.round(num(flags["top-words"], 1, 20, 8)),
  topN: Math.round(num(flags.top, 1, 1e5, 200))
});
if (!r.summary.products) fail("None of the rows had a review date and a star rating. Use Amazon review scraper output (axesso, junglee and others) or a sheet with date and rating columns.");
var flat = r.products.map((p) => ({ ...p, complaintWords: (p.complaintWords ?? []).map((c) => `${c.term} (${c.reviews})`).join("; "), risingComplaints: (p.risingComplaints ?? []).join("; "), byMonth: (p.byMonth ?? []).map((m) => `${m.month}: ${m.avgStars ?? "?"} (${m.reviews})`).join("; "), flags: (p.flags ?? []).join(" | ") }));
var paths = writeOutputs(files[0], "review-trend", clean(r), flat, flags.out);
if (flags.json) {
  console.log(JSON.stringify({ summary: r.summary, products: r.products.slice(0, 25), files: paths }, null, 2));
  process.exit(0);
}
var s = r.summary;
console.log(`## Amazon review trend: ${s.products} product(s), ${s.reviewsRead} reviews read, last ${s.windowDays} days to ${s.asOf}
`);
console.log(`Falling ${s.falling}, slipping ${s.slipping}, steady ${s.steady}, rising ${s.rising}, not enough reviews ${s.notEnoughReviews}.
`);
console.log(mdTable(flat.slice(0, 15), ["product", "trend", "confidence", "recentAvgStars", "recentReviews", "previousAvgStars", "previousReviews", "complaintWords"]));
for (const p of r.products.slice(0, 5)) console.log(`
- ${p.title ?? p.product}: ${p.why}`);
console.log(`
Note: ${s.note}`);
console.log(`Full results: ${paths.json} and ${paths.csv}`);
console.log("\nFor an AI agent with no install, the same rules run as the paid Nero Labs tool POST https://x402-agent-tools.nerolabs.workers.dev/review-trend (x402, pay per product). Scrape the reviews with any Amazon reviews actor on https://apify.com/store sorted by newest.");
