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
export const SAMPLE_RAMP = [0.2, 0.7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
export const VIDEO_REVENUE_RAMP = [0.15, 0.3, 0.5, 0.7, 0.85, 1, 1, 1, 1, 1, 1, 1];

export interface MonthRow {
  month: number;
  samples: number;
  newVideos: number;
  cumVideos: number;
  gmv: number;
  programCost: number;
  net: number;
  affiliates: number;
  cumNet: number;
  adSpend: number;
}
export interface Scenario {
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

export function projectScenario(
  samples: number,
  a: Assumptions,
  econ: Economics,
  gmvPerVideo: number,
  start: { gmv: number; videos: number } = { gmv: 0, videos: 0 },
  options: { medianCompetitorGmv?: number; newShop?: boolean; conservativeOf?: MonthRow[] } = {},
): Scenario {
  const rows: MonthRow[] = [];
  const newShop = options.newShop ?? start.gmv <= 0;
  let activeNew = 0, activeExisting = start.videos;
  let cumContrib = 0, cumCost = 0, breakEvenMonth: number | null = null;
  let affiliates = 0, cumNet = 0, profitableMonth: number | null = null, maxInvestment = 0;
  let earlyProfitFlag = false, actualAdStartMonth: number | null = null;
  const capNotes: string[] = [];
  const margin = (econ.avgMarginFloor + a.adsFloorPct) / 100;
  for (let m = 1; m <= PLAN_MONTHS; m++) {
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
    if (options.conservativeOf?.[m - 1]) incremental = Math.min(incremental, Math.max(0, options.conservativeOf[m - 1]!.gmv - start.gmv) * .5);
    const gmv = start.gmv + incremental;
    const programCost = a.sophieFee + delivered * econ.sampleUnitCost + adSpend;
    const contribution = gmv * margin;
    cumContrib += contribution; cumCost += programCost;
    const net = contribution - programCost;
    affiliates += newVideos; cumNet += net;
    maxInvestment = Math.max(maxInvestment, -cumNet);
    if (newShop && m < 3 && net > 0) earlyProfitFlag = true;
    if (profitableMonth === null && net > 0 && (!newShop || m >= 3)) profitableMonth = m;
    if (breakEvenMonth === null && cumContrib >= cumCost && (!newShop || m >= 3)) breakEvenMonth = m;
    rows.push({ month: m, samples: delivered, newVideos, cumVideos: active, gmv, programCost, net, affiliates, cumNet, adSpend });
  }
  const roi = cumCost > 0 ? ((cumContrib - cumCost) / cumCost) * 100 : 0;
  return { samples, rows, breakEvenMonth, profitableMonth, maxInvestment, roi, cumContrib, cumCost, capNotes, earlyProfitFlag, actualAdStartMonth };
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
  const targetAffiliates = Math.max(30, Math.ceil((data.market.affiliates ?? 0) * .25));
  a.samplesPerMonth = overrides.samples ?? Math.max(150, Math.ceil(targetAffiliates / 6 / (a.videoRatePct / 100) / 10) * 10);
  a.roas = Math.min(2.5, overrides.roas ?? data.market.roas ?? 0);
  const gmvPerVideo = data.market.robustTrimmedMean ?? 0;
  const method: Fulfillment = s.branch === "optimize" ? (s.answers.fulfillment ?? "fbt") : "fbt";
  const products = s.products.length ? s.products : [emptyProduct()];
  const start = s.branch === "optimize" ? { gmv: data.own.reduce((n,p) => n + (p.gmv ?? 0), 0), videos: data.own.reduce((n,p) => n + (p.videos ?? 0), 0) } : {gmv: 0, videos: 0};
  const newShop = s.branch === "launch" || s.answers.probation === "yes";
  const month3Organic = a.samplesPerMonth * a.videoRatePct / 100 * (1 + .65 + .65 ** 2) * gmvPerVideo * .5;
  a.adDaily = Math.max(100, month3Organic * .10 / 30);
  const econ = economics(products, a, method);
  const niche = productMarketStats(s.kalodata, s.answers);
  const bench = {hasData: data.hasData, categoryGmv: niche.gmv, medianPrice: data.market.price ?? 0, medianCommission: data.market.commission ?? 0, avgCreators: data.market.affiliates ?? 0, avgVideos: data.market.videos ?? 0, gmvPerCreator: data.market.gmvPerAffiliate ?? 0, gmvPerVideo, affiliateShare: a.affiliateSharePct};
  const medianCompetitorGmv = data.market.gmv ?? 0;
  let scenarios: Scenario[] = [];
  if (data.hasData) {
    const target = {...projectScenario(a.samplesPerMonth, a, econ, gmvPerVideo, start, {medianCompetitorGmv,newShop}), label: "Target"};
    const conservative = {...projectScenario(a.samplesPerMonth, a, econ, data.market.robustMedian ?? 0, start, {medianCompetitorGmv,newShop,conservativeOf:target.rows}), label: "Conservative"};
    scenarios = [target, conservative];
    a.adStartMonth = target.actualAdStartMonth ?? 3;
  }
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
  return { insights: data, targetAffiliates, adjusted: !!s.kalodata?.adjustedAt, assumptions: a, method, econ, bench, gmvPerVideo, scenarios, unitsPerProduct, fulfillment, verdict: v, profitAvailable, earlyProfitFlag, capNotes };
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
  const selected = selectedCompetitors(k, answers);
  const entries = selected.map(p => k?.enriched?.[productKey(p)]).filter((e): e is EnrichedProduct => !!e?.detail && toNum(e.detail.revenue)>0 && (k?.discovery?.version !== 2 || (toNum(e.detail.revenue) >= 5000 && (toNum(e.detail.creator_number) >= 5 || toNum(e.detail.video_number) >= 10))));
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
  return {products, market, hasData: products.length>=2 && products.filter(p=>p.robustTrimmedMean !== null).length>=2, topVideos, creators, ads: adsMetrics, own: ownEntries.map(enrichedMetrics), ownCreators: creatorInsights(ownEntries.flatMap(e=>e.creators??[])), ownAds: videoInsights(ownEntries.flatMap(e=>e.videos??[])), sellerRunVideoCount: entries.reduce((n,e)=>n+(e.sellerRunVideoIds?.length??0),0)};
}
