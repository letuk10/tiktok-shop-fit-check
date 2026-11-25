import { Fragment } from "react";
import { formatLever, type LeverRow, type LeverScorecard } from "@/lib/levers";
import { cn } from "@/lib/utils";

/** Better or worse than the proof point, for the partner's own column. */
function tone(row: LeverRow, own: number | null, peer: number | null) {
  if (row.higherIsBetter === null || own === null || peer === null || peer === 0) return "";
  const ratio = own / peer;
  const good = row.higherIsBetter ? ratio >= 0.9 : ratio <= 1.1;
  const bad = row.higherIsBetter ? ratio < 0.5 : ratio > 2;
  return good ? "bg-growth/40" : bad ? "bg-orange/20 text-orange" : "";
}

export function LeverTable({ s, brand, compact }: { s: LeverScorecard; brand?: string; compact?: boolean }) {
  const peerIndex = s.columns.findIndex((c) => c.isPeer);
  const showOwn = !!s.own;
  const groups = [...new Set(s.rows.map((r) => r.group))];
  return <div className="overflow-x-auto">
    <table className={cn("w-full min-w-[720px]", compact ? "text-xs" : "text-sm")}>
      <thead>
        <tr className="border-b border-border text-left align-bottom">
          <th className="eyebrow px-2 py-2">Lever</th>
          {s.columns.map((c) => <th key={c.name} className={cn("px-2 py-2 text-right font-semibold text-navy", c.isPeer && "bg-gold/15")}>
            <div className="flex flex-col items-end gap-1">
              {c.image && !compact && <img src={c.image} alt="" className="h-8 w-8 rounded object-cover" />}
              <span className="leading-tight">{c.name}</span>
              {c.isPeer && <span className="rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold uppercase text-navy">Proof point</span>}
            </div>
          </th>)}
          {showOwn && <th className="bg-growth/15 px-2 py-2 text-right font-semibold text-navy">{brand ?? "You"} today</th>}
        </tr>
      </thead>
      <tbody>
        {groups.map((g) => <Fragment key={g}>
          <tr><td colSpan={s.columns.length + (showOwn ? 2 : 1)} className="eyebrow px-2 pb-1 pt-4">{g}</td></tr>
          {s.rows.filter((r) => r.group === g).map((r) => <tr key={r.key} className="border-b border-border">
            <td className="px-2 py-1.5"><div className="font-medium text-navy">{r.label}</div>{!compact && <div className="text-xs text-caption">{r.help}</div>}</td>
            {r.values.map((x, i) => <td key={i} className={cn("px-2 py-1.5 text-right tabular-nums", i === peerIndex && "bg-gold/15 font-semibold")}>{formatLever(x, r.format) || "·"}</td>)}
            {showOwn && <td className={cn("bg-growth/15 px-2 py-1.5 text-right font-semibold tabular-nums", tone(r, r.own?.n ?? null, peerIndex >= 0 ? r.values[peerIndex]?.n ?? null : null))}>{formatLever(r.own, r.format) || "·"}</td>}
          </tr>)}
        </Fragment>)}
      </tbody>
    </table>
  </div>;
}

export function LeverTakeaways({ s }: { s: LeverScorecard }) {
  if (!s.takeaways.length) return null;
  return <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
    <thead><tr className="border-b border-border text-left"><th className="eyebrow px-3 py-2">Lever</th><th className="eyebrow px-3 py-2">What {s.peer?.name ?? "the proof point"} does</th><th className="eyebrow px-3 py-2">What you need</th></tr></thead>
    <tbody>{s.takeaways.map((t) => <tr key={t.lever} className="border-b border-border align-top">
      <td className="px-3 py-2 font-semibold text-navy">{t.lever}</td><td className="px-3 py-2">{t.theyDo}</td><td className="px-3 py-2">{t.youNeed}</td>
    </tr>)}</tbody>
  </table></div>;
}
