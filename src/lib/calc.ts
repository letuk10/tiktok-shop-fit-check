// Pure business logic for the Fit Check: fees, unit economics, projection, verdict.
import { fbtFeeForWeight, chargeableWeight } from "./fbt";
import { nicheProducts, nicheStats, groupCompetitors, robustVideoBenchmark, englishHook, type Relevance } from "./discovery";

export type Role = "client" | "pod_leader" | "sales_exec";
// Stored role values stay stable; these are the labels shown everywhere.
export const ROLE_LABEL: Record<string, string> = { client: "Partner", pod_leader: "Pod Leader", sales_exec: "Brand Strategist" };
export type Branch = "launch" | "optimize";
export type Fulfillment = "fbt" | "own" | "mcf";
export type Verdict = "green" | "yellow" | "red";

export interface Product {
  name: string;
  asin: string;
  price: number;
  cogs: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  keywords: string[];
}

export interface Assumptions {
  referralPct: number;
  affiliatePct: number;
  affiliateSharePct: number;
  adsFloorPct: number;
  adsTargetPct: number;
  samplesPerMonth: number;
  adDaily: number;
  adStartMonth: number;
  sophieFee: number;
  mcfFirst: number;
  mcfAdditional: number;
  ownCost: number;
  videoRatePct: number;
  gmvPerVideoFallback: number;
  decayPct: number;
  roas: number;
  activeVideosPerProduct: number;
  returnsPct: number;
  guardrailMonth6: number;
  guardrailMonth12: number;
}

export const DEFAULT_ASSUMPTIONS: Assumptions = {
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
  guardrailMonth6: 40000,
  guardrailMonth12: 120000,
};

export interface Answers {
  interest?: "yes" | "no";
  flowVersion?: number;
  marketPrice?: number;
  shopName?: string;
  shopId?: string;
  shopPick?: { shop_id: string; shop_name: string; image_url?: string; revenue?: number };
  runsIt?: "inhouse" | "agency" | "nobody";
  samplesNow?: number;
  probation?: "yes" | "no" | "unsure";
  gmvMax?: boolean;
  gmvMaxDaily?: number;
  fulfillment?: Fulfillment;
  challenge?: string;
  usSeller?: "yes" | "no" | "progress";
  dtc?: string | string[];
  commitSamples?: boolean;
  commitAds?: boolean;
  amazonUrl?: string;
  amazonRevenue?: string;
  dtcRevenue?: string;
  catalogSize?: number;
  selectedShops?: string[];
  selectedProducts?: string[] | undefined;
  excludedProducts?: string[];
  competitorsConfirmed?: boolean;
  productOverrides?: Record<string, Relevance>;
  asinProvider?: string;
}

export const REVENUE_BUCKETS = ["<$20K", "$20-50K", "$50-100K", "$100-250K", "$250K+"];

export const emptyProduct = (): Product => ({
  name: "",
  asin: "",
  price: 29.99,
  cogs: 7,
  weight: 1,
  length: 8,
  width: 5,
  height: 3,
  keywords: [],
});

// ---------- formatting ----------
export const usd = (n: number, digits = 0) =>
  (n < 0 ? "-$" : "$") +
  Math.abs(isFinite(n) ? n : 0).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
export const pct = (n: number) => `${(isFinite(n) ? n : 0).toFixed(1)}%`;
export const num = (n: number) => Math.round(isFinite(n) ? n : 0).toLocaleString("en-US");

export function parseAsins(url: string): string[] {
  if (/^[A-Z0-9]{10}$/i.test(url.trim())) return [url.trim().toUpperCase()];
  if (!url || !/amazon\./i.test(url)) return [];
  const out = new Set<string>();
  const re = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(url))) out.add((m[1] ?? "").toUpperCase());
  return [...out];
}

// ---------- fees ----------
export function billableWeight(p: Pick<Product, "weight" | "length" | "width" | "height">) {
  const dim = (p.length * p.width * p.height) / 166;
  return Math.max(1, Math.ceil(Math.max(p.weight || 0, dim || 0)));
}
export function fbtFee(p: Product) {
  return fbtFeeForWeight(chargeableWeight(p).weight, 1) ?? 0;
}
export function mcfFee(p: Product, a: Assumptions) {
  return a.mcfFirst + a.mcfAdditional * (billableWeight(p) - 1);
}
export function fulfillmentFee(p: Product, a: Assumptions, method: Fulfillment) {
  if (method === "mcf") return mcfFee(p, a);
  if (method === "own") return a.ownCost;
  return fbtFee(p);
}

// ---------- unit economics ----------
export interface ProductEconomics {
  fbt: number;
  mcf: number;
  own: number;
  fee: number;
  contribFloor: number;
  contribTarget: number;
  marginFloor: number; // %
  marginTarget: number; // %
  sampleUnitCost: number;
}

export function productEconomics(p: Product, a: Assumptions, method: Fulfillment): ProductEconomics {
  const fee = fulfillmentFee(p, a, method);
  // Commission is paid only on the share of sales that come from affiliate creators.
  const base = p.price * (1 - a.referralPct / 100 - (a.affiliatePct / 100) * (a.affiliateSharePct / 100) - a.returnsPct / 100) - p.cogs - fee;
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
    marginFloor: p.price > 0 ? (contribFloor / p.price) * 100 : -100,
    marginTarget: p.price > 0 ? (contribTarget / p.price) * 100 : -100,
    sampleUnitCost: p.cogs + fbt,
  };
}

export interface Economics {
  perProduct: ProductEconomics[];
  avgMarginFloor: number;
  avgMarginTarget: number;
  avgContribFloor: number;
  avgPrice: number;
  sampleUnitCost: number;
  monthlySampleCost: number;
  monthlyAds: number;
  monthlyProgramCost: number;
  breakEvenGmv: number | null;
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);

export function economics(products: Product[], a: Assumptions, method: Fulfillment): Economics {
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
    breakEvenGmv: avgMarginFloor > 0 ? monthlyProgramCost / (avgMarginFloor / 100) : null,
  };
}

export function marginTone(m: number): "good" | "neutral" | "warn" {
  if (m >= 25) return "good";
  if (m >= 15) return "neutral";
  return "warn";
}

// ---------- projection ----------
export const PLAN_MONTHS = 12;
/** Sophie's floor: no plan sends fewer samples a month. */
export const SAMPLE_FLOOR = 150;
/** New shops are capped on outreach early, so samples ramp over months 1 to 3. */
export const NEW_SHOP_MONTH1_CAP = 150;
export const VIDEO_REVENUE_RAMP = [0.15, 0.3, 0.5, 0.7, 0.85, 1, 1, 1, 1, 1, 1, 1];
export const DEFAULT_CREATORS_PER_VIDEO = 0.8;

export interface MonthRow {
  month: number;
  samples: number;
  newVideos: number;
  /** Videos published by the program so far. */
  totalVideos: number;
  /** Videos still live and selling this month (after decay). Includes existing shop videos. */
  cumVideos: number;
  /** Active affiliates: live videos times the competitors' creators per video. */
  affiliates: number;
  /** Effective GMV per live program video this month (benchmark x new-shop ramp, after guardrails). */
  gmvPerVideo: number;
  gmv: number;
  sampleCost: number;
  programCost: number;
  net: number;
  cumNet: number;
  adSpend: number;
  capped: boolean;
}
export type PathKey = "pace" | "minimum";
export interface Scenario {
  key: PathKey;
  samples: number;
  label?: string;
  rows: MonthRow[];
  breakEvenMonth: number | null;
  profitableMonth: number | null;
  maxInvestment: number;
  roi: number;
  cumContrib: number;
  cumCost: number;
  capNotes: string[];
  earlyProfitFlag: boolean;
  actualAdStartMonth: number | null;
}

/** Samples delivered each month. New shops start at the outreach cap and reach full pace in month 3. */
export function sampleSchedule(samples: number, newShop: boolean): number[] {
  const n = Math.max(SAMPLE_FLOOR, samples);
  return Array.from({ length: PLAN_MONTHS }, (_, i) => {
    if (newShop && i === 0) return Math.min(n, NEW_SHOP_MONTH1_CAP);
    if (i === 0 || (newShop && i === 1)) return Math.max(SAMPLE_FLOOR, Math.round(n / 2));
    return n;
  });
}

/** GMV ceiling per month: the month-6 guardrail, then a straight line to the month-12 guardrail. */
export function guardrailCeiling(m: number, cap6: number, cap12: number) {
  const hi = Math.max(cap6, cap12);
  return m <= 6 ? cap6 : cap6 + (hi - cap6) * (m - 6) / 6;
}

export interface ProjectOptions { medianCompetitorGmv?: number; newShop?: boolean; creatorsPerVideo?: number; noCaps?: boolean; key?: PathKey }

export function projectScenario(
  samples: number,
  a: Assumptions,
  econ: Economics,
  gmvPerVideo: number,
  start: { gmv: number; videos: number } = { gmv: 0, videos: 0 },
  options: ProjectOptions = {},
): Scenario {
  const rows: MonthRow[] = [];
  const newShop = options.newShop ?? start.gmv <= 0;
  const keep = 1 - a.decayPct / 100;
  const perCreator = Math.min(1, Math.max(0.1, options.creatorsPerVideo ?? DEFAULT_CREATORS_PER_VIDEO));
  const median = options.medianCompetitorGmv;
  const cap6 = Math.min(a.guardrailMonth6, median ? median * .5 : a.guardrailMonth6);
  const cap12 = Math.min(a.guardrailMonth12, median ? median : a.guardrailMonth12);
  const schedule = sampleSchedule(samples, newShop);
  let live = 0, total = 0;
  let cumContrib = 0, cumCost = 0, breakEvenMonth: number | null = null;
  let cumNet = 0, profitableMonth: number | null = null, maxInvestment = 0;
  let earlyProfitFlag = false, actualAdStartMonth: number | null = null, cappedFrom: number | null = null;
  const margin = (econ.avgMarginFloor + a.adsFloorPct) / 100;
  for (let m = 1; m <= PLAN_MONTHS; m++) {
    const delivered = schedule[m - 1] ?? samples;
    const newVideos = delivered * a.videoRatePct / 100;
    live = live * keep + newVideos;
    total += newVideos;
    const allLive = live + start.videos;
    const adsLive = m >= a.adStartMonth && allLive >= 100;
    const adSpend = adsLive ? a.adDaily * 30 : 0;
    if (adsLive && actualAdStartMonth === null) actualAdStartMonth = m;
    // Sales follow live videos: GMV = live program videos x GMV per video. Ads support those videos;
    // the competitor benchmark already includes their ad-driven sales, so ads add no GMV of their own.
    let perVideo = gmvPerVideo * (VIDEO_REVENUE_RAMP[m - 1] ?? 1);
    let capped = false;
    if (!options.noCaps && live > 0) {
      // Guardrails cap the program's incremental GMV, on top of what an existing shop already sells.
      const ceiling = guardrailCeiling(m, cap6, cap12);
      if (live * perVideo > ceiling) { perVideo = Math.max(0, ceiling) / live; capped = true; cappedFrom ??= m; }
    }
    const gmv = start.gmv + live * perVideo;
    const sampleCost = delivered * econ.sampleUnitCost;
    const programCost = a.sophieFee + sampleCost + adSpend;
    const contribution = gmv * margin;
    cumContrib += contribution; cumCost += programCost;
    const net = contribution - programCost;
    cumNet += net;
    maxInvestment = Math.max(maxInvestment, -cumNet);
    if (newShop && m < 3 && net > 0) earlyProfitFlag = true;
    if (profitableMonth === null && net > 0 && (!newShop || m >= 3)) profitableMonth = m;
    if (breakEvenMonth === null && cumContrib >= cumCost && (!newShop || m >= 3)) breakEvenMonth = m;
    rows.push({ month: m, samples: delivered, newVideos, totalVideos: total, cumVideos: allLive, affiliates: allLive * perCreator, gmvPerVideo: perVideo, gmv, sampleCost, programCost, net, cumNet, adSpend, capped });
  }
  const capNotes = cappedFrom !== null ? [`GMV held at the launch guardrail from month ${cappedFrom} (${usd(cap6)} by month 6, ${usd(cap12)} by month 12).`] : [];
  const roi = cumCost > 0 ? ((cumContrib - cumCost) / cumCost) * 100 : 0;
  return { key: options.key ?? "pace", samples: schedule[PLAN_MONTHS - 1] ?? samples, rows, breakEvenMonth, profitableMonth, maxInvestment, roi, cumContrib, cumCost, capNotes, earlyProfitFlag, actualAdStartMonth };
}

/** Smallest monthly sample volume (step 10, floor 150) whose month-12 GMV reaches the target. */
export function samplesForTarget(target: number, a: Assumptions, econ: Economics, gmvPerVideo: number, start = { gmv: 0, videos: 0 }, options: ProjectOptions = {}, max = 10000) {
  const m12 = (n: number) => projectScenario(n, a, econ, gmvPerVideo, start, { ...options, noCaps: true }).rows[PLAN_MONTHS - 1]?.gmv ?? 0;
  if (!(target > 0) || !(gmvPerVideo > 0) || m12(SAMPLE_FLOOR) >= target) return { samples: SAMPLE_FLOOR, feasible: gmvPerVideo > 0 };
  if (m12(max) < target) return { samples: max, feasible: false };
  let lo = SAMPLE_FLOOR / 10, hi = max / 10;
  while (hi - lo > 1) { const mid = Math.floor((lo + hi) / 2); if (m12(mid * 10) >= target) hi = mid; else lo = mid; }
  return { samples: hi * 10, feasible: true };
}

// ---------- same-brand merge ----------
const BRAND_SUFFIX = /(officialshop|officialstore|official|shop|store)$/;
const BRAND_PREFIX = /^(official|shop|store)/;
const BRAND_DROP_WORDS = new Set(["official", "shop", "store", "us", "usa", "llc", "inc", "co", "the"]);
/** Normalized brand key: lowercase, no punctuation or spaces, without official/shop/store/us. */
export function brandKey(name: unknown): string {
  const words = String(name ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ").filter((w) => w && !BRAND_DROP_WORDS.has(w));
  let key = words.join("");
  for (let i = 0; i < 3; i++) key = key.replace(BRAND_SUFFIX, "").replace(BRAND_PREFIX, "");
  return key;
}
const sellerOf = (p: any) => p?.seller_name ?? p?.shop_name ?? p?.product_shop_name ?? "";
const firstWordKey = (p: any) => brandKey(String(p?.product_name ?? "").trim().split(/\s+/)[0] ?? "");

/** Groups indexes of products that belong to the same brand: same normalized seller, or a product
 *  name whose first word is another product's normalized seller. */
export function sameBrandGroups(products: any[]): number[][] {
  const parent = products.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i]!)));
  const seller = products.map((p) => brandKey(sellerOf(p)));
  const first = products.map(firstWordKey);
  for (let i = 0; i < products.length; i++) for (let j = i + 1; j < products.length; j++) {
    const si = seller[i]!, sj = seller[j]!, fi = first[i]!, fj = first[j]!;
    const same = (si.length >= 3 && si === sj) || (sj.length >= 3 && fi === sj) || (si.length >= 3 && fj === si);
    if (same) parent[find(j)] = find(i);
  }
  const groups = new Map<number, number[]>();
  products.forEach((_, i) => { const r = find(i); groups.set(r, [...(groups.get(r) ?? []), i]); });
  return [...groups.values()];
}

const SUM_FIELDS = ["revenue", "video_number", "creator_number", "live_number", "video_revenue", "live_revenue", "shopping_mall_revenue", "showcase_revenue", "sale", "sales_volumn", "sales_volume", "product_review_count"];
/** Merge enriched competitors of the same brand into one row: counts and revenue add up, the
 *  top-selling listing supplies name, price and image. */
export function mergeSameBrand(entries: EnrichedProduct[]): EnrichedProduct[] {
  const groups = sameBrandGroups(entries.map((e) => ({ ...e.product, ...(e.detail ?? {}), product_name: e.detail?.product_name ?? e.product?.product_name, seller_name: sellerOf(e.product) || sellerOf(e.detail) })));
  return groups.map((idx) => {
    const list = idx.map((i) => entries[i]!).sort((x, y) => toNum(y.detail?.revenue) - toNum(x.detail?.revenue));
    const hero = list[0]!;
    if (list.length === 1) return hero;
    const sum = (pick: (e: EnrichedProduct) => any, field: string) => list.some((e) => pick(e)?.[field] !== undefined) ? list.reduce((n, e) => n + toNum(pick(e)?.[field]), 0) : undefined;
    const detail: any = { ...hero.detail };
    for (const f of SUM_FIELDS) { const v = sum((e) => e.detail, f); if (v !== undefined) detail[f] = v; }
    const d90 = list.every((e) => e.detail90) ? { ...hero.detail90, revenue: list.reduce((n, e) => n + toNum(e.detail90?.revenue), 0) } : hero.detail90;
    const product = { ...hero.product, revenue: list.reduce((n, e) => n + toNum(e.product?.revenue ?? e.detail?.revenue), 0), mergedListingIds: list.map((e) => productKey(e.product)), mergedCount: list.length };
    const merged: EnrichedProduct = { ...hero, product, detail, detail90: d90, videos: list.flatMap((e) => e.videos ?? []), creators: list.flatMap((e) => e.creators ?? []), sellerRunVideoIds: list.flatMap((e) => e.sellerRunVideoIds ?? []), sellerRunCreatorIds: list.flatMap((e) => e.sellerRunCreatorIds ?? []) };
    if (list.some((e) => e.newVideos !== undefined)) merged.newVideos = list.reduce((n, e) => n + (e.newVideos ?? 0), 0);
    if (list.some((e) => e.newVideosCapped)) merged.newVideosCapped = true;
    return merged;
  });
}

/** Enriched, same-brand-merged competitors behind every report table, benchmark and the plan. */
export function reportEntries(k: MarketData | null | undefined, answers: Answers): EnrichedProduct[] {
  const raw = selectedCompetitors(k, answers).map((p) => k?.enriched?.[productKey(p)]).filter((e): e is EnrichedProduct => !!e?.detail && toNum(e.detail.revenue) > 0);
  return mergeSameBrand(raw).filter((e) => k?.discovery?.version !== 2 || (toNum(e.detail.revenue) >= 5000 && (toNum(e.detail.creator_number) >= 5 || toNum(e.detail.video_number) >= 10)));
}

// ---------- category pace benchmark ----------
export const shortName = (name: string) => {
  const clean = String(name ?? "").replace(/[|,(].*$/, "").replace(/\s[-–—]\s.*$/, "").trim();
  const words = clean.split(/\s+/).filter((w) => !/^(buy\d*|get\d*|\d+\s*pcs?|\d+-?pack|buy\d+get\d+)$/i.test(w)).slice(0, 4).join(" ");
  return words || "This product";
};
/** The proof point: smallest selected product still doing at least $20K a month, else the median one. */
export function pickPeer<T extends { gmv: number }>(items: T[]): T | undefined {
  const sorted = [...items].sort((a, b) => a.gmv - b.gmv);
  return sorted.find((p) => p.gmv >= 20000) ?? sorted[Math.floor((sorted.length - 1) / 2)];
}

export interface VelocityRow { name: string; gmv: number; videos: number; creators: number | null; newVideos: number | null; newVideosCapped: boolean; sellerShare: number; perVideo: number | null }
/** One competitor's content velocity. Seller-run videos are taken out of both GMV and video count. */
export function velocityOf(e: EnrichedProduct): VelocityRow {
  const d = e.detail ?? {};
  const gmv = toNum(d.revenue), videos = toNum(d.video_number);
  const seller = new Set(e.sellerRunVideoIds ?? []);
  const sampled = e.videos ?? [];
  const sampledRevenue = sampled.reduce((n, v) => n + toNum(v.revenue), 0);
  const sellerRevenue = sampled.filter((v) => seller.has(String(v.video_id))).reduce((n, v) => n + toNum(v.revenue), 0);
  const sellerShare = sampledRevenue > 0 ? sellerRevenue / sampledRevenue : 0;
  const affVideos = Math.max(0, videos - seller.size);
  return { name: shortName(d.product_name ?? e.product?.product_name), gmv, videos, creators: d.creator_number === undefined ? null : toNum(d.creator_number), newVideos: e.newVideos ?? null, newVideosCapped: !!e.newVideosCapped, sellerShare,
    perVideo: affVideos > 0 && gmv > 0 ? gmv * (1 - sellerShare) / affVideos : null };
}

export interface CategoryPace {
  competitors: VelocityRow[];
  /** Median over competitors of affiliate GMV per live video. */
  gmvPerVideo: number;
  creatorsPerVideo: number;
  benchmark: VelocityRow | undefined;
  targetGmv: number;
  requiredLiveVideos: number;
  requiredNewVideos: number;
  videoRange: [number, number] | null;
}
export function categoryPace(entries: EnrichedProduct[], a: Pick<Assumptions, "decayPct" | "guardrailMonth12">, targetShare = 1): CategoryPace {
  const competitors = entries.map(velocityOf).sort((x, y) => y.gmv - x.gmv);
  const gmvPerVideo = median(competitors.map((c) => c.perVideo).filter((n): n is number => n !== null && n > 0));
  const ratios = competitors.filter((c) => c.creators !== null && c.videos > 0).map((c) => (c.creators ?? 0) / c.videos);
  const creatorsPerVideo = ratios.length ? Math.min(1, Math.max(0.1, median(ratios))) : DEFAULT_CREATORS_PER_VIDEO;
  const benchmark = pickPeer(competitors);
  const median12 = median(competitors.map((c) => c.gmv));
  const targetGmv = Math.min((benchmark?.gmv ?? 0) * targetShare, a.guardrailMonth12, median12 || Infinity);
  const requiredLiveVideos = gmvPerVideo > 0 ? targetGmv / gmvPerVideo : 0;
  const vids = competitors.map((c) => c.videos).filter((n) => n > 0);
  return { competitors, gmvPerVideo, creatorsPerVideo, benchmark, targetGmv, requiredLiveVideos, requiredNewVideos: requiredLiveVideos * a.decayPct / 100,
    videoRange: vids.length ? [Math.min(...vids), Math.max(...vids)] : null };
}

export interface PathSummary { key: PathKey; label: string; samples: number; sampleCost: number; gmv: [number, number, number]; profit: [number, number, number] }
export function pathSummary(s: Scenario): PathSummary {
  const at = (m: number) => s.rows[m - 1];
  return { key: s.key, label: s.label ?? s.key, samples: s.samples, sampleCost: at(PLAN_MONTHS)?.sampleCost ?? 0,
    gmv: [at(3)?.gmv ?? 0, at(6)?.gmv ?? 0, at(12)?.gmv ?? 0], profit: [at(3)?.net ?? 0, at(6)?.net ?? 0, at(12)?.net ?? 0] };
}

// ---------- verdict ----------
export interface VerdictInput {
  branch: Branch | null;
  answers: Answers;
  products: Product[];
  avgMarginFloor: number;
}

export function computeVerdict(v: VerdictInput): { verdict: Verdict; reasons: string[]; fixFirst: string[] } {
  const red: string[] = [];
  const yellow: string[] = [];
  const a = v.answers;
  if (v.branch === "launch" && a.usSeller === "no") red.push("No US TikTok Shop seller account (US entity required).");
  if (v.branch === "launch" && a.commitSamples !== true) red.push("No commitment to 150+ samples per month.");
  if (v.branch === "optimize" && (a.samplesNow ?? 0) < 150 && a.commitSamples === false)
    red.push("No commitment to 150+ samples per month.");
  if (v.avgMarginFloor < 15) red.push(`Contribution margin at floor ads is ${pct(v.avgMarginFloor)}, below 15%.`);
  if (red.length) return { verdict: "red", reasons: red, fixFirst: [] };

  if (v.avgMarginFloor < 25) yellow.push(`Margin is ${pct(v.avgMarginFloor)}, between 15% and 25%.`);
  if (v.products.length <= 1 && (a.catalogSize ?? 1) <= 1) yellow.push("Only one hero product and a one product catalog.");
  const amzIdx = REVENUE_BUCKETS.indexOf(a.amazonRevenue ?? "");
  if (amzIdx < 2) yellow.push("Amazon revenue below $50K per month.");
  if (v.branch === "optimize" && a.probation === "yes") yellow.push("Shop on probation (2,000 outreach messages per week cap).");
  if (yellow.length) return { verdict: "yellow", reasons: yellow, fixFirst: yellow };

  return {
    verdict: "green",
    reasons: ["Profitable at 25%+ margin.", "Sample commitment in place.", "Amazon revenue of $50K+ per month."],
    fixFirst: [],
  };
}

export const NEXT_STEP: Record<Verdict, string> = {
  green: "Send proposal and book the kickoff call.",
  yellow: "Fix the items below, then revisit the fit.",
  red: "Polite no for now. Share the market report and keep in touch.",
};

// ---------- kalodata benchmarks ----------
export const toNum = (x: unknown): number => {
  if (typeof x === "number") return x;
  if (typeof x === "string") {
    const n = parseFloat(x.replace(/[$,%\s]/g, ""));
    return isNaN(n) ? 0 : n;
  }
  return 0;
};
export const median = (xs: number[]) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? (s[m] ?? 0) : ((s[m - 1] ?? 0) + (s[m] ?? 0)) / 2;
};
export const ratePct = (x: unknown) => {
  const n = toNum(x);
  return n <= 1 ? n * 100 : n;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface MarketData {
  ok: boolean;
  error?: string;
  fetchedAt?: string;
  keywords: { keyword: string; products: any[]; shops: any[] }[];
  competitors: any[];
  ownShop?: any;
  productOnly?: boolean;
  enriched?: Record<string, EnrichedProduct>;
  ownProducts?: any[];
  ownEnriched?: Record<string, EnrichedProduct>;
  teamOverrides?: TeamOverrides;
  adjustedAt?: string;
  keywordInfo?: KeywordInfo[];
  suggestions?: string[];
  category?: CategoryCache;
  pool?: any[];
  discovery?: DiscoveryCache;
}
export interface DiscoveryCache {
  version: 2;
  core: string;
  productType: string;
  notCompetitors: string[];
  searchTerms: string[];
  searchesCompleted: number;
  totalScanned: number;
  sellersExpanded: number;
  aiExpansion: boolean;
  aiClassification: boolean;
}
export interface CategoryCache { attempted?: boolean; fetchedAt?: string; id?: string; d30?: any; d90?: any; parent90?: any }
export interface KeywordInfo { input: string; used: string; broadened: boolean; count: number }

const FILLER = new Set(["for", "with", "the", "and", "best", "natural", "organic", "a", "an", "of", "to", "in"]);
// Kalodata keyword search is literal, so long-tail phrases are broadened step by step.
export function keywordVariants(keyword: string): string[] {
  const raw = keyword.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
  const core = raw.filter((w) => !FILLER.has(w));
  const out: string[] = [raw.join(" ")];
  for (let n = core.length; n >= 2; n--) out.push(core.slice(0, n).join(" "));
  const last = core.length >= 2 ? core[1] : core[0];
  if (last && last.length >= 3) out.push(last);
  return [...new Set(out.filter(Boolean))];
}
export const CANDIDATE_TARGET = 20;
export const usableCount = (products: any[]) => new Set(products.filter((p) => toNum(p.revenue) > 0).map((p) => String(p.product_id ?? p.product_name))).size;
export function broaderSuggestions(inputs: string[], tried: string[]): string[] {
  const done = new Set(tried.map((t) => t.toLowerCase()));
  const words = inputs.flatMap((i) => i.toLowerCase().split(/\s+/)).filter((w) => w.length >= 4 && !FILLER.has(w));
  return [...new Set(words)].filter((w) => !done.has(w)).slice(0, 4);
}

export interface Benchmarks {
  hasData: boolean;
  categoryGmv: number;
  medianPrice: number;
  medianCommission: number;
  avgCreators: number;
  avgVideos: number;
  gmvPerCreator: number;
  gmvPerVideo: number;
  affiliateShare: number;
}

export const productKey = (p: any) => String(p.product_id ?? p.product_name);
export const shopKey = (s: any) => String(s.shop_id ?? s.shop_name);

// The client picks which shops and products are real competitors. Default: top 5 shops, all products.
export function selectedShopIds(k: MarketData | null | undefined, a: Answers): string[] {
  if (a.selectedShops) return a.selectedShops;
  return (k?.competitors ?? []).slice(0, 5).map(shopKey);
}
export function filterMarket(k: MarketData | null | undefined, a: Answers): MarketData | null {
  if (!k) return null;
  const shops = new Set(selectedShopIds(k, a));
  const ex = new Set(a.excludedProducts ?? []);
  return {
    ...k,
    competitors: (k.competitors ?? []).filter((c) => shops.has(shopKey(c))),
    keywords: k.keywords.map((kw) => ({ ...kw, products: kw.products.filter((p) => !ex.has(productKey(p))) })),
  };
}

export const MAX_COMPETITORS = 8;
export const DEFAULT_COMPETITORS = 6;
// Discovery V2 uses direct, grouped competitors. Older saved reports retain their original fallback.
export function selectedCompetitors(k: MarketData | null | undefined, a: Answers): any[] {
  const candidates = candidateProducts(k, a);
  if (a.selectedProducts) {
    const keys = new Set(a.selectedProducts);
    return candidates.filter((p) => keys.has(productKey(p))).slice(0, MAX_COMPETITORS);
  }
  if (k?.discovery?.version === 2) return candidates.filter((p) => toNum(p.revenue) >= 5000).slice(0, DEFAULT_COMPETITORS);
  return topMarketProducts(filterMarket(k, a)).slice(0, 5);
}
export const candidateProducts = (k: MarketData | null | undefined, a?: Answers) => k?.discovery?.version === 2
  ? groupCompetitors(nicheProducts(k.pool ?? [], a?.productOverrides))
  : topMarketProducts(k).slice(0, CANDIDATE_TARGET);

export function opportunitySignals(k: MarketData | null | undefined, a: Answers, price?: number) {
  const st = productMarketStats(k, a);
  const growth = median(st.products.filter((p) => p.revenue_growth_rate !== undefined && toNum(p.revenue_growth_rate) >= -95 && toNum(p.revenue_growth_rate) <= 500).map((p) => toNum(p.revenue_growth_rate)));
  const prices = st.products.map((p) => toNum(p.unit_price)).filter((n) => n > 0);
  const lo = quantile(prices, 0.25), hi = quantile(prices, 0.75);
  const size = st.gmv > 500000 ? "Large" : st.gmv >= 100000 ? "Mid" : "Niche";
  const competition = st.top3Share < 50 ? "Open" : st.top3Share > 70 ? "Concentrated" : "Moderate";
  const momentum = growth > 10 ? "Growing" : growth < -10 ? "Cooling" : "Flat";
  const priceFit = !price ? null : price < lo ? "Below band" : price > hi ? "Premium" : "In band";
  return { gmv: st.gmv, size, concentration: st.top3Share, competition, growth, momentum, priceLow: lo, priceHigh: hi, priceFit, videoShare: st.shares[0] ?? 0 };
}

export function topMarketProducts(k: MarketData | null | undefined): any[] {
  if (k?.discovery?.version === 2) return [...(k.pool ?? [])].sort((a, b) => toNum(b.revenue) - toNum(a.revenue));
  const seen = new Map<string, any>();
  for (const kw of k?.keywords ?? []) for (const p of kw.products) {
    const key = productKey(p);
    if (!seen.has(key) || toNum(p.revenue) > toNum(seen.get(key)?.revenue)) seen.set(key, p);
  }
  return [...seen.values()].sort((a, b) => toNum(b.revenue) - toNum(a.revenue)).slice(0, 20);
}

export function productMarketStats(k: MarketData | null | undefined, answers?: Answers) {
  if (k?.discovery?.version === 2) {
    const st = nicheStats(k.pool ?? [], answers?.productOverrides);
    return { ...st, medianVideoRevenue: median(st.products.map((p) => toNum(p.video_revenue))) };
  }
  const products = topMarketProducts(k);
  const sum = (field: string) => products.reduce((s, p) => s + toNum(p[field]), 0);
  const gmv = sum("revenue");
  const shares = ["video_revenue", "live_revenue", "showcase_revenue"].map(f => gmv > 0 ? products.reduce((n, p) => n + toNum(f === "showcase_revenue" ? (p.shopping_mall_revenue ?? p.showcase_revenue) : p[f]), 0) / gmv * 100 : 0);
  return { products, gmv, units: products.reduce((s, p) => s + toNum(p.sales_volumn ?? p.sales_volume), 0), productCount: products.length, sellerCount: 0, top3Share: gmv ? products.slice(0, 3).reduce((n, p) => n + toNum(p.revenue), 0) / gmv * 100 : 0,
    medianPrice: median(products.map(p => toNum(p.unit_price)).filter(n => n > 0)),
    medianCommission: median(products.map(p => ratePct(p.commission_rate)).filter(n => n > 0)), shares,
    medianVideoRevenue: median(products.map(p => toNum(p.video_revenue))) };
}

export function benchmarks(k: MarketData | null | undefined, activeVideos = 25): Benchmarks {
  const m = productMarketStats(k?.ok ? k : null);
  return { hasData: m.products.length > 0, categoryGmv: m.gmv, medianPrice: m.medianPrice,
    medianCommission: m.medianCommission, avgCreators: 0, avgVideos: activeVideos,
    gmvPerCreator: 0, gmvPerVideo: activeVideos > 0 ? m.medianVideoRevenue / activeVideos : 0,
    affiliateShare: m.shares[0] ?? 0 };
}

// ---------- full compute ----------
export interface FullInput {
  branch: Branch | null;
  answers: Answers;
  products: Product[];
  assumptions: Assumptions;
  kalodata: MarketData | null;
}

export function computeAll(s: FullInput) {
  const data = competitorInsights(s.kalodata, s.answers);
  const a = { ...DEFAULT_ASSUMPTIONS, ownCost: s.assumptions?.ownCost ?? DEFAULT_ASSUMPTIONS.ownCost };
  const overrides = s.kalodata?.teamOverrides ?? {};
  a.affiliatePct = overrides.commission ?? Math.max(10, Math.round(data.market.commission ?? 0));
  a.affiliateSharePct = Math.min(100, (data.market.videoShare ?? 0) + (data.market.liveShare ?? 0));
  a.videoRatePct = (overrides.postRate ?? .40) * 100;
  a.guardrailMonth6 = overrides.guardrailMonth6 ?? DEFAULT_ASSUMPTIONS.guardrailMonth6;
  a.guardrailMonth12 = overrides.guardrailMonth12 ?? DEFAULT_ASSUMPTIONS.guardrailMonth12;
  a.roas = Math.min(2.5, overrides.roas ?? data.market.roas ?? 0);
  const pace = categoryPace(data.entries, a);
  // Content velocity drives the plan: GMV per live video comes from what competitors actually earn per video.
  const gmvPerVideo = pace.gmvPerVideo > 0 ? pace.gmvPerVideo : (data.market.robustTrimmedMean ?? 0);
  const method: Fulfillment = s.branch === "optimize" ? (s.answers.fulfillment ?? "fbt") : "fbt";
  const products = s.products.length ? s.products : [emptyProduct()];
  const start = s.branch === "optimize" ? { gmv: data.own.reduce((n,p) => n + (p.gmv ?? 0), 0), videos: data.own.reduce((n,p) => n + (p.videos ?? 0), 0) } : {gmv: 0, videos: 0};
  const newShop = s.branch === "launch" || s.answers.probation === "yes";
  const medianCompetitorGmv = data.market.gmv ?? 0;
  const opts = { medianCompetitorGmv, newShop, creatorsPerVideo: pace.creatorsPerVideo };
  const econ0 = economics(products, a, method);
  const solved = samplesForTarget(Math.max(0, pace.targetGmv - start.gmv), a, econ0, gmvPerVideo, { gmv: 0, videos: 0 }, opts);
  const paceSamples = solved.samples;
  const chosenSamples = Math.max(SAMPLE_FLOOR, overrides.samples ?? paceSamples);
  a.samplesPerMonth = chosenSamples;
  const month3Organic = chosenSamples * a.videoRatePct / 100 * (1 + .65 + .65 ** 2) * gmvPerVideo * .5;
  a.adDaily = Math.max(100, Math.round(month3Organic * .10 / 30));
  const econ = economics(products, a, method);
  const niche = productMarketStats(s.kalodata, s.answers);
  const bench = {hasData: data.hasData, categoryGmv: niche.gmv, medianPrice: data.market.price ?? 0, medianCommission: data.market.commission ?? 0, avgCreators: data.market.affiliates ?? 0, avgVideos: data.market.videos ?? 0, gmvPerCreator: data.market.gmvPerAffiliate ?? 0, gmvPerVideo, affiliateShare: a.affiliateSharePct};
  let scenarios: Scenario[] = [];
  if (data.hasData) {
    const chosen = {...projectScenario(chosenSamples, a, econ, gmvPerVideo, start, { ...opts, key: "pace" }), label: overrides.samples ? "Team plan" : "Category pace"};
    const minimum = {...projectScenario(SAMPLE_FLOOR, a, econ, gmvPerVideo, start, { ...opts, key: "minimum" }), label: "Minimum"};
    scenarios = [chosen, minimum];
    a.adStartMonth = chosen.actualAdStartMonth ?? 3;
  }
  const plan = {
    floor: SAMPLE_FLOOR, paceSamples, chosenSamples, feasible: solved.feasible, gmvPerVideo, creatorsPerVideo: pace.creatorsPerVideo,
    benchmark: pace.benchmark, targetGmv: pace.targetGmv, requiredLiveVideos: pace.requiredLiveVideos, requiredNewVideos: pace.requiredNewVideos,
    videoRange: pace.videoRange, competitors: pace.competitors,
    sampleUnitCost: econ.sampleUnitCost,
    paths: scenarios.map(pathSummary),
  };
  const profitAvailable = products.every((p) => p.cogs > 0);
  const earlyProfitFlag = scenarios.some((scenario) => scenario.earlyProfitFlag);
  const capNotes = [...new Set(scenarios.flatMap((scenario) => scenario.capNotes))];
  const m6Gmv = scenarios[0]?.rows[5]?.gmv ?? 0;
  const unitsM6 = econ.avgPrice > 0 ? m6Gmv / econ.avgPrice : 0;
  const unitsPerProduct = unitsM6 / products.length;
  const fulfillment = products.map((p, i) => {
    const e = econ.perProduct[i];
    if (!e) return { product: p.name, opts: [], cheapest: "fbt" as const };
    const opts = [
      { key: "fbt" as const, label: "FBT", unit: e.fbt },
      { key: "mcf" as const, label: "Amazon MCF", unit: e.mcf },
      { key: "own" as const, label: "Own / 3PL", unit: e.own },
    ].map((o) => ({ ...o, monthly: o.unit * unitsPerProduct }));
    const cheapest = opts.reduce((m, o) => (o.unit < m.unit ? o : m), opts[0] ?? { key: "fbt" as const, label: "FBT", unit: 0, monthly: 0 }).key;
    return { product: p.name || `Product ${i + 1}`, opts, cheapest };
  });
  const v = computeVerdict({ branch: s.branch, answers: s.answers, products, avgMarginFloor: econ.avgMarginFloor });
  return { insights: data, adjusted: !!s.kalodata?.adjustedAt, assumptions: a, method, econ, bench, gmvPerVideo, plan, scenarios, unitsPerProduct, fulfillment, verdict: v, profitAvailable, earlyProfitFlag, capNotes };
}


export interface TeamOverrides { postRate?: number; commission?: number; samples?: number; roas?: number; guardrailMonth6?: number; guardrailMonth12?: number }
export interface EnrichedProduct { product: any; detail?: any; videos?: any[]; creators?: any[]; detail90?: any; newVideos?: number; newVideosCapped?: boolean; attempted?: boolean; errors?: string[]; sellerRunVideoIds?: string[]; sellerRunCreatorIds?: string[] }
export const SOURCE = "Source: Kalodata, TikTok Shop US, last 30 days";
export function quantile(values: number[], q: number) {
  if (!values.length) return 0;
  const s = [...values].sort((a,b) => a-b), position = (s.length - 1) * q;
  const i = Math.floor(position), f = position-i;
  return (s[i] ?? 0) * (1-f) + (s[Math.min(i+1,s.length-1)] ?? 0) * f;
}
const ratio = (n: unknown, d: unknown) => toNum(d) > 0 ? toNum(n) / toNum(d) : null;
export function videoInsights(videos: any[]) {
  const ads = videos.filter(v => toNum(v.ad) === 1);
  const weighted = (field: string) => {
    const valid = ads.filter(v => v[field] !== undefined && v[field] !== null && toNum(v.revenue) > 0 && (field !== 'ads_roas' || toNum(v[field]) > 0));
    const revenue = valid.reduce((n,v) => n+toNum(v.revenue),0);
    return revenue > 0 ? valid.reduce((n,v) => n+toNum(v[field])*toNum(v.revenue),0)/revenue : null;
  };
  return {adsShare: videos.length ? ads.length/videos.length*100 : null, roas: weighted('ads_roas'), adRevenueRatio: weighted('ad_revenue_ratio')};
}
export function enrichedMetrics(e: EnrichedProduct) {
  const d = e.detail ?? {}, gmv = d.revenue === undefined ? null : toNum(d.revenue);
  const count = (field: string) => d[field] === undefined ? null : toNum(d[field]);
  const ads = videoInsights(e.videos ?? []);
  const sellerVideos = new Set(e.sellerRunVideoIds ?? []);
  const affiliateVideos = (e.videos ?? []).filter((v) => !sellerVideos.has(String(v.video_id)));
  const robust = robustVideoBenchmark(affiliateVideos);
  return {product: {...e.product, ...d, product_name:d.product_name??e.product.product_name, master_image_url:d.master_image_url??e.product.master_image_url, image_url:d.image_url??e.product.image_url}, gmv, price: count('unit_price'), commission: count('commission_rate'), affiliates: count('creator_number'), newVideos: e.newVideos ?? null, capped: e.newVideosCapped, videos: count('video_number'), lives: count('live_number'),
    videoShare: gmv && d.video_revenue !== undefined ? toNum(d.video_revenue)/gmv*100 : null, liveShare: gmv && d.live_revenue !== undefined ? toNum(d.live_revenue)/gmv*100 : null, shopShare: gmv && (d.shopping_mall_revenue ?? d.showcase_revenue) !== undefined ? toNum(d.shopping_mall_revenue ?? d.showcase_revenue)/gmv*100 : null,
    gmvPerAffiliate: gmv !== null ? ratio(gmv,d.creator_number) : null, gmvPerVideo: ratio(d.video_revenue,d.video_number), robustMedian: robust.median, robustTrimmedMean: robust.trimmedMean, hitRate: robust.hitRate, affiliateVideoCount: robust.count, sellerRunVideoCount: sellerVideos.size, ...ads};
}
export function followerBucket(n: number) { return n < 10000 ? 0 : n < 50000 ? 1 : n < 250000 ? 2 : 3; }
export function creatorInsights(creators: any[]) {
  const unique = new Map<string, any>();
  for (const c of creators) { const id = String(c.creator_id ?? c.creator_handle); const prior = unique.get(id); unique.set(id, prior ? {...c, revenue: toNum(prior.revenue)+toNum(c.revenue), video_revenue: toNum(prior.video_revenue)+toNum(c.video_revenue), live_revenue: toNum(prior.live_revenue)+toNum(c.live_revenue)} : {...c}); }
  const rows = [...unique.values()];
  const total = rows.reduce((n,c) => n+toNum(c.revenue),0);
  const buckets = ['<10K','10K to 50K','50K to 250K','250K+'].map((label,i) => {const cs=rows.filter(c => followerBucket(toNum(c.creator_followers))===i); return {label, count: cs.length, revenue: cs.reduce((n,c)=>n+toNum(c.revenue),0), share: total ? cs.reduce((n,c)=>n+toNum(c.revenue),0)/total*100:0};});
  const leader = [...buckets].sort((a,b) => b.revenue-a.revenue)[0];
  return {rows,buckets, leader: total ? leader?.label : undefined, videoShare: total ? rows.reduce((n,c)=>n+toNum(c.video_revenue),0)/total*100 : null, liveShare: total ? rows.reduce((n,c)=>n+toNum(c.live_revenue),0)/total*100 : null};
}
export function competitorInsights(k: MarketData | null | undefined, answers: Answers) {
  const entries = reportEntries(k, answers);
  const products = entries.map(enrichedMetrics);
  const fields = ['gmv','price','commission','affiliates','newVideos','videos','lives','videoShare','liveShare','shopShare','adsShare','roas','adRevenueRatio','gmvPerAffiliate','gmvPerVideo','robustMedian','robustTrimmedMean','hitRate'] as const;
  const market = Object.fromEntries(fields.map(field => {const values=products.map(p=>p[field]).filter((n): n is number => n !== null); return [field,values.length ? median(values):null];})) as Record<typeof fields[number],number|null>;
  const videos = new Map<string, any>();
  const sellerCreators = new Set(entries.flatMap((e) => e.sellerRunCreatorIds ?? []));
  const sellerVideos = new Set(entries.flatMap((e) => e.sellerRunVideoIds ?? []));
  const creators = creatorInsights(entries.flatMap(e=>(e.creators??[]).filter((c) => !sellerCreators.has(String(c.creator_id ?? c.creator_handle)))));
  for (const e of entries) for (const v of (e.videos??[]).filter((v) => !sellerVideos.has(String(v.video_id)))) {const key=String(v.video_id); if (!videos.has(key)||toNum(v.revenue)>toNum(videos.get(key)?.revenue)) videos.set(key,v);}
  const allVideos = [...videos.values()];
  const adsMetrics=videoInsights(allVideos);
  market.roas=adsMetrics.roas;
  const topVideos = allVideos.sort((a,b)=>toNum(b.revenue)-toNum(a.revenue)).slice(0,10).map(v=>({...v,displayTitle:englishHook(v.video_title),followers:creators.rows.find(c=>String(c.creator_id)===String(v.belonged_creator_id) || c.creator_handle===v.belonged_creator_handle)?.creator_followers}));
  const ownEntries = Object.values(k?.ownEnriched??{}).filter(e=>e.detail && toNum(e.detail.revenue)>0);
  return {entries, products, market, hasData: products.length>=2 && products.filter(p=>p.robustTrimmedMean !== null).length>=2, topVideos, creators, ads: adsMetrics, own: ownEntries.map(enrichedMetrics), ownCreators: creatorInsights(ownEntries.flatMap(e=>e.creators??[])), ownAds: videoInsights(ownEntries.flatMap(e=>e.videos??[])), sellerRunVideoCount: entries.reduce((n,e)=>n+(e.sellerRunVideoIds?.length??0),0)};
}
