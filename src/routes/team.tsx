import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { pct, ROLE_LABEL } from "@/lib/calc";
import { listSubmissions } from "@/lib/fit.functions";
import { Eyebrow, GhostBtn, PrimaryBtn, TextInput, VerdictBadge } from "@/components/fit/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team dashboard | Sophie Society Fit Check" },
      { name: "description", content: "Internal list of TikTok Shop Fit Check submissions." },
      { property: "og:title", content: "Team dashboard | Sophie Society" },
      { property: "og:description", content: "Internal list of TikTok Shop Fit Check submissions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Team,
});

const PASS_KEY = "sophie-team-pass";
type Row = Awaited<ReturnType<typeof listSubmissions>>["rows"][number];
const ROLE = ROLE_LABEL;

function Team() {
  const list = useServerFn(listSubmissions);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [code, setCode] = useState("");
  const [err, setErr] = useState(false);
  const [interestFilter, setInterestFilter] = useState("all");
  const [filter, setFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState("all");

  async function load(pass: string) {
    const res = await list({ data: { passcode: pass } });
    if (!res.ok) { setErr(true); sessionStorage.removeItem(PASS_KEY); return; }
    sessionStorage.setItem(PASS_KEY, pass);
    setRows(res.rows);
  }
  useEffect(() => {
    const p = sessionStorage.getItem(PASS_KEY);
    if (p) load(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!rows)
    return (
      <div className="mx-auto max-w-md px-5 py-20">
        <Eyebrow>Internal</Eyebrow>
        <h1 className="mt-2 text-3xl">Team dashboard</h1>
        <form className="mt-6 space-y-3" onSubmit={(e) => { e.preventDefault(); load(code); }}>
          <TextInput type="password" placeholder="Team passcode" value={code} onChange={(e) => setCode(e.target.value)} />
          {err && <p className="text-sm text-drive">Wrong passcode</p>}
          <PrimaryBtn type="submit" className="w-full">Unlock</PrimaryBtn>
        </form>
      </div>
    );

  const shown = rows.filter((r) => (filter === "all" || r.verdict === filter) && (interestFilter === "all" || (r.interest ?? "pending") === interestFilter) && (roleFilter === "all" || r.role === roleFilter));
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-5 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Internal</Eyebrow>
          <h1 className="mt-2 text-3xl">Submissions</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", "green", "yellow", "red"].map((f) => (
            <GhostBtn key={f} onClick={() => setFilter(f)}
              className={cn("rounded-full border border-border px-4 py-1.5 text-sm font-semibold capitalize", filter === f ? "border-navy bg-navy text-primary-foreground" : "text-navy")}>
              {f}
            </GhostBtn>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2"><span className="mr-2 text-xs text-caption">Interest</span>{["all", "yes", "no", "pending"].map(value => <GhostBtn key={value} onClick={() => setInterestFilter(value)} aria-pressed={interestFilter === value} className={cn("h-9 px-4 text-sm capitalize", interestFilter === value && "border-navy bg-navy text-primary-foreground")}>{value}</GhostBtn>)}</div>
      <div className="flex flex-wrap items-center gap-2"><span className="mr-2 text-xs text-caption">Role</span>{["all", ...Object.keys(ROLE)].map(value => <GhostBtn key={value} onClick={() => setRoleFilter(value)} aria-pressed={roleFilter === value} className={cn("h-9 px-4 text-sm", roleFilter === value && "border-navy bg-navy text-primary-foreground")}>{value === "all" ? "All" : ROLE[value]}</GhostBtn>)}</div>
      <div className="bento overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {["Brand", "Submitted by", "Date", "Branch", "Interest", "Verdict", "Margin", "Amazon rev", ""].map((h) => (
                <th key={h} className="eyebrow px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-caption">No submissions yet.</td></tr>}
            {shown.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-semibold text-navy">{r.brand_name || "Untitled"}</td>
                <td className="px-4 py-3">{r.submitter_name || "n/a"}<div className="text-xs text-caption">{ROLE[r.role ?? ""] ?? ""}</div></td>
                <td className="px-4 py-3">{new Date(r.created_at).toLocaleDateString("en-US")}</td>
                <td className="px-4 py-3 capitalize">{r.branch ?? "n/a"}</td>
                <td className="px-4 py-3 capitalize">{r.interest ?? "Pending"}</td>
                <td className="px-4 py-3"><VerdictBadge verdict={r.verdict} /></td>
                <td className="px-4 py-3">{r.margin != null ? pct(r.margin) : "n/a"}</td>
                <td className="px-4 py-3">{r.amazonRevenue ?? "n/a"}</td>
                <td className="px-4 py-3"><Link to="/report/$id" params={{ id: r.id }} className="font-semibold text-signal">Report</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
