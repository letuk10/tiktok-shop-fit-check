import { E as fallbackExpansion, M as searchTermSet, N as sellerRunFlags, P as topSellers, T as fallbackClassify, k as mergePoolProducts, l as computeAll, v as productKey, w as applyClassificationFloor, x as selectedCompetitors } from "./calc-BRdncDBi.mjs";
import { a as numberType, c as stringType, i as enumType, n as arrayType, o as objectType, r as booleanType, s as recordType, t as anyType } from "../_libs/zod.mjs";
import { n as marketEntrySchema, r as qualificationReady } from "./qualification-DCEdAUKe.mjs";
import { a as TSS_SERVER_FUNCTION, l as createServerFn } from "./createServerFn-DDDJMFWM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fit.functions-B80Zwf-A.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var mmToIn = (n) => typeof n === "number" && n > 0 ? n / 25.4 : 0;
var gramsToLb = (n) => typeof n === "number" && n > 0 ? n / 453.59237 : 0;
var cents = (n) => typeof n === "number" && n >= 0 ? n / 100 : 0;
function mapKeepaProduct(p) {
	const current = Array.isArray(p.stats?.current) ? p.stats.current : [];
	const buyBox = current[18] ?? 0;
	const price = cents(buyBox > 0 ? buyBox : current[1]);
	const weightLb = gramsToLb(p.packageWeight) || gramsToLb(p.itemWeight);
	const imageFile = String(p.imagesCSV ?? "").split(",")[0]?.trim();
	const categoryPath = p.categoryTree?.map((c) => String(c.name ?? "")).filter(Boolean) ?? [];
	const monthlySold = typeof p.monthlySold === "number" ? p.monthlySold : typeof p.stats?.monthlySold === "number" ? p.stats.monthlySold : void 0;
	const fba = typeof p.fbaFees?.pickAndPackFee === "number" ? cents(p.fbaFees.pickAndPackFee) : void 0;
	return {
		title: String(p.title ?? ""),
		brand: String(p.brand ?? p.manufacturer ?? ""),
		image: imageFile ? `https://m.media-amazon.com/images/I/${imageFile}` : "",
		price,
		lengthIn: mmToIn(p.packageLength),
		widthIn: mmToIn(p.packageWidth),
		heightIn: mmToIn(p.packageHeight),
		weightLb,
		categoryPath,
		...fba !== void 0 ? { fbaPickAndPackFee: fba } : {},
		...monthlySold !== void 0 ? { monthlySold } : {},
		...monthlySold && price ? { monthlyRevenue: monthlySold * price } : {},
		provider: "keepa"
	};
}
var db = async () => (await import("./client.server-nmvUk0Ey.mjs")).supabaseAdmin;
var PUBLIC_COLS = "id,created_at,updated_at,role,submitter_name,submitter_email,client_name,client_email,brand_name,branch,step_reached,answers,products,assumptions,kalodata,results";
function passOk(input) {
	const expected = process.env["TEAM_PASSCODE"];
	if (!expected) return false;
	const a = new TextEncoder().encode(input ?? ""), b = new TextEncoder().encode(expected);
	let diff = a.length ^ b.length;
	for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
	return diff === 0;
}
var createSubmission_createServerFn_handler = createServerRpc({
	id: "1adf66312ce9c809661275bb5d83a2911a5149b1bac5a1bb71d552d875719724",
	name: "createSubmission",
	filename: "src/lib/fit.functions.ts"
}, (opts) => createSubmission.__executeServer(opts));
var createSubmission = createServerFn({ method: "POST" }).inputValidator((d) => marketEntrySchema.parse(d)).handler(createSubmission_createServerFn_handler, async ({ data: input }) => {
	const { emptyProduct, DEFAULT_ASSUMPTIONS } = await import("./calc-BRdncDBi.mjs").then((n) => n.o);
	const lookup = input.lookup;
	const { data, error } = await (await db()).from("submissions").insert({
		brand_name: input.brand || lookup?.brand || "Your brand",
		step_reached: 0,
		products: [{
			...emptyProduct(),
			cogs: 0,
			weight: lookup?.weightLb ?? 0,
			length: lookup?.lengthIn ?? 0,
			width: lookup?.widthIn ?? 0,
			height: lookup?.heightIn ?? 0,
			name: lookup?.title || input.product,
			asin: input.asin,
			price: lookup?.price || input.price,
			keywords: input.keywords
		}],
		assumptions: DEFAULT_ASSUMPTIONS,
		answers: {
			flowVersion: 2,
			amazonUrl: input.asin ? input.product : "",
			marketPrice: lookup?.price || input.price,
			asinProvider: lookup?.provider
		}
	}).select("id").single();
	if (error) throw new Error(error.message);
	return { id: data.id };
});
var getSubmission_createServerFn_handler = createServerRpc({
	id: "a88b5d81bb871d1dd89bc1510fc872b9c5e5d566853d75bc1356c3c51793365f",
	name: "getSubmission",
	filename: "src/lib/fit.functions.ts"
}, (opts) => getSubmission.__executeServer(opts));
var getSubmission = createServerFn({ method: "GET" }).inputValidator((d) => objectType({ id: stringType().uuid() }).parse(d)).handler(getSubmission_createServerFn_handler, async ({ data }) => {
	const { data: row } = await (await db()).from("submissions").select(PUBLIC_COLS).eq("id", data.id).maybeSingle();
	return row ?? null;
});
var saveSchema = objectType({
	id: stringType().uuid(),
	patch: objectType({
		role: stringType().nullable().optional(),
		submitter_name: stringType().max(200).nullable().optional(),
		submitter_email: stringType().max(200).nullable().optional(),
		client_name: stringType().max(200).nullable().optional(),
		client_email: stringType().max(200).nullable().optional(),
		brand_name: stringType().max(200).nullable().optional(),
		branch: enumType(["launch", "optimize"]).nullable().optional(),
		step_reached: numberType().int().min(0).max(10).optional(),
		answers: recordType(anyType()).optional(),
		products: arrayType(anyType()).max(3).optional(),
		assumptions: recordType(anyType()).optional()
	})
});
async function recompute(id) {
	const sb = await db();
	const { data: row } = await sb.from("submissions").select("*").eq("id", id).single();
	if (!row) return;
	const r = computeAll({
		branch: row.branch ?? null,
		answers: row.answers ?? {},
		products: row.products ?? [],
		assumptions: row.assumptions ?? {},
		kalodata: row.kalodata ?? null
	});
	await sb.from("submissions").update({
		results: {
			marginFloor: r.econ.avgMarginFloor,
			breakEvenGmv: r.econ.breakEvenGmv,
			programCost: r.econ.monthlyProgramCost,
			categoryGmv: r.bench.categoryGmv
		},
		verdict: r.verdict.verdict,
		verdict_reasons: {
			reasons: r.verdict.reasons,
			fixFirst: r.verdict.fixFirst
		}
	}).eq("id", id);
}
var saveSubmission_createServerFn_handler = createServerRpc({
	id: "b2e3bc252f3160f46d9970122e7e015e6967b7f9e7cd12c923282361c378da78",
	name: "saveSubmission",
	filename: "src/lib/fit.functions.ts"
}, (opts) => saveSubmission.__executeServer(opts));
var saveSubmission = createServerFn({ method: "POST" }).inputValidator((d) => saveSchema.parse(d)).handler(saveSubmission_createServerFn_handler, async ({ data }) => {
	const sb = await db();
	const { data: cur } = await sb.from("submissions").select("*").eq("id", data.id).single();
	const patch = { ...data.patch };
	if (patch.assumptions) patch.assumptions = {
		...cur?.assumptions ?? {},
		ownCost: numberType().min(0).max(1e4).parse(patch.assumptions.ownCost)
	};
	if (patch.answers) {
		const allowed = [
			"interest",
			"flowVersion",
			"flowStep",
			"marketPrice",
			"shopName",
			"shopId",
			"shopPick",
			"runsIt",
			"samplesNow",
			"probation",
			"gmvMax",
			"gmvMaxDaily",
			"fulfillment",
			"challenge",
			"usSeller",
			"dtc",
			"commitSamples",
			"commitAds",
			"amazonUrl",
			"amazonRevenue",
			"dtcRevenue",
			"catalogSize",
			"excludedProducts",
			"competitorsConfirmed",
			"selectedProducts",
			"productOverrides",
			"asinProvider"
		];
		if (patch.answers.selectedProducts !== void 0) patch.answers.selectedProducts = arrayType(stringType().max(100)).max(8).parse(patch.answers.selectedProducts);
		if (patch.answers.productOverrides !== void 0) patch.answers.productOverrides = recordType(enumType([
			"direct",
			"adjacent",
			"no"
		])).parse(patch.answers.productOverrides);
		patch.answers = {
			...cur?.answers ?? {},
			...Object.fromEntries(Object.entries(patch.answers).filter(([key]) => allowed.includes(key)))
		};
	}
	const merged = {
		...cur,
		...patch
	};
	const currentStep = Number((cur?.answers)?.flowStep ?? 0), nextStep = Number(patch.answers?.flowStep ?? currentStep);
	if (nextStep > currentStep && nextStep > 1) {
		for (let step = 1; step < nextStep; step++) if (!qualificationReady(step, merged)) throw new Error("Please complete every required question before continuing.");
	}
	if (patch.answers?.interest === "no" && patch.submitter_email !== void 0) stringType().trim().email().max(200).parse(patch.submitter_email);
	if (patch.step_reached !== void 0) patch.step_reached = Math.max(patch.step_reached, cur?.step_reached ?? 0);
	const { error } = await sb.from("submissions").update(patch).eq("id", data.id);
	if (error) throw new Error(error.message);
	await recompute(data.id);
	return { ok: true };
});
var checkPasscode_createServerFn_handler = createServerRpc({
	id: "9d5da3fc8f3c46c723516485143d1b5f6a953611faf68f05639f6add17315f22",
	name: "checkPasscode",
	filename: "src/lib/fit.functions.ts"
}, (opts) => checkPasscode.__executeServer(opts));
var checkPasscode = createServerFn({ method: "POST" }).inputValidator((d) => objectType({ passcode: stringType().max(200) }).parse(d)).handler(checkPasscode_createServerFn_handler, async ({ data }) => ({ ok: passOk(data.passcode) }));
var getTeamVerdict_createServerFn_handler = createServerRpc({
	id: "a70a2b836161e5de7f3550d2af70fa27c398faf92d4c0596b5c39e2ef5bf58e3",
	name: "getTeamVerdict",
	filename: "src/lib/fit.functions.ts"
}, (opts) => getTeamVerdict.__executeServer(opts));
var getTeamVerdict = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	id: stringType().uuid(),
	passcode: stringType().max(200)
}).parse(d)).handler(getTeamVerdict_createServerFn_handler, async ({ data }) => {
	if (!passOk(data.passcode)) return { ok: false };
	const { data: row } = await (await db()).from("submissions").select("verdict,verdict_reasons").eq("id", data.id).maybeSingle();
	return {
		ok: true,
		verdict: row?.verdict ?? null,
		reasons: row?.verdict_reasons ?? null
	};
});
var listSubmissions_createServerFn_handler = createServerRpc({
	id: "03abfe2d5d455695d33c37fbaed64d1c9e2ecfd877c0a0ebdbb5ac35e37cd0c5",
	name: "listSubmissions",
	filename: "src/lib/fit.functions.ts"
}, (opts) => listSubmissions.__executeServer(opts));
var listSubmissions = createServerFn({ method: "POST" }).inputValidator((d) => objectType({ passcode: stringType().max(200) }).parse(d)).handler(listSubmissions_createServerFn_handler, async ({ data }) => {
	if (!passOk(data.passcode)) return {
		ok: false,
		rows: []
	};
	const { data: rows } = await (await db()).from("submissions").select("id,created_at,brand_name,role,submitter_name,branch,verdict,results,answers,step_reached").order("created_at", { ascending: false }).limit(500);
	return {
		ok: true,
		rows: (rows ?? []).map((r) => ({
			id: r.id,
			created_at: r.created_at,
			brand_name: r.brand_name,
			role: r.role,
			submitter_name: r.submitter_name,
			branch: r.branch,
			verdict: r.verdict,
			margin: r.results?.marginFloor ?? null,
			amazonRevenue: r.answers?.amazonRevenue ?? null,
			step: r.step_reached,
			interest: r.answers?.interest ?? null
		}))
	};
});
var BASE = "https://www.kalodata.com/openapi/v1/tiktok/";
var COMMON = {
	region: "US",
	language: "en-US",
	currency: "USD",
	date_range: "last30Day"
};
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function kalo(path, body) {
	const key = process.env["KALODATA_API_KEY"];
	if (!key) throw new Error("Market data is not connected yet (missing API key).");
	const res = await fetch(BASE + path, {
		method: "POST",
		headers: {
			"X-API-KEY": key,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			...COMMON,
			...body
		}),
		signal: AbortSignal.timeout(2e4)
	});
	const json = await res.json().catch(() => null);
	if (!res.ok || !json || json.success === false) throw new Error(json?.message || `Market data request failed (${res.status}).`);
	return json.data;
}
var asList = (d) => Array.isArray(d) ? d : Array.isArray(d?.list) ? d.list : Array.isArray(d?.records) ? d.records : [];
async function productSearch(keyword, size = 100, options = {}) {
	await sleep(1100);
	return kalo("product/rank", {
		sort_field: {
			field: "revenue",
			type: "DESC"
		},
		page_size: size,
		page_number: 1,
		...options.shopId ? { shop_id: options.shopId } : { keyword },
		...options.dateRange ? { date_range: options.dateRange } : {},
		need_image: 1,
		need_extra: true
	}).then(asList);
}
var shopSearch = (keyword, size = 10) => kalo("shop/rank", {
	sort_field: {
		field: "revenue",
		type: "DESC"
	},
	page_size: size,
	page_number: 1,
	keyword,
	need_image: 1
}).then(asList);
var shopDetail = (shop_id) => kalo("shop/detail", { shop_id });
var kalodata_createServerFn_handler = createServerRpc({
	id: "acfc2cd5c77d07a665be812a6f3b209a154414616ce53481e6bc7c64bc8ff352",
	name: "kalodata",
	filename: "src/lib/fit.functions.ts"
}, (opts) => kalodata.__executeServer(opts));
var kalodata = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	action: enumType([
		"shop_search",
		"shop_detail",
		"product_search"
	]),
	params: objectType({
		keyword: stringType().max(200).optional(),
		shop_id: stringType().max(100).optional()
	})
}).parse(d)).handler(kalodata_createServerFn_handler, async ({ data }) => {
	try {
		if (data.action === "shop_search") return {
			ok: true,
			data: await shopSearch(data.params.keyword ?? "")
		};
		if (data.action === "product_search") return {
			ok: true,
			data: await productSearch(data.params.keyword ?? "", 20)
		};
		return {
			ok: true,
			data: await shopDetail(data.params.shop_id ?? "")
		};
	} catch (e) {
		return {
			ok: false,
			error: e.message,
			data: null
		};
	}
});
function previousCalendarMonth() {
	const d = /* @__PURE__ */ new Date();
	d.setUTCDate(1);
	d.setUTCMonth(d.getUTCMonth() - 1);
	return d.toISOString().slice(0, 7);
}
async function classifyPool(pool, expansion) {
	const payload = pool.filter((p) => Number(p.revenue ?? 0) >= 500).slice(0, 80).map((p) => ({
		product_id: String(p.product_id),
		name: p.product_name,
		price: p.unit_price,
		category_1: p.pri_cate_name ?? p.pri_cate_id,
		category_2: p.sec_cate_name ?? p.sec_cate_id,
		category_3: p.ter_cate_name ?? p.ter_cate_id,
		seller: p.shop_name ?? p.seller_name ?? p.product_shop_name
	}));
	try {
		const { classifyProducts } = await import("./market-ai.server-BdlxdXVJ.mjs");
		const classified = await classifyProducts(payload, expansion.product_type, expansion.not_competitors);
		const byId = new Map(classified.map((c) => [c.product_id, c]));
		return {
			ai: true,
			pool: applyClassificationFloor(pool.map((p) => ({
				...p,
				relevance: byId.get(String(p.product_id))?.relevance ?? "no",
				relevanceReason: byId.get(String(p.product_id))?.reason ?? (Number(p.revenue ?? 0) < 500 ? "Under $500 in 30-day GMV." : "Outside the reviewed top 80.")
			})), expansion)
		};
	} catch (e) {
		console.error("AI relevance classification failed; using deterministic fallback", e);
		return {
			ai: false,
			pool: applyClassificationFloor(fallbackClassify(pool, expansion.core), expansion)
		};
	}
}
async function searchMarket(kws, title = "") {
	let expansion = fallbackExpansion(kws, title), aiExpansion = false;
	try {
		expansion = await (await import("./market-ai.server-BdlxdXVJ.mjs")).expandSearch(title, kws);
		aiExpansion = true;
	} catch (e) {
		console.error("AI search expansion failed; using deterministic fallback", e);
	}
	if (/\btallow\b/i.test([title, ...kws].join(" "))) expansion.core = "tallow";
	const terms = searchTermSet(kws, expansion, title);
	let pool = [];
	for (const term of terms) try {
		pool = mergePoolProducts(pool, await productSearch(term), term);
	} catch (e) {
		console.error(`Search failed for ${term}`, e);
	}
	try {
		const discovered = await productSearch(expansion.core, 100, { dateRange: previousCalendarMonth() });
		const known = new Set(pool.map((p) => String(p.product_id)));
		for (const p of discovered) {
			if (known.has(String(p.product_id))) continue;
			try {
				await sleep(1100);
				const current = await kalo("product/detail", {
					product_id: String(p.product_id),
					date_range: "last30Day"
				});
				pool = mergePoolProducts(pool, [{
					...current,
					product_id: String(p.product_id)
				}], `${expansion.core} (previous-month discovery, current 30d)`);
			} catch {}
		}
	} catch (e) {
		console.error("Previous-month core search failed", e);
	}
	const sellers = topSellers(pool);
	for (const shopId of sellers) try {
		pool = mergePoolProducts(pool, await productSearch("", 50, { shopId }), "seller expansion");
	} catch (e) {
		console.error(`Seller expansion failed for ${shopId}`, e);
	}
	const classified = await classifyPool(pool, expansion);
	pool = classified.pool;
	const keywords = [{
		keyword: terms.join(", "),
		products: pool,
		shops: []
	}];
	return {
		ok: true,
		fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
		keywords,
		pool,
		competitors: [],
		productOnly: true,
		discovery: {
			version: 2,
			core: expansion.core,
			productType: expansion.product_type,
			notCompetitors: expansion.not_competitors,
			searchTerms: terms,
			searchesCompleted: terms.length + 1 + sellers.length,
			totalScanned: pool.length,
			sellersExpanded: sellers.length,
			aiExpansion,
			aiClassification: classified.ai
		},
		keywordInfo: kws.map((input) => ({
			input,
			used: expansion.core,
			broadened: input !== expansion.core,
			count: pool.length
		})),
		suggestions: []
	};
}
var runMarketScan_createServerFn_handler = createServerRpc({
	id: "2a8b831515b68ca15cf637486418fb45780e1ec893df5d89ff6eaaef5d9d32cd",
	name: "runMarketScan",
	filename: "src/lib/fit.functions.ts"
}, (opts) => runMarketScan.__executeServer(opts));
var runMarketScan = createServerFn({ method: "POST" }).inputValidator((d) => objectType({ id: stringType().uuid() }).parse(d)).handler(runMarketScan_createServerFn_handler, async ({ data }) => {
	const sb = await db();
	const { data: row } = await sb.from("submissions").select("*").eq("id", data.id).single();
	if (!row) throw new Error("Not found");
	const cached = row.kalodata;
	if (cached?.productOnly) return cached;
	const products = row.products ?? [];
	const kws = [...new Set(products.flatMap((p) => p.keywords ?? []).map((k) => k.trim().toLowerCase()).filter(Boolean))].slice(0, 8);
	let result;
	try {
		if (!kws.length) throw new Error("Add at least one search keyword to your hero products.");
		result = await searchMarket(kws, products[0]?.name ?? "");
	} catch (e) {
		console.error("Market scan failed", e);
		result = {
			ok: false,
			error: "We could not load your market right now. Please try again.",
			keywords: [],
			competitors: []
		};
	}
	await sb.from("submissions").update({ kalodata: result }).eq("id", data.id);
	await recompute(data.id);
	return result;
});
var editMarketTerms_createServerFn_handler = createServerRpc({
	id: "fcd8f12044e2be5b2823226aeeb65ec37646e0cf0df363e0870230f5cd360b58",
	name: "editMarketTerms",
	filename: "src/lib/fit.functions.ts"
}, (opts) => editMarketTerms.__executeServer(opts));
var editMarketTerms = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	id: stringType().uuid(),
	terms: arrayType(stringType().trim().min(1).max(100)).min(1).max(8)
}).parse(d)).handler(editMarketTerms_createServerFn_handler, async ({ data }) => {
	const sb = await db();
	const { data: row } = await sb.from("submissions").select("kalodata").eq("id", data.id).single();
	const k = row?.kalodata;
	if (!k?.discovery || !k.pool) throw new Error("Run the market scan first");
	const existing = k.discovery.searchTerms;
	const added = data.terms.filter((t) => !existing.includes(t));
	let pool = k.pool;
	if (data.terms.length < existing.length) {
		const kept = new Set(data.terms);
		pool = pool.map((p) => ({
			...p,
			foundTerms: (p.foundTerms ?? []).filter((t) => kept.has(t) || t === "seller expansion")
		})).filter((p) => p.foundTerms.length);
	}
	for (const term of added) pool = mergePoolProducts(pool, await productSearch(term), term);
	const classified = await classifyPool(pool, {
		product_type: k.discovery.productType,
		not_competitors: k.discovery.notCompetitors,
		core: k.discovery.core,
		variants: data.terms
	});
	const updated = {
		...k,
		pool: classified.pool,
		fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
		keywords: [{
			keyword: data.terms.join(", "),
			products: classified.pool,
			shops: []
		}],
		discovery: {
			...k.discovery,
			searchTerms: data.terms,
			searchesCompleted: k.discovery.searchesCompleted + added.length,
			totalScanned: classified.pool.length,
			aiClassification: classified.ai
		},
		enriched: {}
	};
	const { error } = await sb.from("submissions").update({ kalodata: updated }).eq("id", data.id);
	if (error) throw new Error("Could not save search terms");
	return updated;
});
var findMarketCompetitors_createServerFn_handler = createServerRpc({
	id: "cd67778c097dd8448b2e18983f35ee51b80a7f9a942e7dd7b3278c1495dcae9a",
	name: "findMarketCompetitors",
	filename: "src/lib/fit.functions.ts"
}, (opts) => findMarketCompetitors.__executeServer(opts));
var findMarketCompetitors = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	id: stringType().uuid(),
	query: stringType().trim().min(1).max(200)
}).parse(d)).handler(findMarketCompetitors_createServerFn_handler, async ({ data }) => {
	const match = data.query.match(/(?:product\/|product_id[=:/]?|^)(\d{8,25})(?:\D|$)/);
	if (match?.[1]) return {
		products: [],
		productId: match[1]
	};
	return {
		products: await productSearch(data.query, 20),
		productId: null
	};
});
var addMarketCompetitor_createServerFn_handler = createServerRpc({
	id: "b7e55d1c2de64c2b979f3fcae6ac62a1098bbc112c7f80eef9ff3bad29707b5a",
	name: "addMarketCompetitor",
	filename: "src/lib/fit.functions.ts"
}, (opts) => addMarketCompetitor.__executeServer(opts));
var addMarketCompetitor = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	id: stringType().uuid(),
	productId: stringType().regex(/^\d{8,25}$/)
}).parse(d)).handler(addMarketCompetitor_createServerFn_handler, async ({ data }) => {
	const sb = await db();
	const { data: row } = await sb.from("submissions").select("kalodata,answers").eq("id", data.id).single();
	const k = row?.kalodata, answers = row?.answers ?? {};
	if (!k?.pool) throw new Error("Run the market scan first");
	let product = k.pool.find((p) => String(p.product_id) === data.productId);
	if (!product) product = await kalo("product/detail", { product_id: data.productId });
	if (!product) throw new Error("Product not found");
	product = {
		...product,
		product_id: data.productId,
		relevance: "direct",
		relevanceReason: "Added by you.",
		foundTerms: [.../* @__PURE__ */ new Set([...product.foundTerms ?? [], "added by you"])]
	};
	const pool = mergePoolProducts(k.pool, [product]).map((p) => String(p.product_id) === data.productId ? product : p);
	const selected = [.../* @__PURE__ */ new Set([...answers.selectedProducts ?? selectedCompetitors(k, answers).map(productKey), data.productId])].slice(0, 8);
	const updated = {
		...k,
		pool,
		keywords: [{
			keyword: k.discovery?.searchTerms.join(", ") ?? "",
			products: pool,
			shops: []
		}]
	};
	const { error } = await sb.from("submissions").update({
		kalodata: updated,
		answers: {
			...answers,
			selectedProducts: selected,
			productOverrides: {
				...answers.productOverrides ?? {},
				[data.productId]: "direct"
			}
		}
	}).eq("id", data.id);
	if (error) throw new Error("Could not add competitor");
	return {
		k: updated,
		answers: {
			...answers,
			selectedProducts: selected,
			productOverrides: {
				...answers.productOverrides ?? {},
				[data.productId]: "direct"
			}
		}
	};
});
var DETAIL_FIELDS = [
	"product_id",
	"revenue",
	"video_revenue",
	"live_revenue",
	"shopping_mall_revenue",
	"sales_volumn",
	"creator_number",
	"video_number",
	"live_number",
	"product_review_count"
];
var pickDetail = (d) => Object.fromEntries(Object.entries(d ?? {}).filter(([f]) => DETAIL_FIELDS.includes(f)));
var CATEGORY_FIELDS = [
	"category_id",
	"category_name",
	"revenue",
	"revenue_growth_rate",
	"shop_number",
	"active_product_number",
	"sale",
	"video_revenue",
	"live_revenue",
	"affiliate_revenue",
	"self_operate_revenue",
	"shopping_mall_revenue",
	"average_shop_revenue",
	"revenue_trend"
];
var pickCategory = (d) => d ? Object.fromEntries(Object.entries(d).filter(([f]) => CATEGORY_FIELDS.includes(f))) : void 0;
var enrichCategory_createServerFn_handler = createServerRpc({
	id: "befc3d4c386bf0e4b7be30f61e242b1265b109d749744b2b79a736fdd2e7eda7",
	name: "enrichCategory",
	filename: "src/lib/fit.functions.ts"
}, (opts) => enrichCategory.__executeServer(opts));
var enrichCategory = createServerFn({ method: "POST" }).inputValidator((d) => objectType({ id: stringType().uuid() }).parse(d)).handler(enrichCategory_createServerFn_handler, async ({ data }) => {
	const sb = await db();
	const { data: row } = await sb.from("submissions").select("kalodata,answers").eq("id", data.id).single();
	if (!row) throw new Error("Report not found");
	const k = row.kalodata;
	if (!k?.ok) throw new Error("Search for competing products first");
	if (k.category?.attempted) return k;
	const selected = selectedCompetitors(k, row.answers);
	const ids = selected.map((p) => k.enriched?.[productKey(p)]?.detail).filter(Boolean);
	const count = /* @__PURE__ */ new Map();
	for (const d of ids) if (d.ter_cate_id) {
		const c = count.get(String(d.ter_cate_id));
		count.set(String(d.ter_cate_id), {
			n: (c?.n ?? 0) + 1,
			parent: d.sec_cate_id ? String(d.sec_cate_id) : void 0
		});
	}
	let best = [...count.entries()].sort((a, b) => b[1].n - a[1].n)[0];
	if (!best && selected[0]) try {
		const d = await kalo("product/detail", { product_id: productKey(selected[0]) });
		if (d?.ter_cate_id) best = [String(d.ter_cate_id), {
			n: 1,
			parent: d.sec_cate_id ? String(d.sec_cate_id) : void 0
		}];
	} catch {}
	const category = {
		attempted: true,
		fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	if (best) {
		const get = async (id, range) => {
			try {
				return pickCategory(await kalo("category/detail", {
					category_id: id,
					date_range: range
				}));
			} catch {
				return;
			}
		};
		category.id = best[0];
		category.d30 = await get(best[0], "last30Day");
		category.d90 = await get(best[0], "last90Day");
		if (best[1].parent) category.parent90 = await get(best[1].parent, "last90Day");
	}
	const backfill = {};
	for (const p of selected) {
		const key = productKey(p), e = k.enriched?.[key];
		if (e?.detail && !e.detail90) try {
			backfill[key] = pickDetail(await kalo("product/detail", {
				product_id: key,
				date_range: "last90Day"
			}));
		} catch {}
	}
	const { data: current } = await sb.from("submissions").select("kalodata").eq("id", data.id).single();
	const latest = current?.kalodata ?? k, enriched = { ...latest.enriched ?? {} };
	for (const [key, d90] of Object.entries(backfill)) if (enriched[key]) enriched[key] = {
		...enriched[key],
		detail90: d90
	};
	const updated = {
		...latest,
		enriched,
		category
	};
	const { error } = await sb.from("submissions").update({ kalodata: updated }).eq("id", data.id);
	if (error) throw new Error("Could not save category data");
	return updated;
});
var enrichMarketProduct_createServerFn_handler = createServerRpc({
	id: "b59d4122e1f2df679d652180e7726fba65e997a6f8a94b16de4f57c02190723b",
	name: "enrichMarketProduct",
	filename: "src/lib/fit.functions.ts"
}, (opts) => enrichMarketProduct.__executeServer(opts));
var enrichMarketProduct = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	id: stringType().uuid(),
	productId: stringType().min(1).max(100),
	own: booleanType().optional()
}).parse(d)).handler(enrichMarketProduct_createServerFn_handler, async ({ data }) => {
	const sb = await db();
	const { data: row, error } = await sb.from("submissions").select("kalodata,answers").eq("id", data.id).single();
	if (error || !row) throw new Error("Report not found");
	const k = row.kalodata, answers = row.answers;
	const product = (data.own ? k.ownProducts ?? [] : selectedCompetitors(k, answers)).find((p) => productKey(p) === data.productId);
	if (!product) throw new Error("Product is not selected");
	const field = data.own ? "ownEnriched" : "enriched", prior = k[field]?.[data.productId];
	if (prior?.attempted) return k;
	const entry = {
		product,
		...prior ?? {},
		attempted: true,
		errors: []
	};
	async function attempt(label, call) {
		try {
			return await call();
		} catch {
			entry.errors?.push(label);
			return;
		}
	}
	entry.detail = await attempt("Product details unavailable", () => kalo("product/detail", { product_id: data.productId }));
	if (entry.detail) entry.detail = Object.fromEntries(Object.entries(entry.detail).filter(([field]) => [
		"product_id",
		"product_name",
		"product_shop_id",
		"shop_id",
		"shop_name",
		"seller_name",
		"min_price",
		"max_price",
		"revenue",
		"video_revenue",
		"live_revenue",
		"shopping_mall_revenue",
		"showcase_revenue",
		"sales_volumn",
		"creator_number",
		"video_number",
		"live_number",
		"commission_rate",
		"unit_price",
		"product_review_count",
		"launch_date",
		"delivery_type",
		"master_image_url",
		"image_url",
		"pri_cate_id",
		"sec_cate_id",
		"ter_cate_id"
	].includes(field)));
	const detail90 = await attempt("90-day details unavailable", () => kalo("product/detail", {
		product_id: data.productId,
		date_range: "last90Day"
	}));
	if (detail90) entry.detail90 = pickDetail(detail90);
	await sleep(1100);
	entry.videos = await attempt("Top videos unavailable", () => kalo("video/rank", {
		product_id: data.productId,
		sort_field: {
			field: "revenue",
			type: "DESC"
		},
		page_size: 100,
		page_number: 1
	}).then(asList));
	let newCount = 0, counted = false, capped = false;
	for (let page = 1; page <= 3; page++) {
		await sleep(1100);
		const videos = await attempt("New video count incomplete", () => kalo("video/rank", {
			product_id: data.productId,
			publish_date_range: "<30",
			sort_field: {
				field: "revenue",
				type: "DESC"
			},
			page_size: 100,
			page_number: page
		}).then(asList));
		if (!videos) {
			capped = counted;
			break;
		}
		counted = true;
		newCount += videos.length;
		if (videos.length < 100) {
			capped = false;
			break;
		}
		capped = true;
	}
	if (counted) {
		entry.newVideos = newCount;
		entry.newVideosCapped = capped;
	}
	await sleep(1100);
	entry.creators = await attempt("Creator data unavailable", () => kalo("creator/rank", {
		product_id: data.productId,
		sort_field: {
			field: "revenue",
			type: "DESC"
		},
		page_size: 20,
		page_number: 1
	}).then(asList));
	const flags = sellerRunFlags(entry.videos ?? [], entry.creators ?? [], [
		entry.detail?.shop_name,
		entry.detail?.seller_name,
		product.shop_name,
		product.seller_name,
		product.product_shop_name
	].filter(Boolean));
	entry.sellerRunVideoIds = flags.sellerRunVideoIds;
	entry.sellerRunCreatorIds = flags.sellerRunCreatorIds;
	const { data: current } = await sb.from("submissions").select("kalodata").eq("id", data.id).single();
	const latest = current?.kalodata ?? k;
	const updated = {
		...latest,
		[field]: {
			...latest[field] ?? {},
			[data.productId]: entry
		}
	};
	const { error: writeError } = await sb.from("submissions").update({ kalodata: updated }).eq("id", data.id);
	if (writeError) throw new Error("Could not save market data");
	await recompute(data.id);
	return updated;
});
var findOwnProducts_createServerFn_handler = createServerRpc({
	id: "d17f990034b5af60dd156fd1c0aa09effe5ec8812d2d2b2d6c377988130d6bc4",
	name: "findOwnProducts",
	filename: "src/lib/fit.functions.ts"
}, (opts) => findOwnProducts.__executeServer(opts));
var findOwnProducts = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	id: stringType().uuid(),
	shopId: stringType().max(100).optional()
}).parse(d)).handler(findOwnProducts_createServerFn_handler, async ({ data }) => {
	const sb = await db();
	const { data: row } = await sb.from("submissions").select("kalodata,answers").eq("id", data.id).single();
	const answers = row?.answers, k = row?.kalodata;
	if (!answers) throw new Error("Report not found");
	if (data.shopId) answers.shopId = data.shopId;
	if (!k || !answers?.shopId) throw new Error("Choose your shop first");
	if (k.ownShopId === answers.shopId && k.ownProducts) return k;
	let ownProducts = [];
	try {
		ownProducts = await productSearch("", 20, { shopId: answers.shopId });
	} catch {
		return {
			...k,
			ownError: "Your product data is unavailable."
		};
	}
	const updated = {
		...k,
		ownProducts: ownProducts.slice(0, 5),
		ownEnriched: {},
		ownShopId: answers.shopId
	};
	const { error } = await sb.from("submissions").update({ kalodata: updated }).eq("id", data.id);
	if (error) throw new Error("Could not save your products");
	return updated;
});
var overrideSchema = objectType({
	postRate: numberType().min(.01).max(1).optional(),
	commission: numberType().min(0).max(100).optional(),
	samples: numberType().int().min(150).max(1e5).optional(),
	roas: numberType().min(0).max(100).optional(),
	guardrailMonth6: numberType().min(0).max(1e7).optional(),
	guardrailMonth12: numberType().min(0).max(1e7).optional()
});
var adjustTeamAssumptions_createServerFn_handler = createServerRpc({
	id: "2fd6922b5155fa935ba00b6f468ab67caf5c64f9c3a738e9b878b5f4cc6c4048",
	name: "adjustTeamAssumptions",
	filename: "src/lib/fit.functions.ts"
}, (opts) => adjustTeamAssumptions.__executeServer(opts));
var adjustTeamAssumptions = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	id: stringType().uuid(),
	passcode: stringType().max(200),
	overrides: overrideSchema
}).parse(d)).handler(adjustTeamAssumptions_createServerFn_handler, async ({ data }) => {
	if (!passOk(data.passcode)) throw new Error("Wrong passcode");
	const sb = await db();
	const { data: row } = await sb.from("submissions").select("kalodata").eq("id", data.id).single();
	if (!row) throw new Error("Report not found");
	const k = {
		...row.kalodata,
		teamOverrides: data.overrides,
		adjustedAt: Object.keys(data.overrides).length ? (/* @__PURE__ */ new Date()).toISOString() : void 0
	};
	const { error } = await sb.from("submissions").update({ kalodata: k }).eq("id", data.id);
	if (error) throw new Error("Could not save adjustments");
	await recompute(data.id);
	return k;
});
var refreshTeamData_createServerFn_handler = createServerRpc({
	id: "f8acb4475eb85e638608c622255ee0472d1fba7b5380afb40eb77d70a4e8710f",
	name: "refreshTeamData",
	filename: "src/lib/fit.functions.ts"
}, (opts) => refreshTeamData.__executeServer(opts));
var refreshTeamData = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	id: stringType().uuid(),
	passcode: stringType().max(200)
}).parse(d)).handler(refreshTeamData_createServerFn_handler, async ({ data }) => {
	if (!passOk(data.passcode)) throw new Error("Wrong passcode");
	const sb = await db();
	const { data: row } = await sb.from("submissions").select("kalodata,products,answers").eq("id", data.id).single();
	if (!row) throw new Error("Report not found");
	const old = row.kalodata;
	const products = row.products ?? [];
	const k = {
		...await searchMarket([...new Set(products.flatMap((p) => p.keywords ?? []).map((x) => String(x).trim().toLowerCase()).filter(Boolean))].slice(0, 8), products[0]?.name ?? ""),
		teamOverrides: old?.teamOverrides,
		adjustedAt: old?.adjustedAt
	};
	const answers = {
		...row.answers,
		selectedProducts: void 0,
		competitorsConfirmed: false,
		productOverrides: {}
	};
	const { error } = await sb.from("submissions").update({
		kalodata: k,
		answers
	}).eq("id", data.id);
	if (error) throw new Error("Could not refresh data");
	return k;
});
var editMarketKeywords_createServerFn_handler = createServerRpc({
	id: "ef0aecf63dff727bb39afc7a90f35e55f334e80fa6ee918bbe25690f2d66f871",
	name: "editMarketKeywords",
	filename: "src/lib/fit.functions.ts"
}, (opts) => editMarketKeywords.__executeServer(opts));
var editMarketKeywords = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	id: stringType().uuid(),
	keywords: arrayType(stringType().trim().min(1).max(200)).min(1).max(8)
}).parse(d)).handler(editMarketKeywords_createServerFn_handler, async ({ data }) => {
	const sb = await db();
	const { data: row } = await sb.from("submissions").select("products,answers,kalodata").eq("id", data.id).single();
	if (!row) throw new Error("Report not found");
	const k = row.kalodata;
	if ((await import("./calc-BRdncDBi.mjs").then((n) => n.o)).competitorInsights(k, row.answers).hasData && row.answers?.competitorsConfirmed) throw new Error("Only unconfirmed or unavailable market searches can be changed");
	const products = row.products ?? [];
	if (!products[0]) throw new Error("Product not found");
	products[0] = {
		...products[0],
		keywords: data.keywords
	};
	const { error } = await sb.from("submissions").update({
		products,
		kalodata: null,
		answers: {
			...row.answers,
			competitorsConfirmed: false,
			excludedProducts: [],
			selectedProducts: void 0,
			productOverrides: {}
		}
	}).eq("id", data.id);
	if (error) throw new Error("Could not save keywords");
	return { ok: true };
});
var suggestSearchTerms_createServerFn_handler = createServerRpc({
	id: "b072d317b10f32f581418b9cb579fe770d3ecb5ac802c250132756ad96fb40c9",
	name: "suggestSearchTerms",
	filename: "src/lib/fit.functions.ts"
}, (opts) => suggestSearchTerms.__executeServer(opts));
var suggestSearchTerms = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	title: stringType().max(1e3),
	keywords: arrayType(stringType().max(200)).max(8)
}).parse(d)).handler(suggestSearchTerms_createServerFn_handler, async ({ data }) => {
	try {
		const expansion = await (await import("./market-ai.server-BdlxdXVJ.mjs")).expandSearch(data.title, data.keywords);
		return { terms: searchTermSet(data.keywords, expansion, data.title).slice(0, 6) };
	} catch {
		const expansion = fallbackExpansion(data.keywords, data.title);
		return { terms: searchTermSet(data.keywords, expansion, data.title).slice(0, 6) };
	}
});
async function hubLookup(asin) {
	const url = process.env["HUB_API_URL"], key = process.env["HUB_API_KEY"];
	if (!url || !key) return null;
	const res = await fetch(`${url.replace(/\/$/, "")}/asin/${asin}`, {
		headers: { Authorization: `Bearer ${key}` },
		signal: AbortSignal.timeout(15e3)
	});
	if (!res.ok) throw new Error("Sophie Hub lookup failed");
	return {
		...await res.json(),
		provider: "hub"
	};
}
async function keepaLookup(asin) {
	const key = process.env["KEEPA_API_KEY"];
	if (!key) return null;
	const res = await fetch(`https://api.keepa.com/product?key=${encodeURIComponent(key)}&domain=1&asin=${asin}&stats=1`, { signal: AbortSignal.timeout(2e4) });
	if (!res.ok) throw new Error("Amazon product lookup failed");
	const raw = (await res.json()).products?.[0];
	if (!raw) return null;
	const mapped = mapKeepaProduct(raw);
	const unmapped = [
		"title",
		"packageLength",
		"packageWidth",
		"packageHeight",
		"packageWeight",
		"itemWeight",
		"stats",
		"fbaFees"
	].filter((field) => raw[field] === void 0);
	if (unmapped.length) console.info(`Keepa response for ${asin} did not include fields: ${unmapped.join(", ")}`);
	return mapped;
}
var lookupAsin_createServerFn_handler = createServerRpc({
	id: "e362339c7c16fc9a913d9dcbeb3135a5ff8c6a1d22902c0379b43f30e79abc0c",
	name: "lookupAsin",
	filename: "src/lib/fit.functions.ts"
}, (opts) => lookupAsin.__executeServer(opts));
var lookupAsin = createServerFn({ method: "POST" }).inputValidator((d) => objectType({ asin: stringType().regex(/^[A-Za-z0-9]{10}$/) }).parse(d)).handler(lookupAsin_createServerFn_handler, async ({ data }) => {
	const asin = data.asin.toUpperCase(), sb = await db();
	const { data: cached } = await sb.from("asin_cache").select("fetched_at,payload").eq("asin", asin).maybeSingle();
	if (cached && Date.now() - new Date(cached.fetched_at).getTime() < 2592e6) return {
		ok: true,
		product: cached.payload,
		cached: true
	};
	try {
		const product = await hubLookup(asin) ?? await keepaLookup(asin);
		if (!product) return {
			ok: false,
			product: null,
			message: "Automatic Amazon lookup is not connected yet. Enter the product details manually."
		};
		await sb.from("asin_cache").upsert({
			asin,
			fetched_at: (/* @__PURE__ */ new Date()).toISOString(),
			payload: product
		});
		return {
			ok: true,
			product,
			cached: false
		};
	} catch (e) {
		console.error("ASIN lookup failed", e);
		return {
			ok: false,
			product: null,
			message: "We could not retrieve this Amazon listing. Enter the details manually."
		};
	}
});
//#endregion
export { addMarketCompetitor_createServerFn_handler, adjustTeamAssumptions_createServerFn_handler, checkPasscode_createServerFn_handler, createSubmission_createServerFn_handler, editMarketKeywords_createServerFn_handler, editMarketTerms_createServerFn_handler, enrichCategory_createServerFn_handler, enrichMarketProduct_createServerFn_handler, findMarketCompetitors_createServerFn_handler, findOwnProducts_createServerFn_handler, getSubmission_createServerFn_handler, getTeamVerdict_createServerFn_handler, kalodata_createServerFn_handler, listSubmissions_createServerFn_handler, lookupAsin_createServerFn_handler, refreshTeamData_createServerFn_handler, runMarketScan_createServerFn_handler, saveSubmission_createServerFn_handler, suggestSearchTerms_createServerFn_handler };
