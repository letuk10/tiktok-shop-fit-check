/* eslint-disable @typescript-eslint/no-explicit-any */
// Pure data for the partner plan deck. Every headline and tile derives from cached Kalodata and plan numbers.
import { computeAll, enrichedMetrics, median, pickPeer, productMarketStats, reportEntries, shortName, toNum, type Answers, type MarketData } from "./calc";
import { formatGrowth } from "./discovery";

type R = ReturnType<typeof computeAll>;
export const short = (n: number): string => n < 0 ? `-${short(-n)}` : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${Math.round(n / 1e3)}K` : `$${Math.round(n)}`;
export const sharePct = (n: number) => n > 0 && n < 0.01 ? "under 0.01%" : n >= 10 ? `${Math.round(n)}%` : n >= 1 ? `${n.toFixed(1)}%` : `${n.toFixed(2)}%`;
export const signed = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
export { shortName, pickPeer };

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
  const entries = reportEntries(k, answers);
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
  // The chosen path (category pace, or the team's sample volume) drives every plan slide.
  const base = r.scenarios.find((s) => s.key === "pace");
  const minimum = r.scenarios.find((s) => s.key === "minimum");
  const six = (s?: typeof base) => (s?.rows ?? []).slice(0, 6);
  const sixTarget = six(base).reduce((n, x) => n + x.gmv, 0), sixMinimum = six(minimum).reduce((n, x) => n + x.gmv, 0);
  const plan = r.plan;
  const benchName = plan.benchmark?.name ?? peer?.name ?? "the proof point";
  const paths = plan.paths;
  const sellerRun = new Set(entries.flatMap((e) => e.sellerRunVideoIds ?? []));
  // Top 15 affiliate videos of each competitor, so one brand's replies cannot crowd out every hook.
  const hookPool = entries.flatMap((e) => (e.videos ?? []).filter((v) => !sellerRun.has(String(v.video_id))).sort((x, y) => toNum(y.revenue) - toNum(x.revenue)).slice(0, 15)).sort((x, y) => toNum(y.revenue) - toNum(x.revenue));
  const hookSet = pickHooks(hookPool, entries.map((e) => String(e.detail?.product_name ?? e.product?.product_name ?? "")), cat?.name, k?.discovery?.core || "it");
  const bands = priceBands(market.map((p) => ({ price: toNum(p.unit_price), units: toNum(p.sales_volumn ?? p.sales_volume) })), opts.price);
  const nicheCounts = { products: nicheData.productCount, sellers: nicheData.sellerCount, units: nicheData.units, avgOrder: nicheData.units > 0 ? niche / nicheData.units : null };
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

  return { brand, optimize, source, asOf, products, niche, top10Share, competition: competitionWord(top10Share), cat, own, ownGmv, ownGmv90, ownShare, ownVideos, ownCreators, ownCommission, ownPerVideo, peerPerVideo, peer, peerShare, leader, leaderShare, mostVideos, smallPerK, largePerK, topVideo, topFollowers: topVideo ? followersOf(topVideo) : null, zone, priceWhere, bundles, bundleShare, price, base, minimum, sixTarget, sixMinimum, m6, plan, benchName, paths, hooks: hookSet.hooks, genericHooks: hookSet.generic, bands, nicheCounts, m6Share, tiers, amazon, sellsAmazon, lead, liveShare, openLive, q4Soon, commission, blockers, shelf, topVideos: d.topVideos, creators: d.creators, a, peerVideos };
}
export type Deck = ReturnType<typeof buildDeck>;

// ---------- hooks ----------
const REPLY = /^\s*(replying to|reply to|respuesta a|respondiendo a)\b/i;
const SPANISH = /\b(?:de|la|el|los|las|para|que|es|con|y|una|un|mi|tu|piel|crema|sebo|cebo|res|esta|este|muy|por|lo|se|no|como|pero|amiga|así|aquí|acá)\b/gi;
const ENGLISH = /\b(?:the|and|for|with|this|that|your|you|how|why|best|skin|get|my|is|to|of|i|it|in|on|what|when|finally|before|after|wish|knew|have|works|tried|need|stop)\b/gi;
const STRONG = /\?|!|\b(?:i|you|my|your|this|why|how|stop|wish|finally|before|after|never|secret|tried|need|works|changed|best)\b|\d/i;
const words = (t: string) => t.toLowerCase().replace(/[^a-z0-9@\s']/g, " ").split(/\s+/).filter(Boolean);

/** Clean one video title into a usable hook, or null when it is a reply, a mention, non-English or just a product name. */
export function cleanHook(title: unknown, productNames: string[] = [], max = 60): string | null {
  let text = String(title ?? "").split(/[#\n]/)[0] ?? "";
  text = text.replace(/[\p{Extended_Pictographic}\p{Emoji_Modifier}‍️✅]/gu, "").replace(/\s+/g, " ").trim();
  if (!text || REPLY.test(text)) return null;
  const all = words(text);
  const plain = all.filter((w) => !w.startsWith("@"));
  if (plain.length < 3 || plain.length < all.length * 0.6) return null;
  if (/[áéíóúñ¿¡]/i.test(text)) return null;
  const es = text.match(SPANISH)?.length ?? 0, en = text.match(ENGLISH)?.length ?? 0;
  if (es > en || (en === 0 && es > 0)) return null;
  const letters = text.match(/[A-Za-z]/g)?.length ?? 0;
  if (letters / Math.max(1, text.replace(/\s/g, "").length) < 0.75) return null;
  // Just the product or brand name: most words appear in a competitor's product name.
  const nameWords = new Set(productNames.flatMap((n) => words(String(n))));
  if (nameWords.size && plain.filter((w) => nameWords.has(w)).length >= plain.length * 0.7) return null;
  if (text.length > max) { const cut = text.slice(0, max + 1); text = `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:&-]+$/, "")}...`; }
  return text;
}

const SKIN = /skin|moistur|balm|cream|lotion|serum|tallow|face|beauty|lip|body|care|cosmetic/i;
/** Generic hook ideas for a category when real hooks are thin. */
export function genericHooks(category: string | null | undefined, product = "it") {
  if (SKIN.test(`${category ?? ""} ${product}`)) return [`Before and after: 7 days of ${product} on dry skin`, "Problem, solution: what finally fixed my dry patches", `My night routine, one step: ${product}`];
  return [`Before and after using ${product}`, `The problem ${product} solves, in 10 seconds`, `How ${product} fits my daily routine`];
}

/** Up to 3 real hooks from top videos, strongest first. Falls back to generic ideas below 2. */
export function pickHooks(videos: { video_title?: unknown; displayTitle?: unknown }[], productNames: string[], category?: string | null, product?: string) {
  const seen = new Set<string>();
  const good = videos.map((v, i) => ({ i, h: cleanHook(v.video_title ?? v.displayTitle, productNames) })).filter((x): x is { i: number; h: string } => {
    if (!x.h) return false; const key = x.h.toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true;
  }).map((x) => ({ ...x, score: (STRONG.test(x.h) ? 0 : 1) * 100 + x.i })).sort((a, b) => a.score - b.score).map((x) => x.h);
  return good.length >= 2 ? { hooks: good.slice(0, 3), generic: false } : { hooks: genericHooks(category, product), generic: true };
}

// ---------- price bands ----------
export interface PriceBand { lo: number; hi: number | null; label: string; units: number; share: number; partner: boolean }
/** Units-weighted price bands. Step of $5, $10, $20 or $50 picked from the range up to the 95th
 *  percentile; everything above sits in one "$X+" band. */
export function priceBands(items: { price: number; units: number }[], partnerPrice?: number) {
  const valid = items.filter((p) => p.price > 0 && p.units > 0);
  const total = valid.reduce((n, p) => n + p.units, 0);
  if (!total) return null;
  const sorted = [...valid].sort((a, b) => a.price - b.price);
  let acc = 0; let p95 = sorted[sorted.length - 1]!.price;
  for (const p of sorted) { acc += p.units; if (acc >= total * 0.95) { p95 = p.price; break; } }
  const lowest = sorted[0]!.price;
  const steps = [5, 10, 20, 25, 50, 100];
  let step = steps.find((s) => Math.ceil(p95 / s) - Math.floor(lowest / s) <= 8) ?? 100;
  const start = Math.floor(lowest / step) * step;
  const top = Math.max(start + step, Math.ceil((p95 + 0.001) / step) * step);
  const bands: PriceBand[] = [];
  for (let lo = start; lo < top; lo += step) bands.push({ lo, hi: lo + step, label: `$${lo} to $${lo + step}`, units: 0, share: 0, partner: false });
  const over: PriceBand = { lo: top, hi: null, label: `$${top}+`, units: 0, share: 0, partner: false };
  for (const p of valid) { const b = p.price >= top ? over : bands[Math.floor((p.price - start) / step)]; if (b) b.units += p.units; }
  const out = over.units > 0 || (partnerPrice ?? 0) >= top ? [...bands, over] : bands;
  for (const b of out) { b.share = b.units / total * 100; b.partner = !!partnerPrice && partnerPrice >= b.lo && (b.hi === null || partnerPrice < b.hi); }
  // Densest window of two neighbouring bands (one band if that already holds most units).
  let best = { from: 0, to: 0, share: -1 };
  for (let i = 0; i < bands.length; i++) {
    const one = bands[i]!.share, two = one + (bands[i + 1]?.share ?? 0);
    if (one >= 50 && one > best.share) best = { from: i, to: i, share: one };
    if (i + 1 < bands.length && two > best.share && one < 50) best = { from: i, to: i + 1, share: two };
  }
  const zoneLo = bands[best.from]?.lo ?? 0, zoneHi = bands[best.to]?.hi ?? top;
  const where = !partnerPrice ? null : partnerPrice < zoneLo ? "below" : partnerPrice >= zoneHi ? "above" : "inside";
  const pctText = `${Math.round(best.share)}%`;
  const priceText = partnerPrice ? `$${partnerPrice.toFixed(2)}` : "";
  const headline = `${pctText} of units sell between $${zoneLo} and $${zoneHi}.${where === "inside" ? ` Your ${priceText} sits inside that range.` : where ? ` Your ${priceText} sits ${where} that.` : ""}`;
  return { bands: out, step, zone: { lo: zoneLo, hi: zoneHi, share: best.share }, where, headline, total };
}
