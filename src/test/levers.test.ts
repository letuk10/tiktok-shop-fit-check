import { describe, expect, it } from "vitest";
import { formatLever, productLevers, leverTakeaways } from "@/lib/levers";
import { namesCore } from "@/lib/discovery";

const vid = (revenue: number, ad = 0, extra: Record<string, unknown> = {}) => ({ video_id: String(Math.random()), revenue, ad, ads_roas: ad ? 2 : 0, ad_revenue_ratio: ad ? 80 : 0, ...extra });

describe("competitor levers", () => {
  it("counts videos that sell and their median GMV when the full list is in", () => {
    const l = productLevers({ product: {}, detail: { revenue: 12000, video_number: 4, creator_number: 2, commission_rate: 20, live_revenue: 0 }, detail90: { revenue: 27000 },
      videos: [vid(8000, 1), vid(2000), vid(0), vid(0)], creators: [{ creator_id: "a", revenue: 8000, creator_followers: 59000 }, { creator_id: "b", revenue: 2000, creator_followers: 20000 }] });
    expect(l.sellingVideos).toBe(2);
    expect(l.sellingAtLeast).toBe(false);
    expect(l.sellingShare).toBe(50);
    expect(l.gmvPerSellingVideo).toBe(5000);
    expect(Math.round(l.adShare ?? 0)).toBe(53); // 8000 x 80% of 12000
    expect(l.gmvPerCreator).toBe(6000);
    expect(Math.round(l.trend ?? 0)).toBe(33); // 12000 vs 9000 a month
    expect(l.creatorSweetSpot).toBe("50K to 250K");
  });

  it("marks the count as a floor when Kalodata only returned top videos that all sold", () => {
    const l = productLevers({ product: {}, detail: { revenue: 90000, video_number: 900, creator_number: 600 }, videos: Array.from({ length: 100 }, () => vid(500)) });
    expect(l.sellingAtLeast).toBe(true);
    expect(l.sellingShare).toBeNull();
    expect(formatLever({ n: l.sellingVideos, atLeast: l.sellingAtLeast }, "int")).toBe("100+");
  });

  it("turns the proof point into what the partner needs", () => {
    const p = productLevers({ product: {}, detail: { revenue: 30000, video_number: 200, creator_number: 150, commission_rate: 25, product_review_count: 900 }, newVideos: 120, videos: [vid(400, 1), vid(200)] });
    const own = productLevers({ product: {}, detail: { revenue: 4000, video_number: 40, creator_number: 30, commission_rate: 15, product_review_count: 80 }, newVideos: 20, videos: [vid(100)] });
    const t = leverTakeaways(p, own, "URO Boric Acid");
    expect(t.find((x) => x.lever === "Creators")?.youNeed).toContain("5.0x");
    expect(t.find((x) => x.lever === "Commission")?.youNeed).toBe("Move from 15% to 25%.");
  });
});

describe("core matching", () => {
  it("matches whole words only", () => {
    expect(namesCore("boric acid suppositories", "boric")).toBe(true);
    expect(namesCore("puerto rican santa boricua decor", "boric")).toBe(false);
    expect(namesCore("travel sewing kits", "sewing kit")).toBe(true);
  });
});
