import { describe, expect, it } from "vitest";
import { amazonMonthly, beyondScenarios, channelLead, competitionWord, fitsAveragePrice, pickPeer, priceZone } from "@/lib/deck";

describe("plan deck rules", () => {
  it("peer is the smallest product still at $20K or more", () => {
    expect(pickPeer([{ gmv: 183000 }, { gmv: 25000 }, { gmv: 12000 }, { gmv: 111000 }])?.gmv).toBe(25000);
  });
  it("peer falls back to the median product when none reach $20K", () => {
    expect(pickPeer([{ gmv: 5000 }, { gmv: 9000 }, { gmv: 15000 }])?.gmv).toBe(9000);
  });
  it("price zone finds the densest $10 range from $5 bands", () => {
    const z = priceZone([{ price: 22, units: 100 }, { price: 27, units: 300 }, { price: 31, units: 50 }, { price: 60, units: 50 }]);
    expect(z).toEqual({ lo: 20, hi: 30, share: 80 });
  });
  it("average order fits within 20% of the partner price", () => {
    expect(fitsAveragePrice(24, 20)).toBe(true);
    expect(fitsAveragePrice(25, 20)).toBe(false);
  });
  it("competition word uses top 10 share thresholds", () => {
    expect(competitionWord(40)).toBe("Open");
    expect(competitionWord(60)).toBe("Moderate");
    expect(competitionWord(75)).toBe("Concentrated");
  });
  it("beyond month 6 tiers show only Conservative and Target", () => {
    const t = beyondScenarios(1_000_000, 10, 20);
    expect(t.map((x) => x.monthly)).toEqual([50000, 100000]);
    expect(t[1]?.yearly).toBe(1_200_000);
  });
  it("headline channel is the largest one", () => {
    expect(channelLead(68, 18, 14)).toBe("video");
    expect(channelLead(20, 50, 30)).toBe("live");
  });
  it("Amazon bucket maps to a monthly midpoint", () => {
    expect(amazonMonthly("$50-100K")).toBe(75000);
    expect(amazonMonthly(undefined)).toBeNull();
  });
});
