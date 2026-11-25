/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from "vitest";
import { brandKey, categoryPace, computeAll, DEFAULT_ASSUMPTIONS, emptyProduct, mergeSameBrand, reportEntries, SAMPLE_FLOOR, type MarketData } from "@/lib/calc";
import { cleanHook, pickHooks, priceBands } from "@/lib/deck";

// Tallow-like niche: six confirmed listings, two of them the same brand sold from two shops.
const LISTINGS = [
  { id: "a", name: "Glowco Whipped Beef Tallow Honey Balm", seller: "glowco", gmv: 178620, videos: 714, creators: 657, price: 26.62 },
  { id: "b", name: "Forge Tallow Face Balm for Men", seller: "FORGE MEN", gmv: 164687, videos: 2283, creators: 1469, price: 26.08 },
  { id: "c", name: "Organic Grass-Fed Beef Tallow Balm with Raw Honey", seller: "Terra Field", gmv: 114427, videos: 935, creators: 1050, price: 17 },
  { id: "d", name: "Paleo Whipped Tallow Balm Copper Peptide", seller: "Coast Paleo", gmv: 107887, videos: 534, creators: 145, price: 26.71 },
  { id: "e", name: "Lopeie Whipped Grass-Fed Beef Tallow Honey Balm Unscented", seller: "Lopeieofficial", gmv: 63617, videos: 3405, creators: 2747, price: 11.94 },
  { id: "f", name: "Lopeie Whipped Grass-Fed Beef Tallow Honey Balm Lavender", seller: "LOPEIE.SHOP", gmv: 50995, videos: 1727, creators: 1415, price: 12.95 },
];
function market(scale = 1, videoScale = 1): MarketData {
  const products = LISTINGS.map((l) => ({ product_id: l.id, product_name: l.name, seller_name: l.seller, revenue: l.gmv * scale, unit_price: l.price }));
  return {
    ok: true, competitors: [], keywords: [{ keyword: "beef tallow", shops: [], products }],
    enriched: Object.fromEntries(LISTINGS.map((l, i) => [l.id, {
      product: products[i], detail: { ...products[i], video_number: Math.round(l.videos * videoScale), creator_number: l.creators, video_revenue: l.gmv * scale * .8, live_revenue: l.gmv * scale * .15, commission_rate: 15 },
      videos: [{ video_id: `${l.id}1`, revenue: 900, views: 40000, video_title: "I wish I knew this sooner" }, { video_id: `${l.id}2`, revenue: 300, views: 9000, video_title: "Replying to @someone" }], creators: [],
    }])),
  };
}
const answers = { selectedProducts: LISTINGS.map((l) => l.id) };
const product = { ...emptyProduct(), name: "Tallow balm", price: 39.99, cogs: 3.5, weight: 0.3, length: 3, width: 3, height: 2 };
const run = (k: MarketData, extra: Partial<MarketData> = {}) => computeAll({ branch: "launch", answers, products: [product], assumptions: DEFAULT_ASSUMPTIONS, kalodata: { ...k, ...extra } });

describe("same-brand merge", () => {
  it("normalizes shop names", () => {
    expect(brandKey("LOPEIE.SHOP")).toBe("lopeie");
    expect(brandKey("Lopeieofficial")).toBe("lopeie");
    expect(brandKey("Lopeie Official Store US")).toBe("lopeie");
    expect(brandKey("Terra Field")).toBe("terrafield");
  });
  it("merges two shops of one brand into one competitor with summed GMV and videos", () => {
    const k = market();
    const merged = reportEntries(k, answers);
    expect(merged).toHaveLength(5);
    const lopeie = merged.find((e) => String(e.detail.product_name).startsWith("Lopeie"));
    expect(lopeie?.detail.revenue).toBeCloseTo(63617 + 50995);
    expect(lopeie?.detail.video_number).toBe(3405 + 1727);
    expect(lopeie?.videos).toHaveLength(4);
  });
  it("treats a product as the same brand when its first word is another listing's seller", () => {
    const k = market();
    const entries = Object.values(k.enriched ?? {}).map((e) => e.product.product_id === "f" ? { ...e, product: { ...e.product, seller_name: "Some Reseller" }, detail: { ...e.detail, seller_name: "Some Reseller" } } : e);
    const withSeller = entries.map((e) => e.product.product_id === "e" ? { ...e, product: { ...e.product, seller_name: "Lopeie" } } : e);
    expect(mergeSameBrand(withSeller)).toHaveLength(5);
  });
});

describe("plan follows the category", () => {
  it("derives GMV per video, the proof point and the samples needed from competitor velocity", () => {
    const r = run(market());
    const pace = categoryPace(reportEntries(market(), answers), DEFAULT_ASSUMPTIONS);
    expect(r.plan.gmvPerVideo).toBeCloseTo(pace.gmvPerVideo);
    // Median of 250, 72, 122, 202 and 22 (merged Lopeie) GMV per video.
    expect(Math.round(r.plan.gmvPerVideo)).toBe(122);
    expect(r.plan.benchmark?.gmv).toBeCloseTo(107887);
    expect(r.plan.paceSamples).toBeGreaterThan(SAMPLE_FLOOR);
    // The pace path reaches the proof point by month 12, the floor path does not.
    const [chosen, minimum] = r.scenarios;
    expect(chosen?.rows[11]?.gmv).toBeGreaterThanOrEqual(r.plan.targetGmv * 0.99);
    expect(minimum?.rows[11]?.gmv).toBeLessThan(r.plan.targetGmv * 0.5);
    expect(minimum?.samples).toBe(150);
  });
  it("needs more samples when competitors need more videos for the same GMV", () => {
    const base = run(market()).plan.paceSamples;
    const slow = run(market(1, 2)).plan.paceSamples;
    expect(slow).toBeGreaterThan(base * 1.8);
  });
  it("never goes below the 150 floor when videos earn a lot", () => {
    const r = run(market(1, 0.05));
    expect(r.plan.paceSamples).toBe(150);
    expect(r.scenarios.every((s) => s.rows.every((row) => row.samples >= 150))).toBe(true);
  });
  it("ramps a new shop over months 1 to 3", () => {
    const r = run(market());
    const rows = r.scenarios[0]!.rows;
    expect(rows[0]?.samples).toBe(150);
    expect(rows[1]?.samples).toBe(Math.round(r.plan.paceSamples / 2));
    expect(rows[2]?.samples).toBe(r.plan.paceSamples);
  });
  it("reconciles GMV with live videos x GMV per video, and GMV only grows with videos", () => {
    for (const s of run(market()).scenarios) {
      let prev = { gmv: 0, videos: 0 };
      for (const row of s.rows) {
        expect(row.gmv).toBeCloseTo(row.cumVideos * row.gmvPerVideo, 6);
        expect(row.affiliates).toBeLessThanOrEqual(row.cumVideos);
        expect(row.sampleCost).toBeCloseTo(row.samples * (3.5 + 4.52));
        if (row.gmv > prev.gmv + 1) expect(row.cumVideos >= prev.videos || row.gmvPerVideo > 0).toBe(true);
        prev = { gmv: row.gmv, videos: row.cumVideos };
      }
    }
  });
  it("keeps no profit before month 3 for a new shop", () => {
    for (const s of run(market()).scenarios) expect(s.profitableMonth === null || s.profitableMonth >= 3).toBe(true);
  });
  it("team overrides still set the chosen sample volume", () => {
    const r = run(market(), { teamOverrides: { samples: 400 }, adjustedAt: "2026-11-25" });
    expect(r.assumptions.samplesPerMonth).toBe(400);
    expect(r.scenarios[0]?.label).toBe("Team plan");
    expect(r.scenarios[0]?.rows[11]?.samples).toBe(400);
  });
  it("summarizes both paths at months 3, 6 and 12 with sample cost", () => {
    const r = run(market());
    const [pace, floor] = r.plan.paths;
    expect(pace?.gmv[2]).toBeCloseTo(r.scenarios[0]!.rows[11]!.gmv);
    expect(floor?.sampleCost).toBeCloseTo(150 * (3.5 + 4.52));
  });
});

describe("hooks", () => {
  const names = ["FORGE SKIN Wrinkle Defense & Natural Anti Aging Beef Tallow Moisturizer"];
  it("skips replies, mentions, non-English titles and product names", () => {
    expect(cleanHook("Replying to @Melissa Evans ", names)).toBeNull();
    expect(cleanHook("Respuesta a @teresacordero1017 #skincare", names)).toBeNull();
    expect(cleanHook("Reply to @someone and @other", names)).toBeNull();
    expect(cleanHook("@a @b @c wow", names)).toBeNull();
    expect(cleanHook("Cebo de res para la piel. #skincare", names)).toBeNull();
    expect(cleanHook("Esta crema de cebo de res es impresionante", names)).toBeNull();
    expect(cleanHook("FORGE SKIN Wrinkle Defense & N #skincare", names)).toBeNull();
    expect(cleanHook("I wish I knew this in the 7th grade 🤦🏽‍♂️ #beard", names)).toBe("I wish I knew this in the 7th grade");
  });
  it("prefers real hooks and falls back to category formats below two", () => {
    const real = pickHooks([{ video_title: "Replying to @x" }, { video_title: "Hurry ends soon for real" }, { video_title: "Why my skin finally cleared up" }, { video_title: "This have my skin super clear" }], names, "Moisturizers & Mists", "tallow");
    expect(real.generic).toBe(false);
    expect(real.hooks[0]).toBe("Why my skin finally cleared up");
    const thin = pickHooks([{ video_title: "Replying to @x" }, { video_title: "Sebo de res para la piel" }, { video_title: "Why my skin finally cleared up" }], names, "Moisturizers & Mists", "tallow");
    expect(thin.generic).toBe(true);
    expect(thin.hooks.join(" ")).toMatch(/Before and after/);
  });
});

describe("price bands", () => {
  it("weights by units, uses steady steps with one open band and highlights the partner", () => {
    const items = [{ price: 12, units: 5000 }, { price: 13, units: 4000 }, { price: 17, units: 6700 }, { price: 26, units: 13000 }, { price: 27, units: 4000 }, { price: 44, units: 900 }, { price: 63, units: 500 }, { price: 320, units: 5 }];
    const b = priceBands(items, 39.99)!;
    expect(b.step).toBe(5);
    expect(b.bands.at(-1)?.hi).toBeNull();
    expect(b.bands.reduce((n, x) => n + x.share, 0)).toBeCloseTo(100);
    expect(b.bands.find((x) => x.partner)?.label).toBe("$30+");
    expect(b.bands.map((x) => x.label)).toEqual(["$10 to $15", "$15 to $20", "$20 to $25", "$25 to $30", "$30+"]);
    expect(b.where).toBe("above");
    expect(b.headline).toMatch(/^\d+% of units sell between \$\d+ and \$\d+\. Your \$39\.99 sits above that\.$/);
  });
});
