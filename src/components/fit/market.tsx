/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { productMarketStats, productKey, ratePct, toNum, usd, num, pct, candidateProducts, selectedCompetitors, MAX_COMPETITORS, type MarketData, type Answers } from '@/lib/calc';
import { formatGrowth, groupCompetitors, nicheStats, relevanceOf, type Relevance } from '@/lib/discovery';
import { addMarketCompetitor, editMarketTerms, findMarketCompetitors } from '@/lib/fit.functions';
import { Stat, Note, GhostBtn, PrimaryBtn, TextInput } from './ui';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MarketInsights, SourceLine } from './insights';
import { competitorInsights } from '@/lib/calc';
import { cn } from '@/lib/utils';

const img = (p: any) => p.master_image_url || p.image_url;
const marketStats = (k: MarketData | null, answers: Answers) => productMarketStats(k, answers);

export function KeywordLine({ k, onEdit }: { k: MarketData | null; onEdit?: ((keywords: string[]) => void) | undefined }) {
  const [editing, setEditing] = useState(false);
  const info = k?.keywordInfo ?? [];
  const [value, setValue] = useState(info.map(i => i.input).join(', '));
  if (!info.length && !onEdit) return null;
  const submit = (v: string) => { const kws = v.split(',').map(x => x.trim()).filter(Boolean).slice(0, 3); if (kws.length) { onEdit?.(kws); setEditing(false); } };
  return <div className="space-y-3 text-sm">
    {info.length > 0 && <p className="text-caption">Market based on: {info.map((i, n) => <span key={i.input}>{n > 0 && ', '}<span className="font-semibold text-navy">{i.used}</span>{i.broadened && ` (broadened from '${i.input}')`}</span>)}
      {onEdit && <> · <button type="button" className="font-semibold text-signal underline" onClick={() => setEditing(e => !e)}>Edit keywords</button></>}</p>}
    {onEdit && (editing || !info.length) && <form className="flex flex-wrap gap-2" onSubmit={e => { e.preventDefault(); submit(value); }}>
      <TextInput aria-label="Search keywords" placeholder="Up to 3 keywords, comma separated" value={value} onChange={e => setValue(e.target.value)} className="max-w-md" />
      <PrimaryBtn type="submit">Search again</PrimaryBtn>
    </form>}
    {onEdit && (k?.suggestions?.length ?? 0) > 0 && <div className="flex flex-wrap items-center gap-2"><span className="text-caption">Few products found. Try:</span>{k?.suggestions?.map(sug => <button key={sug} type="button" onClick={() => onEdit([sug])} className="rounded-full border border-signal px-3 py-1 font-semibold text-navy hover:bg-signal/10">{sug}</button>)}</div>}
  </div>;
}

export function MarketShare({ k, answers }: { k: MarketData | null; answers: Answers }) {
  const stats = marketStats(k, answers);
  const shares = stats.products.slice(0, 10).map(p => ({ ...p, share: stats.gmv ? toNum(p.revenue) / stats.gmv * 100 : 0 }));
  const others = stats.products.slice(10).reduce((s, p) => s + toNum(p.revenue), 0);
  return <section className="space-y-4">
    <h3 className="text-xl">Market share</h3>
    <div className="space-y-3">
      {shares.map((p, i) => <div key={productKey(p)} className="grid grid-cols-[36px_minmax(0,1fr)_60px] items-center gap-3 sm:grid-cols-[40px_minmax(0,240px)_1fr_64px]">
        {img(p) ? <img src={img(p)} alt="" className="h-9 w-9 rounded object-cover" /> : <div className="h-9 w-9 rounded bg-cloud" />}
        <span title={p.product_name} className="truncate text-sm font-semibold text-navy">{p.product_name}</span>
        <div className="col-start-2 row-start-auto h-2 bg-cloud sm:col-start-auto"><div className={cn('h-full', i < 3 ? 'bg-navy' : 'bg-signal')} style={{ width: `${p.share}%` }} /></div>
        <span className="col-start-3 row-start-auto text-right text-xs text-navy sm:col-start-auto">{pct(p.share)}</span>
      </div>)}
      {others > 0 && <div className="flex items-center justify-between border-t border-border pt-3 text-sm"><span>Others</span><span>{pct(stats.gmv ? others / stats.gmv * 100 : 0)}</span></div>}
    </div>
    <SourceLine />
  </section>;
}

export function PriceBands({ k, answers, title = 'Price bands' }: { k: MarketData | null; answers: Answers; title?: string }) {
  const stats = marketStats(k, answers);
  const prices = stats.products.map(p => toNum(p.unit_price)).filter(n => n > 0);
  const maxPrice = Math.max(...prices, answers.marketPrice ?? 0, 1);
  const bandWidth = Math.ceil(maxPrice / 5 / 5) * 5;
  const bands = Array.from({ length: 5 }, (_, i) => ({ price: (i + .5) * bandWidth, count: prices.filter(p => p >= i * bandWidth && (i === 4 ? p <= (i + 1) * bandWidth : p < (i + 1) * bandWidth)).length }));
  return <section className="space-y-4">
    <h3 className="text-xl">{title}</h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%"><BarChart data={bands}>
        <XAxis dataKey="price" type="number" domain={[0, bandWidth * 5]} tickFormatter={v => usd(v)} />
        <YAxis allowDecimals={false} width={30} />
        <Tooltip labelFormatter={v => `${usd(Number(v) - bandWidth / 2)} to ${usd(Number(v) + bandWidth / 2)}`} formatter={v => [v, 'Products']} />
        <Bar dataKey="count" fill="var(--signal)" barSize={40} isAnimationActive={false} />
        {answers.marketPrice !== undefined && <ReferenceLine x={answers.marketPrice} stroke="var(--navy)" strokeWidth={2} label={{ value: 'Your price', fill: 'var(--navy)', position: 'insideTopRight' }} />}
      </BarChart></ResponsiveContainer>
    </div>
    {answers.marketPrice !== undefined && <p className="text-xs text-caption">Your price: {usd(answers.marketPrice, 2)}</p>}
    <SourceLine />
  </section>;
}

function ConfirmCompetitors({ id, k, answers, onAnswers, onEditKeywords, onMarket }: { id?: string | undefined; k: MarketData | null; answers: Answers; onAnswers: (a: Partial<Answers>) => void; onEditKeywords?: ((keywords: string[]) => void) | undefined; onMarket?: ((k: MarketData) => void) | undefined }) {
  const [tab, setTab] = useState<Relevance>('direct');
  const [term, setTerm] = useState('');
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const editTerms = useServerFn(editMarketTerms), find = useServerFn(findMarketCompetitors), add = useServerFn(addMarketCompetitor);
  const pool = k?.pool ?? [];
  const niche = nicheStats(pool, answers.productOverrides);
  const direct = candidateProducts(k, answers).filter((p) => toNum(p.revenue) >= 5000);
  const adjacent = groupCompetitors(pool.filter((p) => relevanceOf(p, answers.productOverrides) === 'adjacent'));
  const irrelevant = groupCompetitors(pool.filter((p) => relevanceOf(p, answers.productOverrides) === 'no'));
  const chosen = (answers.selectedProducts ?? selectedCompetitors(k, answers).map(productKey)).filter((key) => direct.some((p) => productKey(p) === key));
  const set = new Set(chosen);
  const selectedGmv = direct.filter((p) => set.has(productKey(p))).reduce((n, p) => n + toNum(p.revenue), 0);
  const toggle = (key: string) => {
    const next = set.has(key) ? chosen.filter(x => x !== key) : chosen.length < MAX_COMPETITORS ? [...chosen, key] : chosen;
    onAnswers({ selectedProducts: next });
  };
  const move = (p: any, relevance: Relevance) => {
    const overrides = { ...(answers.productOverrides ?? {}) };
    for (const id of p.listingIds ?? [productKey(p)]) overrides[id] = relevance;
    onAnswers({ productOverrides: overrides, selectedProducts: relevance === 'direct' ? chosen : chosen.filter((id) => id !== productKey(p)), competitorsConfirmed: false });
  };
  async function saveTerms(terms: string[]) {
    if (!terms.length || !id || !onMarket) { onEditKeywords?.(terms); return; }
    setBusy(true); setMessage('');
    try { onMarket(await editTerms({ data: { id, terms } })); onAnswers({ selectedProducts: undefined, competitorsConfirmed: false, productOverrides: {} }); }
    catch { setMessage('Could not update that search term.'); }
    finally { setBusy(false); }
  }
  async function searchMissing() {
    if (!id || !query.trim()) return;
    setBusy(true); setMessage(''); setFound([]);
    try {
      const result = await find({ data: { id, query } });
      if (result.productId) await addProduct(result.productId);
      else setFound(result.products);
    } catch { setMessage('No matching product was found. Try its exact product ID.'); }
    finally { setBusy(false); }
  }
  async function addProduct(productId: string) {
    if (!id) return;
    const result = await add({ data: { id, productId } });
    onMarket?.(result.k); onAnswers(result.answers); setFound([]); setQuery(''); setMessage('Competitor added to Direct.');
  }
  const rows = tab === 'direct' ? direct : tab === 'adjacent' ? adjacent : irrelevant;
  return <div className="space-y-6">
    <div className="space-y-1"><h2 className="text-2xl">Confirm your competitors</h2><p className="text-sm text-caption">Pick the products a shopper would compare with yours. Up to {MAX_COMPETITORS}.</p></div>
    {k?.discovery && <div className="space-y-3">
      <p className="text-sm text-navy">We scanned {k.discovery.totalScanned} products across {k.discovery.searchesCompleted} searches. Your selection covers {pct(niche.gmv ? selectedGmv / niche.gmv * 100 : 0)} of the direct niche GMV ({usd(selectedGmv)} of {usd(niche.gmv)}).</p>
      <div className="flex flex-wrap items-center gap-2">{k.discovery.searchTerms.map((t) => <span key={t} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs">{t}<button type="button" aria-label={`Remove ${t}`} disabled={busy || k.discovery?.searchTerms.length === 1} onClick={() => void saveTerms(k.discovery!.searchTerms.filter((x) => x !== t))}>×</button></span>)}
        <TextInput aria-label="Add market search term" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Add term" className="h-9 w-36" /><GhostBtn className="h-9" disabled={busy || !term.trim() || k.discovery.searchTerms.length >= 8} onClick={() => { void saveTerms([...k.discovery!.searchTerms, term.trim().toLowerCase()]); setTerm(''); }}>Search term</GhostBtn></div>
    </div>}
    {!k?.discovery && <KeywordLine k={k} onEdit={onEditKeywords} />}
    {direct.length < 3 && <Note>This niche is still small on TikTok Shop: only {direct.length} products sell over $5K a month. Review Adjacent products or add a broader search term.</Note>}
    <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
      {([['direct', `Direct competitors (${direct.length})`], ['adjacent', `Adjacent (${adjacent.length})`], ['no', `Not relevant (${irrelevant.length})`]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setTab(value)} className={cn('rounded-full border px-3 py-1.5 text-sm font-semibold', tab === value ? 'border-navy bg-navy text-primary-foreground' : 'border-border text-navy')}>{label}</button>)}
      <span className="ml-auto text-sm font-semibold text-navy">{chosen.length} of {MAX_COMPETITORS} selected</span>
    </div>
    <div className="space-y-3">{rows.slice(0, tab === 'no' ? 20 : 80).map((p) => {
      const key = productKey(p), on = set.has(key), full = !on && chosen.length >= MAX_COMPETITORS;
      return <div key={key} className={cn('flex flex-col gap-3 border p-3 sm:flex-row sm:items-start', on ? 'border-signal bg-card ring-2 ring-signal/20' : 'border-border')}>
        {tab === 'direct' && <input type="checkbox" checked={on} disabled={full} onChange={() => toggle(key)} aria-label={`Include ${p.product_name}`} className="mt-1 h-5 w-5 shrink-0 accent-[var(--signal)]" />}
        {img(p) ? <img src={img(p)} alt="" className="h-16 w-16 shrink-0 rounded object-cover" /> : <div className="h-16 w-16 shrink-0 rounded bg-cloud" />}
        <div className="min-w-0 flex-1 space-y-1"><span title={p.product_name} className="line-clamp-2 text-sm font-semibold text-navy">{p.product_name}</span>
          <p className="text-xs text-caption">{p.shop_name ?? p.seller_name ?? p.product_shop_name ?? 'Seller unavailable'} · {usd(toNum(p.unit_price), 2)} · <span className="font-semibold text-navy">{usd(toNum(p.revenue))} / 30d</span> · {pct(ratePct(p.commission_rate))} commission</p>
          <p className="text-xs text-caption">Found: {(p.foundTerms ?? []).join(', ') || 'seller expansion'}{p.listingCount > 1 ? ` · +${p.listingCount - 1} more listings` : ''}</p><p className="text-xs">{p.relevanceReason}</p></div>
        <select aria-label={`Classify ${p.product_name}`} value={relevanceOf(p, answers.productOverrides)} onChange={(e) => move(p, e.target.value as Relevance)} className="h-9 rounded-md border border-border bg-background px-2 text-xs"><option value="direct">Direct</option><option value="adjacent">Adjacent</option><option value="no">Not relevant</option></select>
      </div>;
    })}</div>
    {id && <div className="bento space-y-3 p-4"><div className="font-semibold text-navy">Missing a competitor?</div><div className="flex flex-col gap-2 sm:flex-row"><TextInput aria-label="Find missing competitor" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Product name, brand, TikTok link or product ID" /><GhostBtn disabled={busy || !query.trim()} onClick={() => void searchMissing()}>Find product</GhostBtn></div>
      {found.length > 0 && <div className="max-h-64 space-y-2 overflow-y-auto">{found.map((p) => <button type="button" key={productKey(p)} onClick={() => void addProduct(productKey(p))} className="flex w-full items-center gap-3 border-b border-border py-2 text-left text-sm"><span className="flex-1">{p.product_name}</span><span>{usd(toNum(p.revenue))}</span><span className="font-semibold text-signal">Add</span></button>)}</div>}
    </div>}
    {message && <Note>{message}</Note>}
    <PrimaryBtn type="button" disabled={chosen.length < 2 || busy} onClick={() => onAnswers({ selectedProducts: chosen, competitorsConfirmed: true })}>Analyze selected competitors</PrimaryBtn>
  </div>;
}

export function ProductMarket({ id, k, answers, onAnswers, afterShare, onEditKeywords, onMarket }: { id?: string | undefined; k: MarketData | null; answers: Answers; onAnswers?: ((a: Partial<Answers>) => void) | undefined; afterShare?: React.ReactNode; onEditKeywords?: ((keywords: string[]) => void) | undefined; onMarket?: ((k: MarketData) => void) | undefined }) {
  const m = productMarketStats(k, answers);
  if (!k?.ok || !m.products.length) return <><Note>{k?.ok ? 'No competing products found. Try a broader keyword.' : 'Market data unavailable. Please retry when you are ready.'}</Note>{k?.ok && <KeywordLine k={k} onEdit={onEditKeywords} />}{afterShare}</>;
  if (onAnswers && !answers.competitorsConfirmed) return <ConfirmCompetitors id={id} k={k} answers={answers} onAnswers={onAnswers} onEditKeywords={onEditKeywords} onMarket={onMarket} />;
  const stats = marketStats(k, answers);
  const leader = stats.products[0];
  const commissions = stats.products.map(p => ratePct(p.commission_rate)).filter(n => n > 0).sort((a, b) => a - b);
  const low = commissions[Math.floor(commissions.length * .25)] ?? 0;
  const high = commissions[Math.floor(commissions.length * .75)] ?? 0;
  const channel = (p: any) => ['Creator video', 'Live', 'Shop tab'][[toNum(p.video_revenue), toNum(p.live_revenue), toNum(p.shopping_mall_revenue ?? p.showcase_revenue)].reduce((best, v, i, a) => v > (a[best] ?? 0) ? i : best, 0)];
  const insights = competitorInsights(k, answers);
  if (!insights.hasData) return <div className="space-y-4"><Note>Not enough market data for this keyword. Try a broader keyword.</Note><KeywordLine k={k} onEdit={onEditKeywords} />{onAnswers && <GhostBtn onClick={() => onAnswers({ competitorsConfirmed: false })}>Edit competitors</GhostBtn>}</div>;
  return <div className="space-y-8">
    <KeywordLine k={k} />
    {onAnswers && <GhostBtn type="button" className="text-sm underline text-navy" onClick={() => onAnswers({ competitorsConfirmed: false })}>Edit competitors ({insights.products.length} selected)</GhostBtn>}
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Stat label="Direct niche GMV, 30 days" value={usd(stats.gmv)} sub={`${stats.productCount} direct products from ${stats.sellerCount || 'multiple'} sellers`} tone="dark" />
      <Stat label="Units sold, 30 days" value={num(stats.units)} />
      <Stat label="Median price" value={usd(stats.medianPrice, 2)} />
      <Stat label="Median affiliate commission" value={pct(stats.medianCommission)} />
      <Stat label="Creator videos" value={pct(stats.shares[0] ?? 0)} sub="Share of 30-day GMV" />
      <Stat label="Live / shop tab" value={`${pct(stats.shares[1] ?? 0)} / ${pct(stats.shares[2] ?? 0)}`} sub="Share of 30-day GMV" />
    </div>
    <MarketShare k={k} answers={answers} />
    <MarketInsights k={k} answers={answers} />
    <div className="grid gap-3 sm:grid-cols-3">
      <Note>Creator videos drive {pct(stats.shares[0] ?? 0)} of sales in this market.</Note>
      <Note>{commissions.length ? `Top products pay ${pct(low)} to ${pct(high)} affiliate commission.` : 'Affiliate commission data is unavailable.'}</Note>
      <Note>{leader ? `The #1 product does ${usd(toNum(leader.revenue))} a month at ${usd(toNum(leader.unit_price), 2)}.` : 'Choose competitors to see the market leader.'}</Note>
    </div>
    <PriceBands k={k} answers={answers} />
    <section className="space-y-4">
      <h3 className="text-xl">Competing products</h3>
      <div className="overflow-x-auto border-y border-border">
        <table className="w-full min-w-[860px] text-sm"><thead><tr className="border-b border-border text-left">
          {['Product', 'Price', '30d GMV', 'Units', 'Growth', 'Commission', 'Main channel'].map(h => <th key={h} className="eyebrow px-3 py-3">{h}</th>)}
        </tr></thead><tbody>{stats.products.map(p => <tr key={productKey(p)} className="border-b border-border">
          <td className="px-3 py-3"><div className="flex items-center gap-3">{img(p) && <img src={img(p)} alt="" className="h-10 w-10 rounded object-cover" />}<span className="line-clamp-2 w-56 text-navy">{p.product_name}</span></div></td>
          <td className="px-3">{usd(toNum(p.unit_price), 2)}</td><td className="px-3 font-semibold text-navy">{usd(toNum(p.revenue))}</td><td className="px-3">{num(toNum(p.sales_volumn ?? p.sales_volume))}</td>
          <td className="px-3">{formatGrowth(p.revenue_growth_rate, p.launch_date) === 'new' ? 'new' : formatGrowth(p.revenue_growth_rate, p.launch_date) === null ? 'n/a' : pct(formatGrowth(p.revenue_growth_rate, p.launch_date) as number)}</td><td className="px-3">{pct(ratePct(p.commission_rate))}</td><td className="px-3">{channel(p)}</td>
        </tr>)}</tbody></table>
      </div>
      <SourceLine />
    </section>
    {afterShare}
  </div>;
}
