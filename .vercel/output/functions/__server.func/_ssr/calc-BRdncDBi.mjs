//#region node_modules/.nitro/vite/services/ssr/assets/calc-BRdncDBi.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FBT_RATE_CARD = {
	version: "2026-11-01",
	effectiveDate: "Nov 1, 2026",
	source: "TikTok Shop Academy, FBT Rate Card & FAQ, updated Nov 10, 2026",
	label: "FBT rate card effective Nov 1, 2026"
};
var TIERS = [
	{
		maxOz: 4,
		label: "4 oz or less",
		fees: [
			4.28,
			2.52,
			1.91,
			1.56
		]
	},
	{
		maxOz: 8,
		label: "4+ to 8 oz",
		fees: [
			4.52,
			2.91,
			2.36,
			1.93
		]
	},
	{
		maxOz: 12,
		label: "8+ to 12 oz",
		fees: [
			4.7,
			3.05,
			2.61,
			2.23
		]
	},
	{
		maxOz: 16,
		label: "12+ to 16 oz",
		fees: [
			5.1,
			3.16,
			2.78,
			2.36
		]
	},
	{
		maxOz: 32,
		label: "1+ to 2 lb",
		fees: [
			5.71,
			3.92,
			3.14,
			2.6
		]
	},
	{
		maxOz: 48,
		label: "2+ to 3 lb",
		fees: [
			6.27,
			4.3,
			3.25,
			2.76
		]
	},
	{
		maxOz: 64,
		label: "3+ to 4 lb",
		fees: [
			6.92,
			4.7,
			3.55,
			3.12
		]
	},
	{
		maxOz: 80,
		label: "4+ to 5 lb",
		fees: [
			7.66,
			5.09,
			4.54,
			4.54
		]
	},
	{
		maxOz: 96,
		label: "5+ to 6 lb",
		fees: [
			8.58,
			6.19,
			5.46,
			5.46
		]
	},
	{
		maxOz: 112,
		label: "6+ to 7 lb",
		fees: [
			8.88,
			6.5,
			6.14,
			6.08
		]
	},
	{
		maxOz: 128,
		label: "7+ to 8 lb",
		fees: [
			9.22,
			6.9,
			6.7,
			6.5
		]
	},
	{
		maxOz: 144,
		label: "8+ to 9 lb",
		fees: [
			9.42,
			7,
			6.77,
			6.59
		]
	},
	{
		maxOz: 160,
		label: "9+ to 10 lb",
		fees: [
			9.63,
			7.46,
			7.3,
			7.3
		]
	},
	{
		maxOz: 176,
		label: "10+ to 11 lb",
		fees: [
			10.64,
			8.3,
			8.1,
			8.1
		]
	},
	{
		maxOz: 192,
		label: "11+ to 12 lb",
		fees: [
			10.75,
			9.2,
			9,
			9
		]
	},
	{
		maxOz: 208,
		label: "12+ to 13 lb",
		fees: [
			10.98,
			10.04,
			10.04,
			10.04
		]
	},
	{
		maxOz: 224,
		label: "13+ to 14 lb",
		fees: [
			11.44,
			10.42,
			10.42,
			10.42
		]
	},
	{
		maxOz: 240,
		label: "14+ to 15 lb",
		fees: [
			11.85,
			10.8,
			10.8,
			10.8
		]
	}
];
var HEAVY_FEES = [
	12.67,
	12.9,
	13.25,
	13.51,
	13.8,
	14.52,
	14.86,
	15.13,
	15.67,
	15.9,
	16.38,
	16.63,
	17.25,
	17.45,
	17.88,
	18.46,
	18.51,
	19.05,
	19.47,
	19.86,
	20.3,
	20.56,
	20.89,
	21.48,
	21.51,
	22.1,
	22.3,
	22.9,
	23.21,
	23.3,
	23.77,
	24.04,
	24.38,
	24.5,
	24.52
];
function chargeableWeight(p) {
	const actual = Math.max(0, p.weight || 0);
	const volume = Math.max(0, p.length * p.width * p.height);
	const dimensional = volume / 166;
	const useActual = actual > 0 && actual <= 2 && volume <= 332;
	return {
		weight: useActual ? actual : Math.max(actual, dimensional),
		dimensional,
		volume,
		reason: useActual ? "actual" : "dimensional"
	};
}
function fbtEligibility(p) {
	const sides = [
		p.length,
		p.width,
		p.height
	];
	return {
		eligible: p.weight <= 150 && Math.max(...sides) <= 108,
		reason: p.weight > 150 ? "Over the 150 lb limit" : Math.max(...sides) > 108 ? "A side exceeds 108 in" : null
	};
}
function fbtFeeForWeight(weight, units = 1) {
	if (weight <= 0 || weight > 50) return null;
	const oz = weight * 16;
	const index = TIERS.findIndex((t) => oz <= t.maxOz + 1e-9);
	if (index >= 0) return TIERS[index]?.fees[units === 1 ? 0 : units === 2 ? 1 : units === 3 ? 2 : 3] ?? null;
	return HEAVY_FEES[Math.min(34, Math.max(0, Math.ceil(weight) - 16))] ?? null;
}
function fbtWeightTier(weight) {
	if (weight > 50) return "Heavy Bulky, quoted by the team";
	const oz = weight * 16;
	const tier = TIERS.find((t) => oz <= t.maxOz + 1e-9);
	if (tier) return tier.label;
	const upper = Math.min(50, Math.ceil(weight));
	return `${upper - 1}+ to ${upper} lb`;
}
function nextFbtBoundary(weight) {
	if (weight <= 0 || weight >= 50) return null;
	const oz = weight * 16;
	const boundaryOz = TIERS.find((t) => oz <= t.maxOz + 1e-9)?.maxOz ?? Math.ceil(weight) * 16;
	const remaining = boundaryOz - oz;
	return remaining > .001 ? {
		boundaryOz,
		remainingOz: remaining
	} : null;
}
function fbtFeePanel(p) {
	const chargeable = chargeableWeight(p);
	return {
		...chargeable,
		tier: fbtWeightTier(chargeable.weight),
		fees: [
			1,
			2,
			3,
			4
		].map((units) => ({
			units,
			fee: fbtFeeForWeight(chargeable.weight, units)
		})),
		sampleCost: (p.cogs ?? 0) + (fbtFeeForWeight(chargeable.weight, 1) ?? 0),
		next: nextFbtBoundary(chargeable.weight),
		eligibility: fbtEligibility(p)
	};
}
var FBT_FACTS = [
	"FBT orders ship free to shoppers by default.",
	"Storage is free for the first 60 days.",
	"Creator sample orders pay the standard single-unit fee.",
	"Physical bundles count as one unit; virtual bundles get multi-unit rates."
];
var toNum$1 = (x) => typeof x === "number" ? x : typeof x === "string" ? Number.parseFloat(x.replace(/[$,%\s]/g, "")) || 0 : 0;
var median$1 = (xs) => {
	if (!xs.length) return 0;
	const s = [...xs].sort((a, b) => a - b), m = Math.floor(s.length / 2);
	return s.length % 2 ? s[m] ?? 0 : ((s[m - 1] ?? 0) + (s[m] ?? 0)) / 2;
};
var STOP_WORDS = /* @__PURE__ */ new Set([
	"for",
	"with",
	"the",
	"and",
	"best",
	"natural",
	"organic",
	"a",
	"an",
	"of",
	"to",
	"in",
	"by",
	"your"
]);
var cleanTerm = (s) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
function fallbackExpansion(keywords, title = "") {
	const words = cleanTerm([title, ...keywords].join(" ")).split(" ").filter((w) => w && !STOP_WORDS.has(w));
	const grams = [];
	for (const size of [1, 2]) for (let i = 0; i <= words.length - size; i++) grams.push(words.slice(i, i + size).join(" "));
	return {
		core: words.length > 1 ? words[1] ?? "product" : words[0] ?? "product",
		variants: [...new Set(grams)].slice(0, 6),
		product_type: cleanTerm(title) || keywords.join(", "),
		not_competitors: []
	};
}
function searchTermSet(keywords, expansion, title = "") {
	const deterministic = keywords.flatMap((keyword) => {
		const core = cleanTerm(keyword).split(" ").filter(Boolean).filter((w) => !STOP_WORDS.has(w));
		const out = [cleanTerm(keyword)];
		for (let n = core.length; n >= 1; n--) out.push(core.slice(0, n).join(" "));
		for (const size of [1, 2]) for (let i = 0; i <= core.length - size; i++) out.push(core.slice(i, i + size).join(" "));
		return out;
	});
	const titleWords = cleanTerm(title).split(" ").filter((w) => w && !STOP_WORDS.has(w));
	return [.../* @__PURE__ */ new Set([
		...keywords.map(cleanTerm),
		expansion.core,
		...expansion.variants.map(cleanTerm),
		...deterministic,
		titleWords.slice(0, 2).join(" ")
	])].filter(Boolean).slice(0, 8);
}
function mergePoolProducts(existing, incoming, term) {
	const pool = /* @__PURE__ */ new Map();
	for (const p of [...existing, ...incoming]) {
		const id = String(p.product_id ?? "");
		if (!id) continue;
		const prior = pool.get(id);
		const terms = [.../* @__PURE__ */ new Set([
			...prior?.foundTerms ?? p.foundTerms ?? [],
			...p.foundTerms ?? [],
			...term ? [term] : []
		])];
		const best = prior ? {
			...p,
			...prior
		} : p;
		pool.set(id, {
			...best,
			product_id: id,
			foundTerms: terms
		});
	}
	return [...pool.values()].sort((a, b) => toNum$1(b.revenue) - toNum$1(a.revenue));
}
function topSellers(pool, limit = 8) {
	const sellers = /* @__PURE__ */ new Map();
	for (const p of pool) {
		const id = String(p.product_shop_id ?? p.shop_id ?? "");
		if (!id) continue;
		const current = sellers.get(id) ?? {
			id,
			revenue: 0
		};
		current.revenue += toNum$1(p.revenue);
		sellers.set(id, current);
	}
	return [...sellers.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit).map((s) => s.id);
}
function applyClassificationFloor(pool, expansion) {
	const core = cleanTerm(expansion.core);
	const exclusions = expansion.not_competitors.map(cleanTerm).filter(Boolean);
	const modifiers = [...new Set(expansion.variants.flatMap((variant) => cleanTerm(variant).split(" ")).filter((word) => word.length > 2 && !core.split(" ").includes(word) && ![
		"for",
		"and",
		"the",
		"with"
	].includes(word)))];
	return pool.map((p) => {
		const title = cleanTerm(p.product_name);
		if (exclusions.some((excluded) => title.includes(excluded))) return {
			...p,
			relevance: "no",
			relevanceReason: "Excluded product type."
		};
		if (core.split(" ").includes("tallow") && (!title.split(" ").includes("tallow") || /\b(cooking|cook|frying|fry|rendered|lard)\b/.test(title))) return {
			...p,
			relevance: "no",
			relevanceReason: "Not a tallow skincare product."
		};
		if (/\bsewing\b/.test(core) && /\b(machine|gun|buckle|pliers|threaders?|ripper|mannequins?|felt|cardboard|stitcher|fasteners?)\b/.test(title)) return {
			...p,
			relevance: "adjacent",
			relevanceReason: "Sewing device, craft project or specialist accessory, not a general hand-sewing repair kit."
		};
		const exact = core.split(" ").length > 1 && title.includes(core);
		const ingredientAndForm = core.split(" ").length === 1 && title.includes(core) && modifiers.some((word) => title.split(" ").includes(word));
		if (exact || ingredientAndForm) return {
			...p,
			relevance: "direct",
			reason: "Matches the core product and product form."
		};
		return p;
	});
}
function fallbackClassify(pool, core) {
	const matches = pool.filter((p) => cleanTerm(String(p.product_name)).includes(cleanTerm(core)));
	const categoryRevenue = /* @__PURE__ */ new Map();
	for (const p of matches) {
		const cat = String(p.pri_cate_id ?? p.category_id ?? p.category_name ?? "unknown");
		categoryRevenue.set(cat, (categoryRevenue.get(cat) ?? 0) + toNum$1(p.revenue));
	}
	const majority = [...categoryRevenue.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
	return pool.map((p) => {
		const cat = String(p.pri_cate_id ?? p.category_id ?? p.category_name ?? "unknown");
		const direct = cleanTerm(String(p.product_name)).includes(cleanTerm(core)) && cat === majority;
		return {
			...p,
			relevance: direct ? "direct" : "no",
			relevanceReason: direct ? `Name contains ${core} and matches the main category.` : "Does not match the core product and category."
		};
	});
}
var normalizeSeller = (p) => cleanTerm(String(p.shop_name ?? p.seller_name ?? p.product_shop_name ?? p.product_shop_id ?? p.shop_id ?? "unknown"));
var variantSignature = (name) => cleanTerm(name).replace(/\b(?:pack of|set of|combo|bundle|single|count|ct|pcs?|packs?)\b/g, " ").replace(/\b\d+(?:\.\d+)?\s*(?:oz|fl|lb|g|ml|count|ct|pcs?|packs?)\b/g, " ").replace(/\b\d+\s*[-x]\s*\d*\b/g, " ").replace(/\b(?:1|2|3|4|5|6|8|10|12)\b/g, " ").replace(/\s+/g, " ").trim().split(" ").slice(0, 12).join(" ");
/** Groups likely pack variants only within one seller; unrelated products stay separate. */
function groupCompetitors(products) {
	const groups = /* @__PURE__ */ new Map();
	for (const p of uniqueListings(products)) {
		const key = `${normalizeSeller(p)}|${variantSignature(String(p.product_name ?? ""))}`;
		groups.set(key, [...groups.get(key) ?? [], p]);
	}
	return [...groups.values()].map((listings) => {
		return {
			...[...listings].sort((a, b) => toNum$1(b.revenue) - toNum$1(a.revenue))[0],
			revenue: listings.reduce((n, p) => n + toNum$1(p.revenue), 0),
			sales_volumn: listings.reduce((n, p) => n + toNum$1(p.sales_volumn ?? p.sales_volume), 0),
			listings,
			listingCount: listings.length,
			listingIds: listings.map((p) => String(p.product_id))
		};
	}).sort((a, b) => toNum$1(b.revenue) - toNum$1(a.revenue));
}
function relevanceOf(p, overrides) {
	return overrides?.[String(p.product_id)] ?? p.relevance ?? "no";
}
/** Flatten aggregates before deduplication so a hero and its listings cannot both count. */
function uniqueListings(pool) {
	return mergePoolProducts([], pool.flatMap((p) => Array.isArray(p.listings) && p.listings.length ? p.listings.map((listing) => ({
		...p,
		...listing,
		listings: void 0
	})) : [p]));
}
function nicheProducts(pool, overrides) {
	return uniqueListings(pool).filter((p) => relevanceOf(p, overrides) === "direct" && toNum$1(p.revenue) >= 500);
}
function nicheStats(pool, overrides) {
	const products = nicheProducts(pool, overrides);
	const sum = (field) => products.reduce((n, p) => n + toNum$1(p[field]), 0);
	const gmv = sum("revenue");
	const top3 = [...products].sort((a, b) => toNum$1(b.revenue) - toNum$1(a.revenue)).slice(0, 3).reduce((n, p) => n + toNum$1(p.revenue), 0);
	return {
		products,
		gmv,
		units: products.reduce((n, p) => n + toNum$1(p.sales_volumn ?? p.sales_volume), 0),
		productCount: products.length,
		sellerCount: new Set(products.map(normalizeSeller)).size,
		top3Share: gmv ? top3 / gmv * 100 : 0,
		medianPrice: median$1(products.map((p) => toNum$1(p.unit_price)).filter((n) => n > 0)),
		medianCommission: median$1(products.map((p) => {
			const n = toNum$1(p.commission_rate);
			return n <= 1 ? n * 100 : n;
		}).filter((n) => n > 0)),
		shares: [
			"video_revenue",
			"live_revenue",
			"shopping_mall_revenue"
		].map((field) => gmv ? sum(field) / gmv * 100 : 0)
	};
}
function formatGrowth(value, launchDate, now = /* @__PURE__ */ new Date()) {
	if (launchDate) {
		const launched = new Date(String(launchDate));
		if (!Number.isNaN(launched.getTime()) && now.getTime() - launched.getTime() <= 3888e6) return "new";
	}
	if (value === void 0 || value === null || value === "") return null;
	const growth = toNum$1(value);
	return growth < -95 || growth > 500 ? null : growth;
}
function englishHook(title, max = 72) {
	const text = String(title ?? "").split(/[#\n]/)[0]?.replace(/\s+/g, " ").trim() ?? "";
	if (!text) return null;
	const latinRatio = (text.match(/[A-Za-z]/g)?.length ?? 0) / Math.max(1, text.replace(/\s/g, "").length);
	const commonEnglish = text.toLowerCase().match(/\b(?:the|and|for|with|this|that|your|you|how|why|best|skin|shop|get|my|is|to|of)\b/g)?.length ?? 0;
	if (latinRatio < .75 || /^[\p{Script=Latin}\s\p{N}\p{P}]+$/u.test(text) && commonEnglish === 0 && /[áéíóúñ¿¡]/i.test(text)) return null;
	if (text.length <= max) return text;
	const cut = text.slice(0, max + 1);
	return `${cut.slice(0, cut.lastIndexOf(" ")).trim()}...`;
}
var normalizeAccount = (value) => cleanTerm(String(value ?? "")).replace(/[^a-z0-9]/g, "");
function editDistance(a, b) {
	const row = Array.from({ length: b.length + 1 }, (_, i) => i);
	for (let i = 1; i <= a.length; i++) {
		let prior = row[0] ?? 0;
		row[0] = i;
		for (let j = 1; j <= b.length; j++) {
			const old = row[j] ?? 0;
			row[j] = Math.min((row[j] ?? 0) + 1, (row[j - 1] ?? 0) + 1, prior + (a[i - 1] === b[j - 1] ? 0 : 1));
			prior = old;
		}
	}
	return row[b.length] ?? 0;
}
function accountMatchesSeller(account, seller) {
	const a = normalizeAccount(account), b = normalizeAccount(seller);
	if (a.length < 4 || b.length < 4) return false;
	return a.includes(b) || b.includes(a) || editDistance(a, b) <= 2;
}
function sellerRunFlags(videos, creators, sellerNames) {
	const names = sellerNames.map(normalizeAccount).filter(Boolean);
	const matches = (v) => names.some((seller) => accountMatchesSeller(v.belonged_creator_handle ?? v.creator_handle, seller) || accountMatchesSeller(v.nickname ?? v.creator_nickname, seller));
	const byCreator = /* @__PURE__ */ new Map();
	for (const v of videos) {
		const id = String(v.belonged_creator_id ?? v.belonged_creator_handle ?? "");
		byCreator.set(id, [...byCreator.get(id) ?? [], v]);
	}
	const dominant = /* @__PURE__ */ new Set();
	for (const [id, vs] of byCreator) {
		const revenue = vs.reduce((n, v) => n + toNum$1(v.revenue), 0);
		const total = videos.reduce((n, v) => n + toNum$1(v.revenue), 0);
		const creator = creators.find((c) => String(c.creator_id ?? c.creator_handle) === id);
		if (vs.length >= 3 && total > 0 && revenue / total > .6 && toNum$1(creator?.creator_followers) < 5e3) dominant.add(id);
	}
	const flaggedCreators = creators.filter((c) => matches(c) || dominant.has(String(c.creator_id ?? c.creator_handle))).map((c) => String(c.creator_id ?? c.creator_handle));
	const creatorSet = new Set(flaggedCreators);
	return {
		sellerRunCreatorIds: flaggedCreators,
		sellerRunVideoIds: videos.filter((v) => matches(v) || creatorSet.has(String(v.belonged_creator_id ?? v.belonged_creator_handle))).map((v) => String(v.video_id))
	};
}
function robustVideoBenchmark(videos) {
	const revenues = videos.map((v) => toNum$1(v.revenue)).filter((n) => n > 0).sort((a, b) => a - b);
	if (!revenues.length) return {
		median: null,
		trimmedMean: null,
		hitRate: null,
		count: 0
	};
	const drop = Math.floor(revenues.length * .05);
	const trimmed = revenues.slice(0, revenues.length - drop);
	return {
		median: median$1(revenues),
		trimmedMean: trimmed.reduce((n, x) => n + x, 0) / trimmed.length,
		hitRate: revenues.filter((n) => n > 500).length / revenues.length * 100,
		count: revenues.length
	};
}
var calc_exports = /* @__PURE__ */ __exportAll({
	CANDIDATE_TARGET: () => 20,
	DEFAULT_ASSUMPTIONS: () => DEFAULT_ASSUMPTIONS,
	DEFAULT_COMPETITORS: () => 6,
	MAX_COMPETITORS: () => 8,
	NEXT_STEP: () => NEXT_STEP,
	PLAN_MONTHS: () => 12,
	REVENUE_BUCKETS: () => REVENUE_BUCKETS,
	ROLE_LABEL: () => ROLE_LABEL,
	SAMPLE_RAMP: () => SAMPLE_RAMP,
	SOURCE: () => SOURCE,
	VIDEO_REVENUE_RAMP: () => VIDEO_REVENUE_RAMP,
	billableWeight: () => billableWeight,
	candidateProducts: () => candidateProducts,
	competitorInsights: () => competitorInsights,
	computeAll: () => computeAll,
	computeVerdict: () => computeVerdict,
	creatorInsights: () => creatorInsights,
	economics: () => economics,
	emptyProduct: () => emptyProduct,
	enrichedMetrics: () => enrichedMetrics,
	fbtFee: () => fbtFee,
	filterMarket: () => filterMarket,
	followerBucket: () => followerBucket,
	fulfillmentFee: () => fulfillmentFee,
	marginTone: () => marginTone,
	mcfFee: () => mcfFee,
	median: () => median,
	num: () => num,
	opportunitySignals: () => opportunitySignals,
	parseAsins: () => parseAsins,
	pct: () => pct,
	productEconomics: () => productEconomics,
	productKey: () => productKey,
	productMarketStats: () => productMarketStats,
	projectScenario: () => projectScenario,
	quantile: () => quantile,
	ratePct: () => ratePct,
	selectedCompetitors: () => selectedCompetitors,
	selectedShopIds: () => selectedShopIds,
	shopKey: () => shopKey,
	toNum: () => toNum,
	topMarketProducts: () => topMarketProducts,
	usd: () => usd,
	videoInsights: () => videoInsights
});
var ROLE_LABEL = {
	client: "Partner",
	pod_leader: "Pod Leader",
	sales_exec: "Brand Strategist"
};
var DEFAULT_ASSUMPTIONS = {
	referralPct: 6,
	affiliatePct: 15,
	affiliateSharePct: 70,
	adsFloorPct: 2,
	adsTargetPct: 10,
	samplesPerMonth: 150,
	adDaily: 100,
	adStartMonth: 3,
	sophieFee: 2997,
	mcfFirst: 7,
	mcfAdditional: 1,
	ownCost: 6.5,
	videoRatePct: 40,
	gmvPerVideoFallback: 120,
	decayPct: 35,
	roas: 2,
	activeVideosPerProduct: 25,
	returnsPct: 3,
	guardrailMonth6: 4e4,
	guardrailMonth12: 12e4
};
var REVENUE_BUCKETS = [
	"<$20K",
	"$20-50K",
	"$50-100K",
	"$100-250K",
	"$250K+"
];
var emptyProduct = () => ({
	name: "",
	asin: "",
	price: 29.99,
	cogs: 7,
	weight: 1,
	length: 8,
	width: 5,
	height: 3,
	keywords: []
});
var usd = (n, digits = 0) => (n < 0 ? "-$" : "$") + Math.abs(isFinite(n) ? n : 0).toLocaleString("en-US", {
	minimumFractionDigits: digits,
	maximumFractionDigits: digits
});
var pct = (n) => `${(isFinite(n) ? n : 0).toFixed(1)}%`;
var num = (n) => Math.round(isFinite(n) ? n : 0).toLocaleString("en-US");
function parseAsins(url) {
	if (/^[A-Z0-9]{10}$/i.test(url.trim())) return [url.trim().toUpperCase()];
	if (!url || !/amazon\./i.test(url)) return [];
	const out = /* @__PURE__ */ new Set();
	const re = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})/gi;
	let m;
	while (m = re.exec(url)) out.add((m[1] ?? "").toUpperCase());
	return [...out];
}
function billableWeight(p) {
	const dim = p.length * p.width * p.height / 166;
	return Math.max(1, Math.ceil(Math.max(p.weight || 0, dim || 0)));
}
function fbtFee(p) {
	return fbtFeeForWeight(chargeableWeight(p).weight, 1) ?? 0;
}
function mcfFee(p, a) {
	return a.mcfFirst + a.mcfAdditional * (billableWeight(p) - 1);
}
function fulfillmentFee(p, a, method) {
	if (method === "mcf") return mcfFee(p, a);
	if (method === "own") return a.ownCost;
	return fbtFee(p);
}
function productEconomics(p, a, method) {
	const fee = fulfillmentFee(p, a, method);
	const base = p.price * (1 - a.referralPct / 100 - a.affiliatePct / 100 * (a.affiliateSharePct / 100) - a.returnsPct / 100) - p.cogs - fee;
	const contribFloor = base - p.price * (a.adsFloorPct / 100);
	const contribTarget = base - p.price * (a.adsTargetPct / 100);
	const fbt = fbtFee(p);
	return {
		fbt,
		mcf: mcfFee(p, a),
		own: a.ownCost,
		fee,
		contribFloor,
		contribTarget,
		marginFloor: p.price > 0 ? contribFloor / p.price * 100 : -100,
		marginTarget: p.price > 0 ? contribTarget / p.price * 100 : -100,
		sampleUnitCost: p.cogs + fbt
	};
}
var mean = (xs) => xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0;
function economics(products, a, method) {
	const per = products.map((p) => productEconomics(p, a, method));
	const avgMarginFloor = mean(per.map((e) => e.marginFloor));
	const sampleUnitCost = mean(per.map((e) => e.sampleUnitCost));
	const monthlySampleCost = a.samplesPerMonth * sampleUnitCost;
	const monthlyAds = a.adDaily * 30;
	const monthlyProgramCost = a.sophieFee + monthlySampleCost + monthlyAds;
	return {
		perProduct: per,
		avgMarginFloor,
		avgMarginTarget: mean(per.map((e) => e.marginTarget)),
		avgContribFloor: mean(per.map((e) => e.contribFloor)),
		avgPrice: mean(products.map((p) => p.price)),
		sampleUnitCost,
		monthlySampleCost,
		monthlyAds,
		monthlyProgramCost,
		breakEvenGmv: avgMarginFloor > 0 ? monthlyProgramCost / (avgMarginFloor / 100) : null
	};
}
function marginTone(m) {
	if (m >= 25) return "good";
	if (m >= 15) return "neutral";
	return "warn";
}
var SAMPLE_RAMP = [
	.2,
	.7,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1
];
var VIDEO_REVENUE_RAMP = [
	.15,
	.3,
	.5,
	.7,
	.85,
	1,
	1,
	1,
	1,
	1,
	1,
	1
];
function projectScenario(samples, a, econ, gmvPerVideo, start = {
	gmv: 0,
	videos: 0
}, options = {}) {
	const rows = [];
	const newShop = options.newShop ?? start.gmv <= 0;
	let activeNew = 0, activeExisting = start.videos;
	let cumContrib = 0, cumCost = 0, breakEvenMonth = null;
	let affiliates = 0, cumNet = 0, profitableMonth = null, maxInvestment = 0;
	let earlyProfitFlag = false, actualAdStartMonth = null;
	const capNotes = [];
	const margin = (econ.avgMarginFloor + a.adsFloorPct) / 100;
	for (let m = 1; m <= 12; m++) {
		let delivered = samples * (SAMPLE_RAMP[m - 1] ?? 1);
		if (newShop && m <= 2) delivered = Math.min(150, delivered);
		const newVideos = delivered * a.videoRatePct / 100;
		activeNew = activeNew * (1 - a.decayPct / 100) + newVideos;
		activeExisting *= 1 - a.decayPct / 100;
		const active = activeNew + activeExisting;
		const revenueRamp = VIDEO_REVENUE_RAMP[m - 1] ?? 1;
		const adsLive = m >= 3 && active >= 100;
		const adSpend = adsLive ? a.adDaily * 30 : 0;
		if (adsLive && actualAdStartMonth === null) actualAdStartMonth = m;
		let incremental = activeNew * gmvPerVideo * revenueRamp + adSpend * Math.min(a.roas, 2.5);
		const rawIncremental = incremental;
		if (m === 6) {
			const cap = Math.min(a.guardrailMonth6, Math.max(0, (options.medianCompetitorGmv ?? a.guardrailMonth6 * 2) * .5));
			incremental = Math.min(incremental, cap);
			if (rawIncremental > cap) capNotes.push(`Month 6 capped at ${usd(cap)} by the launch guardrail.`);
		}
		if (m === 12) {
			const cap = Math.min(a.guardrailMonth12, options.medianCompetitorGmv ?? a.guardrailMonth12);
			incremental = Math.min(incremental, cap);
			if (rawIncremental > cap) capNotes.push(`Month 12 capped at ${usd(cap)} by the launch guardrail.`);
		}
		if (options.conservativeOf?.[m - 1]) incremental = Math.min(incremental, Math.max(0, options.conservativeOf[m - 1].gmv - start.gmv) * .5);
		const gmv = start.gmv + incremental;
		const programCost = a.sophieFee + delivered * econ.sampleUnitCost + adSpend;
		const contribution = gmv * margin;
		cumContrib += contribution;
		cumCost += programCost;
		const net = contribution - programCost;
		affiliates += newVideos;
		cumNet += net;
		maxInvestment = Math.max(maxInvestment, -cumNet);
		if (newShop && m < 3 && net > 0) earlyProfitFlag = true;
		if (profitableMonth === null && net > 0 && (!newShop || m >= 3)) profitableMonth = m;
		if (breakEvenMonth === null && cumContrib >= cumCost && (!newShop || m >= 3)) breakEvenMonth = m;
		rows.push({
			month: m,
			samples: delivered,
			newVideos,
			cumVideos: active,
			gmv,
			programCost,
			net,
			affiliates,
			cumNet,
			adSpend
		});
	}
	const roi = cumCost > 0 ? (cumContrib - cumCost) / cumCost * 100 : 0;
	return {
		samples,
		rows,
		breakEvenMonth,
		profitableMonth,
		maxInvestment,
		roi,
		cumContrib,
		cumCost,
		capNotes,
		earlyProfitFlag,
		actualAdStartMonth
	};
}
function computeVerdict(v) {
	const red = [];
	const yellow = [];
	const a = v.answers;
	if (v.branch === "launch" && a.usSeller === "no") red.push("No US TikTok Shop seller account (US entity required).");
	if (v.branch === "launch" && a.commitSamples !== true) red.push("No commitment to 150+ samples per month.");
	if (v.branch === "optimize" && (a.samplesNow ?? 0) < 150 && a.commitSamples === false) red.push("No commitment to 150+ samples per month.");
	if (v.avgMarginFloor < 15) red.push(`Contribution margin at floor ads is ${pct(v.avgMarginFloor)}, below 15%.`);
	if (red.length) return {
		verdict: "red",
		reasons: red,
		fixFirst: []
	};
	if (v.avgMarginFloor < 25) yellow.push(`Margin is ${pct(v.avgMarginFloor)}, between 15% and 25%.`);
	if (v.products.length <= 1 && (a.catalogSize ?? 1) <= 1) yellow.push("Only one hero product and a one product catalog.");
	if (REVENUE_BUCKETS.indexOf(a.amazonRevenue ?? "") < 2) yellow.push("Amazon revenue below $50K per month.");
	if (v.branch === "optimize" && a.probation === "yes") yellow.push("Shop on probation (2,000 outreach messages per week cap).");
	if (yellow.length) return {
		verdict: "yellow",
		reasons: yellow,
		fixFirst: yellow
	};
	return {
		verdict: "green",
		reasons: [
			"Profitable at 25%+ margin.",
			"Sample commitment in place.",
			"Amazon revenue of $50K+ per month."
		],
		fixFirst: []
	};
}
var NEXT_STEP = {
	green: "Send proposal and book the kickoff call.",
	yellow: "Fix the items below, then revisit the fit.",
	red: "Polite no for now. Share the market report and keep in touch."
};
var toNum = (x) => {
	if (typeof x === "number") return x;
	if (typeof x === "string") {
		const n = parseFloat(x.replace(/[$,%\s]/g, ""));
		return isNaN(n) ? 0 : n;
	}
	return 0;
};
var median = (xs) => {
	if (!xs.length) return 0;
	const s = [...xs].sort((a, b) => a - b);
	const m = Math.floor(s.length / 2);
	return s.length % 2 ? s[m] ?? 0 : ((s[m - 1] ?? 0) + (s[m] ?? 0)) / 2;
};
var ratePct = (x) => {
	const n = toNum(x);
	return n <= 1 ? n * 100 : n;
};
var productKey = (p) => String(p.product_id ?? p.product_name);
var shopKey = (s) => String(s.shop_id ?? s.shop_name);
function selectedShopIds(k, a) {
	if (a.selectedShops) return a.selectedShops;
	return (k?.competitors ?? []).slice(0, 5).map(shopKey);
}
function filterMarket(k, a) {
	if (!k) return null;
	const shops = new Set(selectedShopIds(k, a));
	const ex = new Set(a.excludedProducts ?? []);
	return {
		...k,
		competitors: (k.competitors ?? []).filter((c) => shops.has(shopKey(c))),
		keywords: k.keywords.map((kw) => ({
			...kw,
			products: kw.products.filter((p) => !ex.has(productKey(p)))
		}))
	};
}
function selectedCompetitors(k, a) {
	const candidates = candidateProducts(k, a);
	if (a.selectedProducts) {
		const keys = new Set(a.selectedProducts);
		return candidates.filter((p) => keys.has(productKey(p))).slice(0, 8);
	}
	if (k?.discovery?.version === 2) return candidates.filter((p) => toNum(p.revenue) >= 5e3).slice(0, 6);
	return topMarketProducts(filterMarket(k, a)).slice(0, 5);
}
var candidateProducts = (k, a) => k?.discovery?.version === 2 ? groupCompetitors(nicheProducts(k.pool ?? [], a?.productOverrides)) : topMarketProducts(k).slice(0, 20);
function opportunitySignals(k, a, price) {
	const st = productMarketStats(k, a);
	const growth = median(st.products.filter((p) => p.revenue_growth_rate !== void 0 && toNum(p.revenue_growth_rate) >= -95 && toNum(p.revenue_growth_rate) <= 500).map((p) => toNum(p.revenue_growth_rate)));
	const prices = st.products.map((p) => toNum(p.unit_price)).filter((n) => n > 0);
	const lo = quantile(prices, .25), hi = quantile(prices, .75);
	const size = st.gmv > 5e5 ? "Large" : st.gmv >= 1e5 ? "Mid" : "Niche";
	const competition = st.top3Share < 50 ? "Open" : st.top3Share > 70 ? "Concentrated" : "Moderate";
	const momentum = growth > 10 ? "Growing" : growth < -10 ? "Cooling" : "Flat";
	const priceFit = !price ? null : price < lo ? "Below band" : price > hi ? "Premium" : "In band";
	return {
		gmv: st.gmv,
		size,
		concentration: st.top3Share,
		competition,
		growth,
		momentum,
		priceLow: lo,
		priceHigh: hi,
		priceFit,
		videoShare: st.shares[0] ?? 0
	};
}
function topMarketProducts(k) {
	if (k?.discovery?.version === 2) return [...k.pool ?? []].sort((a, b) => toNum(b.revenue) - toNum(a.revenue));
	const seen = /* @__PURE__ */ new Map();
	for (const kw of k?.keywords ?? []) for (const p of kw.products) {
		const key = productKey(p);
		if (!seen.has(key) || toNum(p.revenue) > toNum(seen.get(key)?.revenue)) seen.set(key, p);
	}
	return [...seen.values()].sort((a, b) => toNum(b.revenue) - toNum(a.revenue)).slice(0, 20);
}
function productMarketStats(k, answers) {
	if (k?.discovery?.version === 2) {
		const st = nicheStats(k.pool ?? [], answers?.productOverrides);
		return {
			...st,
			medianVideoRevenue: median(st.products.map((p) => toNum(p.video_revenue)))
		};
	}
	const products = topMarketProducts(k);
	const sum = (field) => products.reduce((s, p) => s + toNum(p[field]), 0);
	const gmv = sum("revenue");
	const shares = [
		"video_revenue",
		"live_revenue",
		"showcase_revenue"
	].map((f) => gmv > 0 ? products.reduce((n, p) => n + toNum(f === "showcase_revenue" ? p.shopping_mall_revenue ?? p.showcase_revenue : p[f]), 0) / gmv * 100 : 0);
	return {
		products,
		gmv,
		units: products.reduce((s, p) => s + toNum(p.sales_volumn ?? p.sales_volume), 0),
		productCount: products.length,
		sellerCount: 0,
		top3Share: gmv ? products.slice(0, 3).reduce((n, p) => n + toNum(p.revenue), 0) / gmv * 100 : 0,
		medianPrice: median(products.map((p) => toNum(p.unit_price)).filter((n) => n > 0)),
		medianCommission: median(products.map((p) => ratePct(p.commission_rate)).filter((n) => n > 0)),
		shares,
		medianVideoRevenue: median(products.map((p) => toNum(p.video_revenue)))
	};
}
function computeAll(s) {
	const data = competitorInsights(s.kalodata, s.answers);
	const a = {
		...DEFAULT_ASSUMPTIONS,
		ownCost: s.assumptions?.ownCost ?? DEFAULT_ASSUMPTIONS.ownCost
	};
	const overrides = s.kalodata?.teamOverrides ?? {};
	a.affiliatePct = overrides.commission ?? Math.max(10, Math.round(data.market.commission ?? 0));
	a.affiliateSharePct = Math.min(100, (data.market.videoShare ?? 0) + (data.market.liveShare ?? 0));
	a.videoRatePct = (overrides.postRate ?? .4) * 100;
	a.guardrailMonth6 = overrides.guardrailMonth6 ?? DEFAULT_ASSUMPTIONS.guardrailMonth6;
	a.guardrailMonth12 = overrides.guardrailMonth12 ?? DEFAULT_ASSUMPTIONS.guardrailMonth12;
	const targetAffiliates = Math.max(30, Math.ceil((data.market.affiliates ?? 0) * .25));
	a.samplesPerMonth = overrides.samples ?? Math.max(150, Math.ceil(targetAffiliates / 6 / (a.videoRatePct / 100) / 10) * 10);
	a.roas = Math.min(2.5, overrides.roas ?? data.market.roas ?? 0);
	const gmvPerVideo = data.market.robustTrimmedMean ?? 0;
	const method = s.branch === "optimize" ? s.answers.fulfillment ?? "fbt" : "fbt";
	const products = s.products.length ? s.products : [emptyProduct()];
	const start = s.branch === "optimize" ? {
		gmv: data.own.reduce((n, p) => n + (p.gmv ?? 0), 0),
		videos: data.own.reduce((n, p) => n + (p.videos ?? 0), 0)
	} : {
		gmv: 0,
		videos: 0
	};
	const newShop = s.branch === "launch" || s.answers.probation === "yes";
	const month3Organic = a.samplesPerMonth * a.videoRatePct / 100 * (1.65 + .65 ** 2) * gmvPerVideo * .5;
	a.adDaily = Math.max(100, month3Organic * .1 / 30);
	const econ = economics(products, a, method);
	const niche = productMarketStats(s.kalodata, s.answers);
	const bench = {
		hasData: data.hasData,
		categoryGmv: niche.gmv,
		medianPrice: data.market.price ?? 0,
		medianCommission: data.market.commission ?? 0,
		avgCreators: data.market.affiliates ?? 0,
		avgVideos: data.market.videos ?? 0,
		gmvPerCreator: data.market.gmvPerAffiliate ?? 0,
		gmvPerVideo,
		affiliateShare: a.affiliateSharePct
	};
	const medianCompetitorGmv = data.market.gmv ?? 0;
	let scenarios = [];
	if (data.hasData) {
		const target = {
			...projectScenario(a.samplesPerMonth, a, econ, gmvPerVideo, start, {
				medianCompetitorGmv,
				newShop
			}),
			label: "Target"
		};
		scenarios = [target, {
			...projectScenario(a.samplesPerMonth, a, econ, data.market.robustMedian ?? 0, start, {
				medianCompetitorGmv,
				newShop,
				conservativeOf: target.rows
			}),
			label: "Conservative"
		}];
		a.adStartMonth = target.actualAdStartMonth ?? 3;
	}
	const profitAvailable = products.every((p) => p.cogs > 0);
	const earlyProfitFlag = scenarios.some((scenario) => scenario.earlyProfitFlag);
	const capNotes = [...new Set(scenarios.flatMap((scenario) => scenario.capNotes))];
	const m6Gmv = scenarios[0]?.rows[5]?.gmv ?? 0;
	const unitsPerProduct = (econ.avgPrice > 0 ? m6Gmv / econ.avgPrice : 0) / products.length;
	const fulfillment = products.map((p, i) => {
		const e = econ.perProduct[i];
		if (!e) return {
			product: p.name,
			opts: [],
			cheapest: "fbt"
		};
		const opts = [
			{
				key: "fbt",
				label: "FBT",
				unit: e.fbt
			},
			{
				key: "mcf",
				label: "Amazon MCF",
				unit: e.mcf
			},
			{
				key: "own",
				label: "Own / 3PL",
				unit: e.own
			}
		].map((o) => ({
			...o,
			monthly: o.unit * unitsPerProduct
		}));
		const cheapest = opts.reduce((m, o) => o.unit < m.unit ? o : m, opts[0] ?? {
			key: "fbt",
			label: "FBT",
			unit: 0,
			monthly: 0
		}).key;
		return {
			product: p.name || `Product ${i + 1}`,
			opts,
			cheapest
		};
	});
	const v = computeVerdict({
		branch: s.branch,
		answers: s.answers,
		products,
		avgMarginFloor: econ.avgMarginFloor
	});
	return {
		insights: data,
		targetAffiliates,
		adjusted: !!s.kalodata?.adjustedAt,
		assumptions: a,
		method,
		econ,
		bench,
		gmvPerVideo,
		scenarios,
		unitsPerProduct,
		fulfillment,
		verdict: v,
		profitAvailable,
		earlyProfitFlag,
		capNotes
	};
}
var SOURCE = "Source: Kalodata, TikTok Shop US, last 30 days";
function quantile(values, q) {
	if (!values.length) return 0;
	const s = [...values].sort((a, b) => a - b), position = (s.length - 1) * q;
	const i = Math.floor(position), f = position - i;
	return (s[i] ?? 0) * (1 - f) + (s[Math.min(i + 1, s.length - 1)] ?? 0) * f;
}
var ratio = (n, d) => toNum(d) > 0 ? toNum(n) / toNum(d) : null;
function videoInsights(videos) {
	const ads = videos.filter((v) => toNum(v.ad) === 1);
	const weighted = (field) => {
		const valid = ads.filter((v) => v[field] !== void 0 && v[field] !== null && toNum(v.revenue) > 0 && (field !== "ads_roas" || toNum(v[field]) > 0));
		const revenue = valid.reduce((n, v) => n + toNum(v.revenue), 0);
		return revenue > 0 ? valid.reduce((n, v) => n + toNum(v[field]) * toNum(v.revenue), 0) / revenue : null;
	};
	return {
		adsShare: videos.length ? ads.length / videos.length * 100 : null,
		roas: weighted("ads_roas"),
		adRevenueRatio: weighted("ad_revenue_ratio")
	};
}
function enrichedMetrics(e) {
	const d = e.detail ?? {}, gmv = d.revenue === void 0 ? null : toNum(d.revenue);
	const count = (field) => d[field] === void 0 ? null : toNum(d[field]);
	const ads = videoInsights(e.videos ?? []);
	const sellerVideos = new Set(e.sellerRunVideoIds ?? []);
	const robust = robustVideoBenchmark((e.videos ?? []).filter((v) => !sellerVideos.has(String(v.video_id))));
	return {
		product: {
			...e.product,
			...d,
			product_name: d.product_name ?? e.product.product_name,
			master_image_url: d.master_image_url ?? e.product.master_image_url,
			image_url: d.image_url ?? e.product.image_url
		},
		gmv,
		price: count("unit_price"),
		commission: count("commission_rate"),
		affiliates: count("creator_number"),
		newVideos: e.newVideos ?? null,
		capped: e.newVideosCapped,
		videos: count("video_number"),
		lives: count("live_number"),
		videoShare: gmv && d.video_revenue !== void 0 ? toNum(d.video_revenue) / gmv * 100 : null,
		liveShare: gmv && d.live_revenue !== void 0 ? toNum(d.live_revenue) / gmv * 100 : null,
		shopShare: gmv && (d.shopping_mall_revenue ?? d.showcase_revenue) !== void 0 ? toNum(d.shopping_mall_revenue ?? d.showcase_revenue) / gmv * 100 : null,
		gmvPerAffiliate: gmv !== null ? ratio(gmv, d.creator_number) : null,
		gmvPerVideo: ratio(d.video_revenue, d.video_number),
		robustMedian: robust.median,
		robustTrimmedMean: robust.trimmedMean,
		hitRate: robust.hitRate,
		affiliateVideoCount: robust.count,
		sellerRunVideoCount: sellerVideos.size,
		...ads
	};
}
function followerBucket(n) {
	return n < 1e4 ? 0 : n < 5e4 ? 1 : n < 25e4 ? 2 : 3;
}
function creatorInsights(creators) {
	const unique = /* @__PURE__ */ new Map();
	for (const c of creators) {
		const id = String(c.creator_id ?? c.creator_handle);
		const prior = unique.get(id);
		unique.set(id, prior ? {
			...c,
			revenue: toNum(prior.revenue) + toNum(c.revenue),
			video_revenue: toNum(prior.video_revenue) + toNum(c.video_revenue),
			live_revenue: toNum(prior.live_revenue) + toNum(c.live_revenue)
		} : { ...c });
	}
	const rows = [...unique.values()];
	const total = rows.reduce((n, c) => n + toNum(c.revenue), 0);
	const buckets = [
		"<10K",
		"10K to 50K",
		"50K to 250K",
		"250K+"
	].map((label, i) => {
		const cs = rows.filter((c) => followerBucket(toNum(c.creator_followers)) === i);
		return {
			label,
			count: cs.length,
			revenue: cs.reduce((n, c) => n + toNum(c.revenue), 0),
			share: total ? cs.reduce((n, c) => n + toNum(c.revenue), 0) / total * 100 : 0
		};
	});
	const leader = [...buckets].sort((a, b) => b.revenue - a.revenue)[0];
	return {
		rows,
		buckets,
		leader: total ? leader?.label : void 0,
		videoShare: total ? rows.reduce((n, c) => n + toNum(c.video_revenue), 0) / total * 100 : null,
		liveShare: total ? rows.reduce((n, c) => n + toNum(c.live_revenue), 0) / total * 100 : null
	};
}
function competitorInsights(k, answers) {
	const entries = selectedCompetitors(k, answers).map((p) => k?.enriched?.[productKey(p)]).filter((e) => !!e?.detail && toNum(e.detail.revenue) > 0 && (k?.discovery?.version !== 2 || toNum(e.detail.revenue) >= 5e3 && (toNum(e.detail.creator_number) >= 5 || toNum(e.detail.video_number) >= 10)));
	const products = entries.map(enrichedMetrics);
	const market = Object.fromEntries([
		"gmv",
		"price",
		"commission",
		"affiliates",
		"newVideos",
		"videos",
		"lives",
		"videoShare",
		"liveShare",
		"shopShare",
		"adsShare",
		"roas",
		"adRevenueRatio",
		"gmvPerAffiliate",
		"gmvPerVideo",
		"robustMedian",
		"robustTrimmedMean",
		"hitRate"
	].map((field) => {
		const values = products.map((p) => p[field]).filter((n) => n !== null);
		return [field, values.length ? median(values) : null];
	}));
	const videos = /* @__PURE__ */ new Map();
	const sellerCreators = new Set(entries.flatMap((e) => e.sellerRunCreatorIds ?? []));
	const sellerVideos = new Set(entries.flatMap((e) => e.sellerRunVideoIds ?? []));
	const creators = creatorInsights(entries.flatMap((e) => (e.creators ?? []).filter((c) => !sellerCreators.has(String(c.creator_id ?? c.creator_handle)))));
	for (const e of entries) for (const v of (e.videos ?? []).filter((v) => !sellerVideos.has(String(v.video_id)))) {
		const key = String(v.video_id);
		if (!videos.has(key) || toNum(v.revenue) > toNum(videos.get(key)?.revenue)) videos.set(key, v);
	}
	const allVideos = [...videos.values()];
	const adsMetrics = videoInsights(allVideos);
	market.roas = adsMetrics.roas;
	const topVideos = allVideos.sort((a, b) => toNum(b.revenue) - toNum(a.revenue)).slice(0, 10).map((v) => ({
		...v,
		displayTitle: englishHook(v.video_title),
		followers: creators.rows.find((c) => String(c.creator_id) === String(v.belonged_creator_id) || c.creator_handle === v.belonged_creator_handle)?.creator_followers
	}));
	const ownEntries = Object.values(k?.ownEnriched ?? {}).filter((e) => e.detail && toNum(e.detail.revenue) > 0);
	return {
		products,
		market,
		hasData: products.length >= 2 && products.filter((p) => p.robustTrimmedMean !== null).length >= 2,
		topVideos,
		creators,
		ads: adsMetrics,
		own: ownEntries.map(enrichedMetrics),
		ownCreators: creatorInsights(ownEntries.flatMap((e) => e.creators ?? [])),
		ownAds: videoInsights(ownEntries.flatMap((e) => e.videos ?? [])),
		sellerRunVideoCount: entries.reduce((n, e) => n + (e.sellerRunVideoIds?.length ?? 0), 0)
	};
}
//#endregion
export { nicheStats as A, usd as C, formatGrowth as D, fallbackExpansion as E, FBT_FACTS as F, FBT_RATE_CARD as I, fbtFeePanel as L, searchTermSet as M, sellerRunFlags as N, groupCompetitors as O, topSellers as P, toNum as S, fallbackClassify as T, pct as _, SOURCE as a, ratePct as b, competitorInsights as c, enrichedMetrics as d, marginTone as f, parseAsins as g, opportunitySignals as h, ROLE_LABEL as i, relevanceOf as j, mergePoolProducts as k, computeAll as l, num as m, NEXT_STEP as n, calc_exports as o, median as p, REVENUE_BUCKETS as r, candidateProducts as s, DEFAULT_ASSUMPTIONS as t, emptyProduct as u, productKey as v, applyClassificationFloor as w, selectedCompetitors as x, productMarketStats as y };
