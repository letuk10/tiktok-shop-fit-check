/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Story } from "@/components/fit/story";
import { DeckView } from "@/components/fit/deck";
import { BookCall } from "@/components/fit/book-call";
import { ScanProgress } from "@/components/fit/scan-progress";
import { TeamAdjustments } from "@/components/fit/team-adjustments";
import { Download, EyeOff, Loader2, Lock, Pencil, Presentation, Printer } from "lucide-react";
import { toast } from "sonner";
import { downloadDeckPdf } from "@/lib/deck-pdf";
import { selectedCompetitors, productKey, computeAll, NEXT_STEP, type MarketData } from "@/lib/calc";
import { enrichCategory, getSubmission, getTeamVerdict, runMarketScan } from "@/lib/fit.functions";
import { Eyebrow, GhostBtn, PrimaryBtn, TextInput, VerdictBadge } from "@/components/fit/ui";

export const Route = createFileRoute("/report/$id")({
  loader: async ({ params }) => {
    const row = await getSubmission({ data: { id: params.id } });
    if (!row) throw notFound();
    return row;
  },
  head: ({ loaderData }) => {
    const brand = (loaderData as any)?.brand_name;
    const title = brand ? `${brand} TikTok Shop Fit Report | Sophie Society` : "TikTok Shop Fit Report | Sophie Society";
    return {
      meta: [
        { title },
        { name: "description", content: "TikTok Shop market opportunity, competitor playbook and a 12-month plan with profitability." },
        { property: "og:title", content: title },
        { property: "og:description", content: "TikTok Shop market opportunity, competitor playbook and a 12-month plan with profitability." },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: Report,
});

const PASS_KEY = "sophie-team-pass";

function Report() {
  const row = Route.useLoaderData() as any;
  const { id } = Route.useParams();
  const [k, setK] = useState<MarketData | null>(row.kalodata ?? null);
  const marketOnly = row.answers?.interest === "no" || (row.answers?.flowVersion === 2 && (row.answers?.flowStep ?? 0) < 6);
  const [teamPass,setTeamPass]=useState("");
  const scan = useServerFn(runMarketScan);
  const [retrying, setRetrying] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [hidePricing, setHidePricing] = useState(false);
  const loadCategory = useServerFn(enrichCategory);
  const exitPresent = useCallback(() => setPresenting(false), []);
  const r = useMemo(
    () => computeAll({ branch: row.branch, answers: row.answers ?? {}, products: row.products ?? [], assumptions: row.assumptions ?? {}, kalodata: k }),
    [row, k],
  );
  const products = row.products?.length ? row.products : [];
  const answers = row.answers ?? {};
  const pending = selectedCompetitors(k, answers).some((p) => !k?.enriched?.[productKey(p)]?.attempted);
  const ownPending = (k?.ownProducts ?? []).some((p) => !k?.ownEnriched?.[productKey(p)]?.attempted);

  useEffect(() => {
    if (!k?.ok || pending || marketOnly || k.category?.attempted) return;
    loadCategory({ data: { id } }).then(setK).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k?.ok, pending, marketOnly, k?.category?.attempted]);

  async function retry() {
    setRetrying(true);
    try { setK(await scan({ data: { id } })); } finally { setRetrying(false); }
  }

  return (
    <div className="report-root mx-auto max-w-5xl space-y-12 px-5 pb-16">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <TeamToggle id={id} onUnlock={setTeamPass} />
        <div className="flex gap-2">
          <Link to="/fit/$id" params={{ id }}><GhostBtn><Pencil className="h-4 w-4" /> Edit answers</GhostBtn></Link>
          {!marketOnly && k?.ok && !pending && <GhostBtn onClick={() => setPresenting(true)}><Presentation className="h-4 w-4" /> Present</GhostBtn>}
          {teamPass && !marketOnly && <GhostBtn aria-pressed={hidePricing} onClick={() => setHidePricing((h) => !h)}><EyeOff className="h-4 w-4" /> {hidePricing ? "Show pricing" : "Hide pricing"}</GhostBtn>}
          {!marketOnly && k?.ok && !pending ? <PdfButton name={`${row.brand_name || "Brand"} TikTok Shop Plan, Sophie Society.pdf`} />
            : <GhostBtn onClick={() => window.print()}><Printer className="h-4 w-4" /> Print / Save as PDF</GhostBtn>}
        </div>
      </div>

      {marketOnly && <header>
        <Eyebrow>{marketOnly ? "TikTok Shop Market Report" : "TikTok Shop Fit Report"}</Eyebrow>
        <h1 className="mt-3 text-4xl sm:text-5xl">{row.brand_name || "Your brand"}</h1>
        <p className="mt-3 text-caption">
          {marketOnly ? "Product market analysis" : row.branch === "optimize" ? "Optimize an existing TikTok Shop" : "Launch on TikTok Shop"} · Prepared{" "}
          {new Date(row.updated_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </header>}

      <div className="no-print grid grid-cols-3 gap-4 border-t border-border pt-3 text-xs font-semibold text-caption"><span>1 Market</span><span>2 Your plan</span><span className="text-navy">3 Report</span></div>
      {teamPass && <TeamAdjustments id={id} passcode={teamPass} k={k} answers={answers} r={r} onData={setK}/>}
      {pending && k?.ok && <ScanProgress id={id} k={k} answers={answers} onData={setK}/>}
      {!pending && ownPending && <ScanProgress id={id} k={k} answers={answers} own onData={setK}/>}
      {!k?.ok && <GhostBtn onClick={retry} disabled={retrying}>{retrying ? "Retrying..." : "Retry market analysis"}</GhostBtn>}
      {k?.ok && !pending && marketOnly && <Story r={r} k={k} answers={answers} brand={row.brand_name ?? ""} products={products} marketOnly />}
      {k?.ok && !pending && !marketOnly && <>
        {!k.category?.attempted && <p className="no-print text-sm text-caption">Loading category totals...</p>}
        <DeckView r={r} k={k} answers={answers} brand={row.brand_name ?? ""} branch={row.branch} price={answers.marketPrice ?? products[0]?.price} team={!!teamPass} hidePricing={hidePricing} presenting={presenting} onExit={exitPresent} />
        <div className="no-print"><BookCall popup /></div>
        <p className="no-print text-xs text-caption">Market data: Kalodata, TikTok Shop US. Projections are estimates based on competitor benchmarks, not guarantees.</p>
      </>}
      {marketOnly && <Link to="/fit/$id" params={{id}} className="no-print font-semibold text-signal">Explore your plan</Link>}
      {!marketOnly && products.length === 0 && <p className="no-print text-xs text-caption">No products entered yet, figures use defaults.</p>}
    </div>
  );
}

function TeamToggle({ id, onUnlock }: { id: string; onUnlock: (pass: string)=>void }) {
  const get = useServerFn(getTeamVerdict);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [err, setErr] = useState(false);
  const [data, setData] = useState<{ verdict: string | null; reasons: any } | null>(null);

  async function load(pass: string) {
    const res = await get({ data: { id, passcode: pass } });
    if (!res.ok) { setErr(true); sessionStorage.removeItem(PASS_KEY); return; }
    sessionStorage.setItem(PASS_KEY, pass);
    onUnlock(pass); setErr(false); setData({ verdict: res.verdict, reasons: res.reasons });
  }
  useEffect(() => {
    const p = sessionStorage.getItem(PASS_KEY);
    if (p) { setOpen(true); load(p); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!open)
    return <GhostBtn onClick={() => setOpen(true)}><Lock className="h-4 w-4" /> Team view</GhostBtn>;
  if (!data)
    return (
      <form className="flex flex-wrap items-center gap-2" onSubmit={(e) => { e.preventDefault(); load(code); }}>
        <TextInput type="password" placeholder="Team passcode" value={code} onChange={(e) => setCode(e.target.value)} className="w-48" />
        <PrimaryBtn type="submit">Unlock</PrimaryBtn>
        <button type="button" className="text-sm text-caption" onClick={() => setOpen(false)}>Cancel</button>
        {err && <span className="text-sm text-drive">Wrong passcode</span>}
      </form>
    );
  const v = (data.verdict ?? "red") as "green" | "yellow" | "red";
  return (
    <div className="bento w-full space-y-3 border-navy p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Eyebrow>Team view · Fit verdict</Eyebrow>
          <VerdictBadge verdict={data.verdict} large />
        </div>
        <div className="flex gap-3 text-sm">
          <Link to="/team" className="font-semibold text-signal">All submissions</Link>
          <button className="text-caption" onClick={() => { sessionStorage.removeItem(PASS_KEY); setData(null); setOpen(false); onUnlock(""); }}>Hide</button>
        </div>
      </div>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {(data.reasons?.reasons ?? []).map((x: string) => <li key={x}>{x}</li>)}
      </ul>
      {v === "yellow" && data.reasons?.fixFirst?.length > 0 && (
        <div className="text-sm"><span className="font-semibold text-navy">What to fix first:</span> {data.reasons.fixFirst[0]}</div>
      )}
      <div className="text-sm"><span className="font-semibold text-navy">Next step:</span> {NEXT_STEP[v]}</div>
    </div>
  );
}

function PdfButton({ name }: { name: string }) {
  const [progress, setProgress] = useState<string | null>(null);
  async function run() {
    setProgress("Preparing...");
    try { await downloadDeckPdf(name, (d, t) => setProgress(`Slide ${d} of ${t}`)); }
    catch { toast.error("Could not build the PDF. Try again, or use your browser's print in landscape."); }
    finally { setProgress(null); }
  }
  return <GhostBtn onClick={run} disabled={!!progress}>{progress ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} {progress ?? "Download PDF"}</GhostBtn>;
}
