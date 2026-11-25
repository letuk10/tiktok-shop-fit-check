import { useEffect, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("eyebrow", className)}>{children}</div>;
}

export function Field({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="block space-y-2">
      <span className="block text-sm font-semibold text-navy">{label}</span>
      {children}
      {help && <span className="block text-xs text-caption">{help}</span>}
    </div>
  );
}

const inputCls =
  "h-12 w-full rounded-xl border border-border bg-background px-4 text-base text-navy outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, props.className)} />;
}

export function NumInput({
  value, onChange, prefix, suffix, step = "any", def,
}: { value: number | undefined; onChange: (n: number) => void; prefix?: string | undefined; suffix?: string | undefined; step?: string; def?: number | undefined }) {
  const [text, setText] = useState(value === undefined || !Number.isFinite(value) ? "" : String(value));
  useEffect(() => {
    if (text === "" || Number(text) !== value) setText(value === undefined || !Number.isFinite(value) ? "" : String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <div className="relative">
      {prefix && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-caption">{prefix}</span>}
      <input
        type="number"
        required
        min="0"
        inputMode="decimal"
        step={step}
        value={text}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          setText(e.target.value);
          if (e.target.value === "") onChange(Number.NaN);
          if (e.target.value !== "" && !isNaN(Number(e.target.value))) onChange(Number(e.target.value));
        }}
        onBlur={() => { if (text === "" && def !== undefined) { setText(String(def)); onChange(def); } }}
        className={cn(inputCls, prefix && "pl-8", (suffix || def !== undefined) && "pr-24")}
      />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-caption">
        {suffix}
        {def !== undefined && <span className="ml-1">default {def}</span>}
      </span>
    </div>
  );
}

export function SelectInput({
  value, onChange, options,
}: { value: string | undefined; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      <option value="" disabled>Select</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function Choice<T extends string>({
  value, onChange, options, cols = 3, size = "md",
}: {
  value: T | undefined;
  onChange: (v: T) => void;
  options: { value: T; label: string; desc?: string; icon?: LucideIcon }[];
  cols?: 2 | 3;
  size?: "md" | "lg";
}) {
  return (
    <div className={cn("grid gap-3", cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
      {options.map((o) => {
        const active = value === o.value;
        const Icon = o.icon;
        return (
          <button
            type="button"
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "bento text-left transition hover:border-signal",
              size === "lg" ? "p-6" : "px-4 py-3",
              active && "border-signal bg-signal/5 ring-2 ring-signal/20",
            )}
          >
            {Icon && <Icon className={cn("mb-3 h-6 w-6", active ? "text-signal" : "text-caption")} strokeWidth={1.5} />}
            <div className={cn("font-semibold text-navy", size === "lg" && "text-lg")}>{o.label}</div>
            {o.desc && <div className="mt-1 text-sm text-caption">{o.desc}</div>}
          </button>
        );
      })}
    </div>
  );
}

export function YesNo({ value, onChange }: { value: boolean | undefined; onChange: (v: boolean) => void }) {
  return (
    <Choice
      cols={2}
      value={value === undefined ? undefined : value ? "yes" : "no"}
      onChange={(v) => onChange(v === "yes")}
      options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
    />
  );
}

export type Tone = "good" | "neutral" | "warn" | "plain" | "dark";
const toneCls: Record<Tone, string> = {
  good: "border-growth/60 bg-growth/10",
  neutral: "border-gold/60 bg-gold/10",
  warn: "border-drive/60 bg-drive/10",
  plain: "",
  dark: "border-navy bg-navy text-primary-foreground",
};

export function Stat({ label, value, sub, tone = "plain" }: { label: string; value: ReactNode; sub?: ReactNode; tone?: Tone }) {
  return (
    <div className={cn("bento p-5", toneCls[tone])}>
      <div className={cn("eyebrow", tone === "dark" && "text-primary-foreground/70")}>{label}</div>
      <div className={cn("mt-2 text-2xl font-bold tracking-tight sm:text-3xl", tone === "dark" ? "text-primary-foreground" : "text-navy")}>
        {value}
      </div>
      {sub && <div className={cn("mt-1 text-xs", tone === "dark" ? "text-primary-foreground/70" : "text-caption")}>{sub}</div>}
    </div>
  );
}

export function Note({ children, tone = "plain" }: { children: ReactNode; tone?: Tone }) {
  return <div className={cn("bento bg-cream p-4 text-sm", tone !== "plain" && toneCls[tone])}>{children}</div>;
}

export function VerdictBadge({ verdict, large }: { verdict: string | null | undefined; large?: boolean }) {
  if (!verdict) return <span className="text-xs text-caption">Pending</span>;
  const map: Record<string, string> = {
    green: "bg-growth text-navy",
    yellow: "bg-gold text-navy",
    red: "bg-drive text-primary-foreground",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full font-bold uppercase tracking-wider", large ? "px-4 py-1.5 text-sm" : "px-2.5 py-0.5 text-[11px]", map[verdict])}>
      {verdict}
    </span>
  );
}

export function PrimaryBtn(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-navy px-6 font-semibold text-primary-foreground transition hover:bg-navy/90 disabled:opacity-50",
        props.className,
      )}
    />
  );
}
export function GhostBtn(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 font-semibold text-navy transition hover:border-signal disabled:opacity-50",
        props.className,
      )}
    />
  );
}
