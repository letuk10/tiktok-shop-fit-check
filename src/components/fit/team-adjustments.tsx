import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { adjustTeamAssumptions, refreshTeamData, findOwnProducts } from '@/lib/fit.functions';
import { computeAll, type MarketData, type Answers } from '@/lib/calc';
import { Field, GhostBtn, Note, PrimaryBtn, TextInput } from './ui';

export function TeamAdjustments({ id, passcode, k, answers, r, onData }: { id: string; passcode: string; k: MarketData | null; answers: Answers; r: ReturnType<typeof computeAll>; onData: (k: MarketData) => void }) {
  const adjust = useServerFn(adjustTeamAssumptions), refresh = useServerFn(refreshTeamData), find = useServerFn(findOwnProducts);
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const empty = { postRate: '', commission: '', samples: '', roas: '', guardrailMonth6: '', guardrailMonth12: '' };
  const [values, setValues] = useState(empty);
  useEffect(() => setValues({
    postRate: String(r.assumptions.videoRatePct), commission: String(r.assumptions.affiliatePct), samples: String(r.assumptions.samplesPerMonth), roas: String(r.assumptions.roas),
    guardrailMonth6: String(r.assumptions.guardrailMonth6), guardrailMonth12: String(r.assumptions.guardrailMonth12),
  }), [r.assumptions.videoRatePct, r.assumptions.affiliatePct, r.assumptions.samplesPerMonth, r.assumptions.roas, r.assumptions.guardrailMonth6, r.assumptions.guardrailMonth12]);
  async function save(reset = false) {
    setBusy(true);
    try {
      onData(await adjust({ data: { id, passcode, overrides: reset ? {} : { postRate: Number(values.postRate) / 100, commission: Number(values.commission), samples: Number(values.samples), roas: Number(values.roas), guardrailMonth6: Number(values.guardrailMonth6), guardrailMonth12: Number(values.guardrailMonth12) } } }));
      setMessage(reset ? 'Market defaults restored.' : 'Adjustments saved.');
    } catch { setMessage('Could not save. Check the values and passcode.'); }
    finally { setBusy(false); }
  }
  async function reload() {
    setBusy(true);
    try { let latest = await refresh({ data: { id, passcode } }); if (answers.shopId) latest = await find({ data: { id } }); onData(latest); setMessage('Market refreshed. Confirm competitors and finish the product scans.'); }
    catch { setMessage('Refresh could not finish. Cached data is retained.'); }
    finally { setBusy(false); }
  }
  const fields = [['postRate', 'Post rate (%)'], ['commission', 'Commission (%)'], ['samples', 'Samples per month'], ['roas', 'Ad ROAS'], ['guardrailMonth6', 'Guardrail: month-6 GMV ($)'], ['guardrailMonth12', 'Guardrail: month-12 GMV ($)']] as const;
  return <div className="no-print space-y-4 border-y border-border py-4">
    <div className="flex flex-wrap gap-3"><GhostBtn onClick={() => setOpen(!open)}>Adjust assumptions</GhostBtn><GhostBtn onClick={() => void reload()} disabled={busy}>Refresh market</GhostBtn></div>
    {open && <form className="space-y-4" onSubmit={e => { e.preventDefault(); void save(); }}>
      <div className="grid gap-4 sm:grid-cols-3">{fields.map(([key, label]) => <Field key={key} label={label}><TextInput aria-label={label} type="number" required min={key === 'samples' ? 150 : key === 'postRate' ? 1 : 0} max={key === 'postRate' || key === 'commission' ? 100 : undefined} step={key === 'samples' ? '1' : 'any'} value={values[key]} onChange={e => setValues({ ...values, [key]: e.target.value })} /></Field>)}</div>
      <p className="text-xs text-caption">Guardrails also respect the selected competitor median: month 6 uses the lower of this cap and 50% of that median; month 12 uses the lower of this cap and that median.</p>
      <div className="flex gap-3"><PrimaryBtn type="submit" disabled={busy}>Save adjustments</PrimaryBtn><GhostBtn onClick={() => void save(true)} disabled={busy}>Restore market defaults</GhostBtn></div>
    </form>}
    {r.earlyProfitFlag && <Note tone="warn">Check inputs: the unadjusted model showed profit before month 3. Partner views start no earlier than month 3.</Note>}
    {r.capNotes.map((note) => <Note key={note}>{note}</Note>)}
    {message && <Note>{message}</Note>}
  </div>;
}
