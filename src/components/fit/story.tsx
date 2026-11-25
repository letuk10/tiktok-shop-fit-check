/* eslint-disable @typescript-eslint/no-explicit-any */
import { useId, useState } from "react";
import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { computeAll, opportunitySignals, num, pct, usd, PLAN_MONTHS, type Answers, type MarketData, type Product } from "@/lib/calc";
import { cn } from "@/lib/utils";
import { BookCall } from "./book-call";
import { MarketInsights, SourceLine } from "./insights";
import { MarketShare, PriceBands } from "./market";
import { FulfillmentSection } from "./sections";
import { Eyebrow, GhostBtn, Note, Stat } from "./ui";

type R = ReturnType<typeof computeAll>;
const short = (n: number): string => n < 0 ? `-${short(-n)}` : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${Math.round(n / 1e3)}K` : usd(n);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const monthLabel = (m: number | null) => (m ? `Month ${m}` : `After month ${PLAN_MONTHS}`);
export const scenarioOf = (r: R, key: "pace" | "minimum" = "pace") => r.scenarios.find((s) => s.key === key);

export function Collapse({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="space-y-4">
    <GhostBtn type="button" className="no-print h-9 text-sm" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
      {label} <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
    </GhostBtn>
    <div className={cn("collapse-body", open ? "block" : "hidden", "print:block")}>{children}</div>
  </div>;
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <section className="story-section space-y-6 border-t border-border pt-10">
    <div><Eyebrow>{eyebrow}</Eyebrow><h2 className="mt-2 text-3xl">{title}</h2></div>
    {children}
  </section>;
}

export function ProfitChart({ r }: { r: R }) {
  const [key, setKey] = useState<"pace" | "minimum">("pace");
  const gradientId = `profitTone${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const s = scenarioOf(r, key) ?? r.scenarios[0];
  if (!s) return null;
  const label = `${s.label ?? "Plan"}, ${num(s.samples)} samples a month`;
  const options = r.scenarios.filter((x, i, all) => x.key === "pace" || x.samples !== all[0]?.samples);
  const data = s.rows.map((row) => ({ month: `M${row.month}`, gmv: Math.round(row.gmv), profit: Math.round(row.net), cum: Math.round(row.cumNet) }));
  if (!r.profitAvailable) return <div className="bento space-y-4 p-5"><div className="eyebrow">Monthly GMV, {label}</div><div className="h-80"><ResponsiveContainer><ComposedChart data={data}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="month" /><YAxis tickFormatter={(v) => short(Number(v))} /><Tooltip formatter={(v: number) => usd(v)} /><Bar dataKey="gmv" fill="var(--navy)" isAnimationActive={false} /></ComposedChart></ResponsiveContainer></div><Note>Add your product cost to see profit.</Note></div>;
  const max = Math.max(...data.map((d) => d.profit)), min = Math.min(...data.map((d) => d.profit));
  const offset = max <= 0 ? 0 : min >= 0 ? 1 : max / (max - min);
  return <div className="bento space-y-4 p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="eyebrow">Monthly GMV and profit, {label}</div>
      <div className="no-print flex gap-1" role="group" aria-label="Scenario">
        {options.length > 1 && options.map((x) => <button key={x.key} type="button" aria-pressed={key === x.key} onClick={() => setKey(x.key)}
          className={cn("rounded-full border px-3 py-1 text-xs font-semibold", key === x.key ? "border-navy bg-navy text-primary-foreground" : "border-border text-navy")}>{x.label}</button>)}
      </div>
    </div>
    <div className="h-80">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 28, right: 12, left: 0, bottom: 0 }}>
          <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset={offset} stopColor="var(--growth)" /><stop offset={offset} stopColor="var(--gold)" /></linearGradient></defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => short(Number(v))} tick={{ fontSize: 12 }} width={56} />
          <Tooltip formatter={(v: number, n: string) => [usd(v), n === "gmv" ? "GMV" : n === "profit" ? "Monthly profit" : "Cumulative profit"]} />
          <ReferenceLine y={0} stroke="var(--navy)" />
          {s.profitableMonth && <ReferenceLine x={`M${s.profitableMonth}`} stroke="var(--growth)" strokeDasharray="3 3" label={{ value: `Profitable month: Month ${s.profitableMonth}`, position: "top", fill: "var(--navy)", fontSize: 11 }} />}
          {s.breakEvenMonth && <ReferenceLine x={`M${s.breakEvenMonth}`} stroke="var(--signal)" strokeDasharray="3 3" label={{ value: `Investment paid back: Month ${s.breakEvenMonth}`, position: "insideTopRight", fill: "var(--navy)", fontSize: 11 }} />}
          <Bar dataKey="gmv" fill="var(--navy)" barSize={22} isAnimationActive={false} />
          <Line dataKey="profit" stroke={`url(#${gradientId})`} strokeWidth={3} dot={false} isAnimationActive={false} />
          <Line dataKey="cum" stroke="var(--signal)" strokeDasharray="6 4" strokeWidth={2} dot={false} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-caption">
      <span><span className="mr-1 inline-block h-2 w-3 bg-navy" />Monthly GMV</span>
      <span><span className="mr-1 inline-block h-0.5 w-3 bg-growth align-middle" />Monthly profit (orange when negative)</span>
      <span><span className="mr-1 inline-block h-0.5 w-3 bg-signal align-middle" />Cumulative profit</span>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 text-sm">
      <div className="font-semibold text-navy">Profitable month: {monthLabel(s.profitableMonth)}</div>
      <div className="font-semibold text-navy">Investment paid back: {monthLabel(s.breakEvenMonth)}</div>
    </div>
    <Collapse label="See month by month">
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm">
        <thead><tr className="text-left text-caption">{["Month", "Samples", "New videos", "Videos live", "Active affiliates", "GMV per video", "GMV", "Sample cost", "Total costs", "Monthly profit", "Cumulative profit"].map((h) => <th key={h} className="py-2 pr-3">{h}</th>)}</tr></thead>
        <tbody>{s.rows.map((row) => <tr key={row.month} className="border-t border-border">
          <td className="py-1.5">{row.month}</td><td>{num(row.samples)}</td><td>{num(row.newVideos)}</td><td>{num(row.cumVideos)}</td><td>{num(row.affiliates)}</td><td>{usd(row.gmvPerVideo)}{row.capped ? " *" : ""}</td>
          <td className="font-semibold text-navy">{usd(row.gmv)}</td><td>{usd(row.sampleCost)}</td><td>{usd(row.programCost)}</td><td>{usd(row.net)}</td><td>{usd(row.cumNet)}</td>
        </tr>)}</tbody>
      </table></div>
    </Collapse>
    <p className="text-xs text-caption">GMV = videos live x GMV per video{s.rows.some((x) => x.capped) ? ". * held at the launch guardrail" : ""}. Total costs = Sophie fee, samples and ads. Sophie's revenue share applies only above $100K GMV/month and is not included here.</p>
  </div>;
}

export function Story({ r, k, answers, brand, products, marketOnly = false, popup = false, earlyCta = false }: {
  r: R; k: MarketData | null; answers: Answers; brand: string; products: Product[]; marketOnly?: boolean; popup?: boolean; earlyCta?: boolean;
}) {
  const name = brand || "Your brand";
  const price = answers.marketPrice ?? products[0]?.price;
  const o = opportunitySignals(k, answers, price || undefined);
  const base = scenarioOf(r);
  const rows = base?.rows ?? [];
  const m12 = rows[PLAN_MONTHS - 1];
  const a = r.assumptions, d = r.insights, mk = d.market;
  const keyword = cap(k?.keywordInfo?.[0]?.used ?? products[0]?.keywords?.[0] ?? "This category");
  const commission = Math.round(a.affiliatePct);
  const creators = d.creators.leader ? `${d.creators.leader} followers` : "creators selling comparable products";
  const hasPlan = !marketOnly && d.hasData && !!base;
  const fbtCheapest = r.fulfillment.filter((f) => f.cheapest === "fbt").length;
  const rec = fbtCheapest >= r.fulfillment.length / 2
    ? "FBT is the cheapest option for most of your hero products and adds the FBT badge. We recommend FBT."
    : `Your cheapest option is ${r.fulfillment[0]?.opts.find((x) => x.key === r.fulfillment[0]?.cheapest)?.label}. FBT can still be worth it for the badge and faster delivery.`;
  const signals = [
    { label: "Market size", word: o.size, text: `${short(o.gmv)} in 30-day GMV across the top competing products.` },
    { label: "Competition", word: o.competition, text: `The top 3 products hold ${pct(o.concentration)} of top-20 sales.` },
    { label: "Momentum", word: o.momentum, text: `Median revenue growth of the top products is ${pct(o.growth)}.` },
    { label: "Price fit", word: o.priceFit ?? "Unknown", text: o.priceFit ? `Your ${usd(price ?? 0, 2)} vs a typical ${usd(o.priceLow, 2)} to ${usd(o.priceHigh, 2)} band.` : "Add your price to see where you fit." },
  ];
  const playbook = [
    { label: "Commission paid", value: mk.commission === null ? "n/a" : pct(mk.commission) },
    { label: "Active affiliates", value: mk.affiliates === null ? "n/a" : num(mk.affiliates) },
    { label: "New videos per month", value: mk.newVideos === null ? "n/a" : num(mk.newVideos) },
    { label: "Sales from videos / lives", value: `${mk.videoShare === null ? "n/a" : pct(mk.videoShare)} / ${mk.liveShare === null ? "n/a" : pct(mk.liveShare)}` },
    { label: "Top videos running as ads", value: d.ads.adsShare === null ? "n/a" : pct(d.ads.adsShare), sub: d.ads.roas === null ? "ROAS n/a" : `${d.ads.roas.toFixed(2)}x ROAS, Kalodata estimate` },
    { label: "Creator sweet spot", value: d.creators.leader ? `${d.creators.leader}` : "n/a", sub: "Followers" },
  ];
  return <div className="story space-y-12">
    <section className="story-section rounded-lg bg-navy p-6 text-primary-foreground sm:p-10">
      <div className="eyebrow text-primary-foreground/70">{marketOnly ? "Market summary" : "Summary"}</div>
      <p className="mt-3 text-2xl font-semibold leading-snug sm:text-3xl">
        {keyword} is a {short(o.gmv)}/month market on TikTok Shop, and creator videos drive {pct(o.videoShare)} of it.
        {hasPlan && m12 ? ` ${name} can realistically reach ${short(m12.gmv)}/month by month 12.` : ""}
      </p>
      <div className={cn("mt-8 grid gap-6", hasPlan ? "sm:grid-cols-3" : "sm:grid-cols-1")}>
        <div><div className="text-sm text-primary-foreground/70">Market size, 30 days</div><div className="text-4xl font-bold">{short(o.gmv)}</div></div>
        {hasPlan && <><div><div className="text-sm text-primary-foreground/70">Your month-12 GMV ({base?.label ?? "plan"})</div><div className="text-4xl font-bold">{short(m12?.gmv ?? 0)}</div></div>
          <div><div className="text-sm text-primary-foreground/70">Profitable from</div><div className="text-4xl font-bold">{monthLabel(base?.profitableMonth ?? null)}</div></div></>}
      </div>
      {hasPlan && <p className="mt-6 border-t border-primary-foreground/20 pt-4">Launch with {commission}% commission and {num(a.samplesPerMonth)} samples a month, start ads in month {a.adStartMonth}.</p>}
    </section>
    {earlyCta && <BookCall />}

    <Section eyebrow="The opportunity" title="Why now">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {signals.map((x) => <div key={x.label} className="bento space-y-2 p-5"><div className="eyebrow">{x.label}</div><div className="text-2xl font-bold text-navy">{x.word}</div><p className="text-sm">{x.text}</p></div>)}
      </div>
      <MarketShare k={k} answers={answers} />
      <PriceBands k={k} answers={answers} title="Where you fit" />
    </Section>

    <Section eyebrow="The playbook" title="What the winners do">
      {d.hasData ? <>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{playbook.map((x) => <Stat key={x.label} label={x.label} value={x.value} sub={x.sub ?? "Median of selected competitors"} />)}</div>
        <MarketInsights k={k} answers={answers} parts={["videos"]} />
        <Collapse label="See full comparison"><MarketInsights k={k} answers={answers} parts={["benchmark", "creators", "ads"]} /></Collapse>
      </> : <Note>Not enough market data for this keyword. Try a broader keyword.</Note>}
    </Section>

    {hasPlan && base && <>
      <Section eyebrow="Your plan" title="Three phases to month 12">
        <div className="grid gap-4 lg:grid-cols-3">
          <Phase n={1} name="Launch" months="Months 1-2" items={[`Set commission at ${commission}%${r.adjusted ? " (team adjusted)" : " (market median)"}.`, `Send ${num(a.samplesPerMonth)} samples a month.`, `Target creators with ${creators}.`]} goal={`${num(rows[1]?.cumVideos ?? 0)} videos live and first sales.`} />
          <Phase n={2} name="Build" months="Months 3-6" items={[`Keep ${num(a.samplesPerMonth)} samples a month.`, "Run a monthly creator challenge.", `Start GMV Max at ${usd(a.adDaily)}/day targeting ${a.roas ? `${a.roas.toFixed(1)}x` : "market"} ROAS.`]} goal={`${num(rows[5]?.affiliates ?? 0)} active affiliates and ${usd(rows[5]?.gmv ?? 0)} GMV/month by month 6.`} />
          <Phase n={3} name="Scale" months="Months 7-12" items={["Scale winning creators and videos with Spark codes.", "Add lives with top creators.", "Add products to the shop."]} goal={`${usd(m12?.gmv ?? 0)} GMV/month by month 12.`} />
        </div>
        {r.adjusted && <Note>Adjusted by Sophie team</Note>}
      </Section>

      <Section eyebrow="Your numbers" title="GMV and profitability">
        <ProfitChart r={r} />
        {r.profitAvailable && <><div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Total investment until payback" value={usd(base.maxInvestment)} sub="Deepest point of cumulative profit" tone="dark" />
          <Stat label="Profitable month" value={monthLabel(base.profitableMonth)} />
          <Stat label="Month-12 monthly profit" value={usd(m12?.net ?? 0)} tone={(m12?.net ?? 0) > 0 ? "good" : "neutral"} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="Profit per order" value={usd(r.econ.avgContribFloor, 2)} sub={`Average, at ${a.adsFloorPct}% ads`} />
          <Stat label="Margin after TikTok costs" value={pct(r.econ.avgMarginFloor)} />
        </div></>}
        <Note>{rec}</Note>
        <Collapse label="See fulfillment comparison"><FulfillmentSection r={r} products={products} /></Collapse>
      </Section>

      <Section eyebrow="What we need from you" title="Your commitments">
        <ul className="space-y-3">
          {[`${num(a.samplesPerMonth)} samples a month for at least 3 months, about ${usd(r.econ.monthlySampleCost)}/month in product and shipping.`, "Inventory sent to FBT.", `Ad budget of ${usd(a.adDaily)}/day from month ${a.adStartMonth}.`, `Affiliate commission at ${commission}%.`].map((t) =>
            <li key={t} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-signal" /><span>{t}</span></li>)}
        </ul>
      </Section>
    </>}

    <section className="story-section space-y-4">
      <BookCall popup={popup} />
    </section>
    <p className="text-xs text-caption">Market data: Kalodata, TikTok Shop US, last 30 days. Projections are estimates based on competitor benchmarks, not guarantees.</p>
    <SourceLine />
  </div>;
}

function Phase({ n, name, months, items, goal }: { n: number; name: string; months: string; items: string[]; goal: string }) {
  return <div className="bento flex flex-col gap-3 p-5">
    <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-sm font-bold text-primary-foreground">{n}</span><div><div className="font-semibold text-navy">Phase {n}, {name}</div><div className="text-xs text-caption">{months}</div></div></div>
    <ul className="list-disc space-y-1 pl-5 text-sm">{items.map((i) => <li key={i}>{i}</li>)}</ul>
    <p className="mt-auto border-t border-border pt-3 text-sm"><span className="font-semibold text-navy">Goal:</span> {goal}</p>
  </div>;
}
