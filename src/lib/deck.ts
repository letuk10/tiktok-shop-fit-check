/* eslint-disable @typescript-eslint/no-explicit-any */
// Pure data for the partner plan deck. Every headline and tile derives from cached Kalodata and plan numbers.
import { computeAll, enrichedMetrics, median, productKey, productMarketStats, selectedCompetitors, toNum, type Answers, type MarketData } from "./calc";
import { formatGrowth } from "./discovery";

type R = ReturnType<typeof computeAll>;
export const short = (n: number): string => n < 0 ? `-${short(-n)}` : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${Math.round(n / 1e3)}K` : `$${Math.round(n)}`;
export const sharePct = (n: number) => n > 0 && n < 0.01 ? "under 0.01%" : n >= 10 ? `${Math.round(n)}%` : n >= 1 ? `${n.toFixed(1)}%` : `${n.toFixed(2)}%`;
export const signed = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
export const shortName = (name: string) => {
  const clean = String(name ?? "").replace(/[|,(].*$/, "").replace(/\s[-–—]\s.*$/, "").trim();
  const words = clean.split(/\s+/).filter((w) => !/^(buy\d*|get\d*|\d+\s*pcs?|\d+-?pack|buy\d+get\d+)$/i.test(w)).slice(0, 4).join(" ");
  return words || "This product";
};

/** The best peer: smallest selected product still doing at least $20K a month, else the median one. */
export function pickPeer<T extends { gmv: number }>(items: T[]): T | undefined {
  const sorted = [...items].sort((a, b) => a.gmv - b.gmv);
  return sorted.find((p) => p.gmv >= 20000) ?? sorted[Math.floor((sorted.length - 1) / 2)];
}

/** Bucket units into $5 bands and find the densest $10 range. */
export function priceZone(items: { price: number; units: number }[]) {
  const bands = new Map<number, number>();
  let total = 0;
  for (const p of items) if (p.price > 0 && p.units > 0) { const b = Math.floor(p.price / 5); bands.set(b, (bands.get(b) ?? 0) + p.units); total += p.units; }
  if (!total) return null;
  let best = { lo: 0, units: -1 };
  for (const b of bands.keys()) for (const start of [b - 1, b]) {
    const units = (bands.get(start) ?? 0) + (bands.get(start + 1) ?? 0);
    if (units > best.units) best = { lo: start * 5, units };
  }
  return { lo: best.lo, hi: best.lo + 10, share: (best.units / total) * 100 };
}

export function fitsAveragePrice(price: number | undefined, avg: number) {
  return !!price && avg > 0 && Math.abs(price - avg) / avg <= 0.2;
}

export function competitionWord(top10Share: number) {
  return top10Share < 50 ? "Open" : top10Share > 70 ? "Concentrated" : "Moderate";
}

const AMAZON_MID: Record<string, number> = { "<$20K": 10000, "$20-50K": 35000, "$50-100K": 75000, "$100-250K": 175000, "$250K+": 250000 };
export const amazonMonthly = (bucket?: string) => (bucket ? AMAZON_MID[bucket] ?? null : null);

/** Scenario tiers beyond month 6, as shares of the niche. */
export function beyondScenarios(niche: number, peerShare: number, leaderShare: number) {
  return [
    { label: "Conservative", note: "Half of peer share", share: peerShare / 2 },
    { label: "Target", note: "Peer parity", share: peerShare },
  ].map((s) => ({ ...s, monthly: (niche * s.share) / 100, yearly: (niche * s.share) / 100 * 12 }));
}

export function channelLead(video: number, live: number, shop: number): "video" | "live" | "shop" {
  return video >= live && video >= shop ? "video" : live >= shop ? "live" : "shop";
}

export function buildDeck(r: R, k: MarketData | null, answers: Answers, opts: { brand: string; branch: string | null; price?: number | undefined; now?: Date }) {
  const brand = opts.brand || "Your brand";
  const optimize = opts.branch === "optimize";
  const now = opts.now ?? new Date();
  const d = r.insights;
  const asOf = new Date(k?.fetchedAt ?? now).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const source = (days: 30 | 90) => `Source: Kalodata, TikTok Shop US, ${days} days to ${asOf}.`;
  const entries = selectedCompetitors(k, answers).map((p) => k?.enriched?.[productKey(p)]).filter((e): e is NonNullable<typeof e> => !!e?.detail && toNum(e.detail.revenue) > 0);
  const products = entries.map((e) => {
    const m = enrichedMetrics(e);
    const d90 = e.detail90 && toNum(e.detail90.revenue) > 0 ? toNum(e.detail90.revenue) : null;
    const rawGrowth = formatGrowth(e.product.revenue_growth_rate, e.detail?.launch_date);
    const growth = typeof rawGrowth === "number" ? rawGrowth : null;
    return { ...m, gmv: m.gmv ?? 0, name: shortName(m.product.product_name), image: m.product.master_image_url || m.product.image_url, gmv90: d90, growth, reviews: e.detail?.product_review_count !== undefined ? toNum(e.detail.product_review_count) : null, skuCount: toNum(e.product.sku_count) };
  }).sort((a, b) => b.gmv - a.gmv);

  const nicheData = productMarketStats(k, answers);
  const market = nicheData.products;
  const niche = nicheData.gmv;
  const top10Share = nicheData.top3Share;
  const c30 = k?.category?.d30, c90 = k?.category?.d90, parent90 = k?.category?.parent90;
  const cat = c30 && toNum(c30.revenue) > 0 ? {
    name: String(c30.category_name ?? "This category"), revenue: toNum(c30.revenue), revenue90: c90 ? toNum(c90.revenue) : null,
    growth90: c90?.revenue_growth_rate !== undefined ? toNum(c90.revenue_growth_rate) : null,
    parentName: parent90?.category_name ? String(parent90.category_name) : null, parentGrowth90: parent90?.revenue_growth_rate !== undefined ? toNum(parent90.revenue_growth_rate) : null,
    shops: toNum(c30.shop_number), activeProducts: toNum(c30.active_product_number), units: toNum(c30.sale),
    avgOrder: toNum(c30.sale) > 0 ? toNum(c30.revenue) / toNum(c30.sale) : null,
    video: toNum(c30.video_revenue) / toNum(c30.revenue) * 100, live: toNum(c30.live_revenue) / toNum(c30.revenue) * 100,
    shop: toNum(c30.shopping_mall_revenue) / toNum(c30.revenue) * 100, affiliate: toNum(c30.affiliate_revenue) / toNum(c30.revenue) * 100,
    trend: Array.isArray(c30.revenue_trend) ? (c30.revenue_trend as unknown[]).map(toNum) : [],
  } : null;

  // Own shop today
  const own = d.own;
  const ownGmv = own.reduce((n, p) => n + (p.gmv ?? 0), 0);
  const ownVideos = own.reduce((n, p) => n + (p.videos ?? 0), 0);
  const ownCreators = own.reduce((n, p) => n + (p.affiliates ?? 0), 0);
  const ownCommission = median(own.map((p) => p.commission).filter((n): n is number => n !== null && n > 0));
  const ownReviews = Object.values(k?.ownEnriched ?? {}).reduce((n, e) => n + toNum(e.detail?.product_review_count), 0);
  const ownGmv90 = Object.values(k?.ownEnriched ?? {}).reduce((n, e) => n + toNum(e.detail90?.revenue), 0);
  const shelf = niche;
  const ownShare = shelf > 0 ? ownGmv / shelf * 100 : 0;

  const peer = pickPeer(products);
  const leader = products[0];
  const peerShare = peer && niche > 0 ? peer.gmv / niche * 100 : 0;
  const leaderShare = leader && niche > 0 ? leader.gmv / niche * 100 : 0;
  const mostVideos = [...products].sort((a, b) => (b.videos ?? 0) - (a.videos ?? 0))[0];

  // Content formula from top videos and creator followers
  const followersOf = (v: any) => { const c = d.creators.rows.find((c: any) => String(c.creator_id) === String(v.belonged_creator_id) || c.creator_handle === v.belonged_creator_handle); return c ? toNum(c.creator_followers) : null; };
  const allVideos = entries.flatMap((e) => e.videos ?? []);
  const perK = (vs: any[]) => { const views = vs.reduce((n, v) => n + toNum(v.views), 0); return views > 0 ? vs.reduce((n, v) => n + toNum(v.revenue), 0) / views * 1000 : null; };
  const tagged = allVideos.map((v) => ({ v, f: followersOf(v) })).filter((x) => x.f !== null);
  const smallPerK = perK(tagged.filter((x) => (x.f ?? 0) < 50000).map((x) => x.v));
  const largePerK = perK(tagged.filter((x) => (x.f ?? 0) >= 50000).map((x) => x.v));
  const topVideo = d.topVideos[0];

  const zone = priceZone(market.map((p) => ({ price: toNum(p.unit_price), units: toNum(p.sales_volumn ?? p.sales_volume) })));
  const medPrice = median(market.map((p) => toNum(p.unit_price)).filter((n) => n > 0));
  const bundles = market.filter((p) => toNum(p.revenue) > 0 && (toNum(p.sku_count) > 1 || toNum(p.unit_price) > medPrice * 2));
  const bundleShare = niche > 0 ? bundles.reduce((n, p) => n + toNum(p.revenue), 0) / niche * 100 : 0;
  const price = opts.price;
  const priceWhere = !price || !zone ? null : price < zone.lo ? "below" : price > zone.hi ? "above" : "inside";

  const a = r.assumptions;
  const base = r.scenarios.find((s) => s.label === "Target");
  const cons = r.scenarios.find((s) => s.label === "Conservative");
  const six = (s?: typeof base) => (s?.rows ?? []).slice(0, 6);
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

  // Optimize diagnosis
  const peerVideos = median(products.map((p) => p.videos ?? 0).filter((n) => n > 0));
  const peerCommission = d.market.commission;
  const peerReviews = median(products.map((p) => p.reviews ?? 0).filter((n) => n > 0));
  const ownPerVideo = ownVideos > 0 ? own.reduce((n, p) => n + toNum(p.product.video_revenue), 0) / ownVideos : null;
  const peerPerVideo = d.market.gmvPerVideo;
  const ownPrice = median(own.map((p) => p.price ?? 0).filter((n) => n > 0));
  const blockers: { blocker: string; today: string; fix: string }[] = [];
  if (optimize && own.length) {
    if (peerVideos > 0 && ownVideos < peerVideos) blockers.push({ blocker: "Content volume", today: `${Math.round(ownVideos)} videos vs ${Math.round(peerVideos)} for a typical peer`, fix: `${a.samplesPerMonth} samples a month to build video volume` });
    if (peerCommission !== null && ownCommission > 0 && ownCommission < peerCommission) blockers.push({ blocker: "Affiliate economics", today: `${Math.round(ownCommission)}% commission vs ${Math.round(peerCommission)}% for peers`, fix: `Move to ${commission}% and reactivate idle creators` });
    if (zone && ownPrice > 0 && (ownPrice < zone.lo || ownPrice > zone.hi)) blockers.push({ blocker: "Price vs band", today: `$${ownPrice.toFixed(2)} vs a $${zone.lo} to $${zone.hi} value zone`, fix: ownPrice > zone.hi ? "Entry SKU or bundle inside the value zone" : "Bundle to lift order value" });
    if (peerReviews > 0 && ownReviews < peerReviews) blockers.push({ blocker: "Social proof", today: `${Math.round(ownReviews).toLocaleString("en-US")} reviews vs ${Math.round(peerReviews).toLocaleString("en-US")} for peers`, fix: "Sample-driven reviews in the first 60 days" });
    if (answers.probation === "yes") blockers.push({ blocker: "Probation cap", today: "Creator outreach is capped while the shop is in probation", fix: "Clear probation first, then open outreach" });
  }

  return { brand, optimize, source, asOf, products, niche, top10Share, competition: competitionWord(top10Share), cat, own, ownGmv, ownGmv90, ownShare, ownVideos, ownCreators, ownCommission, ownPerVideo, peerPerVideo, peer, peerShare, leader, leaderShare, mostVideos, smallPerK, largePerK, topVideo, topFollowers: topVideo ? followersOf(topVideo) : null, zone, priceWhere, bundles, bundleShare, price, base, cons, sixTarget, sixCons, m6, m6Share, tiers, amazon, sellsAmazon, lead, liveShare, openLive, q4Soon, commission, blockers, shelf, topVideos: d.topVideos, creators: d.creators, a, peerVideos };
}
export type Deck = ReturnType<typeof buildDeck>;
