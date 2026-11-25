import { i as __toESM } from "../_runtime.mjs";
import { C as usd, D as formatGrowth, S as toNum, d as enrichedMetrics, l as computeAll, m as num, n as NEXT_STEP, p as median, v as productKey, x as selectedCompetitors, y as productMarketStats } from "./calc-BRdncDBi.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Note, d as VerdictBadge, i as GhostBtn, m as useServerFn, n as Eyebrow, p as cn, r as Field, s as PrimaryBtn, u as TextInput } from "./ui-2b07_hmL.mjs";
import { d as getTeamVerdict, g as runMarketScan, h as refreshTeamData, l as findOwnProducts, n as adjustTeamAssumptions, o as enrichCategory } from "./fit.functions-BjbDqtzX.mjs";
import { C as CalendarCheck, _ as EyeOff, b as ChevronLeft, d as Presentation, h as Lock, m as Pencil, p as Play, t as X, u as Printer, y as ChevronRight } from "../_libs/lucide-react.mjs";
import { c as Bar, d as Legend, i as XAxis, l as ResponsiveContainer, n as BarChart, o as CartesianGrid, r as YAxis, u as Tooltip } from "../_libs/recharts+[...].mjs";
import { c as ProfitChart, l as ScanProgress, t as BookCall, u as Story } from "./scan-progress-DrlhJYYT.mjs";
import { t as Route } from "./report._id-B8mIZLQB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/report._id-D3xPQ9G9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var short = (n) => n < 0 ? `-${short(-n)}` : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${Math.round(n / 1e3)}K` : `$${Math.round(n)}`;
var sharePct = (n) => n > 0 && n < .01 ? "under 0.01%" : n >= 10 ? `${Math.round(n)}%` : n >= 1 ? `${n.toFixed(1)}%` : `${n.toFixed(2)}%`;
var signed = (n) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
var shortName = (name) => {
	return String(name ?? "").replace(/[|,(].*$/, "").replace(/\s[-–—]\s.*$/, "").trim().split(/\s+/).filter((w) => !/^(buy\d*|get\d*|\d+\s*pcs?|\d+-?pack|buy\d+get\d+)$/i.test(w)).slice(0, 4).join(" ") || "This product";
};
/** The best peer: smallest selected product still doing at least $20K a month, else the median one. */
function pickPeer(items) {
	const sorted = [...items].sort((a, b) => a.gmv - b.gmv);
	return sorted.find((p) => p.gmv >= 2e4) ?? sorted[Math.floor((sorted.length - 1) / 2)];
}
/** Bucket units into $5 bands and find the densest $10 range. */
function priceZone(items) {
	const bands = /* @__PURE__ */ new Map();
	let total = 0;
	for (const p of items) if (p.price > 0 && p.units > 0) {
		const b = Math.floor(p.price / 5);
		bands.set(b, (bands.get(b) ?? 0) + p.units);
		total += p.units;
	}
	if (!total) return null;
	let best = {
		lo: 0,
		units: -1
	};
	for (const b of bands.keys()) for (const start of [b - 1, b]) {
		const units = (bands.get(start) ?? 0) + (bands.get(start + 1) ?? 0);
		if (units > best.units) best = {
			lo: start * 5,
			units
		};
	}
	return {
		lo: best.lo,
		hi: best.lo + 10,
		share: best.units / total * 100
	};
}
function competitionWord(top10Share) {
	return top10Share < 50 ? "Open" : top10Share > 70 ? "Concentrated" : "Moderate";
}
var AMAZON_MID = {
	"<$20K": 1e4,
	"$20-50K": 35e3,
	"$50-100K": 75e3,
	"$100-250K": 175e3,
	"$250K+": 25e4
};
var amazonMonthly = (bucket) => bucket ? AMAZON_MID[bucket] ?? null : null;
/** Scenario tiers beyond month 6, as shares of the niche. */
function beyondScenarios(niche, peerShare, leaderShare) {
	return [{
		label: "Conservative",
		note: "Half of peer share",
		share: peerShare / 2
	}, {
		label: "Target",
		note: "Peer parity",
		share: peerShare
	}].map((s) => ({
		...s,
		monthly: niche * s.share / 100,
		yearly: niche * s.share / 100 * 12
	}));
}
function channelLead(video, live, shop) {
	return video >= live && video >= shop ? "video" : live >= shop ? "live" : "shop";
}
function buildDeck(r, k, answers, opts) {
	const brand = opts.brand || "Your brand";
	const optimize = opts.branch === "optimize";
	const now = opts.now ?? /* @__PURE__ */ new Date();
	const d = r.insights;
	const asOf = new Date(k?.fetchedAt ?? now).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric"
	});
	const source = (days) => `Source: Kalodata, TikTok Shop US, ${days} days to ${asOf}.`;
	const entries = selectedCompetitors(k, answers).map((p) => k?.enriched?.[productKey(p)]).filter((e) => !!e?.detail && toNum(e.detail.revenue) > 0);
	const products = entries.map((e) => {
		const m = enrichedMetrics(e);
		const d90 = e.detail90 && toNum(e.detail90.revenue) > 0 ? toNum(e.detail90.revenue) : null;
		const rawGrowth = formatGrowth(e.product.revenue_growth_rate, e.detail?.launch_date);
		const growth = typeof rawGrowth === "number" ? rawGrowth : null;
		return {
			...m,
			gmv: m.gmv ?? 0,
			name: shortName(m.product.product_name),
			image: m.product.master_image_url || m.product.image_url,
			gmv90: d90,
			growth,
			reviews: e.detail?.product_review_count !== void 0 ? toNum(e.detail.product_review_count) : null,
			skuCount: toNum(e.product.sku_count)
		};
	}).sort((a, b) => b.gmv - a.gmv);
	const nicheData = productMarketStats(k, answers);
	const market = nicheData.products;
	const niche = nicheData.gmv;
	const top10Share = nicheData.top3Share;
	const c30 = k?.category?.d30, c90 = k?.category?.d90, parent90 = k?.category?.parent90;
	const cat = c30 && toNum(c30.revenue) > 0 ? {
		name: String(c30.category_name ?? "This category"),
		revenue: toNum(c30.revenue),
		revenue90: c90 ? toNum(c90.revenue) : null,
		growth90: c90?.revenue_growth_rate !== void 0 ? toNum(c90.revenue_growth_rate) : null,
		parentName: parent90?.category_name ? String(parent90.category_name) : null,
		parentGrowth90: parent90?.revenue_growth_rate !== void 0 ? toNum(parent90.revenue_growth_rate) : null,
		shops: toNum(c30.shop_number),
		activeProducts: toNum(c30.active_product_number),
		units: toNum(c30.sale),
		avgOrder: toNum(c30.sale) > 0 ? toNum(c30.revenue) / toNum(c30.sale) : null,
		video: toNum(c30.video_revenue) / toNum(c30.revenue) * 100,
		live: toNum(c30.live_revenue) / toNum(c30.revenue) * 100,
		shop: toNum(c30.shopping_mall_revenue) / toNum(c30.revenue) * 100,
		affiliate: toNum(c30.affiliate_revenue) / toNum(c30.revenue) * 100,
		trend: Array.isArray(c30.revenue_trend) ? c30.revenue_trend.map(toNum) : []
	} : null;
	const own = d.own;
	const ownGmv = own.reduce((n, p) => n + (p.gmv ?? 0), 0);
	const ownVideos = own.reduce((n, p) => n + (p.videos ?? 0), 0);
	const ownCreators = own.reduce((n, p) => n + (p.affiliates ?? 0), 0);
	const ownCommission = median(own.map((p) => p.commission).filter((n) => n !== null && n > 0));
	const ownReviews = Object.values(k?.ownEnriched ?? {}).reduce((n, e) => n + toNum(e.detail?.product_review_count), 0);
	const ownGmv90 = Object.values(k?.ownEnriched ?? {}).reduce((n, e) => n + toNum(e.detail90?.revenue), 0);
	const shelf = niche;
	const ownShare = shelf > 0 ? ownGmv / shelf * 100 : 0;
	const peer = pickPeer(products);
	const leader = products[0];
	const peerShare = peer && niche > 0 ? peer.gmv / niche * 100 : 0;
	const leaderShare = leader && niche > 0 ? leader.gmv / niche * 100 : 0;
	const mostVideos = [...products].sort((a, b) => (b.videos ?? 0) - (a.videos ?? 0))[0];
	const followersOf = (v) => {
		const c = d.creators.rows.find((c) => String(c.creator_id) === String(v.belonged_creator_id) || c.creator_handle === v.belonged_creator_handle);
		return c ? toNum(c.creator_followers) : null;
	};
	const allVideos = entries.flatMap((e) => e.videos ?? []);
	const perK = (vs) => {
		const views = vs.reduce((n, v) => n + toNum(v.views), 0);
		return views > 0 ? vs.reduce((n, v) => n + toNum(v.revenue), 0) / views * 1e3 : null;
	};
	const tagged = allVideos.map((v) => ({
		v,
		f: followersOf(v)
	})).filter((x) => x.f !== null);
	const smallPerK = perK(tagged.filter((x) => (x.f ?? 0) < 5e4).map((x) => x.v));
	const largePerK = perK(tagged.filter((x) => (x.f ?? 0) >= 5e4).map((x) => x.v));
	const topVideo = d.topVideos[0];
	const zone = priceZone(market.map((p) => ({
		price: toNum(p.unit_price),
		units: toNum(p.sales_volumn ?? p.sales_volume)
	})));
	const medPrice = median(market.map((p) => toNum(p.unit_price)).filter((n) => n > 0));
	const bundles = market.filter((p) => toNum(p.revenue) > 0 && (toNum(p.sku_count) > 1 || toNum(p.unit_price) > medPrice * 2));
	const bundleShare = niche > 0 ? bundles.reduce((n, p) => n + toNum(p.revenue), 0) / niche * 100 : 0;
	const price = opts.price;
	const priceWhere = !price || !zone ? null : price < zone.lo ? "below" : price > zone.hi ? "above" : "inside";
	const a = r.assumptions;
	const base = r.scenarios.find((s) => s.label === "Target");
	const cons = r.scenarios.find((s) => s.label === "Conservative");
	const six = (s) => (s?.rows ?? []).slice(0, 6);
	const sixTarget = six(base).reduce((n, x) => n + x.gmv, 0), sixCons = six(cons).reduce((n, x) => n + x.gmv, 0);
	const m6 = six(base)[5]?.gmv ?? 0;
	const m6Share = niche > 0 ? m6 / niche * 100 : 0;
	const tiers = beyondScenarios(niche, peerShare, leaderShare);
	const amazon = amazonMonthly(answers.amazonRevenue);
	const sellsAmazon = Array.isArray(answers.dtc) ? answers.dtc.includes("amazon") : answers.dtc === "amazon" || !!answers.amazonRevenue;
	const lead = channelLead(nicheData.shares[0] ?? 0, nicheData.shares[1] ?? 0, nicheData.shares[2] ?? 0);
	const liveShare = nicheData.shares[1] ?? null;
	const openLive = liveShare !== null && liveShare < 15;
	const month = now.getMonth();
	const q4Soon = month >= 7 && month <= 10;
	const commission = Math.round(a.affiliatePct);
	const peerVideos = median(products.map((p) => p.videos ?? 0).filter((n) => n > 0));
	const peerCommission = d.market.commission;
	const peerReviews = median(products.map((p) => p.reviews ?? 0).filter((n) => n > 0));
	const ownPerVideo = ownVideos > 0 ? own.reduce((n, p) => n + toNum(p.product.video_revenue), 0) / ownVideos : null;
	const peerPerVideo = d.market.gmvPerVideo;
	const ownPrice = median(own.map((p) => p.price ?? 0).filter((n) => n > 0));
	const blockers = [];
	if (optimize && own.length) {
		if (peerVideos > 0 && ownVideos < peerVideos) blockers.push({
			blocker: "Content volume",
			today: `${Math.round(ownVideos)} videos vs ${Math.round(peerVideos)} for a typical peer`,
			fix: `${a.samplesPerMonth} samples a month to build video volume`
		});
		if (peerCommission !== null && ownCommission > 0 && ownCommission < peerCommission) blockers.push({
			blocker: "Affiliate economics",
			today: `${Math.round(ownCommission)}% commission vs ${Math.round(peerCommission)}% for peers`,
			fix: `Move to ${commission}% and reactivate idle creators`
		});
		if (zone && ownPrice > 0 && (ownPrice < zone.lo || ownPrice > zone.hi)) blockers.push({
			blocker: "Price vs band",
			today: `$${ownPrice.toFixed(2)} vs a $${zone.lo} to $${zone.hi} value zone`,
			fix: ownPrice > zone.hi ? "Entry SKU or bundle inside the value zone" : "Bundle to lift order value"
		});
		if (peerReviews > 0 && ownReviews < peerReviews) blockers.push({
			blocker: "Social proof",
			today: `${Math.round(ownReviews).toLocaleString("en-US")} reviews vs ${Math.round(peerReviews).toLocaleString("en-US")} for peers`,
			fix: "Sample-driven reviews in the first 60 days"
		});
		if (answers.probation === "yes") blockers.push({
			blocker: "Probation cap",
			today: "Creator outreach is capped while the shop is in probation",
			fix: "Clear probation first, then open outreach"
		});
	}
	return {
		brand,
		optimize,
		source,
		asOf,
		products,
		niche,
		top10Share,
		competition: competitionWord(top10Share),
		cat,
		own,
		ownGmv,
		ownGmv90,
		ownShare,
		ownVideos,
		ownCreators,
		ownCommission,
		ownPerVideo,
		peerPerVideo,
		peer,
		peerShare,
		leader,
		leaderShare,
		mostVideos,
		smallPerK,
		largePerK,
		topVideo,
		topFollowers: topVideo ? followersOf(topVideo) : null,
		zone,
		priceWhere,
		bundles,
		bundleShare,
		price,
		base,
		cons,
		sixTarget,
		sixCons,
		m6,
		m6Share,
		tiers,
		amazon,
		sellsAmazon,
		lead,
		liveShare,
		openLive,
		q4Soon,
		commission,
		blockers,
		shelf,
		topVideos: d.topVideos,
		creators: d.creators,
		a,
		peerVideos
	};
}
var BOOKING_URL = "https://calendly.com/pablo-sophiesociety/30min";
var watchUrl = (v) => `https://www.tiktok.com/@${encodeURIComponent(v.belonged_creator_handle ?? "")}/video/${encodeURIComponent(String(v.video_id))}`;
var monthLabel = (m) => m ? `Month ${m}` : "After month 12";
function Tiles({ items, dark }) {
	const list = items.filter(Boolean);
	if (!list.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("grid gap-4", list.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : list.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"),
		children: list.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("rounded-xl border p-5", dark ? "border-primary-foreground/20" : "border-border bg-card"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("text-3xl font-bold tracking-tight sm:text-4xl", dark ? "text-primary-foreground" : "text-navy"),
					children: t.value
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("mt-2 text-sm font-semibold", dark ? "text-primary-foreground" : "text-navy"),
					children: t.label
				}),
				t.sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("mt-1 text-sm", dark ? "text-primary-foreground/70" : "text-caption"),
					children: t.sub
				})
			]
		}, t.label))
	});
}
function Footer({ n, dark }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("mt-auto flex items-center justify-between pt-6 text-sm font-semibold", dark ? "text-primary-foreground/70" : "text-caption"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
			String(n).padStart(2, "0"),
			" | ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"aria-hidden": true,
				children: "▲ ■ ●"
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sophie Society" })]
	});
}
function SlideView({ s, n, team, present }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("deck-slide", present && "h-full"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: cn("slide flex flex-col rounded-2xl p-6 sm:p-10", s.dark ? "bg-navy text-primary-foreground" : "border border-border bg-card", present && "h-full overflow-y-auto rounded-none border-0"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("eyebrow", s.dark && "text-primary-foreground/70"),
					children: s.eyebrow
				}),
				n === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: cn("mt-3 max-w-4xl text-4xl leading-tight sm:text-6xl", s.dark && "text-primary-foreground"),
					children: s.title
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: cn("mt-3 max-w-4xl text-3xl leading-tight sm:text-5xl", s.dark && "text-primary-foreground"),
					children: s.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 space-y-6",
					children: s.body
				}),
				s.source && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("mt-6 text-xs", s.dark ? "text-primary-foreground/60" : "text-caption"),
					children: s.source
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {
					n,
					dark: s.dark
				})
			]
		}), team && !present && !!s.notes?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "no-print mt-3 rounded-xl border border-dashed border-navy bg-cloud p-4 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "eyebrow",
				children: "Notes for the team"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 list-disc space-y-1 pl-5",
				children: s.notes.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: x }, x))
			})]
		})]
	});
}
function Table({ head, rows, highlight }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[640px] text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
				className: "border-b border-border text-left",
				children: head.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "eyebrow px-3 py-2",
					children: h
				}, h))
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
				className: cn("border-b border-border", highlight?.includes(i) && "bg-growth/15 font-semibold"),
				children: r.map((c, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-3 py-2",
					children: c
				}, j))
			}, i)) })]
		})
	});
}
var Body = ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
	className: "max-w-3xl text-lg",
	children
});
function buildSlides(D, r, opts) {
	const { brand, optimize, cat, a } = D;
	const S = [];
	const date = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric"
	});
	const shelfName = cat?.name ?? "this shelf";
	const peer = D.peer, base = D.base;
	S.push({
		key: "cover",
		dark: true,
		eyebrow: `Prepared for ${brand} · ${date}`,
		title: `${brand} on TikTok Shop. The plan.`,
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "max-w-3xl text-xl text-primary-foreground/80",
			children: optimize ? `How ${brand} turns its TikTok Shop into a real second channel.` : `How ${brand} builds a second sales channel next to ${D.sellsAmazon ? "Amazon" : "its current channels"} on a shelf that is ${cat?.growth90 !== null && cat?.growth90 !== void 0 && cat.growth90 < 0 ? "already large" : "growing"}.`
		}),
		notes: ["Open with the partner's goal. This deck is built from live TikTok Shop data pulled for their competitors."]
	});
	if (cat || D.niche > 0) {
		const shelf = D.niche;
		const tiles = [
			{
				value: short(shelf),
				label: "Direct niche monthly sales",
				sub: cat ? `Part of the ${short(cat.revenue)} ${shelfName} category.` : "All direct products found, last 30 days."
			},
			cat?.growth90 !== null && cat?.growth90 !== void 0 && {
				value: signed(cat.growth90),
				label: "Growth, 90 days",
				sub: cat.parentGrowth90 !== null ? `${cat.parentName} overall: ${signed(cat.parentGrowth90)}.` : "Versus the prior 90 days."
			},
			cat && cat.shops > 0 && {
				value: num(cat.shops),
				label: "Shops selling",
				sub: `${num(cat.activeProducts)} active products compete for the shelf.`
			},
			cat?.avgOrder && {
				value: usd(cat.avgOrder, 2),
				label: "Average order",
				sub: D.price && Math.abs(D.price - cat.avgOrder) / cat.avgOrder <= .2 ? `Right where ${brand}'s price sits.` : D.price ? `${brand} sells at ${usd(D.price, 2)}.` : "Category sales divided by units."
			},
			{
				value: D.ownGmv > 0 ? short(D.ownGmv) : "$0",
				label: `${brand} today`,
				sub: D.ownGmv > 0 ? `${sharePct(D.ownShare)} of the shelf${D.ownGmv90 ? `, ${short(D.ownGmv90)} over 90 days` : ""}.` : "No TikTok Shop sales yet."
			}
		];
		S.push({
			key: "opportunity",
			eyebrow: optimize ? `Where ${brand} stands` : "The opportunity",
			title: optimize ? `A ${short(shelf)} shelf. ${brand} holds ${sharePct(D.ownShare)} of it.` : `A ${short(shelf)} a month shelf. ${brand} is not on it yet.`,
			body: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiles, { items: tiles }),
			source: `${D.source(30)} 90-day figures: ${D.source(90).replace("Source: ", "")}`,
			notes: [
				cat ? `Niche = all direct products discovered. Category "${cat.name}" is context only.` : "Niche = all direct products discovered.",
				"Average order = category revenue divided by units sold, 30 days.",
				"Talking point: the shelf exists already. The question is who captures it."
			]
		});
	}
	if (cat || D.products.length) {
		const video = cat?.video ?? D.creators.videoShare ?? 0, live = D.liveShare ?? 0;
		const leadWord = D.lead === "video" ? "Creators sell this shelf, through video." : D.lead === "live" ? "Creators sell this shelf, through lives." : "Shoppers find this shelf in the shop tab.";
		S.push({
			key: "how",
			eyebrow: "How the category sells",
			title: leadWord,
			body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiles, { items: [
				{
					value: sharePct(video),
					label: "Sales from shoppable video",
					sub: "Share of category revenue."
				},
				cat && {
					value: sharePct(cat.affiliate),
					label: "Sales from affiliate creators",
					sub: "Paid on commission, only when they sell."
				},
				{
					value: sharePct(live),
					label: "Live share",
					sub: D.openLive ? "Open lane. Few brands go live here." : "Lives are an established channel."
				},
				optimize && D.ownVideos > 0 && D.peerVideos > 0 && {
					value: `${Math.max(1, Math.round(D.peerVideos / D.ownVideos))}x`,
					label: "Content gap",
					sub: `${num(D.ownVideos)} ${brand} videos vs ${num(D.peerVideos)} for a typical peer.`
				},
				optimize && D.ownCommission > 0 && {
					value: `${Math.round(D.ownCommission)}%`,
					label: `${brand} commission`,
					sub: `Peers pay ${D.commission}%.`
				}
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Body, { children: [
				"Shoppers find ",
				cat?.name.toLowerCase() ?? "this product",
				" in a creator's video, not in search. That is exactly the engine we run: seed creators with product, pay them on the sales they drive, and scale what works."
			] })] }),
			source: D.source(30),
			notes: [
				"Channel split from category/detail: video, live and shop tab revenue over total.",
				"Affiliate share = affiliate_revenue / revenue.",
				"Live under 15% is flagged as an open lane."
			]
		});
	}
	if (D.products.length) {
		const highlight = optimize ? D.products.length : -1;
		const rows = D.products.map((p) => [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-2",
				children: [p.image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: p.image,
					alt: "",
					className: "h-9 w-9 rounded object-cover"
				}), p.name]
			}),
			short(p.gmv),
			p.growth !== null ? signed(p.growth) : "",
			p.price ? usd(p.price, 2) : "",
			p.affiliates !== null ? num(p.affiliates) : "",
			p.videos !== null ? num(p.videos) : "",
			p.commission !== null ? `${Math.round(p.commission)}%` : ""
		]);
		const ownRows = optimize ? D.own.map((p) => [
			`${brand}: ${String(p.product.product_name ?? "").split(" ").slice(0, 4).join(" ")}`,
			short(p.gmv ?? 0),
			"",
			p.price ? usd(p.price, 2) : "",
			p.affiliates !== null ? num(p.affiliates) : "",
			p.videos !== null ? num(p.videos) : "",
			p.commission !== null ? `${Math.round(p.commission)}%` : ""
		]) : [];
		const byVideos = [...D.products].sort((x, y) => (y.videos ?? 0) - (x.videos ?? 0));
		const contentWins = byVideos[0] && D.leader && byVideos[0] === D.leader;
		S.push({
			key: "niche",
			eyebrow: "The niche, product vs product",
			title: contentWins ? "Content volume beats shelf size." : "Sales follow creators and content.",
			body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table, {
				head: [
					"Product",
					"30d GMV",
					"Growth",
					"Price",
					"Creators",
					"Videos",
					"Commission"
				],
				rows: [...rows, ...ownRows],
				highlight: ownRows.map((_, i) => highlight + i)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Body, { children: [
				"Top 3 products hold ",
				sharePct(D.top10Share),
				" of the niche. ",
				D.competition === "Open" ? "Room is open for a new name." : D.competition === "Moderate" ? "Leaders exist, but there is room for a new name." : "A few names lead, so a new brand needs a sharp angle."
			] })] }),
			source: D.source(30),
			notes: [
				"Products are the competitors the partner confirmed.",
				"Niche = all direct products discovered, 30 days.",
				`Competition: Open under 50% top-3 share, Concentrated above 70%.`
			]
		});
	}
	if (peer) S.push({
		key: "proof",
		eyebrow: "The proof point",
		title: `A ${peer.name} already does ${short(peer.gmv)} a month.`,
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiles, { items: [
			{
				value: short(peer.gmv),
				label: "30-day GMV",
				sub: `${sharePct(D.peerShare)} of the niche.`
			},
			peer.affiliates !== null && {
				value: num(peer.affiliates),
				label: "Creators",
				sub: "Selling it in the last 30 days."
			},
			peer.videos !== null && {
				value: num(peer.videos),
				label: "Videos in 30 days",
				sub: "With views and sales attached."
			},
			peer.gmv90 && {
				value: short(peer.gmv90),
				label: "GMV, 90 days",
				sub: peer.growth !== null ? `${signed(peer.growth)} growth, 30 days.` : "Last 90 days."
			}
		] }), (peer.videoShare ?? 0) + (peer.liveShare ?? 0) > 60 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Body, { children: "Built almost entirely on affiliate creators." })] }),
		source: D.source(30),
		notes: ["Peer = smallest selected product still above $20K a month, otherwise the median product.", "Use it to show a realistic, not heroic, target."]
	});
	if (D.topVideo) {
		const v = D.topVideo;
		const smallWins = D.smallPerK !== null && D.largePerK !== null && D.smallPerK > D.largePerK;
		S.push({
			key: "content",
			eyebrow: "The content formula",
			title: optimize && D.ownPerVideo && D.peerPerVideo ? D.ownPerVideo >= D.peerPerVideo ? `${usd(D.ownPerVideo)} per video, ${(D.ownPerVideo / D.peerPerVideo).toFixed(1)}x rivals.` : `${usd(D.ownPerVideo)} per video. Rivals make ${usd(D.peerPerVideo)}.` : smallWins ? "Small creators sell this product best." : D.creators.leader ? `Creators with ${D.creators.leader} followers sell the most.` : "A few videos carry the sales.",
			body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiles, { items: [
				{
					value: short(Number(v.revenue) || 0),
					label: "The #1 video",
					sub: `@${v.belonged_creator_handle}, ${num(Number(v.views) || 0)} views${D.topFollowers !== null ? `, ${num(D.topFollowers)} followers` : ""}.`
				},
				D.smallPerK !== null && {
					value: usd(D.smallPerK, 2),
					label: "GMV per 1,000 views, small creators",
					sub: D.largePerK !== null ? `Under 50K followers. Large creators: ${usd(D.largePerK, 2)}.` : "Under 50K followers."
				},
				D.creators.leader && {
					value: D.creators.leader,
					label: "Follower sweet spot",
					sub: "Bucket with the most creator revenue."
				},
				optimize && D.ownPerVideo && D.peerPerVideo && {
					value: usd(D.ownPerVideo),
					label: `${brand} revenue per video`,
					sub: D.ownPerVideo > D.peerPerVideo ? "The product converts, it lacks distribution." : `Peers: ${usd(D.peerPerVideo)}.`
				}
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "grid gap-2 text-sm sm:grid-cols-2",
				children: D.topVideos.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-3 border-b border-border py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-semibold text-navy",
							children: [
								i + 1,
								". @",
								x.belonged_creator_handle
							]
						}),
						" · ",
						short(Number(x.revenue) || 0),
						" · ",
						num(Number(x.views) || 0),
						" views"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: watchUrl(x),
						target: "_blank",
						rel: "noreferrer",
						className: "no-print inline-flex items-center gap-1 font-semibold text-signal",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4" }), "Watch"]
					})]
				}, x.video_id))
			})] }),
			source: D.source(30),
			notes: [
				"Top videos come from video/rank, top 100 by revenue per selected product.",
				"GMV per 1,000 views = revenue / views x 1,000, split by creator followers from creator/rank.",
				"Talking point: we brief creators on the hooks of the top 3 videos."
			]
		});
	}
	if (D.zone) {
		const z = D.zone;
		S.push({
			key: "fit",
			eyebrow: "Product fit",
			title: D.priceWhere === "above" ? "Price sits above the value zone." : D.priceWhere === "below" ? "Price sits below the value zone." : "The catalog fits, as it is today.",
			body: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiles, { items: [
				{
					value: sharePct(z.share),
					label: `Units sold at $${z.lo} to $${z.hi}`,
					sub: "The densest $10 price range."
				},
				D.price && {
					value: usd(D.price, 2),
					label: `${brand}'s price`,
					sub: D.priceWhere === "inside" ? "Inside the value zone." : D.priceWhere === "above" ? "Above the zone. A bundle or entry SKU helps." : "Below the zone. Room for bundles."
				},
				D.bundles.length > 0 && {
					value: sharePct(D.bundleShare),
					label: "Bundle opportunity",
					sub: `${D.bundles.length} multi-SKU or premium products sell in this niche.`
				}
			] }),
			source: D.source(30),
			notes: ["Units from the top 20 keyword products, bucketed in $5 bands.", "Bundle = sku_count above 1 or price above 2x the median."]
		});
	}
	if (optimize && D.blockers.length) S.push({
		key: "diagnosis",
		eyebrow: "Diagnosis",
		title: `${[
			"One thing holds",
			"Two things hold",
			"Three things hold",
			"Four things hold",
			"Five things hold"
		][D.blockers.length - 1]} it back. ${D.blockers.length === 1 ? "It is" : `All ${[
			"",
			"",
			"two",
			"three",
			"four",
			"five"
		][D.blockers.length]} are`} fixable.`,
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table, {
			head: [
				"Blocker",
				"Today",
				"The fix"
			],
			rows: D.blockers.map((b) => [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold text-navy",
					children: b.blocker
				}),
				b.today,
				b.fix
			])
		}),
		source: D.source(30),
		notes: ["Gaps vs the median of selected competitors."]
	});
	if (base) {
		const hooks = D.topVideos.map((v) => v.displayTitle).filter((h) => !!h).slice(0, 3);
		const cards = [
			{
				t: optimize ? "Shop audit" : "Shop launch",
				d: optimize ? "Fix listings, price ladder and probation status. Get the shop ready to scale." : "Set up the shop, listings and FBT stock so creators can sell from day one."
			},
			{
				t: "Affiliate engine",
				d: `${D.commission}% commission, ${num(a.samplesPerMonth)} samples a month, focused on creators with ${D.creators.leader ?? "comparable"} followers.`
			},
			{
				t: "Content system",
				d: hooks.length ? `Hooks from the top videos: ${hooks.map((h) => `"${h.slice(0, 50)}"`).join(", ")}.` : "Briefs built from the best-selling videos in the niche."
			},
			{
				t: "Lives and ads",
				d: `${D.openLive ? "Lives as an open lane. " : ""}GMV Max from month ${a.adStartMonth} at ${usd(a.adDaily)} a day.`
			}
		];
		S.push({
			key: "workstreams",
			eyebrow: "The plan",
			title: "Four workstreams, run by one team.",
			body: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: cards.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-3xl font-bold text-signal",
							children: String(i + 1).padStart(2, "0")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 text-lg font-semibold text-navy",
							children: c.t
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm",
							children: c.d
						})
					]
				}, c.t))
			}),
			notes: [
				"Commission = median of selected competitors, minimum 10%.",
				"Samples = 25% of median active affiliates spread over 6 months at a 40% post rate, minimum 150.",
				r.adjusted ? "Assumptions adjusted by Sophie team." : "No team overrides."
			]
		});
		const rows = base.rows;
		const months = [
			[
				"M1",
				optimize ? "Set up" : "Launch",
				`Shop and listings live. First ${num(a.samplesPerMonth)} samples out.`
			],
			[
				"M2",
				"Seed",
				`${num(rows[1]?.affiliates ?? 0)} videos live target. Learn which hooks sell.`
			],
			[
				"M3",
				"Signal",
				`GMV Max starts at ${usd(a.adDaily)} a day. About ${short(rows[2]?.gmv ?? 0)} GMV.`
			],
			[
				"M4",
				"Scale",
				`Push winning creators. About ${short(rows[3]?.gmv ?? 0)} GMV.`
			],
			[
				"M5",
				optimize ? "Compound" : "Expand",
				`Add lives and products. About ${short(rows[4]?.gmv ?? 0)} GMV.`
			],
			[
				"M6",
				"Optimize",
				`${num(rows[5]?.affiliates ?? 0)} cumulative videos. About ${short(rows[5]?.gmv ?? 0)} GMV.`
			]
		];
		S.push({
			key: "months",
			eyebrow: "Month by month",
			title: "Launch, prove, then scale.",
			body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-3 lg:grid-cols-6",
				children: months.map(([m, t, d]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-bold text-signal",
							children: m
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-semibold text-navy",
							children: t
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm",
							children: d
						})
					]
				}, m))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-caption",
				children: "A new shop starts with limits on creator outreach. Months 1 and 2 build the content base; sales follow video volume, usually from month 3."
			})] }),
			notes: ["GMV uses robust affiliate-video benchmarks, a new-shop ramp, 35% monthly decay, ads only after 100 live videos, and GMV guardrails."]
		});
		const data = rows.slice(0, 6).map((x, i) => ({
			month: `M${x.month}`,
			Target: Math.round(x.gmv),
			Conservative: Math.round(D.cons?.rows[i]?.gmv ?? 0)
		}));
		S.push({
			key: "six",
			eyebrow: "First 6 months, planning model",
			title: "What the first 6 months can look like.",
			body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-72",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								stroke: "var(--border)",
								vertical: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, { dataKey: "month" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								tickFormatter: (v) => short(Number(v)),
								width: 60
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { formatter: (v) => usd(v) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "Target",
								fill: "var(--navy)",
								isAnimationActive: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "Conservative",
								fill: "var(--signal)",
								isAnimationActive: false
							})
						]
					}) })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiles, { items: [
					{
						value: `${short(D.sixCons)} to ${short(D.sixTarget)}`,
						label: "GMV, first 6 months",
						sub: "Conservative to target."
					},
					{
						value: short(D.m6),
						label: "Monthly run rate by month 6",
						sub: "Target scenario."
					},
					D.niche > 0 && {
						value: sharePct(D.m6Share),
						label: "Share of the niche by month 6",
						sub: peer ? `The proof point holds ${sharePct(D.peerShare)}.` : "Of top 20 product GMV."
					}
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-caption",
					children: [
						"Planning model, not a guarantee. Assumes at least ",
						num(a.samplesPerMonth),
						" samples a month, ",
						D.commission,
						"% commission and ads from month ",
						a.adStartMonth,
						"."
					]
				})
			] }),
			notes: ["Target = median of competitor trimmed-mean affiliate video revenue. Conservative uses median per-video revenue and is capped at half of Target."]
		});
		const m12 = rows[11];
		S.push({
			key: "twelve",
			eyebrow: "12 months, GMV and profit",
			title: !r.profitAvailable ? "Add product costs to see profitability." : base.breakEvenMonth ? `The investment pays back in month ${base.breakEvenMonth}.` : base.profitableMonth ? `Profitable from month ${base.profitableMonth}.` : "Profit needs more than 12 months at these numbers.",
			body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfitChart, { r }), r.profitAvailable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiles, { items: [
				{
					value: usd(base.maxInvestment),
					label: "Total investment until payback",
					sub: "Deepest point of cumulative profit."
				},
				{
					value: monthLabel(base.profitableMonth),
					label: "Profitable month",
					sub: "First month with positive profit, never before month 3 for a launch."
				},
				m12 && {
					value: usd(m12.net),
					label: "Month-12 monthly profit",
					sub: "After fees, returns, samples and ads."
				}
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Body, { children: "Add your product cost to see profit. GMV remains an estimate based on competitor benchmarks." })] }),
			notes: ["Monthly profit = GMV x margin after referral, commission, COGS and fulfillment, minus Sophie fee, samples and ad spend."]
		});
	}
	if (peer && D.niche > 0) S.push({
		key: "beyond",
		eyebrow: "Beyond month 6",
		title: "Where this can go once the engine runs.",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table, {
			head: [
				"Scenario",
				"Niche share",
				"Monthly GMV",
				"Per year"
			],
			rows: D.tiers.map((t) => [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-navy",
						children: t.label
					}),
					" · ",
					t.note
				] }),
				sharePct(t.share),
				short(t.monthly),
				short(t.yearly)
			]),
			highlight: [1]
		}), D.amazon && D.tiers[1] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiles, { items: [{
			value: sharePct(D.tiers[1].monthly / D.amazon * 100),
			label: `Target case vs ${brand}'s Amazon sales`,
			sub: `Using the ${short(D.amazon)} midpoint of the revenue range given.`
		}] })] }),
		source: D.source(30),
		notes: ["Conservative = half of the proof point's niche share. Base = proof point share. Upside = top product share."]
	});
	if (D.mostVideos || peer) {
		const mv = D.mostVideos;
		S.push({
			key: "samples",
			eyebrow: "Sample volume",
			title: `${num(a.samplesPerMonth)} samples a month is the floor, not the cap.`,
			body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Body, { children: "Every sample is a shot at a video, and sales follow video volume." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tiles, { items: [mv && mv.videos !== null && {
				value: num(mv.videos),
				label: `Videos in 30 days, ${mv.name}`,
				sub: `${short(mv.gmv)} GMV${mv.growth !== null ? `, ${signed(mv.growth)} growth` : ""}.`
			}, peer && peer.videos !== null && {
				value: num(peer.videos),
				label: `Videos, ${peer.name}`,
				sub: `${peer.affiliates !== null ? num(peer.affiliates) : "Many"} creators behind it.`
			}] })] }),
			source: D.source(30),
			notes: ["Sample units cost COGS plus FBT fee."]
		});
	}
	if (base) S.push({
		key: "investment",
		eyebrow: "Investment",
		title: "What it takes from both sides.",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("grid gap-4", !opts.hidePricing && "md:grid-cols-2"),
			children: [!opts.hidePricing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-navy p-6 text-primary-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow text-primary-foreground/70",
						children: "Sophie Society"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 text-4xl font-bold",
						children: [usd(a.sophieFee), " per month"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-4 list-disc space-y-1 pl-5 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Full TikTok Shop management." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Revenue share only above $100K monthly GMV." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No minimum term, 6 months recommended." })
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "eyebrow",
					children: [brand, " provides"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 space-y-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-navy",
								children: "Product for samples:"
							}),
							" ",
							num(a.samplesPerMonth),
							"+ units a month, no cap, about ",
							usd(r.econ.monthlySampleCost),
							" a month."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-navy",
								children: "Affiliate commission:"
							}),
							" ",
							D.commission,
							"%, only on sales."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-semibold text-navy",
								children: [
									"Ad budget from month ",
									a.adStartMonth,
									":"
								]
							}),
							" ",
							usd(a.adDaily),
							" a day."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-navy",
							children: "Shop and stock:"
						}), " FBT inventory."] })
					]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-caption",
			children: "TikTok Shop also charges a 6% referral fee on each sale."
		})] }),
		notes: ["Team can hide the Sophie fee with Hide pricing before presenting."]
	});
	const growth = cat?.growth90 ?? null;
	const why = [
		growth !== null && (growth > 0 ? `${cat?.name} grew ${signed(growth)} over the last 90 days.` : `${cat?.name} already sells ${short(cat?.revenue ?? 0)} a month.`),
		D.openLive && `Lives drive only ${sharePct(D.liveShare ?? 0)} of sales. That lane is open.`,
		D.ownGmv > 0 ? `${brand} already has a shop and ${num(D.ownCreators)} creators. That is a head start.` : D.sellsAmazon ? `${brand} already proves demand on Amazon. TikTok Shop buyers check reviews there.` : D.competition !== "Concentrated" ? `Top 3 products hold ${sharePct(D.top10Share)}. No one owns the niche yet.` : null,
		D.q4Soon && "Q4 is close. Seeding creators now puts videos live for peak season."
	].filter(Boolean);
	S.push({
		key: "now",
		eyebrow: "Why now, and how we start",
		title: growth !== null && growth > 0 ? "The shelf is growing. The first real brand wins." : "The shelf is here. The first real brand wins.",
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-3",
				children: why.slice(0, 3).map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-2 h-2 w-2 shrink-0 rounded-full bg-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: x })]
				}, x))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl border border-border p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-bold text-signal",
								children: "01"
							}),
							" 30-minute call with the TikTok Shop team.",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "no-print mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
									onClick: () => window.open(BOOKING_URL, "_blank", "noopener,noreferrer"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarCheck, { className: "h-5 w-5" }), " Book a call"]
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl border border-border p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-bold text-signal",
								children: "02"
							}),
							" Hero SKUs and bundles, ",
							optimize ? "shop access" : "shop setup",
							"."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl border border-border p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold text-signal",
							children: "03"
						}), " Launch week: first samples out."]
					})
				]
			})]
		}),
		source: cat ? D.source(90) : void 0,
		notes: ["Close on the call. Confirm hero SKUs and who owns shop access."]
	});
	S.push({
		key: "closing",
		dark: true,
		eyebrow: "Sophie Society",
		title: D.sellsAmazon ? `${brand} already wins on Amazon. TikTok Shop is the next place it should.` : `${brand} already wins with its customers. TikTok Shop is the next place it should.`,
		body: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-lg text-primary-foreground/80",
			children: "hello@sophiesociety.com · sophiesociety.com"
		})
	});
	return S;
}
function DeckView({ r, k, answers, brand, branch, price, team, hidePricing, presenting, onExit }) {
	const slides = buildSlides(buildDeck(r, k, answers, {
		brand,
		branch,
		price
	}), r, { hidePricing });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "deck space-y-10",
		children: slides.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlideView, {
			s,
			n: i + 1,
			team
		}, s.key))
	}), presenting && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Presenter, {
		slides,
		onExit
	})] });
}
function Presenter({ slides, onExit }) {
	const [i, setI] = (0, import_react.useState)(0);
	const ref = (0, import_react.useRef)(null);
	const go = (0, import_react.useCallback)((d) => setI((x) => Math.max(0, Math.min(slides.length - 1, x + d))), [slides.length]);
	(0, import_react.useEffect)(() => {
		ref.current?.requestFullscreen?.().catch(() => void 0);
		const key = (e) => {
			if ([
				"ArrowRight",
				"ArrowDown",
				" ",
				"PageDown"
			].includes(e.key)) {
				e.preventDefault();
				go(1);
			}
			if ([
				"ArrowLeft",
				"ArrowUp",
				"PageUp"
			].includes(e.key)) {
				e.preventDefault();
				go(-1);
			}
			if (e.key === "Escape") onExit();
		};
		const fs = () => {
			if (!document.fullscreenElement) onExit();
		};
		window.addEventListener("keydown", key);
		document.addEventListener("fullscreenchange", fs);
		return () => {
			window.removeEventListener("keydown", key);
			document.removeEventListener("fullscreenchange", fs);
			if (document.fullscreenElement) document.exitFullscreen().catch(() => void 0);
		};
	}, [go, onExit]);
	const touch = (0, import_react.useRef)(null);
	const s = slides[i];
	if (!s) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		className: "no-print fixed inset-0 z-50 flex flex-col bg-navy",
		role: "dialog",
		"aria-label": "Presentation",
		onTouchStart: (e) => {
			touch.current = e.touches[0]?.clientX ?? null;
		},
		onTouchEnd: (e) => {
			const x = e.changedTouches[0]?.clientX;
			if (touch.current !== null && x !== void 0 && Math.abs(x - touch.current) > 50) go(x < touch.current ? 1 : -1);
			touch.current = null;
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex-1 overflow-hidden bg-card",
			onClick: (e) => {
				if (e.target.closest("a,button")) return;
				go(e.clientX > window.innerWidth / 3 ? 1 : -1);
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto h-full max-w-7xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlideView, {
					s,
					n: i + 1,
					team: false,
					present: true
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between px-4 py-2 text-sm text-primary-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onExit,
					className: "inline-flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), " Exit (Esc)"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					i + 1,
					" / ",
					slides.length
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Previous slide",
						onClick: () => go(-1),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-5 w-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Next slide",
						onClick: () => go(1),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-5 w-5" })
					})]
				})
			]
		})]
	});
}
function TeamAdjustments({ id, passcode, k, answers, r, onData }) {
	const adjust = useServerFn(adjustTeamAssumptions), refresh = useServerFn(refreshTeamData), find = useServerFn(findOwnProducts);
	const [open, setOpen] = (0, import_react.useState)(false), [busy, setBusy] = (0, import_react.useState)(false), [message, setMessage] = (0, import_react.useState)("");
	const [values, setValues] = (0, import_react.useState)({
		postRate: "",
		commission: "",
		samples: "",
		roas: "",
		guardrailMonth6: "",
		guardrailMonth12: ""
	});
	(0, import_react.useEffect)(() => setValues({
		postRate: String(r.assumptions.videoRatePct),
		commission: String(r.assumptions.affiliatePct),
		samples: String(r.assumptions.samplesPerMonth),
		roas: String(r.assumptions.roas),
		guardrailMonth6: String(r.assumptions.guardrailMonth6),
		guardrailMonth12: String(r.assumptions.guardrailMonth12)
	}), [
		r.assumptions.videoRatePct,
		r.assumptions.affiliatePct,
		r.assumptions.samplesPerMonth,
		r.assumptions.roas,
		r.assumptions.guardrailMonth6,
		r.assumptions.guardrailMonth12
	]);
	async function save(reset = false) {
		setBusy(true);
		try {
			onData(await adjust({ data: {
				id,
				passcode,
				overrides: reset ? {} : {
					postRate: Number(values.postRate) / 100,
					commission: Number(values.commission),
					samples: Number(values.samples),
					roas: Number(values.roas),
					guardrailMonth6: Number(values.guardrailMonth6),
					guardrailMonth12: Number(values.guardrailMonth12)
				}
			} }));
			setMessage(reset ? "Market defaults restored." : "Adjustments saved.");
		} catch {
			setMessage("Could not save. Check the values and passcode.");
		} finally {
			setBusy(false);
		}
	}
	async function reload() {
		setBusy(true);
		try {
			let latest = await refresh({ data: {
				id,
				passcode
			} });
			if (answers.shopId) latest = await find({ data: { id } });
			onData(latest);
			setMessage("Market refreshed. Confirm competitors and finish the product scans.");
		} catch {
			setMessage("Refresh could not finish. Cached data is retained.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "no-print space-y-4 border-y border-border py-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
					onClick: () => setOpen(!open),
					children: "Adjust assumptions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
					onClick: () => void reload(),
					disabled: busy,
					children: "Refresh market"
				})]
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-4",
				onSubmit: (e) => {
					e.preventDefault();
					save();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-4 sm:grid-cols-3",
						children: [
							["postRate", "Post rate (%)"],
							["commission", "Commission (%)"],
							["samples", "Samples per month"],
							["roas", "Ad ROAS"],
							["guardrailMonth6", "Guardrail: month-6 GMV ($)"],
							["guardrailMonth12", "Guardrail: month-12 GMV ($)"]
						].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								"aria-label": label,
								type: "number",
								required: true,
								min: key === "samples" ? 150 : key === "postRate" ? 1 : 0,
								max: key === "postRate" || key === "commission" ? 100 : void 0,
								step: key === "samples" ? "1" : "any",
								value: values[key],
								onChange: (e) => setValues({
									...values,
									[key]: e.target.value
								})
							})
						}, key))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-caption",
						children: "Guardrails also respect the selected competitor median: month 6 uses the lower of this cap and 50% of that median; month 12 uses the lower of this cap and that median."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryBtn, {
							type: "submit",
							disabled: busy,
							children: "Save adjustments"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
							onClick: () => void save(true),
							disabled: busy,
							children: "Restore market defaults"
						})]
					})
				]
			}),
			r.earlyProfitFlag && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, {
				tone: "warn",
				children: "Check inputs: the unadjusted model showed profit before month 3. Partner views start no earlier than month 3."
			}),
			r.capNotes.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: note }, note)),
			message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: message })
		]
	});
}
var PASS_KEY = "sophie-team-pass";
function Report() {
	const row = Route.useLoaderData();
	const { id } = Route.useParams();
	const [k, setK] = (0, import_react.useState)(row.kalodata ?? null);
	const marketOnly = row.answers?.interest === "no" || row.answers?.flowVersion === 2 && (row.answers?.flowStep ?? 0) < 6;
	const [teamPass, setTeamPass] = (0, import_react.useState)("");
	const scan = useServerFn(runMarketScan);
	const [retrying, setRetrying] = (0, import_react.useState)(false);
	const [presenting, setPresenting] = (0, import_react.useState)(false);
	const [hidePricing, setHidePricing] = (0, import_react.useState)(false);
	const loadCategory = useServerFn(enrichCategory);
	const exitPresent = (0, import_react.useCallback)(() => setPresenting(false), []);
	const r = (0, import_react.useMemo)(() => computeAll({
		branch: row.branch,
		answers: row.answers ?? {},
		products: row.products ?? [],
		assumptions: row.assumptions ?? {},
		kalodata: k
	}), [row, k]);
	const products = row.products?.length ? row.products : [];
	const answers = row.answers ?? {};
	const pending = selectedCompetitors(k, answers).some((p) => !k?.enriched?.[productKey(p)]?.attempted);
	const ownPending = (k?.ownProducts ?? []).some((p) => !k?.ownEnriched?.[productKey(p)]?.attempted);
	(0, import_react.useEffect)(() => {
		if (!k?.ok || pending || marketOnly || k.category?.attempted) return;
		loadCategory({ data: { id } }).then(setK).catch(() => void 0);
	}, [
		k?.ok,
		pending,
		marketOnly,
		k?.category?.attempted
	]);
	async function retry() {
		setRetrying(true);
		try {
			setK(await scan({ data: { id } }));
		} finally {
			setRetrying(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl space-y-12 px-5 pb-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "no-print flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamToggle, {
					id,
					onUnlock: setTeamPass
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/fit/$id",
							params: { id },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" }), " Edit answers"] })
						}),
						!marketOnly && k?.ok && !pending && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
							onClick: () => setPresenting(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Presentation, { className: "h-4 w-4" }), " Present"]
						}),
						teamPass && !marketOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
							"aria-pressed": hidePricing,
							onClick: () => setHidePricing((h) => !h),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }),
								" ",
								hidePricing ? "Show pricing" : "Hide pricing"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
							onClick: () => window.print(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "h-4 w-4" }), " Print / Save as PDF"]
						})
					]
				})]
			}),
			marketOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eyebrow, { children: marketOnly ? "TikTok Shop Market Report" : "TikTok Shop Fit Report" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 text-4xl sm:text-5xl",
					children: row.brand_name || "Your brand"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-caption",
					children: [
						marketOnly ? "Product market analysis" : row.branch === "optimize" ? "Optimize an existing TikTok Shop" : "Launch on TikTok Shop",
						" · Prepared",
						" ",
						new Date(row.updated_at).toLocaleDateString("en-US", {
							month: "long",
							day: "numeric",
							year: "numeric"
						})
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "no-print grid grid-cols-3 gap-4 border-t border-border pt-3 text-xs font-semibold text-caption",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "1 Market" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "2 Your plan" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-navy",
						children: "3 Report"
					})
				]
			}),
			teamPass && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamAdjustments, {
				id,
				passcode: teamPass,
				k,
				answers,
				r,
				onData: setK
			}),
			pending && k?.ok && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanProgress, {
				id,
				k,
				answers,
				onData: setK
			}),
			!pending && ownPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanProgress, {
				id,
				k,
				answers,
				own: true,
				onData: setK
			}),
			!k?.ok && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
				onClick: retry,
				disabled: retrying,
				children: retrying ? "Retrying..." : "Retry market analysis"
			}),
			k?.ok && !pending && marketOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Story, {
				r,
				k,
				answers,
				brand: row.brand_name ?? "",
				products,
				marketOnly: true
			}),
			k?.ok && !pending && !marketOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				!k.category?.attempted && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "no-print text-sm text-caption",
					children: "Loading category totals..."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeckView, {
					r,
					k,
					answers,
					brand: row.brand_name ?? "",
					branch: row.branch,
					price: answers.marketPrice ?? products[0]?.price,
					team: !!teamPass,
					hidePricing,
					presenting,
					onExit: exitPresent
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "no-print",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookCall, { popup: true })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-caption",
					children: "Market data: Kalodata, TikTok Shop US. Projections are estimates based on competitor benchmarks, not guarantees."
				})
			] }),
			marketOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/fit/$id",
				params: { id },
				className: "no-print font-semibold text-signal",
				children: "Explore your plan"
			}),
			!marketOnly && products.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-caption",
				children: "No products entered yet, figures use defaults."
			})
		]
	});
}
function TeamToggle({ id, onUnlock }) {
	const get = useServerFn(getTeamVerdict);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [code, setCode] = (0, import_react.useState)("");
	const [err, setErr] = (0, import_react.useState)(false);
	const [data, setData] = (0, import_react.useState)(null);
	async function load(pass) {
		const res = await get({ data: {
			id,
			passcode: pass
		} });
		if (!res.ok) {
			setErr(true);
			sessionStorage.removeItem(PASS_KEY);
			return;
		}
		sessionStorage.setItem(PASS_KEY, pass);
		onUnlock(pass);
		setErr(false);
		setData({
			verdict: res.verdict,
			reasons: res.reasons
		});
	}
	(0, import_react.useEffect)(() => {
		const p = sessionStorage.getItem(PASS_KEY);
		if (p) {
			setOpen(true);
			load(p);
		}
	}, []);
	if (!open) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
		onClick: () => setOpen(true),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4" }), " Team view"]
	});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "flex flex-wrap items-center gap-2",
		onSubmit: (e) => {
			e.preventDefault();
			load(code);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
				type: "password",
				placeholder: "Team passcode",
				value: code,
				onChange: (e) => setCode(e.target.value),
				className: "w-48"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryBtn, {
				type: "submit",
				children: "Unlock"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-sm text-caption",
				onClick: () => setOpen(false),
				children: "Cancel"
			}),
			err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm text-drive",
				children: "Wrong passcode"
			})
		]
	});
	const v = data.verdict ?? "red";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bento w-full space-y-3 border-navy p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eyebrow, { children: "Team view · Fit verdict" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerdictBadge, {
						verdict: data.verdict,
						large: true
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/team",
						className: "font-semibold text-signal",
						children: "All submissions"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "text-caption",
						onClick: () => {
							sessionStorage.removeItem(PASS_KEY);
							setData(null);
							setOpen(false);
							onUnlock("");
						},
						children: "Hide"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "list-disc space-y-1 pl-5 text-sm",
				children: (data.reasons?.reasons ?? []).map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: x }, x))
			}),
			v === "yellow" && data.reasons?.fixFirst?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-navy",
						children: "What to fix first:"
					}),
					" ",
					data.reasons.fixFirst[0]
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-navy",
						children: "Next step:"
					}),
					" ",
					NEXT_STEP[v]
				]
			})
		]
	});
}
//#endregion
export { Report as component };
