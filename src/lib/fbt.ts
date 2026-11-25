export interface FbtProduct {
  weight: number;
  length: number;
  width: number;
  height: number;
}

export const FBT_RATE_CARD = {
  version: "2026-11-01",
  effectiveDate: "Nov 1, 2026",
  source: "TikTok Shop Academy, FBT Rate Card & FAQ, updated Nov 10, 2026",
  label: "FBT rate card effective Nov 1, 2026",
} as const;

type Tier = { maxOz: number; label: string; fees: [number, number, number, number] };
const TIERS: Tier[] = [
  { maxOz: 4, label: "4 oz or less", fees: [4.28, 2.52, 1.91, 1.56] },
  { maxOz: 8, label: "4+ to 8 oz", fees: [4.52, 2.91, 2.36, 1.93] },
  { maxOz: 12, label: "8+ to 12 oz", fees: [4.70, 3.05, 2.61, 2.23] },
  { maxOz: 16, label: "12+ to 16 oz", fees: [5.10, 3.16, 2.78, 2.36] },
  { maxOz: 32, label: "1+ to 2 lb", fees: [5.71, 3.92, 3.14, 2.60] },
  { maxOz: 48, label: "2+ to 3 lb", fees: [6.27, 4.30, 3.25, 2.76] },
  { maxOz: 64, label: "3+ to 4 lb", fees: [6.92, 4.70, 3.55, 3.12] },
  { maxOz: 80, label: "4+ to 5 lb", fees: [7.66, 5.09, 4.54, 4.54] },
  { maxOz: 96, label: "5+ to 6 lb", fees: [8.58, 6.19, 5.46, 5.46] },
  { maxOz: 112, label: "6+ to 7 lb", fees: [8.88, 6.50, 6.14, 6.08] },
  { maxOz: 128, label: "7+ to 8 lb", fees: [9.22, 6.90, 6.70, 6.50] },
  { maxOz: 144, label: "8+ to 9 lb", fees: [9.42, 7.00, 6.77, 6.59] },
  { maxOz: 160, label: "9+ to 10 lb", fees: [9.63, 7.46, 7.30, 7.30] },
  { maxOz: 176, label: "10+ to 11 lb", fees: [10.64, 8.30, 8.10, 8.10] },
  { maxOz: 192, label: "11+ to 12 lb", fees: [10.75, 9.20, 9.00, 9.00] },
  { maxOz: 208, label: "12+ to 13 lb", fees: [10.98, 10.04, 10.04, 10.04] },
  { maxOz: 224, label: "13+ to 14 lb", fees: [11.44, 10.42, 10.42, 10.42] },
  { maxOz: 240, label: "14+ to 15 lb", fees: [11.85, 10.80, 10.80, 10.80] },
];
const HEAVY_FEES = [12.67, 12.90, 13.25, 13.51, 13.80, 14.52, 14.86, 15.13, 15.67, 15.90, 16.38, 16.63, 17.25, 17.45, 17.88, 18.46, 18.51, 19.05, 19.47, 19.86, 20.30, 20.56, 20.89, 21.48, 21.51, 22.10, 22.30, 22.90, 23.21, 23.30, 23.77, 24.04, 24.38, 24.50, 24.52];

export function chargeableWeight(p: FbtProduct) {
  const actual = Math.max(0, p.weight || 0);
  const volume = Math.max(0, p.length * p.width * p.height);
  const dimensional = volume / 166;
  const useActual = actual > 0 && actual <= 2 && volume <= 332;
  return { weight: useActual ? actual : Math.max(actual, dimensional), dimensional, volume, reason: useActual ? "actual" as const : "dimensional" as const };
}

export function fbtEligibility(p: FbtProduct) {
  const sides = [p.length, p.width, p.height];
  return { eligible: p.weight <= 150 && Math.max(...sides) <= 108, reason: p.weight > 150 ? "Over the 150 lb limit" : Math.max(...sides) > 108 ? "A side exceeds 108 in" : null };
}

export function fbtFeeForWeight(weight: number, units = 1): number | null {
  if (weight <= 0 || weight > 50) return null;
  const oz = weight * 16;
  const index = TIERS.findIndex((t) => oz <= t.maxOz + 1e-9);
  if (index >= 0) return TIERS[index]?.fees[units === 1 ? 0 : units === 2 ? 1 : units === 3 ? 2 : 3] ?? null;
  return HEAVY_FEES[Math.min(34, Math.max(0, Math.ceil(weight) - 16))] ?? null;
}

export function fbtWeightTier(weight: number) {
  if (weight > 50) return "Heavy Bulky, quoted by the team";
  const oz = weight * 16;
  const tier = TIERS.find((t) => oz <= t.maxOz + 1e-9);
  if (tier) return tier.label;
  const upper = Math.min(50, Math.ceil(weight));
  return `${upper - 1}+ to ${upper} lb`;
}

export function nextFbtBoundary(weight: number) {
  if (weight <= 0 || weight >= 50) return null;
  const oz = weight * 16;
  const tier = TIERS.find((t) => oz <= t.maxOz + 1e-9);
  const boundaryOz = tier?.maxOz ?? Math.ceil(weight) * 16;
  const remaining = boundaryOz - oz;
  return remaining > 0.001 ? { boundaryOz, remainingOz: remaining } : null;
}

export function fbtFeePanel(p: FbtProduct & { cogs?: number }) {
  const chargeable = chargeableWeight(p);
  return {
    ...chargeable,
    tier: fbtWeightTier(chargeable.weight),
    fees: [1, 2, 3, 4].map((units) => ({ units, fee: fbtFeeForWeight(chargeable.weight, units) })),
    sampleCost: (p.cogs ?? 0) + (fbtFeeForWeight(chargeable.weight, 1) ?? 0),
    next: nextFbtBoundary(chargeable.weight),
    eligibility: fbtEligibility(p),
  };
}

export const FBT_FACTS = [
  "FBT orders ship free to shoppers by default.",
  "Storage is free for the first 60 days.",
  "Creator sample orders pay the standard single-unit fee.",
  "Physical bundles count as one unit; virtual bundles get multi-unit rates.",
];
