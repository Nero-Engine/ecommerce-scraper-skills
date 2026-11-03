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

// ../../../actors/unit-price/src/unitprice.ts
var norm = (k) => k.toLowerCase().replace(/[^a-z0-9]/g, "");
var round = (n, d = 2) => {
  const m = 10 ** d;
  return Math.round(n * m) / m;
};
function flatten(row) {
  const out = /* @__PURE__ */ new Map();
  const walk = (v, path2, leaf, depth) => {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const o = v;
      const ks = Object.keys(o);
      if ("value" in o && ks.every((k) => ["value", "currency", "level", "raw", "symbol", "amount"].includes(k))) {
        const p2 = norm(path2), l2 = norm(leaf);
        if (p2 && !out.has(p2)) out.set(p2, o.value);
        if (l2 && !out.has("~" + l2)) out.set("~" + l2, o.value);
        if (typeof o.currency === "string" && !out.has("~$cur")) out.set("~$cur", o.currency);
        return;
      }
      if (depth > 3) return;
      for (const [k, x] of Object.entries(o)) walk(x, path2 ? path2 + "." + k : k, k, depth + 1);
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
function pickKey(f, names) {
  for (const pass of [0, 1]) for (const n of names) {
    const k = pass === 0 ? norm(n) : "~" + norm(n.split(".").pop());
    const v = f.get(k);
    if (v !== void 0 && v !== null && v !== "") return [v, n];
  }
  return void 0;
}
var pick = (f, names) => pickKey(f, names)?.[0];
var CUR = { "$": "USD", "us$": "USD", "\xA3": "GBP", "\u20AC": "EUR", "a$": "AUD", "c$": "CAD", "\xA5": "JPY", "\u20B9": "INR" };
function curOf(v) {
  if (typeof v !== "string" || !v.trim()) return null;
  const s2 = v.trim();
  const low = s2.toLowerCase();
  if (CUR[low]) return CUR[low];
  if (/^[A-Za-z]{3}$/.test(s2)) return s2.toUpperCase();
  const m = /(us\$|a\$|c\$|[$£€¥₹])/.exec(low);
  return m ? CUR[m[1]] : null;
}
function money(v) {
  if (typeof v === "number") return Number.isFinite(v) && v > 0 ? v : null;
  if (typeof v !== "string") return null;
  const m = /(\d{1,3}(?:,\d{3})+|\d+)(?:[.,](\d{1,2}))?/.exec(v.replace(/\s/g, ""));
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, "") + (m[2] ? "." + m[2] : ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}
var NUM = String.raw`(\d+(?:[.,]\d+)?)`;
var toN = (s2) => Number(s2.replace(",", "."));
var COUNT_WORDS = String.raw`(?:ct|cts|count|counts|cnt|pods?|k ?cups?|kcups?|tablets?|tabs|pacs?|paks?|packets?|capsules?|caps|sheets?|bags?|pieces?|pcs|rolls?|wipes?|bars?|servings?|sachets?|cans|bottles|units?)`;
function parseQuantity(text) {
  const q = { count: null, loads: null, grams: null, ml: null, packOf: null, imperial: false, matched: [] };
  let s2 = " " + text.toLowerCase().replace(/\b(?:all|\d+)[\s-]*in[\s-]*(?:1|one)\b/g, " ").replace(/(\d),(\d{3})\b/g, "$1$2").replace(/(\d)\s*-\s*(?=[a-z])/g, "$1 ").replace(/[()[\]]/g, " ") + " ";
  s2 = s2.replace(/\b\d+(?:\.\d+)?\s*(?:month|months|day|days|week|weeks|year|years|inch|inches|in\.|ft|feet|cm|mm|watt|w|v|volt|mah|hz|gb|tb|mg|mcg|iu|%)\b/g, " ");
  const take = (re, label) => {
    const m2 = re.exec(s2);
    if (m2) {
      q.matched.push(m2[0].trim());
      s2 = s2.slice(0, m2.index) + " " + s2.slice(m2.index + m2[0].length);
    }
    void label;
    return m2;
  };
  const mx = take(new RegExp(String.raw`\b(\d+)\s*[x×]\s*${NUM}\s*(fl\.? ?oz|ml|l|ltr|g|kg|oz|lb|lbs)\b`), "multi");
  let multi = 1;
  if (mx) {
    multi = Number(mx[1]);
    s2 = ` ${mx[2]} ${mx[3]} ` + s2;
  } else {
    const my = take(new RegExp(String.raw`${NUM}\s*(fl\.? ?oz|ml|l|ltr|g|kg|oz|lb|lbs)\s*[x×]\s*(\d+)\b`), "multi");
    if (my) {
      multi = Number(my[3]);
      s2 = ` ${my[1]} ${my[2]} ` + s2;
    }
  }
  const v = (re) => {
    const m2 = take(re, "");
    return m2 ? toN(m2[1]) : null;
  };
  const flOz = v(new RegExp(String.raw`${NUM}\s*(?:fl\.? ?oz\.?|fluid ounces?)\b`));
  const ml = v(new RegExp(String.raw`${NUM}\s*(?:ml|millilit(?:er|re)s?)\b`));
  const lit = v(new RegExp(String.raw`${NUM}\s*(?:l|ltr|lt|lit(?:er|re)s?)\b`));
  const gal = v(new RegExp(String.raw`${NUM}\s*(?:gal|gallons?)\b`));
  const qt = v(new RegExp(String.raw`${NUM}\s*(?:qt|quarts?)\b`));
  const kg = v(new RegExp(String.raw`${NUM}\s*(?:kg|kilos?|kilograms?)\b`));
  const lb = v(new RegExp(String.raw`${NUM}\s*(?:lbs?|pounds?)\b`));
  const oz = v(new RegExp(String.raw`${NUM}\s*(?:oz|ounces?)\b`));
  const g = v(new RegExp(String.raw`${NUM}\s*(?:g|gr|grams?)\b`));
  const loads = v(new RegExp(String.raw`\b(\d+)\s*(?:loads?|washes|wash loads)\b`));
  let pack = null;
  const p1 = take(/\b(?:pack|pk|case|box|set|bundle)\s*of\s*(\d+)\b/, "pack");
  const p2 = p1 ? null : take(/\b(\d+)\s*(?:pack|packs|pk|pks)\b/, "pack");
  if (p1) pack = Number(p1[1]);
  else if (p2) pack = Number(p2[1]);
  if (pack !== null && (pack < 1 || pack > 500)) pack = null;
  const count = v(new RegExp(String.raw`\b(\d+)\s*(?:(?:double|triple|mega|family|huge|super|jumbo|regular|large|small|mini|single|individual|value)\s+)?${COUNT_WORDS}\b`));
  if (flOz !== null || ml !== null || lit !== null || gal !== null || qt !== null) {
    q.ml = flOz !== null ? flOz * 29.5735 : ml !== null ? ml : lit !== null ? lit * 1e3 : gal !== null ? gal * 3785.41 : qt * 946.353;
    if (flOz !== null || gal !== null || qt !== null) q.imperial = true;
  }
  if (kg !== null || lb !== null || oz !== null || g !== null) {
    q.grams = kg !== null ? kg * 1e3 : g !== null ? g : lb !== null ? lb * 453.592 + (oz ?? 0) * 28.3495 : oz * 28.3495;
    if (kg === null && g === null) q.imperial = true;
  }
  if (loads !== null && loads > 0) q.loads = loads;
  if (count !== null && count > 0 && count <= 1e5) q.count = count;
  const m = multi * (pack ?? 1);
  if (m > 1) {
    if (q.ml !== null) q.ml *= m;
    if (q.grams !== null) q.grams *= m;
    const pm = pack ?? 1;
    if (q.loads !== null) q.loads *= pm;
    if (q.count !== null) q.count *= pm;
    else if (q.ml === null && q.grams === null && q.loads === null) q.count = m;
    q.packOf = m;
  }
  for (const k of ["ml", "grams"]) if (q[k] !== null) q[k] = round(q[k], 1);
  return q;
}
function sizeOf(q, b) {
  return b === "count" ? q.count : b === "loads" ? q.loads : b === "weight" ? q.grams : q.ml;
}
function unitOn(price, q, b, imperial) {
  const size = sizeOf(q, b);
  if (!size || size <= 0) return null;
  if (b === "weight") return imperial ? price / (size / 28.3495) : price / (size / 100);
  if (b === "volume") return imperial ? price / (size / 29.5735) : price / (size / 100);
  return price / size;
}
var LABEL = { count: ["per item", "per item"], loads: ["per load", "per load"], weight: ["per 100 g", "per oz"], volume: ["per 100 ml", "per fl oz"] };
function unitFamily(label) {
  return /ml|litre|fl oz/.test(label) ? "volume" : /100 g|kg|lb|per oz/.test(label) ? "weight" : label;
}
function median(xs) {
  if (!xs.length) return null;
  const s2 = [...xs].sort((a, b) => a - b);
  const h = s2.length >> 1;
  return s2.length % 2 ? s2[h] : (s2[h - 1] + s2[h]) / 2;
}
var GROUP_COLS = ["searchQuery", "searchTerm", "searchKeyword", "keyword", "query", "search", "input", "categoryName", "category", "breadCrumbs", "productCategory"];
var TITLE_COLS = ["title", "name", "productName", "product_title", "productTitle", "itemName", "product"];
var PRICE_COLS = ["price", "currentPrice", "salePrice", "offerPrice", "finalPrice", "priceValue", "price.value", "price.current", "buyboxPrice", "listPrice"];
var PROMO_COLS = ["discount_price", "discountPrice", "discountedPrice", "specialPrice", "promoPrice", "promotionPrice", "memberPrice", "clubPrice", "offer_price"];
var SIZE_COLS = ["packageSize", "package_size", "size", "itemSize", "netQuantity", "netContent", "packageQuantity", "unitCount", "numberOfItems", "quantity", "packSize", "weight", "itemWeight", "volume"];
var UNIT_PRICE_COLS = ["unitPrice", "pricePerUnit", "price_per_unit", "unit_price", "pricePerUnitText", "unitPriceText", "cupString", "cupPrice", "comparePrice", "comparisonPrice", "getPriceBeforeDiscount"];
function searchWords(v) {
  if (!/^https?:\/\//i.test(v)) return v;
  try {
    const u = new URL(v);
    const k = u.searchParams.get("k") ?? u.searchParams.get("q") ?? u.searchParams.get("query") ?? u.searchParams.get("searchTerm");
    return k && k.trim() ? k.trim() : v;
  } catch {
    return v;
  }
}
function readRow(row, rowIndex, groupBy) {
  const f = flatten(row);
  const title = pick(f, TITLE_COLS);
  if (typeof title !== "string" || title.trim().length < 3) return { skip: "no_title" };
  const shelf = money(pick(f, PRICE_COLS));
  const promo = money(pick(f, PROMO_COLS));
  const price = shelf !== null && promo !== null && promo < shelf ? promo : shelf ?? promo;
  if (price === null) return { skip: "no_price" };
  const sizeText = SIZE_COLS.map((c) => pick(f, [c])).filter((x) => typeof x === "string" || typeof x === "number").map(String).join(" | ");
  const quantity = parseQuantity(title + (sizeText ? " | " + sizeText : ""));
  const currency = curOf(pick(f, ["currency", "currencyCode", "price.currency", "priceCurrency"])) ?? curOf(f.get("~$cur")) ?? curOf(typeof pick(f, ["price"]) === "string" ? pick(f, ["price"]) : null);
  let group = "all";
  if (groupBy && groupBy !== "all") {
    const g = pick(f, [groupBy]);
    group = g === void 0 || g === null ? "(blank)" : String(g).slice(0, 200);
  } else if (!groupBy) {
    const g = pick(f, GROUP_COLS);
    if (typeof g === "string" && g.trim()) group = searchWords(g.trim()).slice(0, 200);
  }
  const brandV = pick(f, ["brand", "brandName", "manufacturer", "seller.name"]);
  const brand = typeof brandV === "string" && brandV.trim() ? brandV.trim().replace(/^(visit the|brand:)\s*/i, "").replace(/\s*store$/i, "") : null;
  const id = pick(f, ["asin", "sku", "productId", "id", "itemId", "usItemId", "upc", "gtin"]);
  const url = pick(f, ["url", "productUrl", "link", "canonicalUrl"]);
  const sp = pick(f, ["isSponsored", "sponsored"]);
  const u = pickKey(f, UNIT_PRICE_COLS);
  const rawUnit = u && money(u[0]) !== null ? { value: money(u[0]), field: u[1] } : void 0;
  const p = {
    rowIndex,
    id: id === void 0 || id === null ? null : String(id),
    title: title.trim().slice(0, 300),
    brand,
    url: typeof url === "string" ? url : null,
    group,
    price,
    currency,
    sponsored: typeof sp === "boolean" ? sp : null,
    quantity,
    comparedOn: null,
    unitPrice: null,
    unitLabel: null,
    groupMedianUnitPrice: null,
    gapPct: null,
    rankInGroup: null,
    groupCompared: 0,
    verdict: "not_compared",
    flags: [],
    sourceUnitPrice: null,
    beforeDiscountPrice: null,
    why: ""
  };
  return { p, f, rawUnit };
}
function brandKey(p) {
  if (p.brand) return p.brand.toLowerCase();
  return p.title.toLowerCase().split(/[\s,]+/).slice(0, 2).join(" ");
}
function findUnitPrices(rows2, options = {}) {
  const overPct = Math.min(200, Math.max(5, options.overpricedPct ?? 25));
  const minGroup = Math.min(50, Math.max(2, options.minGroupSize ?? 3));
  const topN = Math.min(1e5, Math.max(1, options.topN ?? 200));
  const skipped = {};
  const reads = [];
  rows2.forEach((r2, i) => {
    const x = readRow(r2, i, options.groupBy);
    if ("skip" in x) skipped[x.skip] = (skipped[x.skip] ?? 0) + 1;
    else reads.push(x);
  });
  const groups = /* @__PURE__ */ new Map();
  for (const x of reads) {
    const k = x.p.group + "\0" + (x.p.currency ?? "");
    (groups.get(k) ?? groups.set(k, []).get(k)).push(x);
  }
  const groupOut = [];
  for (const list of groups.values()) {
    const ps = list.map((x) => x.p);
    const cover = { count: 0, loads: 0, weight: 0, volume: 0 };
    for (const p of ps) for (const b of Object.keys(cover)) if (sizeOf(p.quantity, b)) cover[b]++;
    let basis = null;
    if (options.compareBy && options.compareBy !== "auto") basis = options.compareBy;
    else {
      const best = Object.keys(cover).sort((a, b) => cover[b] - cover[a])[0];
      basis = cover[best] === 0 ? null : cover.loads > 0 && cover.loads * 1.5 >= cover[best] ? "loads" : best;
    }
    const withSize = basis ? ps.filter((p) => sizeOf(p.quantity, basis)) : [];
    const imperial = basis ? withSize.filter((p) => p.quantity.imperial).length * 2 >= withSize.length : false;
    const label = basis ? LABEL[basis][imperial ? 1 : 0] : null;
    for (const p of withSize) {
      p.comparedOn = basis;
      p.unitPrice = round(unitOn(p.price, p.quantity, basis, imperial), 4);
      p.unitLabel = label;
    }
    const priced = withSize.filter((p) => p.unitPrice !== null).sort((a, b) => a.unitPrice - b.unitPrice);
    const med = median(priced.map((p) => p.unitPrice));
    const enough = priced.length >= minGroup;
    priced.forEach((p, i) => {
      p.groupCompared = priced.length;
      p.groupMedianUnitPrice = med === null ? null : round(med, 4);
      if (!enough || !med) {
        p.why = `Only ${priced.length} product(s) in this group had a ${basis} size; ${minGroup} needed to compare.`;
        return;
      }
      p.rankInGroup = i + 1;
      p.gapPct = round((p.unitPrice / med - 1) * 100, 1);
      p.verdict = i === 0 || p.gapPct <= -20 ? "best_value" : p.gapPct <= -5 ? "good_value" : p.gapPct > overPct * 2.4 ? "very_overpriced" : p.gapPct > overPct ? "overpriced" : "fair";
    });
    if (enough) for (const p of priced) {
      const smaller = priced.filter((o) => o !== p && brandKey(o) === brandKey(p) && sizeOf(o.quantity, basis) < sizeOf(p.quantity, basis) && o.unitPrice < p.unitPrice * 0.97);
      if (smaller.length) {
        const s2 = smaller.sort((a, b) => a.unitPrice - b.unitPrice)[0];
        p.flags.push("bigger_pack_costs_more_per_unit");
        p.why = `Bigger pack but ${round((p.unitPrice / s2.unitPrice - 1) * 100, 0)}% dearer ${label} than the smaller "${s2.title.slice(0, 60)}" (row ${s2.rowIndex}). `;
      }
    }
    const cheapest = priced[0], dearest = priced[priced.length - 1];
    groupOut.push({
      group: ps[0].group,
      currency: ps[0].currency,
      products: ps.length,
      compared: enough ? priced.length : 0,
      comparedOn: basis,
      unitLabel: label,
      coverage: cover,
      medianUnitPrice: med === null ? null : round(med, 4),
      cheapest: cheapest ? { rowIndex: cheapest.rowIndex, title: cheapest.title.slice(0, 120), price: cheapest.price, unitPrice: cheapest.unitPrice } : null,
      dearest: dearest ? { rowIndex: dearest.rowIndex, title: dearest.title.slice(0, 120), price: dearest.price, unitPrice: dearest.unitPrice } : null,
      spreadX: cheapest && dearest && cheapest.unitPrice ? round(dearest.unitPrice / cheapest.unitPrice, 2) : null,
      overpriced: priced.filter((p) => p.verdict === "overpriced" || p.verdict === "very_overpriced").length,
      biggerPackTraps: priced.filter((p) => p.flags.includes("bigger_pack_costs_more_per_unit")).length,
      note: basis === "loads" && cover.loads < ps.length ? `Compared per load; ${ps.length - cover.loads} product(s) without a load count were left out.` : void 0
    });
  }
  for (const x of reads) {
    const p = x.p, r2 = x.rawUnit;
    if (!r2) continue;
    if (r2.field === "getPriceBeforeDiscount" && r2.value > p.price * 1.0001) {
      p.beforeDiscountPrice = r2.value;
      continue;
    }
    if (r2.field === "getPriceBeforeDiscount" && r2.value >= p.price * 0.9999) continue;
    let matches = null;
    const tests = [
      ["per item", p.quantity.count ? p.price / p.quantity.count : null],
      ["per load", p.quantity.loads ? p.price / p.quantity.loads : null],
      ["per oz", p.quantity.grams ? p.price / (p.quantity.grams / 28.3495) : null],
      ["per 100 g", p.quantity.grams ? p.price / (p.quantity.grams / 100) : null],
      ["per fl oz", p.quantity.ml ? p.price / (p.quantity.ml / 29.5735) : null],
      ["per 100 ml", p.quantity.ml ? p.price / (p.quantity.ml / 100) : null],
      ["per lb", p.quantity.grams ? p.price / (p.quantity.grams / 453.592) : null],
      ["per kg", p.quantity.grams ? p.price / (p.quantity.grams / 1e3) : null],
      ["per litre", p.quantity.ml ? p.price / (p.quantity.ml / 1e3) : null]
    ];
    for (const [lab, val] of tests) if (val && Math.abs(val / r2.value - 1) <= 0.04) {
      matches = lab;
      break;
    }
    p.sourceUnitPrice = { value: r2.value, field: r2.field, matchesUnit: matches };
    if (r2.field === "getPriceBeforeDiscount") p.flags.push("source_unit_price_in_discount_field");
    if (matches && p.unitLabel && unitFamily(matches) !== unitFamily(p.unitLabel)) p.flags.push("source_uses_other_unit");
  }
  for (const x of reads) {
    const p = x.p;
    if (!p.comparedOn || p.unitPrice === null) {
      const imp = p.quantity.imperial;
      for (const b of ["loads", "count", "weight", "volume"]) {
        const u = unitOn(p.price, p.quantity, b, imp);
        if (u) {
          p.otherUnitPrice = { value: round(u, 4), unitLabel: LABEL[b][imp ? 1 : 0] };
          break;
        }
      }
      if (p.otherUnitPrice) {
        p.flags.push("other_unit_only");
        p.why = `Group compared ${p.unitLabel ?? "on another unit"}; this one only has ${p.otherUnitPrice.unitLabel}: ${p.otherUnitPrice.value}.`;
        p.comparedOn = null;
        p.unitLabel = null;
        continue;
      }
      p.flags.push("size_not_found");
      if (!p.why) p.why = p.comparedOn ? `No ${p.comparedOn} size in the title, so not compared.` : "No count, load, weight or volume found in the title or size fields.";
      continue;
    }
    if (p.rankInGroup === null) continue;
    const gap = p.gapPct;
    const line = `${p.unitLabel} ${p.unitPrice} vs group median ${p.groupMedianUnitPrice} (${gap > 0 ? "+" : ""}${gap}%), #${p.rankInGroup} of ${p.groupCompared}.`;
    p.why = (p.why ?? "") + line;
    if (p.sourceUnitPrice && p.sourceUnitPrice.matchesUnit && unitFamily(p.sourceUnitPrice.matchesUnit) !== unitFamily(p.unitLabel)) p.why += ` The store shows ${p.sourceUnitPrice.value} ${p.sourceUnitPrice.matchesUnit}, a different unit.`;
  }
  const all = reads.map((x) => x.p);
  const order = ["very_overpriced", "overpriced", "best_value", "good_value", "fair", "not_compared"];
  const listed = [...all].sort((a, b) => a.group.localeCompare(b.group) || (a.rankInGroup ?? 1e9) - (b.rankInGroup ?? 1e9) || order.indexOf(a.verdict) - order.indexOf(b.verdict)).slice(0, topN);
  const compared = all.filter((p) => p.rankInGroup !== null);
  const warnings = [];
  if (reads.length && compared.length === 0) warnings.push("No group had enough products with a readable size. Check the title column, or set compareBy and groupBy.");
  const noSize = all.filter((p) => p.flags.includes("size_not_found")).length;
  if (noSize) warnings.push(`${noSize} product(s) had no readable pack size and were not compared.`);
  if (all.some((p) => p.flags.includes("source_unit_price_in_discount_field"))) warnings.push("Some rows carry the store unit price in getPriceBeforeDiscount (junglee/Amazon-crawler search rows); it is not a before-discount price and is reported as sourceUnitPrice.");
  if (all.some((p) => p.flags.includes("source_uses_other_unit"))) warnings.push("The store shows unit prices in mixed units in this search (for example per load on one product and per fl oz on the next); unitPrice here puts every product on one unit.");
  return {
    summary: {
      rows: rows2.length,
      products: reads.length,
      withSize: all.length - noSize,
      compared: compared.length,
      groups: groupOut.length,
      bestValue: compared.filter((p) => p.verdict === "best_value").length,
      overpriced: compared.filter((p) => p.verdict === "overpriced" || p.verdict === "very_overpriced").length,
      biggerPackTraps: compared.filter((p) => p.flags.includes("bigger_pack_costs_more_per_unit")).length,
      skipped
    },
    groups: groupOut.sort((a, b) => b.products - a.products),
    products: listed,
    warnings
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
  const cols2 = [];
  for (const r2 of rows2) for (const k of Object.keys(r2)) if (!cols2.includes(k)) cols2.push(k);
  return [cols2.join(","), ...rows2.map((r2) => cols2.map((c) => cell(r2[c])).join(","))].join("\n") + "\n";
}
function writeOutputs(firstInput, tool, result, tableRows, outFlag) {
  const base = outFlag ? outFlag.replace(/\.(json|csv)$/i, "") : path.join(path.dirname(firstInput), `${path.basename(firstInput).replace(/\.[^.]+$/, "")}.${tool}`);
  fs.writeFileSync(`${base}.json`, JSON.stringify(result, null, 2));
  fs.writeFileSync(`${base}.csv`, toCsv(tableRows));
  return { json: `${base}.json`, csv: `${base}.csv` };
}
function mdTable(rows2, cols2) {
  const esc = (v) => cell(v).replace(/\|/g, "/").replace(/^"|"$/g, "").slice(0, 80);
  return [`| ${cols2.join(" | ")} |`, `| ${cols2.map(() => "---").join(" | ")} |`, ...rows2.map((r2) => `| ${cols2.map((c) => esc(r2[c])).join(" | ")} |`)].join("\n");
}
var FUNNEL = (actor, what) => `
For ${what}, scheduled runs or a dataset ID straight from your Apify scraper, the same rules run as the Apify actor https://apify.com/nerolabs/${actor} (pay per result).`;

// unitprice.ts
var { files, flags } = parseArgs(process.argv.slice(2));
if (flags.help) {
  console.log("Usage: node unit-price.cjs <rows.json|.jsonl|.csv> [more files] [--group-by searchQuery] [--compare-by auto|count|loads|weight|volume] [--overpriced-pct 25] [--min-group 3] [--top 200] [--out path] [--json]");
  process.exit(0);
}
var rows = loadRows(files);
var compareBy = ["auto", "count", "loads", "weight", "volume"].includes(flags["compare-by"]) ? flags["compare-by"] : void 0;
var r = findUnitPrices(rows, {
  groupBy: flags["group-by"],
  compareBy,
  overpricedPct: num(flags["overpriced-pct"], 5, 200, 25),
  minGroupSize: Math.round(num(flags["min-group"], 2, 50, 3)),
  topN: Math.round(num(flags.top, 1, 1e5, 200))
});
if (!r.summary.products) fail("None of the rows had a product title and a price. Use Amazon, Walmart or grocery scraper output, or a sheet with title and price columns.");
var products = r.products.map((p) => ({ ...p, quantity: void 0, flags: (p.flags ?? []).join(" | ") }));
var paths = writeOutputs(files[0], "unit-prices", clean(r), products, flags.out);
if (flags.json) {
  console.log(JSON.stringify({ summary: r.summary, products: r.products.slice(0, 25), files: paths }, null, 2));
  process.exit(0);
}
var s = r.summary;
console.log(`## Price per unit: ${s.compared} of ${s.products} products compared in ${s.groups} group(s)
`);
console.log(`Best value ${s.bestValue}, overpriced ${s.overpriced}, bigger packs that cost more per unit ${s.biggerPackTraps}.
`);
var cols = ["group", "rankInGroup", "title", "price", "unitPrice", "unitLabel", "gapPct", "verdict", "flags"];
console.log(mdTable(products.filter((p) => p.verdict !== "not_compared").slice(0, 15), cols));
for (const w of (r.warnings ?? []).slice(0, 3)) console.log(`
Note: ${clean(w)}`);
console.log(`
Full results: ${paths.json} and ${paths.csv}`);
console.log(FUNNEL("price-per-unit-calculator", "thousands of products"));
