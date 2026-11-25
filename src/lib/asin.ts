export interface AsinProduct {
  title: string;
  brand: string;
  image: string;
  price: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  weightLb: number;
  cogs?: number;
  monthlyRevenue?: number;
  keywords?: string[];
  categoryPath?: string[];
  fbaPickAndPackFee?: number;
  monthlySold?: number;
  provider: "hub" | "keepa" | "amazon";
  bsr?: number;
}

const mmToIn = (n: unknown) => typeof n === "number" && n > 0 ? n / 25.4 : 0;
const gramsToLb = (n: unknown) => typeof n === "number" && n > 0 ? n / 453.59237 : 0;
const cents = (n: unknown) => typeof n === "number" && n >= 0 ? n / 100 : 0;

/** Maps documented Keepa Product Object and Statistics Object fields. Prices and FBA fees are cents. */
export interface KeepaProduct {
  title?: string; brand?: string; manufacturer?: string; imagesCSV?: string;
  packageWeight?: number; itemWeight?: number; packageLength?: number; packageWidth?: number; packageHeight?: number;
  monthlySold?: number; stats?: { current?: number[]; monthlySold?: number };
  categoryTree?: { name?: string }[]; fbaFees?: { pickAndPackFee?: number };
}

export function mapKeepaProduct(p: KeepaProduct): AsinProduct {
  const current = Array.isArray(p.stats?.current) ? p.stats.current : [];
  const buyBox = current[18] ?? 0;
  const price = cents(buyBox > 0 ? buyBox : current[1]);
  const weightLb = gramsToLb(p.packageWeight) || gramsToLb(p.itemWeight);
  const imageFile = String(p.imagesCSV ?? "").split(",")[0]?.trim();
  const categoryPath = p.categoryTree?.map((c) => String(c.name ?? "")).filter(Boolean) ?? [];
  const monthlySold: number | undefined = typeof p.monthlySold === "number" ? p.monthlySold : typeof p.stats?.monthlySold === "number" ? p.stats.monthlySold : undefined;
  const fba = typeof p.fbaFees?.pickAndPackFee === "number" ? cents(p.fbaFees.pickAndPackFee) : undefined;
  return {
    title: String(p.title ?? ""), brand: String(p.brand ?? p.manufacturer ?? ""),
    image: imageFile ? `https://m.media-amazon.com/images/I/${imageFile}` : "",
    price, lengthIn: mmToIn(p.packageLength), widthIn: mmToIn(p.packageWidth), heightIn: mmToIn(p.packageHeight), weightLb,
    categoryPath, ...(fba !== undefined ? { fbaPickAndPackFee: fba } : {}), ...(monthlySold !== undefined ? { monthlySold } : {}),
    ...(monthlySold && price ? { monthlyRevenue: monthlySold * price } : {}),
    provider: "keepa",
  };
}

export function validAsin(asin: string) {
  return /^[A-Z0-9]{10}$/i.test(asin.trim());
}


const decode = (t: string) => t.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;|&#160;/g, " ").replace(/\u200e|\u200f|&lrm;|&rlm;/g, "").replace(/\s+/g, " ").trim();
const stripTags = (t: string) => decode(t.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "));

/** Returns true when Amazon served a robot check instead of the product page. */
export function isAmazonBlockPage(html: string) {
  return /validateCaptcha|Type the characters you see|api-services-support@amazon\.com|Sorry, we just need to make sure you're not a robot/i.test(html);
}

function toPounds(value: number, unit: string) {
  const u = unit.toLowerCase();
  if (u.startsWith("pound") || u === "lb" || u === "lbs") return value;
  if (u.startsWith("ounce") || u === "oz") return value / 16;
  if (u.startsWith("kilogram") || u === "kg") return value * 2.20462;
  if (u.startsWith("gram") || u === "g") return value / 453.59237;
  return 0;
}

/** Reads title, price, package size, weight, image, brand and BSR from an amazon.com product page. */
export function parseAmazonPage(html: string): Omit<AsinProduct, "provider"> | null {
  if (!html || isAmazonBlockPage(html)) return null;
  const title = stripTags(html.match(/id="productTitle"[^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? "");
  if (!title) return null;
  const text = stripTags(html);
  // Price: the first "priceToPay" or core price block, then any offscreen price.
  // The buy box price lives in the core price block; other offscreen prices on the page belong to
  // variants, subscriptions or ads, so search those blocks in order before anything else.
  const inBlock = (id: string) => { const i = html.indexOf(id); return i < 0 ? undefined : html.slice(i, i + 4000).match(/class="a-offscreen">\s*\$([\d,]+\.\d{2})/i)?.[1]; };
  const priceBlock = inBlock('id="corePriceDisplay_desktop_feature_div"') ?? inBlock('id="corePrice_feature_div"') ?? inBlock('id="apex_desktop"') ?? inBlock('id="corePrice_desktop"')
    ?? html.match(/class="a-offscreen">\s*\$([\d,]+\.\d{2})/i)?.[1];
  const price = priceBlock ? Number(priceBlock.replace(/,/g, "")) : 0;
  // Dimensions: prefer package dimensions, then product or item dimensions. Formats like
  // "3.43 x 2.72 x 2.68 inches; 8.48 Ounces" or "3.4"L x 2.7"W x 2.7"H".
  const dimLabel = /(Package Dimensions|Product Dimensions|Item Dimensions(?: LxWxH)?)\s*:?\s*([\d.]+)\s*"?\s*[LlWwHh]?\s*x\s*([\d.]+)\s*"?\s*[LlWwHh]?\s*x\s*([\d.]+)\s*"?\s*[LlWwHh]?\s*(inches|inch|in|centimeters|cm)?\s*(?:;\s*([\d.]+)\s*(pounds|pound|lbs|lb|ounces|ounce|oz|kilograms|kg|grams|g)\b)?/gi;
  let lengthIn = 0, widthIn = 0, heightIn = 0, weightLb = 0, best = 99;
  for (const m of text.matchAll(dimLabel)) {
    const rank = /package/i.test(m[1] ?? "") ? 0 : /product/i.test(m[1] ?? "") ? 1 : 2;
    if (rank >= best) continue;
    const cm = /^c/i.test(m[5] ?? "");
    const f = cm ? 1 / 2.54 : 1;
    const dims = [Number(m[2]), Number(m[3]), Number(m[4])].map((n) => n * f).sort((a, b) => b - a);
    if (dims.some((n) => !Number.isFinite(n) || n <= 0)) continue;
    [lengthIn, widthIn, heightIn] = dims as [number, number, number];
    if (m[6] && m[7]) weightLb = toPounds(Number(m[6]), m[7]);
    best = rank;
  }
  if (!weightLb) {
    const w = text.match(/(?:Item Weight|Package Weight|Shipping Weight)\s*:?\s*([\d.]+)\s*(pounds|pound|lbs|lb|ounces|ounce|oz|kilograms|kg|grams|g)\b/i);
    if (w) weightLb = toPounds(Number(w[1]), w[2] ?? "");
  }
  const image = decode(html.match(/id="landingImage"[^>]*data-old-hires="([^"]+)"/i)?.[1] ?? html.match(/id="landingImage"[^>]*src="([^"]+)"/i)?.[1] ?? "");
  const byline = stripTags(html.match(/id="bylineInfo"[^>]*>([\s\S]*?)<\/a>/i)?.[1] ?? "");
  const brand = byline.replace(/^Visit the\s+/i, "").replace(/\s+Store$/i, "").replace(/^Brand:\s*/i, "").trim();
  const bsrMatch = text.match(/Best Sellers Rank\s*:?\s*#\s*([\d,]+)/i);
  const bsr = bsrMatch ? Number(bsrMatch[1]!.replace(/,/g, "")) : undefined;
  return {
    title, brand, image, price,
    lengthIn: Math.round(lengthIn * 100) / 100, widthIn: Math.round(widthIn * 100) / 100, heightIn: Math.round(heightIn * 100) / 100,
    weightLb: Math.round(weightLb * 1000) / 1000,
    ...(bsr ? { bsr } : {}),
  };
}

/** Turns an Amazon URL slug ("Amallow-100-Grass-Beef-Tallow/dp/...") into a readable product name. */
export function titleFromAmazonUrl(input: string) {
  const m = input.match(/amazon\.[a-z.]+\/([^/?#]+)\/(?:dp|gp\/product)\//i);
  if (!m || /^(dp|gp)$/i.test(m[1] ?? "")) return "";
  return decodeURIComponent(m[1]!).replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}
