import { ProductMarket } from "./market";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Truck } from "lucide-react";
import { computeAll, type Answers, marginTone, num, pct, usd, type MarketData, type Product } from "@/lib/calc";
import { Note, Stat } from "./ui";
import { FBT_FACTS, FBT_RATE_CARD, fbtFeePanel } from "@/lib/fbt";
import { cn } from "@/lib/utils";

type R = ReturnType<typeof computeAll>;

export function EconomicsCards({ r, products }: { r: R; products: Product[] }) {
  const e = r.econ;
  if (!r.profitAvailable) return <Note>Add your product cost to see profit, margin and ROI. FBT and GMV estimates remain available.</Note>;
  return (
    <div className="space-y-6">
      <ExpectedRoi r={r} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Profit per order" value={usd(e.avgContribFloor, 2)} sub={`Average, at ${r.assumptions.adsFloorPct}% ads`} tone={marginTone(e.avgMarginFloor)} />
        <Stat label="Margin after TikTok costs" value={pct(e.avgMarginFloor)} sub={`${pct(e.avgMarginTarget)} at ${r.assumptions.adsTargetPct}% ads`} tone={marginTone(e.avgMarginFloor)} />
        <Stat label="Monthly program investment" value={usd(e.monthlyProgramCost)} sub="Fee + samples + ads from month 3" />
        <Stat label="Break-even GMV" value={e.breakEvenGmv ? usd(e.breakEvenGmv) : "Not profitable"} sub="TikTok GMV per month" tone="dark" />
      </div>
      <div className="bento overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left">
            <tr className="border-b border-border">
              {["Product", "Price", "Fulfillment", `Profit @${r.assumptions.adsFloorPct}% ads`, "Margin", `Profit @${r.assumptions.adsTargetPct}% ads`, "Margin", "Sample cost"].map((h) => (
                <th key={h} className="eyebrow px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => {
              const x = e.perProduct[i];
              if (!x) return null;
              return (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-semibold text-navy">{p.name || `Product ${i + 1}`}</td>
                  <td className="px-4 py-3">{usd(p.price, 2)}</td>
                  <td className="px-4 py-3">{usd(x.fee, 2)}</td>
                  <td className="px-4 py-3">{usd(x.contribFloor, 2)}</td>
                  <td className={cn("px-4 py-3 font-semibold", toneText(x.marginFloor))}>{pct(x.marginFloor)}</td>
                  <td className="px-4 py-3">{usd(x.contribTarget, 2)}</td>
                  <td className={cn("px-4 py-3 font-semibold", toneText(x.marginTarget))}>{pct(x.marginTarget)}</td>
                  <td className="px-4 py-3">{usd(x.sampleUnitCost, 2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-caption">
        {FBT_RATE_CARD.label}. Profit includes a 3% returns allowance. Monthly samples cost {usd(e.monthlySampleCost)} ({r.assumptions.samplesPerMonth} x {usd(e.sampleUnitCost, 2)}).
        Sophie fee {usd(r.assumptions.sophieFee)}/month; revenue share only applies above $100K GMV per month.
      </p>
    </div>
  );
}

export function ExpectedRoi({ r }: { r: R }) {
  const s = r.scenarios.find((scenario) => scenario.label === "Target");
  if (!s || !r.profitAvailable) return <Note>Add your product cost to see ROI and profit. The GMV plan is still available.</Note>;
  const tone = s.roi >= 0 ? "good" : s.roi > -40 ? "neutral" : "warn";
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="sm:col-span-1">
        <Stat label="Expected ROI, 12 months" value={pct(s.roi)} sub={`${s.samples} samples per month scenario`} tone={tone} />
      </div>
      <div className="bento p-5 text-sm sm:col-span-2">
        <div className="eyebrow">How to read this</div>
        <p className="mt-2">
          For every {usd(100)} invested over 12 months, projected contribution is{" "}
          <span className="font-semibold text-navy">{usd(100 + s.roi)}</span> after TikTok fees, creator
          commissions, product cost and shipping. {s.breakEvenMonth ? `It pays back in month ${s.breakEvenMonth}.` : "It does not pay back within 12 months."}
        </p>
        <p className="mt-2 text-xs text-caption">
          Ads return {r.assumptions.roas}x their spend (ROAS) from month {r.assumptions.adStartMonth}. Assumes {r.assumptions.affiliateSharePct}% of sales come from affiliate creators (commission only on those) and ads at {r.assumptions.adsFloorPct}% of GMV.
        </p>

      </div>
    </div>
  );
}

const toneText = (m: number) => ({ good: "text-navy", neutral: "text-navy", warn: "text-drive" })[marginTone(m)];

export function FulfillmentSection({ r, products }: { r: R; products?: Product[] }) {
  return (
    <div className="space-y-6">
      {r.fulfillment.map((f, i) => (
        <div key={i} className="bento p-5">
          <div className="mb-4 font-semibold text-navy">{f.product}</div>
          <div className="grid gap-3 sm:grid-cols-3">
            {f.opts.map((o) => (
              <div key={o.key} className={cn("rounded-xl border border-border p-4", o.key === f.cheapest && "border-growth bg-growth/10")}>
                <div className="eyebrow">{o.label}{o.key === f.cheapest && " · cheapest"}</div>
                <div className="mt-1 text-2xl font-bold text-navy">{usd(o.unit, 2)}</div>
                <div className="text-xs text-caption">per order · {usd(o.monthly)}/mo at {num(r.unitsPerProduct)} units</div>
              </div>
            ))}
          </div>
          <FbtPanel product={products?.[i]} />
          <div className="mt-4 h-40">
            <ResponsiveContainer>
              <BarChart data={f.opts} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="label" width={90} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => usd(v, 2)} />
                <Bar dataKey="unit" fill="var(--signal)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
      <p className="text-xs text-caption">
        MCF and own 3PL are editable estimates. Monthly volume uses the Target scenario, month 6.
      </p>
      <Note>
        <div className="flex gap-3">
          <Truck className="mt-0.5 h-5 w-5 shrink-0 text-signal" strokeWidth={1.5} />
          <span>
            FBT advantages: the FBT badge and faster delivery promise usually lift conversion, and creator samples can ship
            straight from FBT stock.
          </span>
        </div>
      </Note>
    </div>
  );
}

function FbtPanel({ product }: { product?: Product | undefined }) {
  if (!product) return null;
  const panel = fbtFeePanel(product);
  return <div className="mt-5 rounded-xl border border-border p-4 text-sm">
    <div className="font-semibold text-navy">{panel.weight.toFixed(2)} lb chargeable weight · {panel.tier}</div>
    <p className="mt-1 text-xs text-caption">Uses {panel.reason === "actual" ? "actual weight: 2 lb or less and at most 332 cubic inches" : `the greater of actual and dimensional weight (${panel.dimensional.toFixed(2)} lb dimensional)`}. {FBT_RATE_CARD.label}.</p>
    <div className="mt-3 grid grid-cols-4 gap-2">{panel.fees.map((f) => <div key={f.units}><div className="text-xs text-caption">{f.units === 4 ? "4+" : f.units} unit{f.units === 1 ? "" : "s"}</div><div className="font-semibold text-navy">{f.fee === null ? "Team quote" : usd(f.fee, 2)}</div></div>)}</div>
    <p className="mt-3">Sample cost per unit: <span className="font-semibold text-navy">{usd(panel.sampleCost, 2)}</span> (COGS + single-unit FBT fee).</p>
    {panel.next && <p className="mt-1 text-xs text-caption">{panel.next.remainingOz.toFixed(1)} oz under the next tier.</p>}
    {!panel.eligibility.eligible && <Note>{panel.eligibility.reason}</Note>}
    <p className="mt-3 text-xs text-caption">{FBT_FACTS.join(" ")}</p>
  </div>;
}

export function MarketSection({ id, k, answers, onAnswers, afterShare, onEditKeywords, onMarket }: {
  id?: string | undefined; r: R; k: MarketData | null; branch?: string | null; compact?: boolean; answers: Answers; onAnswers?: (a: Partial<Answers>) => void; afterShare?: React.ReactNode; onEditKeywords?: (keywords: string[]) => void; onMarket?: ((k: MarketData) => void) | undefined;
}) {
  return <ProductMarket id={id} k={k} answers={answers} onAnswers={onAnswers} afterShare={afterShare} onEditKeywords={onEditKeywords} onMarket={onMarket} />;
}

