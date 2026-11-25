import { describe, expect, it } from "vitest";
import { chargeableWeight, fbtEligibility, fbtFeeForWeight, fbtFeePanel, fbtWeightTier, nextFbtBoundary } from "@/lib/fbt";

describe("official FBT rate card", () => {
  it("charges 0.5 lb in a 4x4x2 box at the official 4+ to 8 oz single-unit rate", () => {
    expect(fbtFeePanel({ weight: .5, length: 4, width: 4, height: 2 }).fees[0]?.fee).toBe(4.52);
  });
  it("charges 1.5 lb in a 10x8x6 box using 480/166 dimensional pounds", () => {
    const panel = fbtFeePanel({ weight: 1.5, length: 10, width: 8, height: 6 });
    expect(panel.weight).toBeCloseTo(2.891566265, 8);
    expect(panel.fees[0]?.fee).toBe(6.27);
  });
  it("charges a three-ounce single unit at $4.28", () => {
    expect(fbtFeeForWeight(3 / 16)).toBe(4.28);
  });
  it("uses actual weight at 2 lb or less and 332 cubic inches or less", () => {
    expect(chargeableWeight({ weight: 1.2, length: 8, width: 5, height: 3 })).toMatchObject({ weight: 1.2, reason: "actual" });
  });
  it("uses dimensional weight above 332 cubic inches", () => {
    expect(chargeableWeight({ weight: 1.2, length: 10, width: 10, height: 5 })).toMatchObject({ weight: 500 / 166, reason: "dimensional" });
  });
  it("uses actual weight for a heavy small unit", () => {
    expect(chargeableWeight({ weight: 4, length: 5, width: 4, height: 3 }).weight).toBe(4);
  });
  it("charges the exact ounce and multi-unit rates", () => {
    expect(fbtFeeForWeight(.25, 1)).toBe(4.28);
    expect(fbtFeeForWeight(.5, 2)).toBe(2.91);
    expect(fbtFeeForWeight(.75, 3)).toBe(2.61);
    expect(fbtFeeForWeight(1, 4)).toBe(2.36);
  });
  it("uses the 1+ to 2 lb rate above one pound", () => {
    expect(fbtFeeForWeight(1.01)).toBe(5.71);
    expect(fbtFeeForWeight(2)).toBe(5.71);
  });
  it("uses the same heavy-tier fee for every order size", () => {
    expect(fbtFeeForWeight(16, 1)).toBe(12.67);
    expect(fbtFeeForWeight(50, 4)).toBe(24.52);
    expect(fbtFeeForWeight(50.01)).toBeNull();
  });
  it("returns the tier and next boundary", () => {
    expect(fbtWeightTier(.47)).toBe("4+ to 8 oz");
    expect(nextFbtBoundary(.47)?.remainingOz).toBeCloseTo(.48, 5);
  });
  it("includes COGS and single-unit shipping in sample cost", () => {
    expect(fbtFeePanel({ cogs: 8, weight: 1, length: 8, width: 5, height: 3 }).sampleCost).toBe(13.10);
  });
  it("enforces the 150 lb and 108 inch eligibility limits", () => {
    expect(fbtEligibility({ weight: 151, length: 1, width: 1, height: 1 }).eligible).toBe(false);
    expect(fbtEligibility({ weight: 10, length: 109, width: 1, height: 1 }).eligible).toBe(false);
  });
});
