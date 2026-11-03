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

// ../../../actors/reddit-recommends/src/recommends.ts
var k = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
function pick(row, names) {
  const want = new Set(names);
  for (const [key, v] of Object.entries(row)) if (want.has(k(key)) && v !== null && v !== void 0 && v !== "") return v;
  return void 0;
}
var num = (v) => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v.replace(/[, ]/g, "")) : NaN;
  return Number.isFinite(n) ? n : 0;
};
function readComments(rows2) {
  const out2 = [];
  const seen = /* @__PURE__ */ new Set();
  for (const row of rows2) {
    if (!row || typeof row !== "object") continue;
    const author = String(pick(row, ["author", "authorname", "username", "user"]) ?? "");
    if (/^automoderator$|bot$/i.test(author)) continue;
    const type = String(pick(row, ["datatype", "type", "kind", "itemtype"]) ?? "").toLowerCase();
    const body = pick(row, ["body", "text", "comment", "commentbody", "commenttext", "content", "selftext", "description", "message"]);
    const title = pick(row, ["title", "posttitle"]);
    const isPost = type === "post" || type === "t3" || type === "" && title !== void 0 && !pick(row, ["parentid", "parsedparentid", "commentid"]);
    let text = typeof body === "string" ? body : "";
    if (isPost && typeof title === "string") text = `${title}. ${text}`;
    text = text.trim();
    if (text.length < 2 || /^\[(removed|deleted)\]$/i.test(text)) continue;
    const id = String(pick(row, ["id", "commentid", "parsedid", "name"]) ?? "") || text.slice(0, 200);
    if (seen.has(id)) continue;
    seen.add(id);
    const url = pick(row, ["url", "permalink", "commenturl", "link", "posturl"]);
    const term = pick(row, ["searchterm", "search", "query", "keyword"]);
    out2.push({
      id,
      text,
      upvotes: num(pick(row, ["upvotes", "commentupvotes", "ups", "score", "votes", "likes", "points"])),
      url: typeof url === "string" ? url.startsWith("/") ? `https://www.reddit.com${url}` : url : null,
      isPost,
      searchTerm: typeof term === "string" ? term : null
    });
  }
  return out2;
}
var STOP = new Set(`a about above actually after again against all also although always am amazing an and another any anyone anything anyway are around as at avoid awesome bad be because been before being best better between big both but buy bought by can cannot cant check close come comfortable could currently cheap daily definitely did do does doing done dont down during each easy edit either else enough especially even ever every everyone everything except fair few first for found from fwiw get go going good got great had has have having he her here hers highly him his honestly how however i id ie if ill im imho imo in instead into is isnt it its ive just keep know last least less like love loved lol look lot made make many maybe me mine more most mostly much must my myself need never new next nice no none nor not nothing now of off oh ok okay old on once one only or other others our ours out over own perfect personally please plus pretty probably psa quite rather really recommend recommended remember right same say see seem seems she should since so some someone something sometimes still such sure tbh than thank thanks that thats the their theirs them then there these they theyre thing things think this those though thought through to too totally tried try trying ugh under until up us usa uk eu use used using usually very want was wasnt way we well went were what whatever when where whether which while who whoever why will with without wont worst would wouldnt wow yeah yes yet you your youre yours yup also anyway agreed disagree same op tldr tl dr dm pm ama eli5 update edit2 reddit subreddit thread post comment sub link here january february march april may june july august september october november december monday tuesday wednesday thursday friday saturday sunday mr mrs ms dr st english american british i'd i've i'm don't can't won't it's that's there's they're you're didn't doesn't isn't wasn't`.split(/\s+/).map(k));
var POS = ["love", "loved", "loving", "recommend", "recommended", "favorite", "favourite", "great", "best", "amazing", "awesome", "comfortable", "comfy", "durable", "reliable", "solid", "perfect", "excellent", "fantastic", "adore", "happy", "worth", "goto", "gotos", "revelation", "unmatched", "golden", "magical", "impressed", "superb", "outlasted", "lasts", "lasted", "winner", "beast", "stellar", "flawless", "fan", "swear", "nothing beats", "cant beat", "can't beat", "second pair", "third pair", "bought another", "buy again", "no complaints", "highly"];
var NEG = ["hate", "hated", "avoid", "terrible", "awful", "worst", "broke", "broken", "disappointing", "disappointed", "returned", "uncomfortable", "overrated", "junk", "garbage", "crap", "regret", "painful", "hurt", "hurts", "cheaply", "flimsy", "shot", "trash", "useless", "meh", "mediocre", "issues", "problems", "failed", "died", "fell apart", "wore out", "not worth", "stay away", "blisters", "stopped working"];
var NEGATORS = /* @__PURE__ */ new Set(["not", "never", "dont", "didnt", "doesnt", "wouldnt", "wont", "cant", "isnt", "wasnt", "no", "hardly", "nothing"]);
var ROMAN = /^(ii|iii|iv|vi{0,3}|ix|x|II|III|IV|V|VI{0,3}|IX|X)$/;
var isModel = (t) => /^\d+[a-z]{0,2}$/i.test(t) || /^v\d+$/i.test(t) || /^[a-z]{1,2}\d+[a-z0-9]*$/i.test(t) || ROMAN.test(t);
var isCap = (t) => /^[A-Z]/.test(t) || /^[a-z]+[A-Z]/.test(t);
function candidates(text) {
  const hits = [];
  const linked = [];
  let t = text.replace(/\[([^\]\n]{2,60})\]\((?:https?:\/\/(?:www\.)?reddit\.com)?\/search\/?\?q=[^)]*\)/g, (_m, label) => {
    linked.push(label.trim());
    return label;
  });
  t = t.replace(/\[([^\]\n]{1,80})\]\([^)]*\)/g, "$1").replace(/https?:\/\/\S+/g, " ").replace(/[*_~`>#]/g, " ").replace(/\bu\/\w+|\br\/\w+/g, " ");
  const sentences = t.split(/(?<=[.!?;:\n])\s+|\n+|\s+-\s+|\(|\)/).map((s) => s.trim()).filter(Boolean);
  for (const label of linked) {
    const tokens = label.match(/[A-Za-z0-9][A-Za-z0-9'’&+.-]*/g) ?? [];
    if (tokens.length) hits.push({ surface: label, tokens: tokens.map(clean), strong: true, atStart: false, sentence: sentences.find((s) => s.includes(label)) ?? label });
  }
  for (const s of sentences) {
    const ms = [...s.matchAll(/[A-Za-z0-9][A-Za-z0-9'’&+-]*/g)];
    const words = ms.map((m) => m[0]);
    let run = [];
    const flush = () => {
      let part = [];
      const emit = () => {
        while (part.length && isModel(part[0].tok)) part.shift();
        if (part.length && part.some((p) => !isModel(p.tok))) {
          const tokens = part.map((p) => clean(p.tok));
          hits.push({ surface: part.map((p) => p.tok).join(" "), tokens, strong: false, atStart: part[0].i === 0, sentence: s });
        }
        part = [];
      };
      for (const [j, p] of run.entries()) {
        const keepNew = k(p.tok) === "new" && j === 0 && run.length > 1 && part.length === 0 && /^[A-Z]/.test(run[1].tok) && !STOP.has(k(run[1].tok));
        if (STOP.has(k(p.tok)) && !isModel(p.tok) && !keepNew) emit();
        else part.push(p);
      }
      emit();
      run = [];
    };
    words.forEach((w, i) => {
      if (i > 0 && run.length) {
        const gap = s.slice(ms[i - 1].index + ms[i - 1][0].length, ms[i].index);
        if (gap !== " ") flush();
      }
      const prevName = run.length > 0;
      if (isCap(w) || prevName && isModel(w) && run.length < 5) {
        if (run.length >= 5) flush();
        run.push({ tok: w, i });
      } else flush();
    });
    flush();
  }
  return hits;
}
function clean(t) {
  return t.replace(/['’]s$/i, "").replace(/['’]$/, "").replace(/[.]+$/, "");
}
function splitVersion(tokens) {
  const fam = [...tokens];
  const ver = [];
  while (fam.length > 1 && isModel(fam[fam.length - 1])) ver.unshift(fam.pop().replace(/^(\d+)s$/i, "$1"));
  return { family: fam, version: ver.length ? ver.join(" ") : null };
}
function sentimentOf(sentence) {
  const low = " " + sentence.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ") + " ";
  const words = low.trim().split(" ");
  let pos = 0;
  let neg = 0;
  const scan = (list2, add) => {
    for (const w of list2) {
      const ww = w.replace(/'/g, "");
      if (ww.includes(" ")) {
        if (low.includes(` ${ww} `)) add(false);
        continue;
      }
      words.forEach((x, i) => {
        if (x !== ww) return;
        const before = words.slice(Math.max(0, i - 3), i);
        add(before.some((b) => NEGATORS.has(b)));
      });
    }
  };
  scan(POS, (n) => {
    if (n) neg++;
    else pos++;
  });
  scan(NEG, (n) => {
    if (n) pos += 0.5;
    else neg++;
  });
  return pos > neg ? 1 : neg > pos ? -1 : 0;
}
function rankRecommendations(comments2, opts = {}) {
  const minMentions = Math.max(1, Math.round(opts.minMentions ?? 2));
  const maxResults = Math.max(1, Math.round(opts.maxResults ?? 50));
  const hasComments = comments2.some((c) => !c.isPost);
  const pool = comments2.filter((c) => opts.includePosts || !hasComments || !c.isPost);
  const userBrands = new Map((opts.brands ?? []).filter((b) => typeof b === "string" && b.trim()).map((b) => [k(b), b.trim()]));
  const ignore = new Set((opts.ignore ?? []).map((x) => k(String(x))));
  for (const c of comments2) if (c.searchTerm) for (const w of c.searchTerm.split(/\s+/)) ignore.add(k(w));
  if (comments2[0]?.searchTerm) ignore.add(k(comments2[0].searchTerm));
  const raws = [];
  for (const c of pool) for (const h of candidates(c.text)) {
    const { family, version } = splitVersion(h.tokens);
    if (!family.length) continue;
    const fk = k(family.join(""));
    if (fk.length < 3 || ignore.has(fk) || STOP.has(fk) || /^\d+$/.test(fk)) continue;
    raws.push({ c, h, family, version });
  }
  const brandSet = new Set(userBrands.keys());
  const lead = /* @__PURE__ */ new Map();
  const alone = /* @__PURE__ */ new Set();
  for (const r of raws) {
    if (r.family.length === 1) alone.add(k(r.family[0]));
    else lead.set(k(r.family[0]), (lead.get(k(r.family[0])) ?? /* @__PURE__ */ new Set()).add(k(r.family.slice(1).join(""))));
  }
  for (const [b, rest] of lead) {
    if (STOP.has(b) || b.length < 3) continue;
    if (rest.size >= 2 || [...rest].some((x) => alone.has(x)) || alone.has(b)) brandSet.add(b);
  }
  const fams = /* @__PURE__ */ new Map();
  const brandFams = /* @__PURE__ */ new Map();
  const newFam = (key) => ({ key, display: /* @__PURE__ */ new Map(), brandVotes: /* @__PURE__ */ new Map(), versions: /* @__PURE__ */ new Map(), strong: 0, nonStart: 0, hasModel: 0, multi: 0, seen: /* @__PURE__ */ new Map() });
  const bump = (m, x) => m.set(x, (m.get(x) ?? 0) + 1);
  for (const r of raws) {
    let fam = r.family;
    let brand = null;
    if (fam.length > 1 && brandSet.has(k(fam[0]))) {
      brand = fam[0];
      fam = fam.slice(1);
    }
    const fk = k(fam.join(""));
    if (fam.length === 1 && brandSet.has(fk) && !brand) {
      const bf = brandFams.get(fk) ?? newFam(fk);
      bump(bf.display, fam[0]);
      if (!bf.seen.has(r.c.id)) bf.seen.set(r.c.id, r.h.sentence);
      if (r.h.strong) bf.strong++;
      if (!r.h.atStart) bf.nonStart++;
      brandFams.set(fk, bf);
      continue;
    }
    if (fk.length < 3 || STOP.has(fk) || ignore.has(fk)) continue;
    const f = fams.get(fk) ?? newFam(fk);
    bump(f.display, fam.join(" "));
    if (brand) bump(f.brandVotes, brand);
    if (r.version) {
      bump(f.versions, r.version);
      f.hasModel++;
    }
    if (r.h.strong) f.strong++;
    if (!r.h.atStart) f.nonStart++;
    if (r.family.length > 1) f.multi++;
    if (!f.seen.has(r.c.id)) f.seen.set(r.c.id, r.h.sentence);
    fams.set(fk, f);
    if (brand) {
      const bf = brandFams.get(k(brand)) ?? newFam(k(brand));
      bump(bf.display, brand);
      if (!bf.seen.has(r.c.id)) bf.seen.set(r.c.id, r.h.sentence);
      bf.nonStart++;
      brandFams.set(k(brand), bf);
    }
  }
  const merge = (from, into) => {
    for (const [d, n] of from.display) into.display.set(d, (into.display.get(d) ?? 0) + n);
    for (const [d, n] of from.brandVotes) into.brandVotes.set(d, (into.brandVotes.get(d) ?? 0) + n);
    for (const [d, n] of from.versions) into.versions.set(d, (into.versions.get(d) ?? 0) + n);
    for (const [id, s] of from.seen) if (!into.seen.has(id)) into.seen.set(id, s);
    into.strong += from.strong;
    into.nonStart += from.nonStart;
    into.hasModel += from.hasModel;
    into.multi += from.multi;
  };
  for (const key of [...fams.keys()].sort((a, b) => b.length - a.length)) {
    const f = fams.get(key);
    if (!f) continue;
    if (key.endsWith("s") && key.length > 4 && fams.has(key.slice(0, -1))) {
      merge(f, fams.get(key.slice(0, -1)));
      fams.delete(key);
      continue;
    }
  }
  for (const key of [...fams.keys()].sort((x, y) => x.length - y.length)) {
    const f = fams.get(key);
    if (!f || key.length < 5) continue;
    const supers = [...fams.keys()].filter((o) => o !== key && o.endsWith(key));
    if (supers.length === 1) {
      merge(f, fams.get(supers[0]));
      fams.delete(key);
    }
  }
  for (const key of [...fams.keys()]) {
    const f = fams.get(key);
    const b = brandFams.get(key) ?? (key.endsWith("s") ? brandFams.get(key.slice(0, -1)) : void 0);
    if (b && f.multi === 0 && f.hasModel === 0) {
      merge(f, b);
      fams.delete(key);
    }
  }
  const lowerHits = (f) => {
    const forms = new Set([...f.display.keys()].map((d) => d.toLowerCase()));
    let n = 0;
    for (const c of pool) {
      if (f.seen.has(c.id)) continue;
      for (const form of forms) if (new RegExp(`(^|[^A-Za-z0-9])${form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s?")}s?([^A-Za-z0-9]|$)`).test(c.text)) {
        n++;
        break;
      }
    }
    return n;
  };
  const common = (f) => f.strong === 0 && f.hasModel === 0 && !userBrands.has(f.key) && lowerHits(f) >= f.seen.size;
  const confirmed = (f) => (f.strong > 0 || f.nonStart > 0 || f.hasModel > 0 || f.multi > 0 || userBrands.has(f.key)) && !common(f);
  const all = [...[...fams.values()].map((f) => ({ f, kind: "product" })), ...[...brandFams.values()].map((f) => ({ f, kind: "brand" }))].filter((x) => confirmed(x.f));
  const lowered = pool.map((c) => ({ c, low: " " + c.text.toLowerCase().replace(/[^a-z0-9]+/g, " ") + " ", sentences: c.text.split(/(?<=[.!?\n])\s+/) }));
  for (const { f } of all) {
    if (f.key.length < 4) continue;
    const forms = new Set([...f.display.keys()].map((d) => d.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()).filter((d) => d.replace(/ /g, "").length >= 4));
    for (const form of forms) {
      const re = new RegExp(`\\s${form.replace(/ /g, "\\s?")}s?\\s`);
      for (const { c, low, sentences } of lowered) {
        if (f.seen.has(c.id) || !re.test(low)) continue;
        const sent = sentences.find((s) => re.test(" " + s.toLowerCase().replace(/[^a-z0-9]+/g, " ") + " ")) ?? c.text;
        f.seen.set(c.id, sent);
      }
    }
  }
  const byId = new Map(pool.map((c) => [c.id, c]));
  const scored = all.map(({ f, kind }) => {
    let score = 0;
    let pos = 0;
    let neg = 0;
    let ups = 0;
    let best = null;
    for (const [id, sentence] of f.seen) {
      const c = byId.get(id);
      const sent = sentimentOf(sentence);
      if (sent > 0) pos++;
      else if (sent < 0) neg++;
      const w = 1 + Math.log2(1 + Math.max(0, c.upvotes));
      score += w * (1 + 0.5 * sent);
      ups += Math.max(0, c.upvotes);
      if (sent >= 0 && (!best || c.upvotes > best.c.upvotes || best.sent < sent && c.upvotes === best.c.upvotes)) best = { c, s: sentence, sent };
    }
    const top = (m) => [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const brand = kind === "product" ? top(f.brandVotes) : null;
    const exact = new Map([...f.display.entries()].filter(([d]) => k(d) === f.key));
    const display = kind === "brand" ? userBrands.get(f.key) ?? top(exact.size ? exact : f.display) : top(exact.size ? exact : f.display);
    const name = brand ? `${brand} ${display}` : display;
    return {
      score,
      row: {
        rank: 0,
        name,
        brand,
        kind,
        mentions: f.seen.size,
        upvotesOnMentions: ups,
        positive: pos,
        negative: neg,
        sentiment: f.seen.size ? Math.round((pos - neg) / f.seen.size * 100) / 100 : 0,
        recommendScore: 0,
        versions: [...f.versions.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v).slice(0, 8),
        alsoWrittenAs: [...f.display.keys()].filter((d) => d !== display).slice(0, 5),
        topQuote: best ? trimQuote(best.s) : null,
        topQuoteUpvotes: best ? best.c.upvotes : null,
        topQuoteUrl: best ? best.c.url : null
      }
    };
  }).filter((x) => x.row.mentions >= minMentions);
  scored.sort((a, b) => b.score - a.score || b.row.mentions - a.row.mentions);
  const topScore = scored[0]?.score ?? 1;
  const results = scored.slice(0, maxResults).map((x, i) => ({ ...x.row, rank: i + 1, recommendScore: Math.round(x.score / topScore * 100) }));
  const products = results.filter((r) => r.kind === "product");
  return {
    results,
    summary: {
      rowsRead: comments2.length,
      commentsUsed: pool.length,
      namesFound: scored.length,
      topProduct: products[0]?.name ?? null,
      topBrand: results.find((r) => r.kind === "brand")?.name ?? null,
      brandsDetected: [...brandSet].length,
      minMentions,
      note: "Ranked by upvote-weighted mentions, with positive or negative words in the same sentence. Text rules only, no AI: check the top quotes before you rely on a name."
    }
  };
}
function trimQuote(s) {
  const t = s.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\s+/g, " ").trim();
  return t.length > 220 ? t.slice(0, 217) + "..." : t;
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
function list(v) {
  return v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];
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
  for (const r of rows2) for (const k2 of Object.keys(r)) if (!cols.includes(k2)) cols.push(k2);
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

// recommends.ts
var { files, flags } = parseArgs(process.argv.slice(2));
if (flags.help) {
  console.log('Usage: node reddit-recommends.cjs <rows.json|.jsonl|.csv> [more files] [--brands "Brand A,Brand B"] [--ignore "word,word"] [--min-mentions 2] [--include-posts] [--max 50] [--out path] [--json]');
  process.exit(0);
}
var rows = loadRows(files);
var comments = readComments(rows);
if (comments.length === 0) fail("None of the rows had comment text (body or text). Use Reddit scraper output, or a sheet with a text column.");
var out = rankRecommendations(comments, {
  brands: list(flags.brands).slice(0, 200),
  ignore: list(flags.ignore).slice(0, 200),
  minMentions: flags["min-mentions"] ? num2(flags["min-mentions"], 1, 100, 2) : void 0,
  includePosts: flags["include-posts"] === "true",
  maxResults: Math.round(num2(flags.max, 1, 500, 50))
});
var flat = out.results.map((r) => ({ ...r, versions: r.versions.join("; "), alsoWrittenAs: r.alsoWrittenAs.join("; ") }));
var paths = writeOutputs(files[0], "reddit-recommends", { recommendations: out.results, summary: out.summary }, flat, flags.out);
if (flags.json) {
  console.log(JSON.stringify({ summary: out.summary, recommendations: out.results.slice(0, 25), files: paths }, null, 2));
  process.exit(0);
}
console.log(`## Most recommended on Reddit: ${out.results.length} product(s) or brand(s) from ${comments.length} comment(s)
`);
console.log(mdTable(flat.slice(0, 15), ["rank", "name", "kind", "mentions", "upvotesOnMentions", "positive", "negative", "recommendScore", "topQuote"]));
console.log(`
Full results: ${paths.json} and ${paths.csv}`);
console.log("\nFor an AI agent with no install, the same rules run as the paid Nero Labs tool POST https://x402-agent-tools.nerolabs.workers.dev/reddit-recommends (x402, pay per comment). To find the questions people ask in the same threads, see https://apify.com/nerolabs/reddit-questions-finder.");
