/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarCheck, ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { computeAll, num, usd, type Answers, type MarketData } from "@/lib/calc";
import { buildDeck, sharePct, short, signed, type Deck } from "@/lib/deck";
import { cn } from "@/lib/utils";
import { ProfitChart } from "./story";
import { PrimaryBtn } from "./ui";

type R = ReturnType<typeof computeAll>;
const BOOKING_URL = "https://calendly.com/pablo-sophiesociety/30min";
const watchUrl = (v: any) => `https://www.tiktok.com/@${encodeURIComponent(v.belonged_creator_handle ?? "")}/video/${encodeURIComponent(String(v.video_id))}`;
const monthLabel = (m: number | null | undefined) => (m ? `Month ${m}` : "After month 12");

type Tile = { value: string; label: string; sub?: string } | null | false | undefined | 0 | "";
function Tiles({ items, dark }: { items: Tile[]; dark?: boolean }) {
  const list = items.filter(Boolean) as { value: string; label: string; sub?: string }[];
  if (!list.length) return null;
  return <div className={cn("grid gap-4", list.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : list.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
    {list.map((t) => <div key={t.label} className={cn("rounded-xl border p-5", dark ? "border-primary-foreground/20" : "border-border bg-card")}>
      <div className={cn("text-3xl font-bold tracking-tight sm:text-4xl", dark ? "text-primary-foreground" : "text-navy")}>{t.value}</div>
      <div className={cn("mt-2 text-sm font-semibold", dark ? "text-primary-foreground" : "text-navy")}>{t.label}</div>
      {t.sub && <div className={cn("mt-1 text-sm", dark ? "text-primary-foreground/70" : "text-caption")}>{t.sub}</div>}
    </div>)}
  </div>;
}

export type SlideDef = { key: string; eyebrow: string; title: string; dark?: boolean; source?: string | undefined; notes?: string[]; body: ReactNode };

function Footer({ n, dark }: { n: number; dark?: boolean | undefined }) {
  return <div className={cn("mt-auto flex items-center justify-between pt-6 text-sm font-semibold", dark ? "text-primary-foreground/70" : "text-caption")}>
    <span>{String(n).padStart(2, "0")} | <span aria-hidden>▲ ■ ●</span></span><span>Sophie Society</span>
  </div>;
}

function SlideView({ s, n, team, present }: { s: SlideDef; n: number; team: boolean; present?: boolean }) {
  return <div className={cn("deck-slide", present && "h-full")}>
    <section className={cn("slide flex flex-col rounded-2xl p-6 sm:p-10", s.dark ? "bg-navy text-primary-foreground" : "border border-border bg-card", present && "h-full overflow-y-auto rounded-none border-0")}>
      <div className={cn("eyebrow", s.dark && "text-primary-foreground/70")}>{s.eyebrow}</div>
      {n === 1 ? <h1 className={cn("mt-3 max-w-4xl text-4xl leading-tight sm:text-6xl", s.dark && "text-primary-foreground")}>{s.title}</h1>
        : <h2 className={cn("mt-3 max-w-4xl text-3xl leading-tight sm:text-5xl", s.dark && "text-primary-foreground")}>{s.title}</h2>}
      <div className="mt-8 space-y-6">{s.body}</div>
      {s.source && <p className={cn("mt-6 text-xs", s.dark ? "text-primary-foreground/60" : "text-caption")}>{s.source}</p>}
      <Footer n={n} dark={s.dark} />
    </section>
    {team && !present && !!s.notes?.length && <div className="no-print mt-3 rounded-xl border border-dashed border-navy bg-cloud p-4 text-sm">
      <div className="eyebrow">Notes for the team</div>
      <ul className="mt-2 list-disc space-y-1 pl-5">{s.notes.map((x) => <li key={x}>{x}</li>)}</ul>
    </div>}
  </div>;
}

function Table({ head, rows, highlight }: { head: string[]; rows: ReactNode[][]; highlight?: number[] }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
    <thead><tr className="border-b border-border text-left">{head.map((h) => <th key={h} className="eyebrow px-3 py-2">{h}</th>)}</tr></thead>
    <tbody>{rows.map((r, i) => <tr key={i} className={cn("border-b border-border", highlight?.includes(i) && "bg-growth/15 font-semibold")}>{r.map((c, j) => <td key={j} className="px-3 py-2">{c}</td>)}</tr>)}</tbody>
  </table></div>;
}

const Body = ({ children }: { children: ReactNode }) => <p className="max-w-3xl text-lg">{children}</p>;

export function buildSlides(D: Deck, r: R, opts: { hidePricing: boolean }): SlideDef[] {
  const { brand, optimize, cat, a } = D;
  const S: SlideDef[] = [];
  const date = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const shelfName = cat?.name ?? "this shelf";
  const peer = D.peer, base = D.base;

  S.push({ key: "cover", dark: true, eyebrow: `Prepared for ${brand} · ${date}`, title: `${brand} on TikTok Shop. The plan.`,
    body: <p className="max-w-3xl text-xl text-primary-foreground/80">{optimize ? `How ${brand} turns its TikTok Shop into a real second channel.` : `How ${brand} builds a second sales channel next to ${D.sellsAmazon ? "Amazon" : "its current channels"} on a shelf that is ${cat?.growth90 !== null && cat?.growth90 !== undefined && cat.growth90 < 0 ? "already large" : "growing"}.`}</p>,
    notes: ["Open with the partner's goal. This deck is built from live TikTok Shop data pulled for their competitors."] });

  if (cat || D.niche > 0) {
    const shelf = D.niche;
    const tiles: Tile[] = [
      { value: short(shelf), label: "Direct niche monthly sales", sub: cat ? `Part of the ${short(cat.revenue)} ${shelfName} category.` : "All direct products found, last 30 days." },
      cat?.growth90 !== null && cat?.growth90 !== undefined && { value: signed(cat.growth90), label: "Growth, 90 days", sub: cat.parentGrowth90 !== null ? `${cat.parentName} overall: ${signed(cat.parentGrowth90)}.` : "Versus the prior 90 days." },
      cat && cat.shops > 0 && { value: num(cat.shops), label: "Shops selling", sub: `${num(cat.activeProducts)} active products compete for the shelf.` },
      cat?.avgOrder && { value: usd(cat.avgOrder, 2), label: "Average order", sub: D.price && Math.abs(D.price - cat.avgOrder) / cat.avgOrder <= 0.2 ? `Right where ${brand}'s price sits.` : D.price ? `${brand} sells at ${usd(D.price, 2)}.` : "Category sales divided by units." },
      { value: D.ownGmv > 0 ? short(D.ownGmv) : "$0", label: `${brand} today`, sub: D.ownGmv > 0 ? `${sharePct(D.ownShare)} of the shelf${D.ownGmv90 ? `, ${short(D.ownGmv90)} over 90 days` : ""}.` : "No TikTok Shop sales yet." },
    ];
    S.push({ key: "opportunity", eyebrow: optimize ? `Where ${brand} stands` : "The opportunity",
      title: optimize ? `A ${short(shelf)} shelf. ${brand} holds ${sharePct(D.ownShare)} of it.` : `A ${short(shelf)} a month shelf. ${brand} is not on it yet.`,
      body: <Tiles items={tiles} />, source: `${D.source(30)} 90-day figures: ${D.source(90).replace("Source: ", "")}`,
      notes: [cat ? `Niche = all direct products discovered. Category "${cat.name}" is context only.` : "Niche = all direct products discovered.", "Average order = category revenue divided by units sold, 30 days.", "Talking point: the shelf exists already. The question is who captures it."] });
  }

  if (cat || D.products.length) {
    const video = cat?.video ?? D.creators.videoShare ?? 0, live = D.liveShare ?? 0;
    const leadWord = D.lead === "video" ? "Creators sell this shelf, through video." : D.lead === "live" ? "Creators sell this shelf, through lives." : "Shoppers find this shelf in the shop tab.";
    S.push({ key: "how", eyebrow: "How the category sells", title: leadWord,
      body: <>
        <Tiles items={[
          { value: sharePct(video), label: "Sales from shoppable video", sub: "Share of category revenue." },
          cat && { value: sharePct(cat.affiliate), label: "Sales from affiliate creators", sub: "Paid on commission, only when they sell." },
          { value: sharePct(live), label: "Live share", sub: D.openLive ? "Open lane. Few brands go live here." : "Lives are an established channel." },
          optimize && D.ownVideos > 0 && D.peerVideos > 0 && { value: `${Math.max(1, Math.round(D.peerVideos / D.ownVideos))}x`, label: "Content gap", sub: `${num(D.ownVideos)} ${brand} videos vs ${num(D.peerVideos)} for a typical peer.` },
          optimize && D.ownCommission > 0 && { value: `${Math.round(D.ownCommission)}%`, label: `${brand} commission`, sub: `Peers pay ${D.commission}%.` },
        ]} />
        <Body>Shoppers find {cat?.name.toLowerCase() ?? "this product"} in a creator's video, not in search. That is exactly the engine we run: seed creators with product, pay them on the sales they drive, and scale what works.</Body>
      </>, source: D.source(30), notes: ["Channel split from category/detail: video, live and shop tab revenue over total.", "Affiliate share = affiliate_revenue / revenue.", "Live under 15% is flagged as an open lane."] });
  }

  if (D.products.length) {
    const highlight = optimize ? D.products.length : -1;
    const rows = D.products.map((p) => [<span className="flex items-center gap-2">{p.image && <img src={p.image} alt="" className="h-9 w-9 rounded object-cover" />}{p.name}</span>, short(p.gmv), p.growth !== null ? signed(p.growth) : "", p.price ? usd(p.price, 2) : "", p.affiliates !== null ? num(p.affiliates) : "", p.videos !== null ? num(p.videos) : "", p.commission !== null ? `${Math.round(p.commission)}%` : ""]);
    const ownRows = optimize ? D.own.map((p) => [`${brand}: ${String(p.product.product_name ?? "").split(" ").slice(0, 4).join(" ")}`, short(p.gmv ?? 0), "", p.price ? usd(p.price, 2) : "", p.affiliates !== null ? num(p.affiliates) : "", p.videos !== null ? num(p.videos) : "", p.commission !== null ? `${Math.round(p.commission)}%` : ""]) : [];
    const byVideos = [...D.products].sort((x, y) => (y.videos ?? 0) - (x.videos ?? 0));
    const contentWins = byVideos[0] && D.leader && byVideos[0] === D.leader;
    S.push({ key: "niche", eyebrow: "The niche, product vs product", title: contentWins ? "Content volume beats shelf size." : "Sales follow creators and content.",
      body: <>
        <Table head={["Product", "30d GMV", "Growth", "Price", "Creators", "Videos", "Commission"]} rows={[...rows, ...ownRows]} highlight={ownRows.map((_, i) => highlight + i)} />
        <Body>Top 3 products hold {sharePct(D.top10Share)} of the niche. {D.competition === "Open" ? "Room is open for a new name." : D.competition === "Moderate" ? "Leaders exist, but there is room for a new name." : "A few names lead, so a new brand needs a sharp angle."}</Body>
      </>, source: D.source(30), notes: ["Products are the competitors the partner confirmed.", "Niche = all direct products discovered, 30 days.", `Competition: Open under 50% top-3 share, Concentrated above 70%.`] });
  }

  if (peer) {
    S.push({ key: "proof", eyebrow: "The proof point", title: `A ${peer.name} already does ${short(peer.gmv)} a month.`,
      body: <>
        <Tiles items={[
          { value: short(peer.gmv), label: "30-day GMV", sub: `${sharePct(D.peerShare)} of the niche.` },
          peer.affiliates !== null && { value: num(peer.affiliates), label: "Creators", sub: "Selling it in the last 30 days." },
          peer.videos !== null && { value: num(peer.videos), label: "Videos in 30 days", sub: "With views and sales attached." },
          peer.gmv90 && { value: short(peer.gmv90), label: "GMV, 90 days", sub: peer.growth !== null ? `${signed(peer.growth)} growth, 30 days.` : "Last 90 days." },
        ]} />
        {(peer.videoShare ?? 0) + (peer.liveShare ?? 0) > 60 && <Body>Built almost entirely on affiliate creators.</Body>}
      </>, source: D.source(30), notes: ["Peer = smallest selected product still above $20K a month, otherwise the median product.", "Use it to show a realistic, not heroic, target."] });
  }

  if (D.topVideo) {
    const v = D.topVideo;
    const smallWins = D.smallPerK !== null && D.largePerK !== null && D.smallPerK > D.largePerK;
    S.push({ key: "content", eyebrow: "The content formula", title: optimize && D.ownPerVideo && D.peerPerVideo ? (D.ownPerVideo >= D.peerPerVideo ? `${usd(D.ownPerVideo)} per video, ${(D.ownPerVideo / D.peerPerVideo).toFixed(1)}x rivals.` : `${usd(D.ownPerVideo)} per video. Rivals make ${usd(D.peerPerVideo)}.`) : smallWins ? "Small creators sell this product best." : D.creators.leader ? `Creators with ${D.creators.leader} followers sell the most.` : "A few videos carry the sales.",
      body: <>
        <Tiles items={[
          { value: short(Number(v.revenue) || 0), label: "The #1 video", sub: `@${v.belonged_creator_handle}, ${num(Number(v.views) || 0)} views${D.topFollowers !== null ? `, ${num(D.topFollowers)} followers` : ""}.` },
          D.smallPerK !== null && { value: usd(D.smallPerK, 2), label: "GMV per 1,000 views, small creators", sub: D.largePerK !== null ? `Under 50K followers. Large creators: ${usd(D.largePerK, 2)}.` : "Under 50K followers." },
          D.creators.leader && { value: D.creators.leader, label: "Follower sweet spot", sub: "Bucket with the most creator revenue." },
          optimize && D.ownPerVideo && D.peerPerVideo && { value: usd(D.ownPerVideo), label: `${brand} revenue per video`, sub: D.ownPerVideo > D.peerPerVideo ? "The product converts, it lacks distribution." : `Peers: ${usd(D.peerPerVideo)}.` },
        ]} />
        <ol className="grid gap-2 text-sm sm:grid-cols-2">{D.topVideos.map((x: any, i: number) => <li key={x.video_id} className="flex items-center justify-between gap-3 border-b border-border py-2">
          <span><span className="font-semibold text-navy">{i + 1}. @{x.belonged_creator_handle}</span> · {short(Number(x.revenue) || 0)} · {num(Number(x.views) || 0)} views</span>
          <a href={watchUrl(x)} target="_blank" rel="noreferrer" className="no-print inline-flex items-center gap-1 font-semibold text-signal"><Play className="h-4 w-4" />Watch</a>
        </li>)}</ol>
      </>, source: D.source(30), notes: ["Top videos come from video/rank, top 100 by revenue per selected product.", "GMV per 1,000 views = revenue / views x 1,000, split by creator followers from creator/rank.", "Talking point: we brief creators on the hooks of the top 3 videos."] });
  }

  if (D.zone) {
    const z = D.zone;
    S.push({ key: "fit", eyebrow: "Product fit", title: D.priceWhere === "above" ? "Price sits above the value zone." : D.priceWhere === "below" ? "Price sits below the value zone." : "The catalog fits, as it is today.",
      body: <Tiles items={[
        { value: sharePct(z.share), label: `Units sold at $${z.lo} to $${z.hi}`, sub: "The densest $10 price range." },
        D.price && { value: usd(D.price, 2), label: `${brand}'s price`, sub: D.priceWhere === "inside" ? "Inside the value zone." : D.priceWhere === "above" ? "Above the zone. A bundle or entry SKU helps." : "Below the zone. Room for bundles." },
        D.bundles.length > 0 && { value: sharePct(D.bundleShare), label: "Bundle opportunity", sub: `${D.bundles.length} multi-SKU or premium products sell in this niche.` },
      ]} />, source: D.source(30), notes: ["Units from the top 20 keyword products, bucketed in $5 bands.", "Bundle = sku_count above 1 or price above 2x the median."] });
  }

  if (optimize && D.blockers.length) {
    S.push({ key: "diagnosis", eyebrow: "Diagnosis", title: `${["One thing holds", "Two things hold", "Three things hold", "Four things hold", "Five things hold"][D.blockers.length - 1]} it back. ${D.blockers.length === 1 ? "It is" : `All ${["", "", "two", "three", "four", "five"][D.blockers.length]} are`} fixable.`,
      body: <Table head={["Blocker", "Today", "The fix"]} rows={D.blockers.map((b) => [<span className="font-semibold text-navy">{b.blocker}</span>, b.today, b.fix])} />,
      source: D.source(30), notes: ["Gaps vs the median of selected competitors."] });
  }

  if (base) {
    const hooks = D.topVideos.map((v: any) => v.displayTitle).filter((h): h is string => !!h).slice(0, 3);
    const cards = [
      { t: optimize ? "Shop audit" : "Shop launch", d: optimize ? "Fix listings, price ladder and probation status. Get the shop ready to scale." : "Set up the shop, listings and FBT stock so creators can sell from day one." },
      { t: "Affiliate engine", d: `${D.commission}% commission, ${num(a.samplesPerMonth)} samples a month, focused on creators with ${D.creators.leader ?? "comparable"} followers.` },
      { t: "Content system", d: hooks.length ? `Hooks from the top videos: ${hooks.map((h) => `"${h.slice(0, 50)}"`).join(", ")}.` : "Briefs built from the best-selling videos in the niche." },
      { t: "Lives and ads", d: `${D.openLive ? "Lives as an open lane. " : ""}GMV Max from month ${a.adStartMonth} at ${usd(a.adDaily)} a day.` },
    ];
    S.push({ key: "workstreams", eyebrow: "The plan", title: "Four workstreams, run by one team.",
      body: <div className="grid gap-4 sm:grid-cols-2">{cards.map((c, i) => <div key={c.t} className="rounded-xl border border-border p-5"><div className="text-3xl font-bold text-signal">{String(i + 1).padStart(2, "0")}</div><div className="mt-2 text-lg font-semibold text-navy">{c.t}</div><p className="mt-1 text-sm">{c.d}</p></div>)}</div>,
      notes: ["Commission = median of selected competitors, minimum 10%.", "Samples = 25% of median active affiliates spread over 6 months at a 40% post rate, minimum 150.", r.adjusted ? "Assumptions adjusted by Sophie team." : "No team overrides."] });

    const rows = base.rows;
    const months = [
      ["M1", optimize ? "Set up" : "Launch", `Shop and listings live. First ${num(a.samplesPerMonth)} samples out.`],
      ["M2", "Seed", `${num(rows[1]?.affiliates ?? 0)} videos live target. Learn which hooks sell.`],
      ["M3", "Signal", `GMV Max starts at ${usd(a.adDaily)} a day. About ${short(rows[2]?.gmv ?? 0)} GMV.`],
      ["M4", "Scale", `Push winning creators. About ${short(rows[3]?.gmv ?? 0)} GMV.`],
      ["M5", optimize ? "Compound" : "Expand", `Add lives and products. About ${short(rows[4]?.gmv ?? 0)} GMV.`],
      ["M6", "Optimize", `${num(rows[5]?.affiliates ?? 0)} cumulative videos. About ${short(rows[5]?.gmv ?? 0)} GMV.`],
    ];
    S.push({ key: "months", eyebrow: "Month by month", title: "Launch, prove, then scale.",
      body: <>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">{months.map(([m, t, d]) => <div key={m} className="rounded-xl border border-border p-4"><div className="text-sm font-bold text-signal">{m}</div><div className="font-semibold text-navy">{t}</div><p className="mt-1 text-sm">{d}</p></div>)}</div>
        <p className="text-sm text-caption">A new shop starts with limits on creator outreach. Months 1 and 2 build the content base; sales follow video volume, usually from month 3.</p>
      </>, notes: ["GMV uses robust affiliate-video benchmarks, a new-shop ramp, 35% monthly decay, ads only after 100 live videos, and GMV guardrails."] });

    const data = rows.slice(0, 6).map((x, i) => ({ month: `M${x.month}`, Target: Math.round(x.gmv), Conservative: Math.round(D.cons?.rows[i]?.gmv ?? 0) }));
    S.push({ key: "six", eyebrow: "First 6 months, planning model", title: "What the first 6 months can look like.",
      body: <>
        <div className="h-72"><ResponsiveContainer><BarChart data={data}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="month" /><YAxis tickFormatter={(v) => short(Number(v))} width={60} /><Tooltip formatter={(v: number) => usd(v)} /><Legend /><Bar dataKey="Target" fill="var(--navy)" isAnimationActive={false} /><Bar dataKey="Conservative" fill="var(--signal)" isAnimationActive={false} /></BarChart></ResponsiveContainer></div>
        <Tiles items={[
          { value: `${short(D.sixCons)} to ${short(D.sixTarget)}`, label: "GMV, first 6 months", sub: "Conservative to target." },
          { value: short(D.m6), label: "Monthly run rate by month 6", sub: "Target scenario." },
          D.niche > 0 && { value: sharePct(D.m6Share), label: "Share of the niche by month 6", sub: peer ? `The proof point holds ${sharePct(D.peerShare)}.` : "Of top 20 product GMV." },
        ]} />
        <p className="text-xs text-caption">Planning model, not a guarantee. Assumes at least {num(a.samplesPerMonth)} samples a month, {D.commission}% commission and ads from month {a.adStartMonth}.</p>
      </>, notes: ["Target = median of competitor trimmed-mean affiliate video revenue. Conservative uses median per-video revenue and is capped at half of Target."] });

    const m12 = rows[11];
    S.push({ key: "twelve", eyebrow: "12 months, GMV and profit", title: !r.profitAvailable ? "Add product costs to see profitability." : base.breakEvenMonth ? `The investment pays back in month ${base.breakEvenMonth}.` : base.profitableMonth ? `Profitable from month ${base.profitableMonth}.` : "Profit needs more than 12 months at these numbers.",
      body: <>
        <ProfitChart r={r} />
        {r.profitAvailable ? <Tiles items={[
          { value: usd(base.maxInvestment), label: "Total investment until payback", sub: "Deepest point of cumulative profit." },
          { value: monthLabel(base.profitableMonth), label: "Profitable month", sub: "First month with positive profit, never before month 3 for a launch." },
          m12 && { value: usd(m12.net), label: "Month-12 monthly profit", sub: "After fees, returns, samples and ads." },
        ]} /> : <Body>Add your product cost to see profit. GMV remains an estimate based on competitor benchmarks.</Body>}
      </>, notes: ["Monthly profit = GMV x margin after referral, commission, COGS and fulfillment, minus Sophie fee, samples and ad spend."] });
  }

  if (peer && D.niche > 0) {
    S.push({ key: "beyond", eyebrow: "Beyond month 6", title: "Where this can go once the engine runs.",
      body: <>
        <Table head={["Scenario", "Niche share", "Monthly GMV", "Per year"]} rows={D.tiers.map((t) => [<span><span className="font-semibold text-navy">{t.label}</span> · {t.note}</span>, sharePct(t.share), short(t.monthly), short(t.yearly)])} highlight={[1]} />
        {D.amazon && D.tiers[1] && <Tiles items={[{ value: sharePct(D.tiers[1].monthly / D.amazon * 100), label: `Target case vs ${brand}'s Amazon sales`, sub: `Using the ${short(D.amazon)} midpoint of the revenue range given.` }]} />}
      </>, source: D.source(30), notes: ["Conservative = half of the proof point's niche share. Base = proof point share. Upside = top product share."] });
  }

  if (D.mostVideos || peer) {
    const mv = D.mostVideos;
    S.push({ key: "samples", eyebrow: "Sample volume", title: `${num(a.samplesPerMonth)} samples a month is the floor, not the cap.`,
      body: <>
        <Body>Every sample is a shot at a video, and sales follow video volume.</Body>
        <Tiles items={[
          mv && mv.videos !== null && { value: num(mv.videos), label: `Videos in 30 days, ${mv.name}`, sub: `${short(mv.gmv)} GMV${mv.growth !== null ? `, ${signed(mv.growth)} growth` : ""}.` },
          peer && peer.videos !== null && { value: num(peer.videos), label: `Videos, ${peer.name}`, sub: `${peer.affiliates !== null ? num(peer.affiliates) : "Many"} creators behind it.` },
        ]} />
      </>, source: D.source(30), notes: ["Sample units cost COGS plus FBT fee."] });
  }

  if (base) {
    S.push({ key: "investment", eyebrow: "Investment", title: "What it takes from both sides.",
      body: <>
        <div className={cn("grid gap-4", !opts.hidePricing && "md:grid-cols-2")}>
          {!opts.hidePricing && <div className="rounded-xl bg-navy p-6 text-primary-foreground"><div className="eyebrow text-primary-foreground/70">Sophie Society</div><div className="mt-2 text-4xl font-bold">{usd(a.sophieFee)} per month</div>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm"><li>Full TikTok Shop management.</li><li>Revenue share only above $100K monthly GMV.</li><li>No minimum term, 6 months recommended.</li></ul></div>}
          <div className="rounded-xl border border-border p-6"><div className="eyebrow">{brand} provides</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><span className="font-semibold text-navy">Product for samples:</span> {num(a.samplesPerMonth)}+ units a month, no cap, about {usd(r.econ.monthlySampleCost)} a month.</li>
              <li><span className="font-semibold text-navy">Affiliate commission:</span> {D.commission}%, only on sales.</li>
              <li><span className="font-semibold text-navy">Ad budget from month {a.adStartMonth}:</span> {usd(a.adDaily)} a day.</li>
              <li><span className="font-semibold text-navy">Shop and stock:</span> FBT inventory.</li>
            </ul></div>
        </div>
        <p className="text-xs text-caption">TikTok Shop also charges a 6% referral fee on each sale.</p>
      </>, notes: ["Team can hide the Sophie fee with Hide pricing before presenting."] });
  }

  const growth = cat?.growth90 ?? null;
  const why = [
    growth !== null && (growth > 0 ? `${cat?.name} grew ${signed(growth)} over the last 90 days.` : `${cat?.name} already sells ${short(cat?.revenue ?? 0)} a month.`),
    D.openLive && `Lives drive only ${sharePct(D.liveShare ?? 0)} of sales. That lane is open.`,
    D.ownGmv > 0 ? `${brand} already has a shop and ${num(D.ownCreators)} creators. That is a head start.` : D.sellsAmazon ? `${brand} already proves demand on Amazon. TikTok Shop buyers check reviews there.` : D.competition !== "Concentrated" ? `Top 3 products hold ${sharePct(D.top10Share)}. No one owns the niche yet.` : null,
    D.q4Soon && "Q4 is close. Seeding creators now puts videos live for peak season.",
  ].filter(Boolean) as string[];
  S.push({ key: "now", eyebrow: "Why now, and how we start", title: growth !== null && growth > 0 ? "The shelf is growing. The first real brand wins." : "The shelf is here. The first real brand wins.",
    body: <div className="grid gap-6 md:grid-cols-2">
      <ul className="space-y-3">{why.slice(0, 3).map((x) => <li key={x} className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gold" /><span>{x}</span></li>)}</ul>
      <ol className="space-y-3">
        <li className="rounded-xl border border-border p-4"><span className="font-bold text-signal">01</span> 30-minute call with the TikTok Shop team.<div className="no-print mt-3"><PrimaryBtn onClick={() => window.open(BOOKING_URL, "_blank", "noopener,noreferrer")}><CalendarCheck className="h-5 w-5" /> Book a call</PrimaryBtn></div></li>
        <li className="rounded-xl border border-border p-4"><span className="font-bold text-signal">02</span> Hero SKUs and bundles, {optimize ? "shop access" : "shop setup"}.</li>
        <li className="rounded-xl border border-border p-4"><span className="font-bold text-signal">03</span> Launch week: first samples out.</li>
      </ol>
    </div>, source: cat ? D.source(90) : undefined, notes: ["Close on the call. Confirm hero SKUs and who owns shop access."] });

  S.push({ key: "closing", dark: true, eyebrow: "Sophie Society", title: D.sellsAmazon ? `${brand} already wins on Amazon. TikTok Shop is the next place it should.` : `${brand} already wins with its customers. TikTok Shop is the next place it should.`,
    body: <p className="text-lg text-primary-foreground/80">hello@sophiesociety.com · sophiesociety.com</p> });
  return S;
}

export function DeckView({ r, k, answers, brand, branch, price, team, hidePricing, presenting, onExit }: {
  r: R; k: MarketData | null; answers: Answers; brand: string; branch: string | null; price?: number | undefined; team: boolean; hidePricing: boolean; presenting: boolean; onExit: () => void;
}) {
  const D = buildDeck(r, k, answers, { brand, branch, price });
  const slides = buildSlides(D, r, { hidePricing });
  return <>
    <div className="deck space-y-10">{slides.map((s, i) => <SlideView key={s.key} s={s} n={i + 1} team={team} />)}</div>
    {presenting && <Presenter slides={slides} onExit={onExit} />}
  </>;
}

function Presenter({ slides, onExit }: { slides: SlideDef[]; onExit: () => void }) {
  const [i, setI] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const go = useCallback((d: number) => setI((x) => Math.max(0, Math.min(slides.length - 1, x + d))), [slides.length]);
  useEffect(() => {
    ref.current?.requestFullscreen?.().catch(() => undefined);
    const key = (e: KeyboardEvent) => {
      if (["ArrowRight", "ArrowDown", " ", "PageDown"].includes(e.key)) { e.preventDefault(); go(1); }
      if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); go(-1); }
      if (e.key === "Escape") onExit();
    };
    const fs = () => { if (!document.fullscreenElement) onExit(); };
    window.addEventListener("keydown", key);
    document.addEventListener("fullscreenchange", fs);
    return () => { window.removeEventListener("keydown", key); document.removeEventListener("fullscreenchange", fs); if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined); };
  }, [go, onExit]);
  const touch = useRef<number | null>(null);
  const s = slides[i];
  if (!s) return null;
  return <div ref={ref} className="no-print fixed inset-0 z-50 flex flex-col bg-navy" role="dialog" aria-label="Presentation"
    onTouchStart={(e) => { touch.current = e.touches[0]?.clientX ?? null; }}
    onTouchEnd={(e) => { const x = e.changedTouches[0]?.clientX; if (touch.current !== null && x !== undefined && Math.abs(x - touch.current) > 50) go(x < touch.current ? 1 : -1); touch.current = null; }}>
    <div className="flex-1 overflow-hidden bg-card" onClick={(e) => { if ((e.target as HTMLElement).closest("a,button")) return; go(e.clientX > window.innerWidth / 3 ? 1 : -1); }}>
      <div className="mx-auto h-full max-w-7xl"><SlideView s={s} n={i + 1} team={false} present /></div>
    </div>
    <div className="flex items-center justify-between px-4 py-2 text-sm text-primary-foreground">
      <button type="button" onClick={onExit} className="inline-flex items-center gap-1"><X className="h-4 w-4" /> Exit (Esc)</button>
      <span>{i + 1} / {slides.length}</span>
      <span className="flex gap-2"><button type="button" aria-label="Previous slide" onClick={() => go(-1)}><ChevronLeft className="h-5 w-5" /></button><button type="button" aria-label="Next slide" onClick={() => go(1)}><ChevronRight className="h-5 w-5" /></button></span>
    </div>
  </div>;
}
