/* eslint-disable @typescript-eslint/no-explicit-any */
// The levers behind a solid TikTok Shop GMV, read straight from each competitor's Kalodata data.
// Every value is what that product did in the last 30 days, unless the row says otherwise.
import { creatorInsights, followerBucket, median, pickPeer, reportEntries, shortName, toNum, type Answers, type EnrichedProduct, type MarketData } from "./calc";

export type LeverFormat = "usd" | "int" | "pct" | "x" | "text" | "signed";
export interface LeverValue { n: number | null; text?: string; atLeast?: boolean }
export interface LeverRow { key: string; group: string; label: string; help: string; format: LeverFormat; values: LeverValue[]; own: LeverValue | null; higherIsBetter: boolean | null }
export interface LeverColumn { name: string; gmv: number; image?: string; isPeer: boolean }

const BUCKETS = ["Under 10K", "10K to 50K", "50K to 250K", "250K+"];
const v = (n: number | null | undefined, extra: Partial<LeverValue> = {}): LeverValue => ({ n: n === undefined || n === null || !Number.isFinite(n) ? null : n, ...extra });

/** Levers for one product (a competitor, or one of the partner's own products). */
export function productLevers(e: EnrichedProduct) {
  const d = e.detail ?? {};
  const gmv = toNum(d.revenue);
  const videos = toNum(d.video_number), creators = toNum(d.creator_number);
  const list = (e.videos ?? []).filter((x) => x && x.video_id !== undefined);
  const selling = list.filter((x) => toNum(x.revenue) > 0);
  // Kalodata returns the top videos by GMV. When it returned fewer than exist and all of them sold, the true count is higher.
  const capped = list.length < videos;
  const sellingCountKnown = !capped || selling.length < list.length;
  const sellingRev = selling.map((x) => toNum(x.revenue));
  const top = Math.max(0, ...sellingRev);
  const adVideos = selling.filter((x) => toNum(x.ad) === 1);
  const adGmv = adVideos.reduce((n, x) => n + toNum(x.revenue) * Math.min(100, Math.max(0, toNum(x.ad_revenue_ratio))) / 100, 0);
  const roasBase = adVideos.filter((x) => toNum(x.ads_roas) > 0);
  const roasRev = roasBase.reduce((n, x) => n + toNum(x.revenue), 0);
  const roas = roasRev > 0 ? roasBase.reduce((n, x) => n + toNum(x.ads_roas) * toNum(x.revenue), 0) / roasRev : null;
  const cr = creatorInsights(e.creators ?? []);
  const topCreator = Math.max(0, ...cr.rows.map((c) => toNum(c.revenue)));
  const leaderBucket = cr.buckets.reduce((best, b, i) => (b.revenue > (cr.buckets[best]?.revenue ?? -1) ? i : best), 0);
  const gmv90 = e.detail90 ? toNum(e.detail90.revenue) : 0;
  const trend = gmv90 > 0 && gmv > 0 ? (gmv / (gmv90 / 3) - 1) * 100 : null;
  return {
    gmv, trend, price: d.unit_price !== undefined ? toNum(d.unit_price) : null, reviews: d.product_review_count !== undefined ? toNum(d.product_review_count) : null,
    creators: creators || null, videos: videos || null, newVideos: e.newVideos ?? null, newVideosCapped: !!e.newVideosCapped,
    videosPerCreator: creators > 0 && videos > 0 ? videos / creators : null, gmvPerCreator: creators > 0 ? gmv / creators : null,
    sellingVideos: list.length ? selling.length : null, sellingAtLeast: !sellingCountKnown,
    sellingShare: list.length && sellingCountKnown && videos > 0 ? selling.length / Math.max(videos, list.length) * 100 : null,
    gmvPerSellingVideo: sellingRev.length ? median(sellingRev) : null,
    topVideoShare: gmv > 0 && top > 0 ? Math.min(100, top / gmv * 100) : null,
    topCreatorShare: gmv > 0 && topCreator > 0 ? Math.min(100, topCreator / gmv * 100) : null,
    creatorSweetSpot: cr.rows.length ? BUCKETS[leaderBucket] ?? null : null,
    commission: d.commission_rate !== undefined && toNum(d.commission_rate) > 0 ? toNum(d.commission_rate) : null,
    adShare: gmv > 0 && list.length ? Math.min(100, adGmv / gmv * 100) : null, roas,
    lives: d.live_number !== undefined ? toNum(d.live_number) : null,
    liveShare: gmv > 0 && d.live_revenue !== undefined ? toNum(d.live_revenue) / gmv * 100 : null,
    shopShare: gmv > 0 && (d.shopping_mall_revenue ?? d.showcase_revenue) !== undefined ? toNum(d.shopping_mall_revenue ?? d.showcase_revenue) / gmv * 100 : null,
  };
}
export type ProductLevers = ReturnType<typeof productLevers>;

/** Sums the partner's own products into one column. Rates are GMV-weighted. */
function combineOwn(items: ProductLevers[]): ProductLevers | null {
  const live = items.filter((p) => p.gmv > 0);
  if (!live.length) return null;
  const gmv = live.reduce((n, p) => n + p.gmv, 0);
  const sum = (f: keyof ProductLevers) => live.some((p) => p[f] !== null) ? live.reduce((n, p) => n + (toNum(p[f]) || 0), 0) : null;
  const w = (f: keyof ProductLevers) => { const ok = live.filter((p) => p[f] !== null); const g = ok.reduce((n, p) => n + p.gmv, 0); return g > 0 ? ok.reduce((n, p) => n + toNum(p[f]) * p.gmv, 0) / g : null; };
  const creators = sum("creators"), videos = sum("videos");
  const biggest = [...live].sort((a, b) => b.gmv - a.gmv)[0]!;
  return { ...biggest, gmv, creators, videos, newVideos: sum("newVideos"), sellingVideos: sum("sellingVideos"), sellingAtLeast: live.some((p) => p.sellingAtLeast),
    videosPerCreator: creators && videos ? videos / creators : null, gmvPerCreator: creators ? gmv / creators : null,
    trend: w("trend"), price: w("price"), reviews: sum("reviews"), sellingShare: w("sellingShare"), gmvPerSellingVideo: w("gmvPerSellingVideo"),
    topVideoShare: w("topVideoShare"), topCreatorShare: w("topCreatorShare"), commission: w("commission"), adShare: w("adShare"), roas: w("roas"),
    lives: sum("lives"), liveShare: w("liveShare"), shopShare: w("shopShare") };
}

type RowSpec = { key: string; group: string; label: string; help: string; format: LeverFormat; higherIsBetter: boolean | null; get: (p: ProductLevers) => LeverValue };
export const LEVER_ROWS: RowSpec[] = [
  { key: "gmv", group: "Result", label: "GMV, 30 days", help: "What the product sold on TikTok Shop.", format: "usd", higherIsBetter: true, get: (p) => v(p.gmv) },
  { key: "trend", group: "Result", label: "Trend vs 90-day average", help: "Last 30 days against the monthly average of the last 90.", format: "signed", higherIsBetter: true, get: (p) => v(p.trend) },
  { key: "creators", group: "Creators", label: "Active creators", help: "Creators who posted or sold it this month.", format: "int", higherIsBetter: true, get: (p) => v(p.creators) },
  { key: "commission", group: "Creators", label: "Commission", help: "Open affiliate commission.", format: "pct", higherIsBetter: null, get: (p) => v(p.commission) },
  { key: "gmvPerCreator", group: "Creators", label: "GMV per creator", help: "GMV divided by active creators.", format: "usd", higherIsBetter: true, get: (p) => v(p.gmvPerCreator) },
  { key: "sweet", group: "Creators", label: "Creator size that sells most", help: "Follower range of the creators who drove the most GMV.", format: "text", higherIsBetter: null, get: (p) => (p.creatorSweetSpot ? { n: null, text: p.creatorSweetSpot } : { n: null }) },
  { key: "topCreatorShare", group: "Creators", label: "GMV from the top creator", help: "How much rests on one creator.", format: "pct", higherIsBetter: false, get: (p) => v(p.topCreatorShare) },
  { key: "videos", group: "Content", label: "Videos with sales or views", help: "Videos linked to the product this month.", format: "int", higherIsBetter: true, get: (p) => v(p.videos) },
  { key: "newVideos", group: "Content", label: "New videos posted", help: "Published in the last 30 days.", format: "int", higherIsBetter: true, get: (p) => v(p.newVideos, { atLeast: p.newVideosCapped }) },
  { key: "videosPerCreator", group: "Content", label: "Videos per creator", help: "Repeat posting by the same creators.", format: "x", higherIsBetter: true, get: (p) => v(p.videosPerCreator) },
  { key: "sellingVideos", group: "Content", label: "Videos that sold", help: "Videos with at least one sale. A + means Kalodata only returns the top 100.", format: "int", higherIsBetter: true, get: (p) => v(p.sellingVideos, { atLeast: p.sellingAtLeast }) },
  { key: "sellingShare", group: "Content", label: "Share of videos that sell", help: "Selling videos over all videos.", format: "pct", higherIsBetter: true, get: (p) => v(p.sellingShare) },
  { key: "gmvPerSellingVideo", group: "Content", label: "GMV per selling video", help: "Median GMV of a video that sold.", format: "usd", higherIsBetter: true, get: (p) => v(p.gmvPerSellingVideo) },
  { key: "topVideoShare", group: "Content", label: "GMV from the top video", help: "How much rests on one hit.", format: "pct", higherIsBetter: false, get: (p) => v(p.topVideoShare) },
  { key: "adShare", group: "Paid", label: "GMV from ads", help: "Video GMV that came through paid boosts (GMV Max, Spark).", format: "pct", higherIsBetter: null, get: (p) => v(p.adShare) },
  { key: "roas", group: "Paid", label: "Ads ROAS", help: "GMV-weighted ROAS of boosted videos, Kalodata estimate.", format: "x", higherIsBetter: true, get: (p) => v(p.roas) },
  { key: "lives", group: "Channels", label: "Lives", help: "Livestreams that sold it.", format: "int", higherIsBetter: true, get: (p) => v(p.lives) },
  { key: "liveShare", group: "Channels", label: "GMV from lives", help: "Share of GMV from livestreams.", format: "pct", higherIsBetter: null, get: (p) => v(p.liveShare) },
  { key: "shopShare", group: "Channels", label: "GMV from shop tab and search", help: "Sales without a video or live.", format: "pct", higherIsBetter: null, get: (p) => v(p.shopShare) },
  { key: "price", group: "Product", label: "Price", help: "Average selling price.", format: "usd", higherIsBetter: null, get: (p) => v(p.price) },
  { key: "reviews", group: "Product", label: "Reviews", help: "Social proof on the listing.", format: "int", higherIsBetter: true, get: (p) => v(p.reviews) },
];

export function formatLever(x: LeverValue | null | undefined, format: LeverFormat): string {
  if (!x) return "";
  if (format === "text") return x.text ?? "";
  if (x.n === null) return "";
  const n = x.n, plus = x.atLeast ? "+" : "";
  if (format === "usd") return `${n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e4 ? `$${Math.round(n / 1e3)}K` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${Math.round(n)}`}${plus}`;
  if (format === "int") return `${Math.round(n).toLocaleString("en-US")}${plus}`;
  if (format === "pct") return `${n >= 10 || n === 0 ? Math.round(n) : n.toFixed(1)}%`;
  if (format === "signed") return `${n >= 0 ? "+" : ""}${Math.round(n)}%`;
  return `${n.toFixed(1)}x`;
}

/** The scorecard: one column per competitor (biggest first, up to `max`), plus the partner's shop when it sells. */
export function leverScorecard(k: MarketData | null | undefined, answers: Answers, max = 5) {
  const entries = reportEntries(k, answers);
  const comps = entries.map((e) => ({ e, l: productLevers(e) })).filter((x) => x.l.gmv > 0).sort((a, b) => b.l.gmv - a.l.gmv).slice(0, max);
  if (!comps.length) return null;
  const peerPick = pickPeer(comps.map((c, i) => ({ i, gmv: c.l.gmv })));
  const peer = peerPick ? comps[peerPick.i] : undefined;
  const columns: LeverColumn[] = comps.map((c) => ({ name: shortName(String(c.e.detail?.product_name ?? c.e.product?.product_name ?? "")), gmv: c.l.gmv, image: c.e.detail?.master_image_url ?? c.e.product?.image_url, isPeer: c === peer }));
  const ownEntries = Object.values(k?.ownEnriched ?? {}).filter((e) => e.detail && toNum(e.detail.revenue) > 0);
  const own = combineOwn(ownEntries.map(productLevers));
  const rows: LeverRow[] = LEVER_ROWS.map((r) => ({ key: r.key, group: r.group, label: r.label, help: r.help, format: r.format, higherIsBetter: r.higherIsBetter, values: comps.map((c) => r.get(c.l)), own: own ? r.get(own) : null }))
    .filter((r) => r.values.some((x) => x.n !== null || !!x.text));
  const p = peer?.l;
  return { columns, rows, own, peer: p ? { name: shortName(String(peer!.e.detail?.product_name ?? "")), ...p } : null, takeaways: p ? leverTakeaways(p, own, shortName(String(peer!.e.detail?.product_name ?? ""))) : [] };
}
export type LeverScorecard = NonNullable<ReturnType<typeof leverScorecard>>;

const money = (n: number) => formatLever({ n }, "usd");
const count = (n: number, plus = false) => formatLever({ n, atLeast: plus }, "int");

/** Plain-language "what it takes", from the proof point's own numbers, and the gap when the partner already sells. */
export function leverTakeaways(p: ProductLevers, own: ProductLevers | null, name: string) {
  const out: { lever: string; theyDo: string; youNeed: string }[] = [];
  const gap = (mine: number | null, theirs: number | null) => mine && theirs && theirs > mine ? ` That is ${(theirs / mine).toFixed(1)}x what you have today.` : "";
  if (p.creators) out.push({ lever: "Creators", theyDo: `${count(p.creators)} creators sold ${name} this month, about ${money(p.gmvPerCreator ?? 0)} each.`, youNeed: `Build to about ${count(p.creators)} active creators.${gap(own?.creators ?? null, p.creators)}` });
  if (p.newVideos || p.videos) out.push({ lever: "Content volume", theyDo: `${count(p.newVideos ?? p.videos ?? 0, p.newVideosCapped)} new videos in 30 days${p.videosPerCreator ? `, ${p.videosPerCreator.toFixed(1)} per creator` : ""}.`, youNeed: `About ${count(p.newVideos ?? p.videos ?? 0)} new videos a month, so samples go to creators who post more than once.${gap(own?.newVideos ?? null, p.newVideos)}` });
  if (p.gmvPerSellingVideo) out.push({ lever: "Videos that sell", theyDo: `${p.sellingShare !== null ? `${Math.round(p.sellingShare)}% of their videos sell` : `At least ${count(p.sellingVideos ?? 0)} of their videos sell`}. A selling video makes ${money(p.gmvPerSellingVideo)} at the median.`, youNeed: "Brief the hooks that already sell and reuse the winning angles." });
  if (p.adShare !== null && p.adShare > 5) out.push({ lever: "Paid boost", theyDo: `${Math.round(p.adShare)}% of GMV comes from boosted videos${p.roas ? ` at ${p.roas.toFixed(1)}x ROAS` : ""}.`, youNeed: "Put ad budget behind the videos that already sell organically." });
  if (p.commission) out.push({ lever: "Commission", theyDo: `${Math.round(p.commission)}% open commission.`, youNeed: own?.commission && own.commission < p.commission ? `Move from ${Math.round(own.commission)}% to ${Math.round(p.commission)}%.` : `Match about ${Math.round(p.commission)}%.` });
  if (p.liveShare !== null && p.liveShare >= 10) out.push({ lever: "Lives", theyDo: `${Math.round(p.liveShare)}% of GMV comes from ${count(p.lives ?? 0)} lives.`, youNeed: "Add lives with the top creators." });
  if (p.reviews && (!own?.reviews || own.reviews < p.reviews)) out.push({ lever: "Social proof", theyDo: `${count(p.reviews)} reviews on the listing.`, youNeed: own?.reviews ? `Grow from ${count(own.reviews)} reviews with sample-driven orders.` : "Build reviews through the first sample wave." });
  return out;
}

export { followerBucket };
