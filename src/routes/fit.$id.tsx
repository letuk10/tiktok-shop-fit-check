/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Briefcase, Check, Loader2, Plus, Rocket, Search, TrendingUp, Trash2, User, Users,
} from "lucide-react";
import {
  competitorInsights, selectedCompetitors, productKey, computeAll, PLAN_MONTHS, DEFAULT_ASSUMPTIONS, emptyProduct, parseAsins, REVENUE_BUCKETS, toNum, usd,
  type Answers, type Assumptions, type Branch, type MarketData, type Product,
} from "@/lib/calc";
import { editMarketKeywords, getSubmission, kalodata, runMarketScan, saveSubmission } from "@/lib/fit.functions";
import { Choice, Eyebrow, Field, GhostBtn, Note, NumInput, PrimaryBtn, SelectInput, TextInput, YesNo } from "@/components/fit/ui";
import { EconomicsCards, FulfillmentSection, MarketSection } from "@/components/fit/sections";
import { Story, scenarioOf } from "@/components/fit/story";
import { ScanProgress } from "@/components/fit/scan-progress";
import { InterestPrompt } from "@/components/fit/interest-prompt";
import { missingFields, qualificationReady } from "@/lib/qualification";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/fit/$id")({
  loader: async ({ params }) => {
    const row = await getSubmission({ data: { id: params.id } });
    if (!row) throw notFound();
    return row;
  },
  head: () => ({
    meta: [
      { title: "Fit Check in progress | Sophie Society" },
      { name: "description", content: "Your TikTok Shop Fit Check by Sophie Society." },
      { property: "og:title", content: "TikTok Shop Fit Check" },
      { property: "og:description", content: "Your TikTok Shop Fit Check by Sophie Society." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Wizard,
});

const STEPS = ["1 Market", "2 Your plan", "3 Report"];
const BUCKETS = REVENUE_BUCKETS.map((b) => ({ value: b, label: b }));

interface State {
  role: string | null;
  submitter_name: string;
  submitter_email: string;
  client_name: string;
  client_email: string;
  brand_name: string;
  branch: Branch | null;
  answers: Answers;
  products: Product[];
  assumptions: Assumptions;
}

function Wizard() {
  const row = Route.useLoaderData() as any;
  const { id } = Route.useParams();
  const nav = useNavigate();
  const save = useServerFn(saveSubmission);
  const [step, setStep] = useState<number>(row.answers?.flowVersion === 2 ? Math.min(row.answers?.flowStep ?? row.step_reached ?? 0, 5) : 0);
  const [declining, setDeclining] = useState(false);
  const [ended, setEnded] = useState(false);
  const [ownBusy,setOwnBusy]=useState(false);
  const [saving, setSaving] = useState(false);
  const [k, setK] = useState<MarketData | null>(row.kalodata ?? null);
  const [s, setS] = useState<State>(() => ({
    role: row.role,
    submitter_name: row.submitter_name ?? "",
    submitter_email: row.submitter_email ?? "",
    client_name: row.client_name ?? "",
    client_email: row.client_email ?? "",
    brand_name: row.brand_name ?? "",
    branch: row.branch,
    answers: { fulfillment: "fbt", commitSamples: undefined, ...(row.answers ?? {}) },
    products: row.products?.length ? row.products : [emptyProduct()],
    assumptions: { ...DEFAULT_ASSUMPTIONS, ...(row.assumptions ?? {}) },
  }));
  const up = (p: Partial<State>) => setS((x) => ({ ...x, ...p }));
  const ans = (p: Partial<Answers>) => setS((x) => ({ ...x, answers: { ...x.answers, ...p } }));

  const r = useMemo(
    () => computeAll({ branch: s.branch, answers: s.answers, products: s.products, assumptions: s.assumptions, kalodata: k }),
    [s, k],
  );

  useEffect(()=>{if(s.answers.shopId)void save({data:{id,patch:{answers:s.answers as any}}});},[s.answers.shopId]);
  const canNext = qualificationReady(step,s) && !(step===2 && ownBusy);
  const missing = missingFields(step, s);
  const [tried, setTried] = useState(false);
  useEffect(() => setTried(false), [step]);

  async function persist(nextStep: number, extra: Partial<Answers> = {}) {
    setSaving(true);
    try {
      await save({
        data: {
          id,
          patch: {
            role: s.role, submitter_name: s.submitter_name, submitter_email: s.submitter_email,
            client_name: s.client_name, client_email: s.client_email, brand_name: s.brand_name,
            branch: s.branch, step_reached: nextStep, answers: { ...s.answers, flowVersion: 2, flowStep: nextStep, ...extra } as any, products: s.products,
            assumptions: s.assumptions as any,
          },
        },
      });
      return true;
    } catch {
      toast.error("Could not save. Check your connection and try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function next() {
    if (!canNext) { setTried(true); return; }
    if (!(await persist(step + 1))) return;
    if (step === 5) return nav({ to: "/report/$id", params: { id } });
    setStep(step + 1);
    window.scrollTo({ top: 0 });
  }
  async function interest(value: "yes" | "no") {
    if (!await persist(value === "yes" ? 1 : 0, {interest: value})) return;
    ans({interest: value});
    if (value === "yes") {setStep(1); window.scrollTo({top: 0});}
    else setDeclining(true);
  }
  async function finish() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.submitter_email)) return;
    if (await persist(0, {interest: "no"})) {setEnded(true); setDeclining(false);}
  }
  if (ended) return <div className="mx-auto max-w-2xl space-y-6 px-5 py-16">
    <Eyebrow>Your market report</Eyebrow><h1 className="text-3xl">Thank you, {s.brand_name || "you're all set"}.</h1>
    <p>Your market report is ready whenever you need it.</p>
    {s.submitter_email && <p className="text-sm text-caption">Your email is saved with this report.</p>}
    <Link to="/report/$id" params={{id}} className="font-semibold text-signal">View your market report <ArrowRight className="inline h-4 w-4" /></Link>
  </div>;

  const gate = <InterestPrompt undecided={!s.answers.interest} title={`Want Sophie Society to launch or scale ${s.brand_name || "your brand"} on TikTok Shop?`}>
    {declining ? <div className="space-y-4">
      <Field label="Email for your market report"><TextInput aria-label="Market report email" type="email" value={s.submitter_email} onChange={e => up({submitter_email: e.target.value})} /></Field>
      <div className="flex flex-wrap gap-3"><PrimaryBtn onClick={finish} disabled={saving || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.submitter_email)}>Finish</PrimaryBtn><GhostBtn onClick={() => setDeclining(false)}>Back</GhostBtn></div>
    </div> : <div className="flex flex-wrap gap-3"><PrimaryBtn onClick={() => interest("yes")} disabled={saving}>Yes, show me my plan <ArrowRight className="h-4 w-4" /></PrimaryBtn><GhostBtn onClick={() => interest("no")} disabled={saving}>Not right now</GhostBtn></div>}
  </InterestPrompt>;

  return (
    <div className={cn("mx-auto max-w-5xl px-5", step === 0 ? "pb-40" : "pb-16")}>
      <Progress step={step} onJump={(i) => {setStep(i); setDeclining(false);}} />
      <div className="mt-10">
        {step === 0 && <StepMarket id={id} s={s} k={k} setK={setK} r={r} persist={() => persist(0)} onKeywords={keywords=>up({products:s.products.map((p,i)=>i===0?{...p,keywords}:p)})} ans={ans} afterShare={gate} />}
        {step === 1 && <StepWho s={s} up={up} />}
        {step === 2 && <><StepShop s={s} up={up} ans={ans} />{s.branch === "optimize" && s.answers.shopId && <ScanProgress id={id} k={k} answers={s.answers} own onData={setK} onBusy={setOwnBusy}/>}</>}
        {step === 3 && <StepWrap eyebrow="Your plan" title="Product economics">
          <StepBrand s={s} up={up} ans={ans} k={k} />
          <EconomicsCards r={r} products={s.products} />

        </StepWrap>}
        {step === 4 && <StepWrap eyebrow="Your plan" title="Fulfillment comparison">
          <Field label="Own / 3PL cost per order"><NumInput prefix="$" value={s.assumptions.ownCost} onChange={ownCost=>up({assumptions:{...s.assumptions,ownCost}})} /></Field>
          <FulfillmentSection r={r} products={s.products} />
        </StepWrap>}
        {step === 5 && <StepWrap eyebrow="Your plan" title="Your 12-month plan">
          <Story r={r} k={k} answers={s.answers} brand={s.brand_name} products={s.products} earlyCta />
        </StepWrap>}
      </div>
      {step === 0 && !s.answers.interest && !declining && s.answers.competitorsConfirmed && r.insights.hasData && !selectedCompetitors(k, s.answers).some((p) => !k?.enriched?.[productKey(p)]?.attempted) && <StickyPlanCta brand={s.brand_name} gmv={scenarioOf(r)?.rows[PLAN_MONTHS - 1]?.gmv ?? 0} disabled={saving} onYes={() => interest("yes")} onNo={() => { void interest("no"); setTimeout(() => document.getElementById("interest-gate")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50); }} />}
      {step > 0 && <div className="sticky bottom-0 mt-10 space-y-3 border-t border-border bg-background/95 py-4 backdrop-blur">
        {tried && missing.length > 0 && <div role="alert" className="rounded-xl border border-orange/50 bg-orange/10 p-4 text-sm">
          <div className="font-semibold text-navy">To continue, complete {missing.length === 1 ? "this" : `these ${missing.length}`}:</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">{missing.map((m) => <li key={m}>{m}</li>)}</ul>
        </div>}
        <div className="flex items-center justify-between gap-3">
          <GhostBtn onClick={async () => {if (await persist(step - 1)) setStep(step - 1);}} disabled={saving}><ArrowLeft className="h-4 w-4" /> Back</GhostBtn>
          <div className="flex items-center gap-3">
            {!tried && missing.length > 0 && <span className="hidden text-sm text-caption sm:inline">{missing.length} {missing.length === 1 ? "item" : "items"} left</span>}
            {step === 2 && ownBusy && <span className="text-sm text-caption">Loading your shop...</span>}
            <PrimaryBtn onClick={next} disabled={saving || (step === 2 && ownBusy)} aria-disabled={!canNext}>{saving ? "Saving..." : step === 5 ? "See your full plan" : "Continue"} <ArrowRight className="h-4 w-4" /></PrimaryBtn>
          </div>
        </div>
      </div>}
    </div>
  );
}

function StickyPlanCta({ brand, gmv, onYes, onNo, disabled }: { brand: string; gmv: number; onYes: () => void; onNo: () => void; disabled: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <div className="no-print fixed inset-x-0 bottom-0 z-40 sm:bottom-4 sm:flex sm:justify-center sm:px-4">
    <div className="flex flex-col gap-3 bg-navy px-5 py-4 text-primary-foreground shadow-lg sm:flex-row sm:items-center sm:gap-5 sm:rounded-full sm:py-3 sm:pl-7 sm:pr-3">
      <p className="text-sm font-semibold">{brand || "Your brand"} could do {usd(gmv)}/month on TikTok Shop by month 12. See your plan</p>
      <div className="flex items-center gap-4">
        <button type="button" onClick={onYes} disabled={disabled} className="rounded-full bg-primary-foreground px-5 py-2 text-sm font-bold text-navy disabled:opacity-50">Show me my plan</button>
        <button type="button" onClick={onNo} disabled={disabled} className="text-xs text-primary-foreground/80 underline">Not now</button>
      </div>
    </div>
  </div>;
}

function Progress({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  const phase = step === 0 ? 0 : 1;
  return <div className="pt-2">
    <div className="grid grid-cols-3 gap-4">{STEPS.map((n, i) => <div key={n} className="space-y-3">
      <div className={cn("h-1 rounded-full", i <= phase ? "bg-signal" : "bg-cloud")} />
      <GhostBtn className={cn("h-auto border-0 bg-transparent px-0 text-xs sm:text-sm", i === phase ? "text-navy" : "text-caption")} onClick={() => i === 0 && onJump(0)} disabled={i > phase}>{n}</GhostBtn>
    </div>)}</div>
  </div>;
}

function MultiChoice({ value, onChange, options }: { value: string[]; onChange: (v: string[]) => void; options: { value: string; label: string }[] }) {
  const toggle = (v: string) => {
    if (v === "none") return onChange(value.includes("none") ? [] : ["none"]);
    const base = value.filter((x) => x !== "none");
    onChange(base.includes(v) ? base.filter((x) => x !== v) : [...base, v]);
  };
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {options.map((o) => {
        const active = value.includes(o.value);
        return (
          <button type="button" key={o.value} onClick={() => toggle(o.value)} aria-pressed={active}
            className={cn("bento flex items-center justify-between px-4 py-3 text-left font-semibold text-navy transition hover:border-signal", active && "border-signal bg-signal/5 ring-2 ring-signal/20")}>
            {o.label}
            {active && <Check className="h-4 w-4 text-signal" />}
          </button>
        );
      })}
    </div>
  );
}

function StepWrap({ eyebrow, title, sub, children }: { eyebrow: string; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-8">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-2 text-3xl sm:text-4xl">{title}</h1>
        {sub && <p className="mt-2 text-caption">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

type Up = (p: Partial<State>) => void;
type Ans = (p: Partial<Answers>) => void;

function StepWho({ s, up }: { s: State; up: Up }) {
  const team = s.role === "pod_leader" || s.role === "sales_exec";
  return (
    <StepWrap eyebrow="Your plan" title="About you">
      <Choice
        size="lg"
        value={s.role ?? undefined}
        onChange={(role) => up({ role })}
        options={[
          { value: "client", label: "Partner", desc: "I run or own the brand", icon: User },
          { value: "pod_leader", label: "Pod Leader", desc: "Sophie Society team", icon: Users },
          { value: "sales_exec", label: "Brand Strategist", desc: "Sophie Society team", icon: Briefcase },
        ]}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name"><TextInput value={s.submitter_name} onChange={(e) => up({ submitter_name: e.target.value })} /></Field>
        <Field label="Your email" help="We send nothing without asking."><TextInput type="email" value={s.submitter_email} onChange={(e) => up({ submitter_email: e.target.value })} /></Field>
        {team && (
          <>
            <Field label="Partner contact name" ><TextInput value={s.client_name} onChange={(e) => up({ client_name: e.target.value })} /></Field>
            <Field label="Partner contact email" ><TextInput type="email" value={s.client_email} onChange={(e) => up({ client_email: e.target.value })} /></Field>
          </>
        )}
      </div>
    </StepWrap>
  );
}

function StepShop({ s, up, ans }: { s: State; up: Up; ans: Ans }) {
  const a = s.answers;
  return (
    <StepWrap eyebrow="Your plan" title="Are you already selling on TikTok Shop?">
      <Choice
        cols={2}
        size="lg"
        value={s.branch ?? undefined}
        onChange={(branch) => up({ branch })}
        options={[
          { value: "optimize", label: "Yes", desc: "Optimize my existing shop", icon: TrendingUp },
          { value: "launch", label: "Not yet", desc: "Launch a new shop", icon: Rocket },
        ]}
      />
      {s.branch === "optimize" && (
        <div className="space-y-6">
          <ShopFinder a={a} ans={ans} />
          <Field label="Who runs it today?">
            <Choice value={a.runsIt} onChange={(runsIt) => ans({ runsIt })} options={[
              { value: "inhouse", label: "In-house" }, { value: "agency", label: "Another agency" }, { value: "nobody", label: "Nobody actively" },
            ]} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Samples sent per month" help="Free product sent to creators.">
              <NumInput value={a.samplesNow} onChange={(samplesNow) => ans({ samplesNow })} />
            </Field>
            <Field label="Running GMV Max ads?">
              <YesNo value={a.gmvMax} onChange={(gmvMax) => ans({ gmvMax })} />
            </Field>
            {a.gmvMax && (
              <Field label="GMV Max daily spend">
                <NumInput prefix="$" value={a.gmvMaxDaily} onChange={(gmvMaxDaily) => ans({ gmvMaxDaily })} />
              </Field>
            )}
          </div>
          <Field label="What is your weekly creator outreach limit?" help="Shops on probation are capped at 2,000 outreach messages per week.">
            <Choice value={a.probation} onChange={(probation) => ans({ probation })} options={[
              { value: "no", label: "Unlimited", desc: "No cap on outreach" },
              { value: "yes", label: "Capped at 2,000 / week", desc: "Shop on probation" },
              { value: "unsure", label: "I don't know" },
            ]} />
          </Field>
          <Field label="How do you fulfill today?">
            <Choice value={a.fulfillment} onChange={(fulfillment) => ans({ fulfillment })} options={[
              { value: "fbt", label: "FBT" }, { value: "own", label: "Own warehouse or 3PL" }, { value: "mcf", label: "Amazon MCF" },
            ]} />
          </Field>
          <Field label="Biggest challenge" help="One line is plenty.">
            <TextInput value={a.challenge ?? ""} onChange={(e) => ans({ challenge: e.target.value })} />
          </Field>
        </div>
      )}
      {s.branch === "launch" && (
        <div className="space-y-6">
          <Field label="Do you have a US TikTok Shop seller account (US business entity)?">
            <Choice value={a.usSeller} onChange={(usSeller) => ans({ usSeller })} options={[
              { value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "progress", label: "In progress" },
            ]} />
          </Field>
          {a.usSeller === "no" && (
            <Note>Sophie can't help set up US entities. You will still get the full market report at the end.</Note>
          )}
          <Field label="Where do you sell today?" help="Pick all that apply.">
            <MultiChoice value={Array.isArray(a.dtc) ? a.dtc : a.dtc ? [a.dtc] : []} onChange={(dtc) => ans({ dtc })} options={[
              { value: "amazon", label: "Amazon" }, { value: "walmart", label: "Walmart" }, { value: "shopify", label: "Shopify" },
              { value: "other", label: "Other" }, { value: "none", label: "None" },
            ]} />
          </Field>
          <Field label="Can you commit to sending 150+ free samples per month for at least 3 months?" help="Samples to creators are the engine of TikTok Shop. Fewer samples means fewer videos and slower growth.">
            <YesNo value={a.commitSamples} onChange={(commitSamples) => ans({ commitSamples })} />
          </Field>
          <Field label="Can you invest about $100/day in TikTok ads once ~100 creator videos are live (around month 3)?" help="Ads amplify the best creator videos and usually unlock the next growth step.">
            <YesNo value={a.commitAds} onChange={(commitAds) => ans({ commitAds })} />
          </Field>
        </div>
      )}
    </StepWrap>
  );
}

function ShopFinder({ a, ans }: { a: Answers; ans: Ans }) {
  const search = useServerFn(kalodata);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  async function find() {
    if (!a.shopName?.trim()) return;
    setBusy(true); setErr(null);
    const res = await search({ data: { action: "shop_search", params: { keyword: a.shopName } } });
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Search failed");
    setResults((res.data as any[]) ?? []);
  }
  return (
    <div className="space-y-3">
      <Field label="TikTok Shop name" help="We look it up in TikTok Shop market data.">
        <div className="flex gap-2">
          <TextInput value={a.shopName ?? ""} onChange={(e) => ans({ shopName: e.target.value })} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), find())} />
          <GhostBtn type="button" onClick={find} disabled={busy} className="shrink-0">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Find my shop
          </GhostBtn>
        </div>
      </Field>
      {err && <Note tone="warn">{err} Try again to select your shop.</Note>}
      {a.shopPick && !results && (
        <div className="text-sm">Selected: <span className="font-semibold text-navy">{a.shopPick.shop_name}</span></div>
      )}
      {results && (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.length === 0 && <div className="text-sm text-caption">No shops found. Try a shorter name.</div>}
          {results.map((r) => {
            const active = a.shopId === String(r.shop_id);
            return (
              <button type="button" key={r.shop_id} onClick={() => ans({ shopId: String(r.shop_id), shopPick: { shop_id: String(r.shop_id), shop_name: r.shop_name, image_url: r.image_url, revenue: toNum(r.revenue) } })}
                className={cn("bento flex items-center gap-3 p-3 text-left hover:border-signal", active && "border-signal ring-2 ring-signal/20")}>
                {r.image_url ? <img src={r.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <div className="h-12 w-12 rounded-lg bg-cloud" />}
                <div className="min-w-0">
                  <div className="truncate font-semibold text-navy">{r.shop_name}</div>
                  <div className="text-xs text-caption">Last 30 days GMV {usd(toNum(r.revenue))}</div>
                </div>
                {active && <Check className="ml-auto h-5 w-5 text-signal" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const MAX_HERO = 5;
function StepBrand({ s, up, ans, k }: { s: State; up: Up; ans: Ans; k: MarketData | null }) {
  const a = s.answers;
  // Products the brand already sells on TikTok Shop (Kalodata), biggest first, not yet added.
  const names = new Set(s.products.map((p) => p.name.trim().toLowerCase()));
  const ownTikTok = (k?.ownProducts ?? []).filter((p: any) => Number(p.revenue) > 0 && !names.has(String(p.product_name ?? "").trim().toLowerCase()))
    .sort((x: any, y: any) => Number(y.revenue) - Number(x.revenue)).slice(0, 8);
  const addOwn = (p: any) => up({ products: [...s.products, { ...emptyProduct(), name: String(p.product_name ?? ""), price: Number(p.unit_price) > 0 ? Math.round(Number(p.unit_price) * 100) / 100 : emptyProduct().price, keywords: s.products[0]?.keywords ?? [] }] });
  const setP = (i: number, p: Partial<Product>) => up({ products: s.products.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  return <div className="space-y-6">
    <div className="grid gap-5 sm:grid-cols-3">
      <Field label="Monthly Amazon revenue"><SelectInput value={a.amazonRevenue} onChange={(amazonRevenue) => ans({ amazonRevenue })} options={BUCKETS} /></Field>
      <Field label="Monthly DTC revenue"><SelectInput value={a.dtcRevenue} onChange={(dtcRevenue) => ans({ dtcRevenue })} options={BUCKETS} /></Field>
      <Field label="Number of products in catalog"><NumInput value={a.catalogSize} onChange={(catalogSize) => ans({ catalogSize })} /></Field>
    </div>
    {s.products.map((p, i) => <ProductCard key={i} p={p} i={i} set={x => setP(i, x)} canRemove={i > 0} askPrice={i > 0 || s.answers.marketPrice === undefined} remove={() => up({products: s.products.filter((_, j) => j !== i)})} />)}
    {s.products.length < MAX_HERO && ownTikTok.length > 0 && <div className="space-y-2">
      <div className="eyebrow">Add from your TikTok Shop</div>
      <div className="flex flex-wrap gap-2">{ownTikTok.map((p: any) => <button key={String(p.product_id)} type="button" onClick={() => addOwn(p)} className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-left text-sm hover:border-navy">
        <Plus className="h-4 w-4 shrink-0" /><span className="max-w-[260px] truncate">{String(p.product_name ?? "")}</span><span className="text-caption">${Number(p.unit_price || 0).toFixed(2)} · ${Math.round(Number(p.revenue)).toLocaleString("en-US")}/30d</span>
      </button>)}</div>
      <p className="text-xs text-caption">Price comes from TikTok Shop. Add the unit cost and package size for each.</p>
    </div>}
    {s.products.length < MAX_HERO && <GhostBtn onClick={() => up({products: [...s.products, emptyProduct()]})}><Plus className="h-4 w-4" /> Add hero product</GhostBtn>}
  </div>;
}

const sProviderNote = (p: Product) => p.weight > 0 && p.length > 0 && p.width > 0 && p.height > 0;

function ProductCard({ p, i, set, remove, canRemove, askPrice }: { p: Product; i: number; set: (p: Partial<Product>) => void; remove: () => void; canRemove: boolean; askPrice: boolean }) {
  return <div className="space-y-5 border-y border-border py-5">
    <div className="flex items-center justify-between"><h2 className="text-xl">{p.name || `Product ${i+1}`}</h2>{canRemove && <GhostBtn onClick={remove} aria-label="Remove product" className="h-9 px-2"><Trash2 className="h-4 w-4" /></GhostBtn>}</div>
    <div className="grid gap-4 sm:grid-cols-2">
      {i > 0 && <Field label="Product name"><TextInput value={p.name} onChange={e => set({name: e.target.value})} /></Field>}
      {askPrice && <Field label="Selling price"><NumInput prefix="$" value={p.price || undefined} onChange={price => set({price})} /></Field>}
      <Field label="COGS per unit" help="Landed cost of one unit."><NumInput prefix="$" value={p.cogs || undefined} onChange={cogs => set({cogs})} /></Field>
    </div>
    {p.asin && sProviderNote(p) && <p className="text-xs text-caption">Package: {p.length.toFixed(1)} x {p.width.toFixed(1)} x {p.height.toFixed(1)} in, {p.weight.toFixed(2)} lb, from Amazon. Edit the values below if needed. FBT measures the unit at inbound, so the final fee can differ slightly.</p>}
    {!(p.length > 0 && p.weight > 0) && <p className="text-xs text-caption">Package size and weight drive the FBT fee and sample cost. On the Amazon listing they are under Product information, as "Package Dimensions" (for example 3.4 x 2.7 x 2.7 inches; 8.5 ounces, which is 0.53 lb). Seller Central shows them under the listing's shipping details.</p>}
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Field label="Weight"><NumInput value={p.weight || undefined} onChange={weight => set({weight})} suffix="lb" /></Field>
      <Field label="Length"><NumInput value={p.length || undefined} onChange={length => set({length})} suffix="in" /></Field>
      <Field label="Width"><NumInput value={p.width || undefined} onChange={width => set({width})} suffix="in" /></Field>
      <Field label="Height"><NumInput value={p.height || undefined} onChange={height => set({height})} suffix="in" /></Field>
    </div>
  </div>;
}

function StepMarket({ id, s, k, setK, r, persist, ans, afterShare, onKeywords }: { onKeywords:(keywords:string[])=>void; ans: Ans; id: string; s: State; k: MarketData | null; setK: (k: MarketData) => void; r: ReturnType<typeof computeAll>; persist: () => Promise<boolean>; afterShare: React.ReactNode }) {
  const save=useServerFn(saveSubmission),editKeywords=useServerFn(editMarketKeywords);
  const scan = useServerFn(runMarketScan);
  const [busy,setBusy]=useState(!k), [enriching,setEnriching]=useState(false);
  const started=useRef(false);
  const [keywords,setKeywords]=useState(s.products[0]?.keywords.join(', ')??'');
  const selected=selectedCompetitors(k,s.answers);
  async function editKw(values:string[]) {
    await editKeywords({data:{id,keywords:values}});onKeywords(values);ans({competitorsConfirmed:false,excludedProducts:[],selectedProducts:undefined});setKeywords(values.join(', '));
    setBusy(true);try{setK(await scan({data:{id}}));}catch{setK({ok:false,keywords:[],competitors:[]});}finally{setBusy(false);}
  }
  const pending=selected.some(p=>!k?.enriched?.[productKey(p)]?.attempted);
  async function run() {
    setBusy(true);
    try {if(!await persist())return;setK(await scan({data:{id}}));}catch{setK({ok:false,keywords:[],competitors:[]});}finally{setBusy(false);}
  }
  useEffect(()=>{if(!started.current){started.current=true;if(!k)void run();}},[]);
  async function selection(a:Partial<Answers>) {
    ans(a);
    await save({data:{id,patch:{answers:{...s.answers,...a}}}});
  }
  return <StepWrap eyebrow="Your market · last 30 days" title={`${s.brand_name || "Your"} TikTok Shop market`}>
    {k?.fetchedAt&&<p className="text-xs text-caption">Updated {new Date(k.fetchedAt).toLocaleDateString('en-US')}</p>}
    {busy?<Note>Finding competing products for {s.products.flatMap(p=>p.keywords).join(', ')}. We broaden long keywords automatically, this can take up to a minute.</Note>:<>
      {s.answers.competitorsConfirmed&&pending&&<ScanProgress id={id} k={k} answers={s.answers} onData={setK} onBusy={setEnriching}/>}
      {!enriching && !(s.answers.competitorsConfirmed&&pending) && <MarketSection id={id} r={r} k={k} answers={s.answers} onAnswers={selection} afterShare={afterShare} onEditKeywords={editKw} onMarket={setK}/>}
      {(!selected.length || (s.answers.competitorsConfirmed&&!pending&&!competitorInsights(k,s.answers).hasData))&&<div className="space-y-3"><Field label="Broader keywords (up to 3)"><TextInput value={keywords} onChange={e=>setKeywords(e.target.value)}/></Field><PrimaryBtn onClick={()=>{const values=keywords.split(',').map(v=>v.trim()).filter(Boolean).slice(0,3);if(values.length)void editKw(values);}}>Edit keywords and search</PrimaryBtn></div>}
      {!k?.ok&&!k?.productOnly&&<GhostBtn onClick={()=>void run()}>Retry market analysis</GhostBtn>}
    </>}
  </StepWrap>;
}
