import { describe, expect, it } from "vitest";
import { accountMatchesSeller, applyClassificationFloor, englishHook, formatGrowth, groupCompetitors, mergePoolProducts, nicheStats, robustVideoBenchmark, searchTermSet, sellerRunFlags } from "@/lib/discovery";

describe("competitor discovery V2", () => {
  it("always includes original keywords, core and variants, capped at eight", () => {
    const terms = searchTermSet(["beef tallow for skin"], { core: "tallow", variants: ["beef tallow", "tallow balm", "whipped tallow", "tallow moisturizer"], product_type: "skincare", not_competitors: ["cooking tallow"] });
    expect(terms[0]).toBe("beef tallow for skin");
    expect(terms).toContain("tallow");
    expect(terms).toContain("beef tallow");
    expect(terms.length).toBeLessThanOrEqual(8);
  });
  it("overrides AI mistakes for exact core product and form matches", () => {
    const expansion = { core: "tallow", variants: ["tallow balm", "tallow cream"], product_type: "tallow skin balm", not_competitors: ["cooking tallow"] };
    const result = applyClassificationFloor([
      { product_id: "1", product_name: "Organic Beef Tallow Balm with Honey", relevance: "no" },
      { product_id: "2", product_name: "Beef Tallow for Cooking", relevance: "no" },
      { product_id: "3", product_name: "Tallow Deodorant", relevance: "no" },
    ], expansion);
    expect(result.map((p) => p.relevance)).toEqual(["direct", "no", "no"]);
  });
  it("dedupes by product ID, retains one consistent snapshot and records both terms", () => {
    const pool = mergePoolProducts([{ product_id: "1", revenue: 100, foundTerms: ["beef tallow"] }], [{ product_id: "1", revenue: 89000 }], "tallow");
    expect(pool).toHaveLength(1);
    expect(pool[0].revenue).toBe(100);
    expect(pool[0].foundTerms).toEqual(["beef tallow", "tallow"]);
  });
  it("groups pack variants from one seller but not different sellers", () => {
    const groups = groupCompetitors([
      { product_id: "1", shop_id: "a", product_name: "Tallow Balm 1 pack", revenue: 10000 },
      { product_id: "2", shop_id: "a", product_name: "Tallow Balm 2 pack", revenue: 5000 },
      { product_id: "3", shop_id: "b", product_name: "Tallow Balm 2 pack", revenue: 7000 },
    ]);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({ product_id: "1", revenue: 15000, listingCount: 2 });
  });
  it("defines the niche from every direct product, not only selected products", () => {
    const stats = nicheStats([
      { product_id: "1", relevance: "direct", revenue: 10000, sales_volumn: 100, video_revenue: 5000 },
      { product_id: "2", relevance: "direct", revenue: 5000, sales_volumn: 50 },
      { product_id: "3", relevance: "no", revenue: 999999 },
    ]);
    expect(stats.gmv).toBe(15000);
    expect(stats.units).toBe(150);
    expect(stats.productCount).toBe(2);
  });
  it("never counts a grouped competitor and its listings twice", () => {
    const listings = [{ product_id: "1", shop_id: "a", product_name: "Tallow Balm 1 pack", relevance: "direct", revenue: 10000 }, { product_id: "2", shop_id: "a", product_name: "Tallow Balm 2 pack", relevance: "direct", revenue: 5000 }];
    expect(nicheStats([...groupCompetitors(listings), ...listings]).gmv).toBe(15000);
    expect(groupCompetitors([...groupCompetitors(listings), ...listings])[0].listingCount).toBe(2);
  });
  it("rejects seller-expansion skincare without tallow and cooking products even if AI says direct", () => {
    const result = applyClassificationFloor([{ product_name: "Triple Collagen Cream", relevance: "direct" }, { product_name: "Beef Tallow for Cooking", relevance: "direct" }], { core: "tallow", variants: ["tallow cream"], product_type: "tallow balm", not_competitors: [] });
    expect(result.map((p) => p.relevance)).toEqual(["no", "no"]);
  });
  it("keeps sewing machines, stitch guns and kids craft projects out of the hand-sewing-kit niche", () => {
    const result = applyClassificationFloor(["Portable Sewing Machine Kit", "Stitch Gun Sewing Kit", "Fashion Sewing Kit with Mannequins", "36PCS Sewing Kit with Needles and Thread"].map((product_name) => ({ product_name, relevance: "direct" })), { core: "sewing kit", variants: ["portable sewing kit"], product_type: "hand sewing kit", not_competitors: [] });
    expect(result.map((p) => p.relevance)).toEqual(["adjacent", "adjacent", "adjacent", "direct"]);
  });
  it("clamps unusable growth and marks recent launches as new", () => {
    const now = new Date("2026-11-13");
    expect(formatGrowth(-100, undefined, now)).toBeNull();
    expect(formatGrowth(999, undefined, now)).toBeNull();
    expect(formatGrowth(20, undefined, now)).toBe(20);
    expect(formatGrowth(-100, "2026-11-01", now)).toBe("new");
  });
  it("matches seller accounts by normalized name and edit distance", () => {
    expect(accountMatchesSeller("Amallow Official", "amallow")).toBe(true);
    expect(accountMatchesSeller("amelow", "amallow")).toBe(true);
    expect(accountMatchesSeller("creator", "amallow")).toBe(false);
  });
  it("flags seller-run creators and dominant low-follower accounts", () => {
    const videos = [{ video_id: "1", belonged_creator_id: "a", belonged_creator_handle: "brandofficial", revenue: 100 }, { video_id: "2", belonged_creator_id: "a", revenue: 100 }, { video_id: "3", belonged_creator_id: "a", revenue: 100 }];
    const flags = sellerRunFlags(videos, [{ creator_id: "a", creator_followers: "1000" }], ["brand"]);
    expect(flags.sellerRunVideoIds).toEqual(["1", "2", "3"]);
  });
  it("uses English hooks trimmed at word boundaries", () => {
    expect(englishHook("Esta crema es increíble para tu piel")).toBeNull();
    expect(englishHook("This is the best balm for your dry skin and this part is far too long to show", 45)).toBe("This is the best balm for your dry skin and...");
  });
  it("uses median, five-percent trimmed mean and $500 hit rate", () => {
    const videos = [...Array.from({ length: 19 }, (_, i) => i + 1), 1000].map((revenue, i) => ({ video_id: String(i), revenue }));
    const result = robustVideoBenchmark(videos);
    expect(result.median).toBe(10.5);
    expect(result.trimmedMean).toBe(10);
    expect(result.hitRate).toBe(5);
  });
});
