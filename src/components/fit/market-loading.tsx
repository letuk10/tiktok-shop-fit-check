import { useEffect, useState } from "react";
import { Check, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/** Estimated scan time in seconds. Kalodata allows about 9 calls per 10 seconds: one search per
 *  keyword, one previous-month search, up to 12 product details and up to 8 seller lookups. */
export const scanEstimate = (keywordCount: number) => Math.round(Math.max(25, (Math.min(keywordCount, 8) + 21) * 1.15 + 6));

const STEPS = [
  { at: 0, label: "Searching TikTok Shop for your keywords" },
  { at: 0.35, label: "Reading 30-day sales for every product found" },
  { at: 0.6, label: "Checking the top sellers' other listings" },
  { at: 0.85, label: "Sorting direct competitors from look-alikes" },
];

/** Time-based progress for the market scan. It never claims 100% until the data arrives. */
export function MarketLoading({ keywords, brand }: { keywords: string[]; brand?: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => { const start = Date.now(); const t = setInterval(() => setElapsed((Date.now() - start) / 1000), 250); return () => clearInterval(t); }, []);
  const total = scanEstimate(keywords.length);
  // Ease toward 95%: linear while inside the estimate, then creeps so the bar never stalls or finishes early.
  const frac = elapsed <= total ? 0.9 * (elapsed / total) : 0.9 + 0.05 * (1 - Math.exp(-(elapsed - total) / 20));
  const step = STEPS.reduce((cur, s, i) => (frac >= s.at ? i : cur), 0);
  const left = Math.max(0, Math.ceil(total - elapsed));
  return <div className="rounded-2xl border border-border bg-card p-6 sm:p-8" role="status" aria-live="polite">
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-primary-foreground"><Search className="h-5 w-5" /></span>
      <div>
        <div className="eyebrow">Live from Kalodata · TikTok Shop US</div>
        <h3 className="text-xl text-navy">Scanning the market{brand ? ` for ${brand}` : ""}</h3>
      </div>
    </div>

    <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-cloud">
      <div className="h-full rounded-full bg-signal transition-[width] duration-300 ease-linear" style={{ width: `${Math.round(frac * 100)}%` }} />
    </div>
    <div className="mt-2 flex justify-between text-xs text-caption">
      <span>{Math.round(frac * 100)}%</span>
      <span>{left > 0 ? `About ${left} seconds left` : "Almost done, finishing the last checks"}</span>
    </div>

    <ol className="mt-6 space-y-3">
      {STEPS.map((s, i) => <li key={s.label} className={cn("flex items-center gap-3 text-sm", i > step && "text-caption")}>
        {i < step ? <Check className="h-4 w-4 shrink-0 text-navy" /> : i === step ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-signal" /> : <span className="h-4 w-4 shrink-0 rounded-full border border-border" />}
        <span className={cn(i === step && "font-semibold text-navy")}>{s.label}</span>
      </li>)}
    </ol>

    <div className="mt-6 flex flex-wrap gap-2">
      {keywords.map((k) => <span key={k} className="rounded-full bg-cloud px-3 py-1 text-xs font-medium text-navy">{k}</span>)}
    </div>
    <p className="mt-4 text-xs text-caption">Keep this tab open. It takes under a minute. You will pick your competitors on the next screen.</p>
  </div>;
}
