import { describe, expect, it } from "vitest";
import { missingFields, qualificationReady } from "@/lib/qualification";

const base = { role: "pod_leader", submitter_name: "Pablo", submitter_email: "p@x.com", client_name: "", client_email: "", branch: "optimize", answers: {}, products: [], assumptions: {} };

describe("what blocks Continue", () => {
  it("names the partner contact fields a pod leader still owes", () => {
    expect(missingFields(1, base)).toEqual(["Partner contact name", "Partner contact email"]);
  });
  it("names each product and the exact missing values", () => {
    const s = { ...base, answers: { amazonRevenue: "$250K+", dtcRevenue: "$250K+", catalogSize: 5 }, products: [{ name: "NutraBlast Boric Life Boric Acid", price: 11.99, cogs: 1.5, weight: 0, length: 3, width: 1.5, height: 1.5 }] };
    expect(missingFields(3, s)).toEqual(["NutraBlast Boric Life Boric: weight"]);
    expect(qualificationReady(3, s)).toBe(false);
  });
  it("is empty exactly when the step is ready", () => {
    const s = { ...base, client_name: "Ana", client_email: "ana@brand.com" };
    expect(missingFields(1, s)).toEqual([]);
    expect(qualificationReady(1, s)).toBe(true);
  });
});
