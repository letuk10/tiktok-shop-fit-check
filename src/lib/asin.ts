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
  provider: "hub" | "keepa";
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
