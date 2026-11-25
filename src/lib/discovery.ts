/* eslint-disable @typescript-eslint/no-explicit-any */
const toNum = (x: unknown): number => typeof x === "number" ? x : typeof x === "string" ? Number.parseFloat(x.replace(/[$,%\s]/g, "")) || 0 : 0;
const median = (xs: number[]) => { if (!xs.length) return 0; const s = [...xs].sort((a, b) => a - b), m = Math.floor(s.length / 2); return s.length % 2 ? (s[m] ?? 0) : ((s[m - 1] ?? 0) + (s[m] ?? 0)) / 2; };
export type Relevance = "direct" | "adjacent" | "no";
export interface SearchExpansion { core: string; variants: string[]; product_type: string; not_competitors: string[]; /** Product noun a direct competitor must name, e.g. "kit" for "sewing kit". Fallback only. */ head?: string }
export const STOP_WORDS = new Set(["for", "with", "the", "and", "best", "natural", "organic", "a", "an", "of", "to", "in", "by", "your"]);
export const MIN_POOL_GMV = 500;
export const MIN_COMPETITOR_GMV = 5000;
export const MAX_SEARCH_TERMS = 8;

const cleanTerm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/(^|\s)-+|-+(\s|$)/g, " ").replace(/\s+/g, " ").trim();
export function fallbackExpansion(keywords: string[], title = ""): SearchExpansion {
  const words = cleanTerm([title, ...keywords].join(" ")).split(" ").filter((w) => w && !STOP_WORDS.has(w));
  const kwWords = cleanTerm(keywords.join(" ")).split(" ").filter((w) => w && !STOP_WORDS.has(w));
  // Core: the most repeated meaningful word across title and keywords (e.g. "tallow"), else the keyword head.
  const counts = new Map<string, number>();
  for (const w of words) if (w.length > 3 && !GENERIC_WORDS.has(w)) counts.set(w, (counts.get(w) ?? 0) + 1);
  // Ties go to the head noun: in "beef tallow", "tallow" names the product, "beef" describes it.
  const headRank = (w: string) => kwWords.lastIndexOf(w);
  const core = [...counts.entries()].sort((a, b) => b[1] - a[1] || headRank(b[0]) - headRank(a[0]))[0]?.[0] ?? kwWords[0] ?? "product";
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    const g = `${words[i]} ${words[i + 1]}`;
    if (g.includes(core) && !GENERIC_WORDS.has(words[i] ?? "") || g.includes(core) && !GENERIC_WORDS.has(words[i + 1] ?? "")) bigrams.push(g);
  }
  // The head noun of the first keyword names the product ("kit" in "sewing kit"). Ingredient keywords
  // ("beef tallow") have the core itself as head, so nothing extra is required.
  const kwHead = cleanTerm(keywords[0] ?? "").split(" ").filter((w) => w && !STOP_WORDS.has(w) && !GENERIC_WORDS.has(w)).pop();
  const head = kwHead && kwHead !== core ? kwHead : undefined;
  return { core, variants: [...new Set(bigrams)].slice(0, 6), product_type: cleanTerm(title) || keywords.join(", "), not_competitors: [], ...(head ? { head } : {}) };
}

// Words that describe use or audience, not the product. Searching them alone floods the pool.
export const GENERIC_WORDS = new Set(["whipped", "unscented", "scented", "raw", "handmade", "hydrating", "moisturizing", "nourishing", "gentle", "sensitive", "lightweight", "luxury", "original", "classic", "face", "body", "skin", "hair", "men", "women", "kids", "baby", "dry", "care", "pack", "gift", "new", "daily", "premium", "large", "small", "travel", "size", "oz", "count", "pure", "grass", "fed"]);

export function searchTermSet(keywords: string[], expansion: SearchExpansion, title = "") {
  const deterministic = keywords.flatMap((keyword) => {
    const raw = cleanTerm(keyword).split(" ").filter(Boolean);
    const core = raw.filter((w) => !STOP_WORDS.has(w));
    const out = [cleanTerm(keyword)];
    for (let n = core.length; n >= 1; n--) out.push(core.slice(0, n).join(" "));
    for (let i = 0; i <= core.length - 2; i++) out.push(core.slice(i, i + 2).join(" "));
    return out;
  });
  const titleWords = cleanTerm(title).split(" ").filter((w) => w && !STOP_WORDS.has(w));
  const coreTerm = cleanTerm(expansion.core);
  const useful = (t: string) => {
    const parts = t.split(" ").filter(Boolean);
    if (!parts.length) return false;
    if (parts.length === 1) return t === coreTerm; // the only one-word search is the core term
    if (parts.some((w) => /\d/.test(w))) return false; // sizes, counts and percentages are not search terms
    // A term must name the product: brand-plus-number fragments from the title do not.
    if (coreTerm && !t.includes(coreTerm) && !keywords.some((k) => cleanTerm(k) === t) && !expansion.variants.map(cleanTerm).includes(t)) return false;
    return !parts.every((w) => GENERIC_WORDS.has(w) || STOP_WORDS.has(w));
  };
  return [...new Set([...keywords.map(cleanTerm), coreTerm, ...expansion.variants.map(cleanTerm), ...deterministic, titleWords.slice(0, 2).join(" ")])].filter(useful).slice(0, MAX_SEARCH_TERMS);
}

export function mergePoolProducts(existing: any[], incoming: any[], term?: string) {
  const pool = new Map<string, any>();
  for (const p of existing) {
    const id = String(p.product_id ?? "");
    if (id) pool.set(id, { ...p, product_id: id, foundTerms: [...(p.foundTerms ?? [])] });
  }
  for (const p of incoming) {
    const id = String(p.product_id ?? "");
    if (!id) continue;
    const prior = pool.get(id);
    // Only the products this search returned get credit for the term.
    const terms = [...new Set([...(prior?.foundTerms ?? []), ...(p.foundTerms ?? []), ...(term ? [term] : [])])];
    // One first-observed last-30-day snapshot per listing, never a maximum across periods.
    const best = prior ? { ...p, ...prior } : p;
    pool.set(id, { ...best, product_id: id, foundTerms: terms });
  }
  return [...pool.values()].sort((a, b) => toNum(b.revenue) - toNum(a.revenue));
}

export function topSellers(pool: any[], limit = 8) {
  const sellers = new Map<string, { id: string; revenue: number }>();
  for (const p of pool) {
    const id = String(p.product_shop_id ?? p.shop_id ?? "");
    if (!id) continue;
    const current = sellers.get(id) ?? { id, revenue: 0 };
    current.revenue += toNum(p.revenue);
    sellers.set(id, current);
  }
  return [...sellers.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit).map((s) => s.id);
}

export function applyClassificationFloor(pool: any[], expansion: SearchExpansion): any[] {
  const core = cleanTerm(expansion.core);
  const exclusions = expansion.not_competitors.map(cleanTerm).filter(Boolean);
  const modifiers = [...new Set(expansion.variants.flatMap((variant) => cleanTerm(variant).split(" ")).filter((word) => word.length > 2 && !core.split(" ").includes(word) && !["for", "and", "the", "with"].includes(word)))];
  const head = expansion.head ? cleanTerm(expansion.head) : "";
  const namesHead = (title: string) => !head || title.split(" ").some((w) => w === head || w === `${head}s` || w === `${head}es`);
  return pool.map((p) => {
    const title = cleanTerm(p.product_name);
    if (exclusions.some((excluded) => title.includes(excluded))) return { ...p, relevance: "no", relevanceReason: "Excluded product type." };
    if (relevanceOf(p) === "direct" && !namesHead(title)) return { ...p, relevance: title.includes(core) ? "adjacent" : "no", relevanceReason: `Mentions ${core} but is not a ${core} ${head}.` };
    // Ingredient niches must contain the ingredient. Generic skincare is not tallow.
    if (core.split(" ").includes("tallow") && (!title.split(" ").includes("tallow") || /\b(cooking|cook|frying|fry|rendered|lard)\b/.test(title))) return { ...p, relevance: "no", relevanceReason: "Not a tallow skincare product." };
    // Judge the device by what the name leads with. Kit contents listed later (threader, seam ripper) do not make it a device.
    if (/\bsewing\b/.test(core) && /\b(machines?|handheld|electric|cordless|gun|buckles?|pliers|threaders?|ripper|mannequins?|felt|cardboard|stitcher|fasteners?|chalk|pen|shears|scissors|crochet|knitting|embroidery|cross stitch|needlepoint)\b/.test(title.slice(0, 60))) return { ...p, relevance: "adjacent", relevanceReason: "Sewing device, craft project or specialist accessory, not a general hand-sewing repair kit." };
    const exact = core.split(" ").length > 1 && title.includes(core);
    const ingredientAndForm = core.split(" ").length === 1 && title.includes(core) && modifiers.some((word) => title.split(" ").includes(word));
    if ((exact || ingredientAndForm) && namesHead(title) && !p.offCategory) {
      const partnerForms = productForms(expansion.product_type), forms = productForms(String(p.product_name));
      if (partnerForms.length && forms.length && !forms.some((f) => partnerForms.includes(f))) return { ...p, relevance: "adjacent" as const, relevanceReason: `Same ingredient, different product (${forms.join(", ")}).` };
      return { ...p, relevance: "direct" as const, reason: "Matches the core product and product form." };
    }
    return p;
  });
}

// Product forms. A product in a different form from the partner's is adjacent, not a direct substitute.
export const PRODUCT_FORMS: Record<string, RegExp> = {
  lip: /\blip(s)?\b|\blip balm\b|chapstick/,
  soap: /\bsoap\b|\bcleanser\b|\bface wash\b|\bbody wash\b/,
  deodorant: /\bdeodorant\b|\bantiperspirant\b/,
  candle: /\bcandles?\b/,
  hair: /\bshampoo\b|\bconditioner\b|\bhair (mask|oil)\b/,
  serum: /\bserum\b/,
  supplement: /\bcapsules?\b|\bsupplement\b|\bgummies\b|\bpowder\b/,
  moisturizer: /\bbalm\b|\bcream\b|\bmoisturi[sz]er\b|\bbutter\b|\blotion\b|\bsalve\b/,
};
export function productForms(name: string) {
  const t = cleanTerm(name);
  // Specific forms win: a "tallow lip balm" is a lip product, not a face moisturizer.
  const specific = Object.entries(PRODUCT_FORMS).filter(([k, re]) => k !== "moisturizer" && re.test(t)).map(([k]) => k);
  return specific.length ? specific : PRODUCT_FORMS['moisturizer']!.test(t) ? ["moisturizer"] : [];
}

/** Kalodata gives categories either flat (ter_cate_id) or as objects (ter_category.category_id). */
export function categoryId(p: any, level: 1 | 2 | 3): string {
  const flat = level === 1 ? p.pri_cate_id : level === 2 ? p.sec_cate_id : p.ter_cate_id;
  const obj = level === 1 ? p.pri_category : level === 2 ? p.sec_category : p.ter_category;
  const id = flat ?? obj?.category_id ?? "";
  return String(id).split(":").pop() ?? "";
}

/** Parent (level-2) categories where most core products sell. Sub-categories split one shelf too finely (sewing kits sit in four): the biggest ones until 80% of matching products, each at least 8%.
 * Counted by products, not revenue, so one huge off-shelf listing cannot claim the niche. */
export function coreCategories(pool: any[], core: string, head?: string) {
  const c = cleanTerm(core), h = head ? cleanTerm(head) : "";
  const ref = pool.filter((p) => { const t = cleanTerm(String(p.product_name)); return t.includes(c) && (!h || t.split(" ").some((w) => w === h || w === `${h}s`)); });
  const byCat = new Map<string, number>();
  for (const p of ref) { const id = categoryId(p, 2) || categoryId(p, 3); if (id && toNum(p.revenue) >= MIN_POOL_GMV) byCat.set(id, (byCat.get(id) ?? 0) + 1); }
  const total = [...byCat.values()].reduce((a, b) => a + b, 0);
  const keep = new Set<string>(); let cum = 0;
  for (const [id, rev] of [...byCat.entries()].sort((a, b) => b[1] - a[1])) {
    if (cum >= 0.8 * total || rev < 0.08 * total) break;
    keep.add(id); cum += rev;
  }
  return keep;
}

export function fallbackClassify(pool: any[], core: string, partnerTitle = "", head?: string): any[] {
  const cats = coreCategories(pool, core, head);
  const partnerForms = productForms(partnerTitle);
  return pool.map((p) => {
    const t = cleanTerm(String(p.product_name));
    const named = t.includes(cleanTerm(core));
    const cat = categoryId(p, 2) || categoryId(p, 3);
    // Without category data we cannot judge the shelf, so the name decides.
    const inCategory = !cats.size || !cat || cats.has(cat);
    if (!named) return { ...p, relevance: "no" as const, relevanceReason: `Does not name ${core}.` };
    if (!inCategory) return { ...p, relevance: "adjacent" as const, offCategory: true, relevanceReason: `Mentions ${core} but sells in another TikTok Shop category.` };
    const forms = productForms(String(p.product_name));
    if (partnerForms.length && forms.length && !forms.some((f) => partnerForms.includes(f))) {
      return { ...p, relevance: "adjacent" as const, relevanceReason: `Same ingredient, different product (${forms.join(", ")}).` };
    }
    return { ...p, relevance: "direct" as const, relevanceReason: `Names ${core} and sells in the same TikTok Shop category.` };
  });
}

const normalizeSeller = (p: any) => cleanTerm(String(p.shop_name ?? p.seller_name ?? p.product_shop_name ?? p.product_shop_id ?? p.shop_id ?? "unknown"));
const variantSignature = (name: string) => cleanTerm(name)
  .replace(/\b(?:pack of|set of|combo|bundle|single|count|ct|pcs?|packs?)\b/g, " ")
  .replace(/\b\d+(?:\.\d+)?\s*(?:oz|fl|lb|g|ml|count|ct|pcs?|packs?)\b/g, " ")
  .replace(/\b\d+\s*[-x]\s*\d*\b/g, " ")
  .replace(/\b(?:1|2|3|4|5|6|8|10|12)\b/g, " ")
  .replace(/\s+/g, " ").trim().split(" ").slice(0, 12).join(" ");

/** Groups likely pack variants only within one seller; unrelated products stay separate. */
export function groupCompetitors(products: any[]) {
  const groups = new Map<string, any[]>();
  for (const p of uniqueListings(products)) {
    const key = `${normalizeSeller(p)}|${variantSignature(String(p.product_name ?? ""))}`;
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }
  return [...groups.values()].map((listings) => {
    const sorted = [...listings].sort((a, b) => toNum(b.revenue) - toNum(a.revenue));
    const hero = sorted[0];
    return { ...hero, revenue: listings.reduce((n, p) => n + toNum(p.revenue), 0), sales_volumn: listings.reduce((n, p) => n + toNum(p.sales_volumn ?? p.sales_volume), 0), listings, listingCount: listings.length, listingIds: listings.map((p) => String(p.product_id)) };
  }).sort((a, b) => toNum(b.revenue) - toNum(a.revenue));
}

export function relevanceOf(p: any, overrides?: Record<string, Relevance>): Relevance {
  return overrides?.[String(p.product_id)] ?? p.relevance ?? "no";
}

/** Flatten aggregates before deduplication so a hero and its listings cannot both count. */
export function uniqueListings(pool: any[]): any[] {
  const listings = pool.flatMap((p) => Array.isArray(p.listings) && p.listings.length ? p.listings.map((listing: any) => ({ ...p, ...listing, listings: undefined })) : [p]);
  return mergePoolProducts([], listings);
}

export function nicheProducts(pool: any[], overrides?: Record<string, Relevance>) {
  return uniqueListings(pool).filter((p) => relevanceOf(p, overrides) === "direct" && toNum(p.revenue) >= MIN_POOL_GMV);
}

export function nicheStats(pool: any[], overrides?: Record<string, Relevance>) {
  const products = nicheProducts(pool, overrides);
  const sum = (field: string) => products.reduce((n, p) => n + toNum(p[field]), 0);
  const gmv = sum("revenue");
  const top3 = [...products].sort((a, b) => toNum(b.revenue) - toNum(a.revenue)).slice(0, 3).reduce((n, p) => n + toNum(p.revenue), 0);
  return {
    products, gmv, units: products.reduce((n, p) => n + toNum(p.sales_volumn ?? p.sales_volume), 0),
    productCount: products.length, sellerCount: new Set(products.map(normalizeSeller)).size,
    top3Share: gmv ? top3 / gmv * 100 : 0,
    medianPrice: median(products.map((p) => toNum(p.unit_price)).filter((n) => n > 0)),
    medianCommission: median(products.map((p) => { const n = toNum(p.commission_rate); return n <= 1 ? n * 100 : n; }).filter((n) => n > 0)),
    shares: ["video_revenue", "live_revenue", "shopping_mall_revenue"].map((field) => gmv ? sum(field) / gmv * 100 : 0),
  };
}

export function formatGrowth(value: unknown, launchDate?: unknown, now = new Date()) {
  if (launchDate) {
    const launched = new Date(String(launchDate));
    if (!Number.isNaN(launched.getTime()) && now.getTime() - launched.getTime() <= 45 * 86400000) return "new";
  }
  if (value === undefined || value === null || value === "") return null;
  const growth = toNum(value);
  return growth < -95 || growth > 500 ? null : growth;
}

export function englishHook(title: unknown, max = 72) {
  const text = String(title ?? "").split(/[#\n]/)[0]?.replace(/\s+/g, " ").trim() ?? "";
  if (!text) return null;
  const letters = text.match(/[A-Za-z]/g)?.length ?? 0;
  const latinRatio = letters / Math.max(1, text.replace(/\s/g, "").length);
  const commonEnglish = text.toLowerCase().match(/\b(?:the|and|for|with|this|that|your|you|how|why|best|skin|shop|get|my|is|to|of)\b/g)?.length ?? 0;
  if (latinRatio < 0.75 || (/^[\p{Script=Latin}\s\p{N}\p{P}]+$/u.test(text) && commonEnglish === 0 && /[áéíóúñ¿¡]/i.test(text))) return null;
  if (text.length <= max) return text;
  const cut = text.slice(0, max + 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).trim()}...`;
}

export const normalizeAccount = (value: unknown) => cleanTerm(String(value ?? "")).replace(/[^a-z0-9]/g, "");
export function editDistance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prior = row[0] ?? 0; row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const old = row[j] ?? 0;
      row[j] = Math.min((row[j] ?? 0) + 1, (row[j - 1] ?? 0) + 1, prior + (a[i - 1] === b[j - 1] ? 0 : 1));
      prior = old;
    }
  }
  return row[b.length] ?? 0;
}
export function accountMatchesSeller(account: unknown, seller: unknown) {
  const a = normalizeAccount(account), b = normalizeAccount(seller);
  if (a.length < 4 || b.length < 4) return false;
  return a.includes(b) || b.includes(a) || editDistance(a, b) <= 2;
}

export function sellerRunFlags(videos: any[], creators: any[], sellerNames: string[]) {
  const names = sellerNames.map(normalizeAccount).filter(Boolean);
  const matches = (v: any) => names.some((seller) => accountMatchesSeller(v.belonged_creator_handle ?? v.creator_handle, seller) || accountMatchesSeller(v.nickname ?? v.creator_nickname, seller));
  const byCreator = new Map<string, any[]>();
  for (const v of videos) {
    const id = String(v.belonged_creator_id ?? v.belonged_creator_handle ?? "");
    byCreator.set(id, [...(byCreator.get(id) ?? []), v]);
  }
  const dominant = new Set<string>();
  for (const [id, vs] of byCreator) {
    const revenue = vs.reduce((n, v) => n + toNum(v.revenue), 0);
    const total = videos.reduce((n, v) => n + toNum(v.revenue), 0);
    const creator = creators.find((c) => String(c.creator_id ?? c.creator_handle) === id);
    if (vs.length >= 3 && total > 0 && revenue / total > .6 && toNum(creator?.creator_followers) < 5000) dominant.add(id);
  }
  const flaggedCreators = creators.filter((c) => matches(c) || dominant.has(String(c.creator_id ?? c.creator_handle))).map((c) => String(c.creator_id ?? c.creator_handle));
  const creatorSet = new Set(flaggedCreators);
  const flaggedVideos = videos.filter((v) => matches(v) || creatorSet.has(String(v.belonged_creator_id ?? v.belonged_creator_handle))).map((v) => String(v.video_id));
  return { sellerRunCreatorIds: flaggedCreators, sellerRunVideoIds: flaggedVideos };
}

export function robustVideoBenchmark(videos: any[]) {
  const revenues = videos.map((v) => toNum(v.revenue)).filter((n) => n > 0).sort((a, b) => a - b);
  if (!revenues.length) return { median: null, trimmedMean: null, hitRate: null, count: 0 };
  const drop = Math.floor(revenues.length * .05);
  const trimmed = revenues.slice(0, revenues.length - drop);
  return {
    median: median(revenues), trimmedMean: trimmed.reduce((n, x) => n + x, 0) / trimmed.length,
    hitRate: revenues.filter((n) => n > 500).length / revenues.length * 100, count: revenues.length,
  };
}
