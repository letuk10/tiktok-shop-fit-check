import { describe, expect, it } from "vitest";
import { isAmazonBlockPage, parseAmazonPage, titleFromAmazonUrl } from "@/lib/asin";

const page = `<html><body>
<a id="bylineInfo" href="/stores/Amallow">Visit the Amallow Store</a>
<span id="productTitle" class="a-size-large">  Amallow 100% Grass Fed Beef Tallow for Skin Care - Face + Body, 4 FL. oz. </span>
<div id="corePriceDisplay_desktop_feature_div"><span class="a-price priceToPay"><span class="a-offscreen">$39.99</span></span></div>
<img id="landingImage" data-old-hires="https://m.media-amazon.com/images/I/abc.jpg" src="x.jpg">
<div id="detailBullets_feature_div"><ul>
<li><span class="a-text-bold">Package Dimensions &rlm; : &lrm;</span><span>3.43 x 2.72 x 2.68 inches; 8.48 ounces</span></li>
<li><span class="a-text-bold">Best Sellers Rank:</span> #1,879 in Beauty &amp; Personal Care</li>
</ul></div></body></html>`;

describe("Amazon page lookup", () => {
  it("reads title, price, package size, weight, brand and rank", () => {
    const p = parseAmazonPage(page)!;
    expect(p.title).toContain("Amallow 100% Grass Fed Beef Tallow");
    expect(p.price).toBe(39.99);
    expect([p.lengthIn, p.widthIn, p.heightIn]).toEqual([3.43, 2.72, 2.68]);
    expect(p.weightLb).toBeCloseTo(0.53, 2);
    expect(p.brand).toBe("Amallow");
    expect(p.bsr).toBe(1879);
    expect(p.image).toContain("abc.jpg");
  });
  it("reads the table layout with item weight on its own row", () => {
    const html = `<span id="productTitle">Sewing Kit</span><table><tr><th>Product Dimensions</th><td>10 x 7 x 2.5 inches</td></tr><tr><th>Item Weight</th><td>1.2 pounds</td></tr></table>`;
    const p = parseAmazonPage(html)!;
    expect([p.lengthIn, p.widthIn, p.heightIn]).toEqual([10, 7, 2.5]);
    expect(p.weightLb).toBe(1.2);
  });
  it("detects a robot check", () => {
    expect(isAmazonBlockPage("<form action=\"/errors/validateCaptcha\">")).toBe(true);
    expect(parseAmazonPage("<form action=\"/errors/validateCaptcha\">")).toBeNull();
  });
  it("gets a product name from the link when the lookup fails", () => {
    expect(titleFromAmazonUrl("https://www.amazon.com/Amallow-100-Grass-Beef-Tallow/dp/B0C3KW5VJR/ref=sr_1_1")).toBe("Amallow 100 Grass Beef Tallow");
    expect(titleFromAmazonUrl("https://www.amazon.com/dp/B0C3KW5VJR")).toBe("");
  });
});
