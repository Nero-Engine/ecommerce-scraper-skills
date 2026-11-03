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

// ../../../actors/winning-ads-finder/src/ads.ts
var DAY = 864e5;
function norm(key) {
  return key.toLowerCase().replace(/[\s_.-]/g, "");
}
function flatKeys(row) {
  const out = /* @__PURE__ */ new Map();
  const add = (k, v) => {
    const n = norm(k);
    if (!out.has(n) && v !== void 0 && v !== null && v !== "") out.set(n, v);
  };
  for (const [k, v] of Object.entries(row)) add(k, v);
  for (const [k, v] of Object.entries(row)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      for (const [k2, v2] of Object.entries(v)) {
        add(`${k}${k2}`, v2);
        add(k2, v2);
      }
    }
  }
  return out;
}
function pick(m, keys) {
  for (const k of keys) {
    const v = m.get(norm(k));
    if (v !== void 0) return v;
  }
  return void 0;
}
function str(v) {
  if (v === void 0 || v === null) return null;
  if (typeof v === "string") return v.trim() === "" ? null : v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "object" && v && "text" in v && typeof v.text === "string") return v.text.trim() || null;
  return null;
}
function num(v) {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v.replace(/,/g, "")))) return Number(v.replace(/,/g, ""));
  return null;
}
function bool(v) {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "yes", "1", "active", "live", "running"].includes(s)) return true;
    if (["false", "no", "0", "inactive", "ended", "stopped"].includes(s)) return false;
  }
  return null;
}
function toTime(v) {
  if (v === void 0 || v === null || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) {
    if (v > 1e12) return v;
    if (v > 1e8) return v * 1e3;
    return null;
  }
  if (typeof v === "string") {
    const s = v.trim();
    if (/^\d{9,13}$/.test(s)) return toTime(Number(s));
    const t = Date.parse(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s) ? `${s.replace(" ", "T")}Z` : s);
    return Number.isNaN(t) ? null : t;
  }
  return null;
}
function domainOf(url) {
  if (!url) return null;
  try {
    let u = url;
    const wrapped = /[?&]u=([^&]+)/.exec(u);
    if (/facebook\.com\/l\.php/.test(u) && wrapped) u = decodeURIComponent(wrapped[1]);
    return new URL(u).hostname.replace(/^www\./, "").toLowerCase() || null;
  } catch {
    return null;
  }
}
function firstCard(row) {
  const snap = row.snapshot ?? {};
  const cards = Array.isArray(snap.cards) ? snap.cards : [];
  return cards.length > 0 && cards[0] && typeof cards[0] === "object" ? cards[0] : null;
}
function readAd(row, index) {
  const m = flatKeys(row);
  const advertiser = str(pick(m, ["pageName", "page_name", "snapshotpageName", "advertiserName", "advertiser", "advertiser_name", "brand", "company", "account", "pageTitle"]));
  const startMs = toTime(pick(m, ["startDate", "start_date", "adDeliveryStartTime", "ad_delivery_start_time", "firstShown", "first_shown", "firstShownDate", "startDateFormatted", "start", "launched", "firstSeen", "createdAt", "created"]));
  if (!advertiser || startMs === null) return null;
  const card = firstCard(row);
  const isActive = bool(pick(m, ["isActive", "is_active", "active", "status", "adStatus"]));
  let endMs = toTime(pick(m, ["endDate", "end_date", "adDeliveryStopTime", "ad_delivery_stop_time", "lastShown", "last_shown", "lastShownDate", "endDateFormatted", "end", "lastSeen"]));
  if (endMs !== null && endMs < startMs) endMs = null;
  const platformsRaw = pick(m, ["publisherPlatform", "publisher_platform", "publisherPlatforms", "platforms", "platform"]);
  const platforms = Array.isArray(platformsRaw) ? platformsRaw.map((p) => String(p).toLowerCase()) : typeof platformsRaw === "string" ? platformsRaw.split(/[,;|]/).map((p) => p.trim().toLowerCase()).filter(Boolean) : [];
  const landingUrl = str(pick(m, ["linkUrl", "link_url", "snapshotlinkUrl", "landingPage", "landing_page", "landingUrl", "destinationUrl", "url_link"])) ?? (card ? str(card.link_url ?? card.linkUrl) : null);
  const imp = pick(m, ["impressionsText", "impressions_text", "impressions"]);
  const spendRaw = pick(m, ["spend", "amountSpent"]);
  const snap = row.snapshot ?? {};
  const imgs = Array.isArray(snap.images) ? snap.images : [];
  const vids = Array.isArray(snap.videos) ? snap.videos : [];
  const archiveId = str(pick(m, ["adArchiveId", "ad_archive_id", "adArchiveID"]));
  const adUrl = str(pick(m, ["adLibraryUrl", "ad_library_url", "adUrl", "ad_url", "adLink", "previewUrl"])) ?? (archiveId ? `https://www.facebook.com/ads/library/?id=${archiveId}` : str(pick(m, ["url"])));
  const blob = `${adUrl ?? ""} ${str(pick(m, ["inputUrl", "source"])) ?? ""}`.toLowerCase();
  const source = /adstransparency|google/.test(blob) ? "google" : /tiktok/.test(blob) ? "tiktok" : /linkedin/.test(blob) ? "linkedin" : m.has("adarchiveid") || m.has("collationid") || /facebook/.test(blob) ? "meta" : "other";
  const spendStr = spendRaw && typeof spendRaw === "object" ? (() => {
    const s = spendRaw;
    return s.lower_bound || s.upper_bound ? `${s.lower_bound ?? "?"} to ${s.upper_bound ?? "?"}` : null;
  })() : str(spendRaw);
  return {
    adId: str(pick(m, ["adArchiveId", "ad_archive_id", "adArchiveID", "adId", "ad_id", "creativeId", "id"])) ?? `row-${index + 1}`,
    advertiser,
    advertiserId: str(pick(m, ["pageId", "page_id", "pageID", "advertiserId", "advertiser_id"])),
    creativeId: str(pick(m, ["collationId", "collation_id"])),
    startMs,
    endMs,
    isActive,
    copiesReported: num(pick(m, ["collationCount", "collation_count", "copies", "variations"])),
    platforms,
    format: str(pick(m, ["displayFormat", "display_format", "format", "adFormat", "mediaType"])),
    text: (str(pick(m, ["bodytext", "body", "adText", "ad_text", "text", "primaryText", "description"])) ?? (card ? str(card.body) : null))?.slice(0, 500) ?? null,
    headline: str(pick(m, ["title", "headline"])) ?? (card ? str(card.title) : null),
    cta: str(pick(m, ["ctaText", "cta_text", "cta", "callToAction"])),
    landingUrl,
    landingDomain: domainOf(landingUrl) ?? str(pick(m, ["caption"]))?.toLowerCase() ?? null,
    adUrl,
    impressions: imp && typeof imp === "object" ? null : str(imp),
    spend: spendStr,
    imageUrl: str(imgs[0]?.original_image_url ?? imgs[0]?.originalImageUrl ?? card?.original_image_url ?? card?.originalImageUrl ?? card?.resized_image_url ?? card?.resizedImageUrl),
    videoUrl: str(vids[0]?.video_hd_url ?? vids[0]?.videoHdUrl ?? vids[0]?.video_sd_url ?? vids[0]?.videoSdUrl ?? card?.video_hd_url ?? card?.videoHdUrl),
    source
  };
}
function median(xs) {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
function round(x, d = 1) {
  const f = 10 ** d;
  return Math.round(x * f) / f;
}
function dedupe(ads2) {
  const byId = /* @__PURE__ */ new Map();
  let duplicates2 = 0;
  for (const a of ads2) {
    const key = `${a.advertiser}|${a.adId}`;
    const prev = byId.get(key);
    if (prev) {
      duplicates2 += 1;
      if ((a.copiesReported ?? 0) > (prev.copiesReported ?? 0)) prev.copiesReported = a.copiesReported;
      if (a.endMs !== null && (prev.endMs === null || a.endMs > prev.endMs)) prev.endMs = a.endMs;
    } else byId.set(key, { ...a });
  }
  const unique2 = [...byId.values()];
  const creativeRows2 = /* @__PURE__ */ new Map();
  for (const a of unique2) if (a.creativeId) creativeRows2.set(`${a.advertiser}|${a.creativeId}`, (creativeRows2.get(`${a.advertiser}|${a.creativeId}`) ?? 0) + 1);
  return { unique: unique2, duplicates: duplicates2, creativeRows: creativeRows2 };
}
function scoreAds(ads2, creativeRows2, opt) {
  const base = ads2.map((ad) => {
    const live = ad.isActive === true || ad.isActive === null && (ad.endMs === null || opt.now - ad.endMs <= opt.activeWithin);
    const end = live ? Math.max(opt.now, ad.endMs ?? 0) : ad.endMs ?? opt.now;
    const days = Math.max(0, (end - ad.startMs) / DAY);
    const copies = Math.max(1, ad.copiesReported ?? 1, ad.creativeId ? creativeRows2.get(`${ad.advertiser}|${ad.creativeId}`) ?? 1 : 1);
    return { ad, live, days, copies };
  });
  const daysByAdv = /* @__PURE__ */ new Map();
  for (const b of base) daysByAdv.set(b.ad.advertiser, [...daysByAdv.get(b.ad.advertiser) ?? [], b.days]);
  return base.map(({ ad, live, days, copies }) => {
    const advDays = daysByAdv.get(ad.advertiser) ?? [days];
    const advMedian = median(advDays);
    const vs = advDays.length >= 3 && advMedian > 0 ? round(days / advMedian, 2) : null;
    const dayPts = Math.min(1, Math.log1p(days) / Math.log1p(180)) * 55;
    const livePts = live ? days >= 14 ? 20 : 8 : 0;
    const copyPts = Math.min(1, Math.log2(copies) / Math.log2(10)) * 15;
    const placePts = Math.min(1, ad.platforms.length / 4) * 4;
    const relPts = vs === null ? 3 : Math.min(1, Math.max(0, (vs - 0.5) / 2)) * 6;
    const score = Math.round(Math.min(100, dayPts + livePts + copyPts + placePts + relPts));
    let tier;
    if (live && days >= 30 || days >= 90) tier = "proven_winner";
    else if (live && copies >= 3) tier = "scaling";
    else if (live && days >= 14) tier = "promising";
    else if (live) tier = "testing";
    else if (days < 14) tier = "stopped_early";
    else tier = "ran_a_while";
    const d = Math.round(days);
    const bits = [`${live ? "Still live after" : "Ran for"} ${d} day${d === 1 ? "" : "s"}`];
    if (copies > 1) bits.push(`${copies} copies of this creative`);
    if (vs !== null) bits.push(`${vs}x this advertiser's median of ${Math.round(advMedian)} days`);
    if (ad.platforms.length > 0) bits.push(`on ${ad.platforms.length} placement${ad.platforms.length === 1 ? "" : "s"}`);
    const meaning = {
      proven_winner: "The advertiser keeps paying for it: treat it as a proven winner.",
      scaling: "New but already copied several times: the advertiser is scaling it.",
      promising: "Live for two weeks or more: it passed the first test.",
      testing: "Under two weeks old: still being tested.",
      stopped_early: "Switched off within two weeks: most likely a losing test.",
      ran_a_while: "Ran for a while, then stopped."
    };
    return {
      ad,
      copies,
      daysRunning: round(days, 1),
      stillLive: live,
      advertiserMedianDays: round(advMedian, 1),
      vsAdvertiserMedian: vs,
      score,
      tier,
      reason: `${bits.join(", ")}. ${meaning[tier]}`
    };
  });
}
function summarise(scored2, now2) {
  const by = /* @__PURE__ */ new Map();
  for (const s of scored2) by.set(s.ad.advertiser, [...by.get(s.ad.advertiser) ?? [], s]);
  const out = [];
  for (const [advertiser, list] of by) {
    const top = [...list].sort((a, b) => b.score - a.score)[0];
    const domains = /* @__PURE__ */ new Map();
    const formats = {};
    for (const s of list) {
      if (s.ad.landingDomain) {
        const d = domains.get(s.ad.landingDomain) ?? { ads: 0, winners: 0 };
        d.ads += 1;
        if (s.tier === "proven_winner" || s.tier === "scaling") d.winners += 1;
        domains.set(s.ad.landingDomain, d);
      }
      const f = (s.ad.format ?? "unknown").toLowerCase();
      formats[f] = (formats[f] ?? 0) + 1;
    }
    out.push({
      advertiser,
      advertiserId: list[0].ad.advertiserId,
      adsScored: list.length,
      liveAds: list.filter((s) => s.stillLive).length,
      provenWinners: list.filter((s) => s.tier === "proven_winner").length,
      medianDaysRunning: round(median(list.map((s) => s.daysRunning)), 1),
      longestRunningDays: Math.max(...list.map((s) => s.daysRunning)),
      newAdsLast7Days: list.filter((s) => now2 - s.ad.startMs <= 7 * DAY).length,
      newAdsLast30Days: list.filter((s) => now2 - s.ad.startMs <= 30 * DAY).length,
      stoppedEarlyShare: round(list.filter((s) => s.tier === "stopped_early").length / list.length, 2),
      topAdId: top?.ad.adId ?? null,
      topAdScore: top?.score ?? null,
      topAdUrl: top?.ad.adUrl ?? null,
      topLandingDomains: [...domains.entries()].map(([domain, v]) => ({ domain, ...v })).sort((a, b) => b.winners - a.winners || b.ads - a.ads).slice(0, 5),
      formats
    });
  }
  return out.sort((a, b) => b.provenWinners - a.provenWinners || b.adsScored - a.adsScored);
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
  return records.slice(1).map((r) => {
    const o = {};
    head.forEach((h, j) => {
      const v = (r[j] ?? "").trim();
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
function num2(v, lo, hi, d) {
  const x = Number(v);
  return v !== void 0 && Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : d;
}
function fail(msg) {
  process.stderr.write(`Error: ${msg}
`);
  process.exit(2);
}
function cell(v) {
  if (v === null || v === void 0) return "";
  const s = Array.isArray(v) ? v.map((x) => typeof x === "object" ? JSON.stringify(x) : String(x)).join("; ") : typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCsv(rows2) {
  const cols = [];
  for (const r of rows2) for (const k of Object.keys(r)) if (!cols.includes(k)) cols.push(k);
  return [cols.join(","), ...rows2.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n") + "\n";
}
function writeOutputs(firstInput, tool, result, tableRows, outFlag) {
  const base = outFlag ? outFlag.replace(/\.(json|csv)$/i, "") : path.join(path.dirname(firstInput), `${path.basename(firstInput).replace(/\.[^.]+$/, "")}.${tool}`);
  fs.writeFileSync(`${base}.json`, JSON.stringify(result, null, 2));
  fs.writeFileSync(`${base}.csv`, toCsv(tableRows));
  return { json: `${base}.json`, csv: `${base}.csv` };
}
function mdTable(rows2, cols) {
  const esc = (v) => cell(v).replace(/\|/g, "/").replace(/^"|"$/g, "").slice(0, 80);
  return [`| ${cols.join(" | ")} |`, `| ${cols.map(() => "---").join(" | ")} |`, ...rows2.map((r) => `| ${cols.map((c) => esc(r[c])).join(" | ")} |`)].join("\n");
}
var FUNNEL = (actor, what) => `
For ${what}, scheduled runs or a dataset ID straight from your Apify scraper, the same rules run as the Apify actor https://apify.com/nerolabs/${actor} (pay per result).`;

// winningads.ts
var DAY2 = 864e5;
var { files, flags } = parseArgs(process.argv.slice(2));
if (flags.help) {
  console.log("Usage: node winning-ads.cjs <rows.json|.jsonl|.csv> [more files] [--min-days 0] [--only-live] [--as-of YYYY-MM-DD] [--out path] [--json]");
  process.exit(0);
}
var rows = loadRows(files);
var parsed = rows.map((r, i) => readAd(r, i)).filter((a) => a !== null);
if (parsed.length === 0) fail("None of the rows had an advertiser and an ad start date. Use Facebook Ad Library scraper output, or a sheet with advertiser and startDate columns.");
var { unique, duplicates, creativeRows } = dedupe(parsed);
var now = Date.now();
var asOf = flags["as-of"] ? toTime(flags["as-of"]) : null;
if (asOf !== null) now = asOf;
else {
  const ends = unique.filter((a) => a.isActive === true && a.endMs !== null).map((a) => a.endMs);
  const newest = ends.length ? Math.max(...ends) : null;
  if (newest !== null && newest <= Date.now() + DAY2 && Date.now() - newest < 365 * DAY2) now = newest;
}
var iso = (ms) => ms === null ? null : new Date(ms).toISOString().slice(0, 10);
var scored = scoreAds(unique, creativeRows, { now, activeWithin: 2 * DAY2 }).sort((a, b) => b.score - a.score || b.daysRunning - a.daysRunning);
var minDays = num2(flags["min-days"], 0, 3650, 0);
var keep = scored.filter((s) => s.daysRunning >= minDays && (flags["only-live"] !== "true" || s.stillLive));
var ads = keep.map((s, i) => ({
  rank: i + 1,
  advertiser: s.ad.advertiser,
  winnerScore: s.score,
  tier: s.tier,
  daysRunning: s.daysRunning,
  stillLive: s.stillLive,
  copies: s.copies,
  startDate: iso(s.ad.startMs),
  endDate: s.stillLive ? null : iso(s.ad.endMs),
  vsAdvertiserMedian: s.vsAdvertiserMedian,
  reason: s.reason,
  format: s.ad.format,
  adText: s.ad.text ? s.ad.text.slice(0, 200) : null,
  cta: s.ad.cta,
  landingDomain: s.ad.landingDomain,
  adUrl: s.ad.adUrl,
  adId: s.ad.adId
}));
var tierCounts = {};
for (const s of scored) tierCounts[s.tier] = (tierCounts[s.tier] ?? 0) + 1;
var summary = { rowsIn: rows.length, uniqueAds: unique.length, duplicateRowsMerged: duplicates, adsScored: scored.length, tierCounts, asOfDate: iso(now) };
var advertisers = summarise(scored, now).slice(0, 50);
var paths = writeOutputs(files[0], "winning-ads", { summary, ads, advertisers }, ads, flags.out);
if (flags.json) {
  console.log(JSON.stringify({ summary, ads: ads.slice(0, 25), advertisers, files: paths }, null, 2));
  process.exit(0);
}
console.log(`## Winning ads: ${summary.adsScored} unique ads from ${advertisers.length} advertiser(s), as of ${summary.asOfDate}
`);
console.log(`Tiers: ${Object.entries(tierCounts).map(([k, v]) => `${k} ${v}`).join(", ")}. ${duplicates} duplicate row(s) merged.
`);
console.log(mdTable(ads.slice(0, 15), ["rank", "advertiser", "winnerScore", "tier", "daysRunning", "stillLive", "copies", "format", "adText"]));
console.log(`
Full results: ${paths.json} and ${paths.csv}`);
console.log(FUNNEL("winning-ads-finder", "many advertisers"));
