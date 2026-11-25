import { describe, expect, it } from "vitest";
import { mapKeepaProduct, validAsin } from "@/lib/asin";

describe("ASIN lookup mapping", () => {
  it("maps Keepa package dimensions, weight, price and sales", () => {
    const item = mapKeepaProduct({ title: "Balm", brand: "Brand", packageLength: 254, packageWidth: 127, packageHeight: 76.2, packageWeight: 453.59237, imagesCSV: "image.jpg", stats: { current: Array.from({ length: 19 }, (_, i) => i === 18 ? 2999 : -1), monthlySold: 100 }, fbaFees: { pickAndPackFee: 510 }, categoryTree: [{ name: "Beauty" }] });
    expect(item).toMatchObject({ title: "Balm", brand: "Brand", price: 29.99, lengthIn: 10, widthIn: 5, weightLb: 1, monthlySold: 100, monthlyRevenue: 2999, fbaPickAndPackFee: 5.10, categoryPath: ["Beauty"] });
    expect(item.heightIn).toBeCloseTo(3, 10);
  });
  it("accepts only a ten-character ASIN", () => {
    expect(validAsin("B0ABCDEFGH")).toBe(true);
    expect(validAsin("not-an-asin")).toBe(false);
  });
});
