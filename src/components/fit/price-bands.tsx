import { priceBands } from "@/lib/deck";
import { cn } from "@/lib/utils";

type Bands = NonNullable<ReturnType<typeof priceBands>>;

/** Units-weighted price bands as horizontal bars. The partner's band is orange with a price marker. */
export function PriceBandChart({ data, price, compact }: { data: Bands; price?: number | undefined; compact?: boolean }) {
  const max = Math.max(...data.bands.map((b) => b.share), 1);
  return <div className="space-y-3">
    <p className={cn("font-semibold text-navy", compact ? "text-base" : "text-lg")}>{data.headline}</p>
    <div className="space-y-1.5" role="list" aria-label="Share of units sold by price band">
      {data.bands.map((b) => <div key={b.label} role="listitem" className="grid grid-cols-[96px_minmax(0,1fr)_190px] items-center gap-3 text-sm">
        <span className={cn("text-right tabular-nums", b.partner ? "font-bold text-navy" : "text-body")}>{b.label}</span>
        <div className="h-6 rounded-sm bg-cloud">
          <div className={cn("h-full rounded-sm", b.partner ? "bg-orange" : b.lo >= data.zone.lo && (b.hi ?? Infinity) <= data.zone.hi ? "bg-navy" : "bg-signal")} style={{ width: `${Math.max(b.share > 0 ? 1.5 : 0, b.share / max * 100)}%` }} />
        </div>
        <span className="flex items-center gap-2 whitespace-nowrap tabular-nums">
          <span className="font-semibold text-navy">{b.share >= 1 || b.share === 0 ? Math.round(b.share) : b.share.toFixed(1)}%</span>
          {b.partner && price ? <span className="rounded-full bg-orange px-2 py-0.5 text-xs font-bold text-primary-foreground">Your price ${price.toFixed(2)}</span> : null}
        </span>
      </div>)}
    </div>
    <p className="text-xs text-caption">Share of units sold in the direct niche, last 30 days. ${data.step} bands up to the 95th percentile of units, then one open band.</p>
  </div>;
}
