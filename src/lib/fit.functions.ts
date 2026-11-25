import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { marketEntrySchema, qualificationReady } from "./qualification";
import { computeAll, type MarketData, type Product, selectedCompetitors, productKey, type EnrichedProduct, MAX_COMPETITORS } from "./calc";
import { applyClassificationFloor, fallbackClassify, fallbackExpansion, mergePoolProducts, searchTermSet, sellerRunFlags, topSellers } from "./discovery";
import { mapKeepaProduct, type AsinProduct } from "./asin";

/* eslint-disable @typescript-eslint/no-explicit-any */
const db = async () => (await import("@/integrations/supabase/client.server")).supabaseAdmin;
const PUBLIC_COLS = "id,created_at,updated_at,role,submitter_name,submitter_email,client_name,client_email,brand_name,branch,step_reached,answers,products,assumptions,kalodata,results";

function passOk(input: string) {
  const expected = process.env['TEAM_PASSCODE'];
  if (!expected) return false;
  const a = new TextEncoder().encode(input ?? ""), b = new TextEncoder().encode(expected);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

export const createSubmission = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => marketEntrySchema.parse(d))
  .handler(async ({ data: input }) => {
    const { emptyProduct, DEFAULT_ASSUMPTIONS } = await import("./calc");
    const lookup = input.lookup;
    const { data, error } = await (await db()).from("submissions").insert({
      brand_name: input.brand || lookup?.brand || "Your brand", step_reached: 0,
      products: [{ ...emptyProduct(), cogs: 0, weight: lookup?.weightLb ?? 0, length: lookup?.lengthIn ?? 0, width: lookup?.widthIn ?? 0, height: lookup?.heightIn ?? 0, name: lookup?.title || input.product, asin: input.asin, price: lookup?.price || input.price, keywords: input.keywords }],
      assumptions: DEFAULT_ASSUMPTIONS as any,
      answers: { flowVersion: 2, amazonUrl: input.asin ? input.product : "", marketPrice: lookup?.price || input.price, asinProvider: lookup?.provider },
    }).select("id").single();
    if (error) throw new Error(error.message);
    return { id: data.id as string };
  });

export const getSubmission = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { data: row } = await (await db()).from("submissions").select(PUBLIC_COLS).eq("id", data.id).maybeSingle();
    return (row as any) ?? null;
  });

const saveSchema = z.object({
  id: z.string().uuid(),
  patch: z.object({
    role: z.string().nullable().optional(), submitter_name: z.string().max(200).nullable().optional(), submitter_email: z.string().max(200).nullable().optional(),
    client_name: z.string().max(200).nullable().optional(), client_email: z.string().max(200).nullable().optional(), brand_name: z.string().max(200).nullable().optional(),
    branch: z.enum(["launch", "optimize"]).nullable().optional(), step_reached: z.number().int().min(0).max(10).optional(),
    answers: z.record(z.any()).optional(), products: z.array(z.any()).max(3).optional(), assumptions: z.record(z.any()).optional(),
  }),
});

async function recompute(id: string) {
  const sb = await db();
  const { data: row } = await sb.from("submissions").select("*").eq("id", id).single();
  if (!row) return;
  const r = computeAll({ branch: (row.branch as any) ?? null, answers: (row.answers as any) ?? {}, products: ((row.products as any) ?? []) as Product[], assumptions: (row.assumptions as any) ?? {}, kalodata: (row.kalodata as any) ?? null });
  await sb.from("submissions").update({
    results: { marginFloor: r.econ.avgMarginFloor, breakEvenGmv: r.econ.breakEvenGmv, programCost: r.econ.monthlyProgramCost, categoryGmv: r.bench.categoryGmv },
    verdict: r.verdict.verdict, verdict_reasons: { reasons: r.verdict.reasons, fixFirst: r.verdict.fixFirst },
  }).eq("id", id);
}

export const saveSubmission = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => saveSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = await db();
    const { data: cur } = await sb.from("submissions").select("*").eq("id", data.id).single();
    const patch: any = { ...data.patch };
    if (patch.assumptions) patch.assumptions = { ...(cur?.assumptions as any ?? {}), ownCost: z.number().min(0).max(10000).parse(patch.assumptions.ownCost) };
    if (patch.answers) {
      const allowed = ["interest", "flowVersion", "flowStep", "marketPrice", "shopName", "shopId", "shopPick", "runsIt", "samplesNow", "probation", "gmvMax", "gmvMaxDaily", "fulfillment", "challenge", "usSeller", "dtc", "commitSamples", "commitAds", "amazonUrl", "amazonRevenue", "dtcRevenue", "catalogSize", "excludedProducts", "competitorsConfirmed", "selectedProducts", "productOverrides", "asinProvider"];
      if (patch.answers.selectedProducts !== undefined) patch.answers.selectedProducts = z.array(z.string().max(100)).max(MAX_COMPETITORS).parse(patch.answers.selectedProducts);
      if (patch.answers.productOverrides !== undefined) patch.answers.productOverrides = z.record(z.enum(["direct", "adjacent", "no"])).parse(patch.answers.productOverrides);
      patch.answers = { ...(cur?.answers as any ?? {}), ...Object.fromEntries(Object.entries(patch.answers).filter(([key]) => allowed.includes(key))) };
    }
    const merged = { ...cur, ...patch };
    const currentStep = Number((cur?.answers as any)?.flowStep ?? 0), nextStep = Number(patch.answers?.flowStep ?? currentStep);
    if (nextStep > currentStep && nextStep > 1) for (let step = 1; step < nextStep; step++) if (!qualificationReady(step, merged)) throw new Error("Please complete every required question before continuing.");
    if (patch.answers?.interest === "no" && patch.submitter_email !== undefined) z.string().trim().email().max(200).parse(patch.submitter_email);
    if (patch.step_reached !== undefined) patch.step_reached = Math.max(patch.step_reached, cur?.step_reached ?? 0);
    const { error } = await sb.from("submissions").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    await recompute(data.id);
    return { ok: true };
  });

export const checkPasscode = createServerFn({ method: "POST" }).inputValidator((d: { passcode: string }) => z.object({ passcode: z.string().max(200) }).parse(d)).handler(async ({ data }) => ({ ok: passOk(data.passcode) }));
export const getTeamVerdict = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; passcode: string }) => z.object({ id: z.string().uuid(), passcode: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    if (!passOk(data.passcode)) return { ok: false as const };
    const { data: row } = await (await db()).from("submissions").select("verdict,verdict_reasons").eq("id", data.id).maybeSingle();
    return { ok: true as const, verdict: (row?.verdict as string) ?? null, reasons: (row?.verdict_reasons as any) ?? null };
  });
export const listSubmissions = createServerFn({ method: "POST" })
  .inputValidator((d: { passcode: string }) => z.object({ passcode: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    if (!passOk(data.passcode)) return { ok: false as const, rows: [] };
    const { data: rows } = await (await db()).from("submissions").select("id,created_at,brand_name,role,submitter_name,branch,verdict,results,answers,step_reached").order("created_at", { ascending: false }).limit(500);
    return { ok: true as const, rows: (rows ?? []).map((r: any) => ({ id: r.id, created_at: r.created_at, brand_name: r.brand_name, role: r.role, submitter_name: r.submitter_name, branch: r.branch, verdict: r.verdict, margin: r.results?.marginFloor ?? null, amazonRevenue: r.answers?.amazonRevenue ?? null, step: r.step_reached, interest: r.answers?.interest ?? null })) };
  });

// ---------------- Kalodata ----------------
const BASE = "https://www.kalodata.com/openapi/v1/tiktok/";
const COMMON = { region: "US", language: "en-US", currency: "USD", date_range: "last30Day" };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function kalo(path: string, body: Record<string, unknown>) {
  const key = process.env['KALODATA_API_KEY'];
  if (!key) throw new Error("Market data is not connected yet (missing API key).");
  const res = await fetch(BASE + path, { method: "POST", headers: { "X-API-KEY": key, "Content-Type": "application/json" }, body: JSON.stringify({ ...COMMON, ...body }), signal: AbortSignal.timeout(20000) });
  const json: any = await res.json().catch(() => null);
  if (!res.ok || !json || json.success === false) throw new Error(json?.message || `Market data request failed (${res.status}).`);
  return json.data;
}
const asList = (d: any): any[] => Array.isArray(d) ? d : Array.isArray(d?.list) ? d.list : Array.isArray(d?.records) ? d.records : [];
async function productSearch(keyword: string, size = 100, options: { dateRange?: string; shopId?: string } = {}) {
  await sleep(1100);
  return kalo("product/rank", { sort_field: { field: "revenue", type: "DESC" }, page_size: size, page_number: 1, ...(options.shopId ? { shop_id: options.shopId } : { keyword }), ...(options.dateRange ? { date_range: options.dateRange } : {}), need_image: 1, need_extra: true }).then(asList);
}
const shopSearch = (keyword: string, size = 10) => kalo("shop/rank", { sort_field: { field: "revenue", type: "DESC" }, page_size: size, page_number: 1, keyword, need_image: 1 }).then(asList);
const shopDetail = (shop_id: string) => kalo("shop/detail", { shop_id });
export const kalodata = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ action: z.enum(["shop_search", "shop_detail", "product_search"]), params: z.object({ keyword: z.string().max(200).optional(), shop_id: z.string().max(100).optional() }) }).parse(d))
  .handler(async ({ data }) => {
    try {
      if (data.action === "shop_search") return { ok: true, data: await shopSearch(data.params.keyword ?? "") };
      if (data.action === "product_search") return { ok: true, data: await productSearch(data.params.keyword ?? "", 20) };
      return { ok: true, data: await shopDetail(data.params.shop_id ?? "") };
    } catch (e) { return { ok: false, error: (e as Error).message, data: null }; }
  });

function previousCalendarMonth() {
  const d = new Date(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - 1);
  return d.toISOString().slice(0, 7);
}

async function classifyPool(pool: any[], expansion: { product_type: string; not_competitors: string[]; core: string; variants: string[] }) {
  const eligible = pool.filter((p) => Number(p.revenue ?? 0) >= 500).slice(0, 80);
  const payload = eligible.map((p) => ({ product_id: String(p.product_id), name: p.product_name, price: p.unit_price, category_1: p.pri_cate_name ?? p.pri_cate_id, category_2: p.sec_cate_name ?? p.sec_cate_id, category_3: p.ter_cate_name ?? p.ter_cate_id, seller: p.shop_name ?? p.seller_name ?? p.product_shop_name }));
  try {
    const { classifyProducts } = await import("./market-ai.server");
    const classified = await classifyProducts(payload, expansion.product_type, expansion.not_competitors);
    const byId = new Map(classified.map((c) => [c.product_id, c]));
    return { ai: true, pool: applyClassificationFloor(pool.map((p) => ({ ...p, relevance: byId.get(String(p.product_id))?.relevance ?? "no", relevanceReason: byId.get(String(p.product_id))?.reason ?? (Number(p.revenue ?? 0) < 500 ? "Under $500 in 30-day GMV." : "Outside the reviewed top 80.") })), expansion) };
  } catch (e) {
    console.error("AI relevance classification failed; using deterministic fallback", e);
    return { ai: false, pool: applyClassificationFloor(fallbackClassify(pool, expansion.core, expansion.product_type), expansion) };
  }
}

async function searchMarket(kws: string[], title = ""): Promise<MarketData> {
  let expansion = fallbackExpansion(kws, title), aiExpansion = false;
  try { expansion = await (await import("./market-ai.server")).expandSearch(title, kws); aiExpansion = true; }
  catch (e) { console.error("AI search expansion failed; using deterministic fallback", e); }
  if (/\btallow\b/i.test([title, ...kws].join(" "))) expansion.core = "tallow";
  const terms = searchTermSet(kws, expansion, title);
  let pool: any[] = [];
  for (const term of terms) {
    try { pool = mergePoolProducts(pool, await productSearch(term), term); }
    catch (e) { console.error(`Search failed for ${term}`, e); }
  }
  try {
    const discovered = await productSearch(expansion.core, 100, { dateRange: previousCalendarMonth() });
    const known = new Set(pool.map((p) => String(p.product_id)));
    for (const p of discovered) {
      if (known.has(String(p.product_id))) continue;
      // Historical rank is discovery only. Obtain current 30-day revenue before inclusion.
      try { await sleep(1100); const current = await kalo("product/detail", { product_id: String(p.product_id), date_range: "last30Day" }); pool = mergePoolProducts(pool, [{ ...current, product_id: String(p.product_id) }], `${expansion.core} (previous-month discovery, current 30d)`); }
      catch { /* Do not use historical GMV when a current snapshot is unavailable. */ }
    }
  }
  catch (e) { console.error("Previous-month core search failed", e); }
  const sellers = topSellers(pool);
  for (const shopId of sellers) {
    try { pool = mergePoolProducts(pool, await productSearch("", 50, { shopId }), "seller expansion"); }
    catch (e) { console.error(`Seller expansion failed for ${shopId}`, e); }
  }
  const classified = await classifyPool(pool, expansion);
  pool = classified.pool;
  const keywords = [{ keyword: terms.join(", "), products: pool, shops: [] }];
  return {
    ok: true, fetchedAt: new Date().toISOString(), keywords, pool, competitors: [], productOnly: true,
    discovery: { version: 2, core: expansion.core, productType: expansion.product_type, notCompetitors: expansion.not_competitors, searchTerms: terms, searchesCompleted: terms.length + 1 + sellers.length, totalScanned: pool.length, sellersExpanded: sellers.length, aiExpansion, aiClassification: classified.ai },
    keywordInfo: kws.map((input) => ({ input, used: expansion.core, broadened: input !== expansion.core, count: pool.length })), suggestions: [],
  };
}

export const runMarketScan = createServerFn({ method: "POST" }).inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d)).handler(async ({ data }) => {
  const sb = await db();
  const { data: row } = await sb.from("submissions").select("*").eq("id", data.id).single();
  if (!row) throw new Error("Not found");
  const cached = row.kalodata as any as MarketData | null;
  if (cached?.productOnly) return cached;
  const products = ((row.products as any) ?? []) as Product[];
  const kws = [...new Set(products.flatMap((p) => p.keywords ?? []).map((k) => k.trim().toLowerCase()).filter(Boolean))].slice(0, 8);
  let result: MarketData;
  try {
    if (!kws.length) throw new Error("Add at least one search keyword to your hero products.");
    result = await searchMarket(kws, products[0]?.name ?? "");
  } catch (e) {
    console.error("Market scan failed", e);
    result = { ok: false, error: "We could not load your market right now. Please try again.", keywords: [], competitors: [] };
  }
  await sb.from("submissions").update({ kalodata: result as any }).eq("id", data.id);
  await recompute(data.id);
  return result;
});

export const editMarketTerms = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), terms: z.array(z.string().trim().min(1).max(100)).min(1).max(8) }).parse(d))
  .handler(async ({ data }) => {
    const sb = await db(); const { data: row } = await sb.from("submissions").select("kalodata").eq("id", data.id).single();
    const k = row?.kalodata as any as MarketData;
    if (!k?.discovery || !k.pool) throw new Error("Run the market scan first");
    const existing = k.discovery.searchTerms;
    const added = data.terms.filter((t) => !existing.includes(t));
    let pool = k.pool;
    if (data.terms.length < existing.length) {
      const kept = new Set(data.terms);
      pool = pool.map((p) => ({ ...p, foundTerms: (p.foundTerms ?? []).filter((t: string) => kept.has(t) || t === "seller expansion") })).filter((p) => p.foundTerms.length);
    }
    for (const term of added) pool = mergePoolProducts(pool, await productSearch(term), term);
    const classified = await classifyPool(pool, { product_type: k.discovery.productType, not_competitors: k.discovery.notCompetitors, core: k.discovery.core, variants: data.terms });
    const updated = { ...k, pool: classified.pool, fetchedAt: new Date().toISOString(), keywords: [{ keyword: data.terms.join(", "), products: classified.pool, shops: [] }], discovery: { ...k.discovery, searchTerms: data.terms, searchesCompleted: k.discovery.searchesCompleted + added.length, totalScanned: classified.pool.length, aiClassification: classified.ai }, enriched: {} };
    const { error } = await sb.from("submissions").update({ kalodata: updated as any }).eq("id", data.id);
    if (error) throw new Error("Could not save search terms");
    return updated as MarketData;
  });

export const findMarketCompetitors = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), query: z.string().trim().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const match = data.query.match(/(?:product\/|product_id[=:/]?|^)(\d{8,25})(?:\D|$)/);
    if (match?.[1]) return { products: [], productId: match[1] };
    return { products: await productSearch(data.query, 20), productId: null };
  });

export const addMarketCompetitor = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), productId: z.string().regex(/^\d{8,25}$/) }).parse(d))
  .handler(async ({ data }) => {
    const sb = await db(); const { data: row } = await sb.from("submissions").select("kalodata,answers").eq("id", data.id).single();
    const k = row?.kalodata as any as MarketData, answers = (row?.answers as any) ?? {};
    if (!k?.pool) throw new Error("Run the market scan first");
    let product = k.pool.find((p) => String(p.product_id) === data.productId);
    if (!product) product = await kalo("product/detail", { product_id: data.productId });
    if (!product) throw new Error("Product not found");
    product = { ...product, product_id: data.productId, relevance: "direct", relevanceReason: "Added by you.", foundTerms: [...new Set([...(product.foundTerms ?? []), "added by you"])] };
    const pool = mergePoolProducts(k.pool, [product]).map((p) => String(p.product_id) === data.productId ? product : p);
    const selected = [...new Set([...(answers.selectedProducts ?? selectedCompetitors(k, answers).map(productKey)), data.productId])].slice(0, MAX_COMPETITORS);
    const updated = { ...k, pool, keywords: [{ keyword: k.discovery?.searchTerms.join(", ") ?? "", products: pool, shops: [] }] };
    const { error } = await sb.from("submissions").update({ kalodata: updated as any, answers: { ...answers, selectedProducts: selected, productOverrides: { ...(answers.productOverrides ?? {}), [data.productId]: "direct" } } }).eq("id", data.id);
    if (error) throw new Error("Could not add competitor");
    return { k: updated as MarketData, answers: { ...answers, selectedProducts: selected, productOverrides: { ...(answers.productOverrides ?? {}), [data.productId]: "direct" } } };
  });

const DETAIL_FIELDS = ["product_id", "revenue", "video_revenue", "live_revenue", "shopping_mall_revenue", "sales_volumn", "creator_number", "video_number", "live_number", "product_review_count"];
const pickDetail = (d: any) => Object.fromEntries(Object.entries(d ?? {}).filter(([f]) => DETAIL_FIELDS.includes(f)));
const CATEGORY_FIELDS = ["category_id", "category_name", "revenue", "revenue_growth_rate", "shop_number", "active_product_number", "sale", "video_revenue", "live_revenue", "affiliate_revenue", "self_operate_revenue", "shopping_mall_revenue", "average_shop_revenue", "revenue_trend"];
const pickCategory = (d: any) => d ? Object.fromEntries(Object.entries(d).filter(([f]) => CATEGORY_FIELDS.includes(f))) : undefined;

export const enrichCategory = createServerFn({ method: "POST" }).inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d)).handler(async ({ data }) => {
  const sb = await db(); const { data: row } = await sb.from("submissions").select("kalodata,answers").eq("id", data.id).single();
  if (!row) throw new Error("Report not found");
  const k = row.kalodata as any as MarketData;
  if (!k?.ok) throw new Error("Search for competing products first");
  if (k.category?.attempted) return k;
  const selected = selectedCompetitors(k, row.answers as any);
  const ids = selected.map((p) => k.enriched?.[productKey(p)]?.detail).filter(Boolean);
  const count = new Map<string, { n: number; parent?: string | undefined }>();
  for (const d of ids as any[]) if (d.ter_cate_id) { const c = count.get(String(d.ter_cate_id)); count.set(String(d.ter_cate_id), { n: (c?.n ?? 0) + 1, parent: d.sec_cate_id ? String(d.sec_cate_id) : undefined }); }
  let best = [...count.entries()].sort((a, b) => b[1].n - a[1].n)[0];
  if (!best && selected[0]) { try { const d = await kalo("product/detail", { product_id: productKey(selected[0]) }); if (d?.ter_cate_id) best = [String(d.ter_cate_id), { n: 1, parent: d.sec_cate_id ? String(d.sec_cate_id) : undefined }]; } catch { /* skip */ } }
  const category: any = { attempted: true, fetchedAt: new Date().toISOString() };
  if (best) {
    const get = async (id: string, range: string) => { try { return pickCategory(await kalo("category/detail", { category_id: id, date_range: range })); } catch { return undefined; } };
    category.id = best[0]; category.d30 = await get(best[0], "last30Day"); category.d90 = await get(best[0], "last90Day");
    if (best[1].parent) category.parent90 = await get(best[1].parent, "last90Day");
  }
  const backfill: Record<string, any> = {};
  for (const p of selected) { const key = productKey(p), e = k.enriched?.[key]; if (e?.detail && !e.detail90) { try { backfill[key] = pickDetail(await kalo("product/detail", { product_id: key, date_range: "last90Day" })); } catch { /* skip */ } } }
  const { data: current } = await sb.from("submissions").select("kalodata").eq("id", data.id).single();
  const latest = (current?.kalodata as any) ?? k, enriched = { ...(latest.enriched ?? {}) };
  for (const [key, d90] of Object.entries(backfill)) if (enriched[key]) enriched[key] = { ...enriched[key], detail90: d90 };
  const updated = { ...latest, enriched, category };
  const { error } = await sb.from("submissions").update({ kalodata: updated }).eq("id", data.id);
  if (error) throw new Error("Could not save category data");
  return updated as MarketData;
});

export const enrichMarketProduct = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), productId: z.string().min(1).max(100), own: z.boolean().optional() }).parse(d))
  .handler(async ({ data }) => {
    const sb = await db(); const { data: row, error } = await sb.from("submissions").select("kalodata,answers").eq("id", data.id).single();
    if (error || !row) throw new Error("Report not found");
    const k = row.kalodata as any as MarketData, answers = row.answers as any;
    const list = data.own ? (k.ownProducts ?? []) : selectedCompetitors(k, answers);
    const product = list.find((p) => productKey(p) === data.productId);
    if (!product) throw new Error("Product is not selected");
    const field = data.own ? "ownEnriched" : "enriched", prior = k[field]?.[data.productId];
    if (prior?.attempted) return k;
    const entry: EnrichedProduct = { product, ...(prior ?? {}), attempted: true, errors: [] };
    async function attempt(label: string, call: () => Promise<any>) { try { return await call(); } catch { entry.errors?.push(label); return undefined; } }
    entry.detail = await attempt("Product details unavailable", () => kalo("product/detail", { product_id: data.productId }));
    if (entry.detail) entry.detail = Object.fromEntries(Object.entries(entry.detail).filter(([field]) => ["product_id", "product_name", "product_shop_id", "shop_id", "shop_name", "seller_name", "min_price", "max_price", "revenue", "video_revenue", "live_revenue", "shopping_mall_revenue", "showcase_revenue", "sales_volumn", "creator_number", "video_number", "live_number", "commission_rate", "unit_price", "product_review_count", "launch_date", "delivery_type", "master_image_url", "image_url", "pri_cate_id", "sec_cate_id", "ter_cate_id"].includes(field)));
    const detail90 = await attempt("90-day details unavailable", () => kalo("product/detail", { product_id: data.productId, date_range: "last90Day" }));
    if (detail90) entry.detail90 = pickDetail(detail90);
    await sleep(1100);
    entry.videos = await attempt("Top videos unavailable", () => kalo("video/rank", { product_id: data.productId, sort_field: { field: "revenue", type: "DESC" }, page_size: 100, page_number: 1 }).then(asList));
    let newCount = 0, counted = false, capped = false;
    for (let page = 1; page <= 3; page++) {
      await sleep(1100);
      const videos = await attempt("New video count incomplete", () => kalo("video/rank", { product_id: data.productId, publish_date_range: "<30", sort_field: { field: "revenue", type: "DESC" }, page_size: 100, page_number: page }).then(asList));
      if (!videos) { capped = counted; break; }
      counted = true; newCount += videos.length;
      if (videos.length < 100) { capped = false; break; }
      capped = true;
    }
    if (counted) { entry.newVideos = newCount; entry.newVideosCapped = capped; }
    await sleep(1100);
    entry.creators = await attempt("Creator data unavailable", () => kalo("creator/rank", { product_id: data.productId, sort_field: { field: "revenue", type: "DESC" }, page_size: 20, page_number: 1 }).then(asList));
    const flags = sellerRunFlags(entry.videos ?? [], entry.creators ?? [], [entry.detail?.shop_name, entry.detail?.seller_name, product.shop_name, product.seller_name, product.product_shop_name].filter(Boolean));
    entry.sellerRunVideoIds = flags.sellerRunVideoIds; entry.sellerRunCreatorIds = flags.sellerRunCreatorIds;
    const { data: current } = await sb.from("submissions").select("kalodata").eq("id", data.id).single();
    const latest = (current?.kalodata ?? k) as any;
    const updated = { ...latest, [field]: { ...(latest[field] ?? {}), [data.productId]: entry } };
    const { error: writeError } = await sb.from("submissions").update({ kalodata: updated }).eq("id", data.id);
    if (writeError) throw new Error("Could not save market data");
    await recompute(data.id);
    return updated as MarketData;
  });

export const findOwnProducts = createServerFn({ method: "POST" }).inputValidator((d: unknown) => z.object({ id: z.string().uuid(), shopId: z.string().max(100).optional() }).parse(d)).handler(async ({ data }) => {
  const sb = await db(); const { data: row } = await sb.from("submissions").select("kalodata,answers").eq("id", data.id).single();
  const answers = row?.answers as any, k = row?.kalodata as any;
  if (!answers) throw new Error("Report not found");
  if (data.shopId) answers.shopId = data.shopId;
  if (!k || !answers?.shopId) throw new Error("Choose your shop first");
  if (k.ownShopId === answers.shopId && k.ownProducts) return k as MarketData;
  let ownProducts: any[] = [];
  try { ownProducts = await productSearch("", 20, { shopId: answers.shopId }); } catch { return { ...k, ownError: "Your product data is unavailable." } as MarketData; }
  const updated = { ...k, ownProducts: ownProducts.slice(0, 5), ownEnriched: {}, ownShopId: answers.shopId };
  const { error } = await sb.from("submissions").update({ kalodata: updated }).eq("id", data.id);
  if (error) throw new Error("Could not save your products");
  return updated as MarketData;
});

const overrideSchema = z.object({ postRate: z.number().min(.01).max(1).optional(), commission: z.number().min(0).max(100).optional(), samples: z.number().int().min(150).max(100000).optional(), roas: z.number().min(0).max(100).optional(), guardrailMonth6: z.number().min(0).max(10000000).optional(), guardrailMonth12: z.number().min(0).max(10000000).optional() });
export const adjustTeamAssumptions = createServerFn({ method: "POST" }).inputValidator((d: unknown) => z.object({ id: z.string().uuid(), passcode: z.string().max(200), overrides: overrideSchema }).parse(d)).handler(async ({ data }) => {
  if (!passOk(data.passcode)) throw new Error("Wrong passcode");
  const sb = await db(); const { data: row } = await sb.from("submissions").select("kalodata").eq("id", data.id).single();
  if (!row) throw new Error("Report not found");
  const k = { ...(row.kalodata as any), teamOverrides: data.overrides, adjustedAt: Object.keys(data.overrides).length ? new Date().toISOString() : undefined };
  const { error } = await sb.from("submissions").update({ kalodata: k }).eq("id", data.id); if (error) throw new Error("Could not save adjustments");
  await recompute(data.id); return k as MarketData;
});
export const refreshTeamData = createServerFn({ method: "POST" }).inputValidator((d: unknown) => z.object({ id: z.string().uuid(), passcode: z.string().max(200) }).parse(d)).handler(async ({ data }) => {
  if (!passOk(data.passcode)) throw new Error("Wrong passcode");
  const sb = await db(); const { data: row } = await sb.from("submissions").select("kalodata,products,answers").eq("id", data.id).single();
  if (!row) throw new Error("Report not found");
  const old = row.kalodata as any;
  const products = (row.products as any) ?? [];
  const kws = [...new Set(products.flatMap((p: any) => p.keywords ?? []).map((x: any) => String(x).trim().toLowerCase()).filter(Boolean))].slice(0, 8) as string[];
  const k = { ...(await searchMarket(kws, products[0]?.name ?? "")), teamOverrides: old?.teamOverrides, adjustedAt: old?.adjustedAt };
  const answers = { ...(row.answers as any), selectedProducts: undefined, competitorsConfirmed: false, productOverrides: {} };
  const { error } = await sb.from("submissions").update({ kalodata: k as any, answers }).eq("id", data.id); if (error) throw new Error("Could not refresh data");
  return k as MarketData;
});

export const editMarketKeywords = createServerFn({ method: "POST" }).inputValidator((d: unknown) => z.object({ id: z.string().uuid(), keywords: z.array(z.string().trim().min(1).max(200)).min(1).max(8) }).parse(d)).handler(async ({ data }) => {
  const sb = await db(); const { data: row } = await sb.from("submissions").select("products,answers,kalodata").eq("id", data.id).single();
  if (!row) throw new Error("Report not found");
  const k = row.kalodata as any, insights = (await import('./calc')).competitorInsights(k, row.answers as any);
  if (insights.hasData && (row.answers as any)?.competitorsConfirmed) throw new Error("Only unconfirmed or unavailable market searches can be changed");
  const products = (row.products as any) ?? [];
  if (!products[0]) throw new Error("Product not found");
  products[0] = { ...products[0], keywords: data.keywords };
  const { error } = await sb.from("submissions").update({ products, kalodata: null, answers: { ...(row.answers as any), competitorsConfirmed: false, excludedProducts: [], selectedProducts: undefined, productOverrides: {} } }).eq("id", data.id);
  if (error) throw new Error("Could not save keywords"); return { ok: true };
});

// ---------------- Amazon ASIN lookup ----------------
export const suggestSearchTerms = createServerFn({ method: "POST" }).inputValidator((d: unknown) => z.object({ title: z.string().max(1000), keywords: z.array(z.string().max(200)).max(8) }).parse(d)).handler(async ({ data }) => {
  try {
    const expansion = await (await import("./market-ai.server")).expandSearch(data.title, data.keywords);
    return { terms: searchTermSet(data.keywords, expansion, data.title).slice(0, 6) };
  } catch {
    const expansion = fallbackExpansion(data.keywords, data.title);
    return { terms: searchTermSet(data.keywords, expansion, data.title).slice(0, 6) };
  }
});

async function hubLookup(asin: string): Promise<AsinProduct | null> {
  const url = process.env['HUB_API_URL'], key = process.env['HUB_API_KEY'];
  if (!url || !key) return null;
  // TODO: confirm Sophie Hub's final route and response envelope. The provider interface is stable.
  const res = await fetch(`${url.replace(/\/$/, "")}/asin/${asin}`, { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error("Sophie Hub lookup failed");
  const body: any = await res.json();
  return { ...body, provider: "hub" } as AsinProduct;
}
async function keepaLookup(asin: string): Promise<AsinProduct | null> {
  const key = process.env['KEEPA_API_KEY'];
  if (!key) return null;
  const res = await fetch(`https://api.keepa.com/product?key=${encodeURIComponent(key)}&domain=1&asin=${asin}&stats=1`, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error("Amazon product lookup failed");
  const body: any = await res.json();
  const raw = body.products?.[0];
  if (!raw) return null;
  const mapped = mapKeepaProduct(raw);
  const expected = ["title", "packageLength", "packageWidth", "packageHeight", "packageWeight", "itemWeight", "stats", "fbaFees"];
  const unmapped = expected.filter((field) => raw[field] === undefined);
  if (unmapped.length) console.info(`Keepa response for ${asin} did not include fields: ${unmapped.join(", ")}`);
  return mapped;
}
async function amazonPageLookup(asin: string): Promise<AsinProduct | null> {
  const { parseAmazonPage, isAmazonBlockPage } = await import("./asin");
  const res = await fetch(`https://www.amazon.com/dp/${asin}?th=1&psc=1`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });
  const html = await res.text();
  if (!res.ok || isAmazonBlockPage(html)) { console.warn(`Amazon page lookup for ${asin} blocked or failed (${res.status})`); return null; }
  const parsed = parseAmazonPage(html);
  // TEMP diagnostics for the page parser.
  try {
    const plain = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const around = (re: RegExp) => { const i = plain.search(re); return i < 0 ? "none" : plain.slice(Math.max(0, i - 40), i + 220); };
    console.info(`[asin-debug] ${asin} len=${html.length} dims=${around(/Dimensions/i)} || weight=${around(/Weight/i)} || prices=${[...html.matchAll(/class="a-offscreen">\s*([^<]{1,20})</g)].slice(0, 8).map((m) => m[1]).join(",")} || ptp=${html.indexOf("priceToPay")} core=${html.indexOf("corePriceDisplay_desktop_feature_div")} apex=${html.indexOf("apex_desktop")}`);
  } catch { /* diagnostics only */ }
  if (!parsed) { console.warn(`Amazon page for ${asin} could not be parsed`); return null; }
  return { ...parsed, provider: "amazon" };
}

export const lookupAsin = createServerFn({ method: "POST" }).inputValidator((d: unknown) => z.object({ asin: z.string().regex(/^[A-Za-z0-9]{10}$/) }).parse(d)).handler(async ({ data }) => {
  const asin = data.asin.toUpperCase(), sb = await db();
  const { data: cached } = await sb.from("asin_cache").select("fetched_at,payload").eq("asin", asin).maybeSingle();
  // Only reuse complete lookups made by the current parser (v2); retry partial ones.
  const usable = cached && (cached.payload as any)?.parserVersion === 2 && Number((cached.payload as any)?.lengthIn) > 0;
  if (cached && usable && Date.now() - new Date(cached.fetched_at).getTime() < 30 * 86400000) return { ok: true, product: cached.payload as any as AsinProduct, cached: true };
  try {
    let product: AsinProduct | null = null;
    for (const provider of [hubLookup, keepaLookup, amazonPageLookup]) {
      try { product = await provider(asin); } catch (e) { console.error(`ASIN lookup provider failed for ${asin}`, e); }
      if (product && product.title) break;
    }
    if (!product) return { ok: false, product: null, message: "Amazon did not return this listing right now. We filled in what we could; check the product details below." };
    await sb.from("asin_cache").upsert({ asin, fetched_at: new Date().toISOString(), payload: { ...product, parserVersion: 2 } as any });
    return { ok: true, product, cached: false };
  } catch (e) {
    console.error("ASIN lookup failed", e);
    return { ok: false, product: null, message: "We could not retrieve this Amazon listing. Enter the details manually." };
  }
});
