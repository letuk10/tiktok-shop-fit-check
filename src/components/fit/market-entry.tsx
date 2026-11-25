import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, Loader2, Plus, X } from 'lucide-react';
import { createSubmission, lookupAsin, suggestSearchTerms } from '@/lib/fit.functions';
import { marketEntrySchema } from '@/lib/qualification';
import { parseAsins } from '@/lib/calc';
import { titleFromAmazonUrl } from '@/lib/asin';
import type { AsinProduct } from '@/lib/asin';
import { Field, TextInput, PrimaryBtn, GhostBtn, Note } from './ui';

export function MarketEntry() {
  const [brand, setBrand] = useState('');
  const [amazonInput, setAmazonInput] = useState('');
  const [product, setProduct] = useState('');
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [price, setPrice] = useState('');
  const [manual, setManual] = useState(false);
  const [lookup, setLookup] = useState<AsinProduct | null>(null);
  const [busy, setBusy] = useState(false);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [error, setError] = useState('');
  const create = useServerFn(createSubmission);
  const lookupFn = useServerFn(lookupAsin);
  const suggest = useServerFn(suggestSearchTerms);
  const nav = useNavigate();
  const asin = parseAsins(amazonInput)[0] ?? '';
  // With a found listing the product name is the Amazon title; otherwise what the user typed.
  const productName = lookup?.title || product || amazonInput;
  const valid = marketEntrySchema.safeParse({ brand, product: productName, asin, keywords, price: price ? Number(price) : undefined, lookup: lookup ?? undefined }).success;

  async function findAmazon() {
    if (!asin || lookupBusy) return;
    setLookupBusy(true); setError(''); setLookup(null);
    try {
      const result = await lookupFn({ data: { asin } });
      if (!result.ok || !result.product) {
        // Fall back to what the link itself tells us: the product name in the URL and a first keyword.
        const fromUrl = titleFromAmazonUrl(amazonInput);
        if (fromUrl) {
          setProduct((p) => p || fromUrl);
          const initial = starterKeyword(fromUrl, brand);
          try { const expanded = await suggest({ data: { title: fromUrl, keywords: [initial] } }); if (expanded.terms.length) setKeywords(expanded.terms.slice(0, 3)); } catch { setKeywords([initial]); }
        }
        setError(result.message ?? 'Enter the product details manually.'); setManual(true); return;
      }
      const item = result.product;
      setLookup(item); setBrand((b) => b || item.brand); setPrice(item.price ? String(item.price.toFixed(2)) : '');
      const initial = item.keywords?.length ? item.keywords : [starterKeyword(item.title, brand || item.brand)];
      const expanded = await suggest({ data: { title: item.title, keywords: initial } });
      setKeywords(expanded.terms); setManual(false);
    } catch { setError('We could not retrieve this Amazon listing. Enter the details manually.'); setManual(true); }
    finally { setLookupBusy(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!valid || busy) return;
    setBusy(true); setError('');
    try {
      const { id } = await create({ data: { brand, product: productName, asin, keywords, price: Number(price), lookup: lookup ?? undefined } });
      await nav({ to: '/fit/$id', params: { id } });
    } catch { setError('We could not start your analysis. Please try again.'); setBusy(false); }
  }

  return <div className="mx-auto max-w-2xl px-5 pb-16 pt-8 sm:pt-12">
    <h1 className="text-3xl sm:text-4xl">See your TikTok Shop market</h1>
    <form onSubmit={submit} className="mt-8 space-y-6">
      <Field label="Brand name"><TextInput aria-label="Brand name" value={brand} onChange={e => setBrand(e.target.value)} required maxLength={200} /></Field>
      <Field label="Paste your Amazon link or ASIN" help="We will look for the title, price, package size and weight.">
        <div className="flex flex-col gap-2 sm:flex-row"><TextInput aria-label="Amazon link or ASIN" value={amazonInput} onChange={e => { setAmazonInput(e.target.value); setLookup(null); }} />
          <GhostBtn type="button" onClick={findAmazon} disabled={!asin || lookupBusy} className="shrink-0">{lookupBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Get Amazon details</GhostBtn></div>
      </Field>
      {lookup && <div className="bento flex gap-4 p-4">
        {lookup.image && <img src={lookup.image} alt="" className="h-24 w-24 rounded object-contain" />}
        <div className="min-w-0"><div className="font-semibold text-navy">{lookup.title}</div><p className="mt-1 text-sm">{lookup.price ? `$${lookup.price.toFixed(2)} · ` : ''}from Amazon</p>{lookup.lengthIn > 0 ? <p className="mt-1 text-xs text-caption">Package: {lookup.lengthIn.toFixed(1)} x {lookup.widthIn.toFixed(1)} x {lookup.heightIn.toFixed(1)} in, {lookup.weightLb.toFixed(2)} lb</p> : <p className="mt-1 text-xs text-caption">Package size not listed. You can add it in the next steps.</p>}</div>
      </div>}
      {lookup && !lookup.price && <Field label="Your price ($)" help="Amazon did not show a price for this listing."><TextInput aria-label="Your price" required type="number" min="0.01" step="any" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} /></Field>}
      {lookup && <Field label="TikTok search terms" help="Edit the terms shoppers would use to find directly competing products.">
        <div className="flex flex-wrap gap-2">{keywords.map((k) => <span key={k} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-sm">{k}<button type="button" aria-label={`Remove ${k}`} onClick={() => setKeywords(keywords.filter(x => x !== k))}><X className="h-3 w-3" /></button></span>)}</div>
        {keywords.length < 8 && <TermAdder onAdd={(term) => setKeywords([...new Set([...keywords, term])])} />}
      </Field>}
      {!lookup && <button type="button" className="text-sm font-semibold text-signal underline" onClick={() => setManual(!manual)}>No Amazon listing? Enter it manually</button>}
      {manual && !lookup && <div className="space-y-6 border-t border-border pt-6">
        <Field label="Product name"><TextInput aria-label="Product name" value={product} onChange={e => setProduct(e.target.value)} required /></Field>
        <Field label="TikTok search keywords" help="Use short shopper terms, such as beef tallow or sewing kit.">
          <div className="space-y-2">{keywords.map((k, i) => <TextInput key={i} aria-label={`Keyword ${i + 1}`} required value={k} onChange={e => setKeywords(keywords.map((v, j) => i === j ? e.target.value : v))} maxLength={200} />)}
            {keywords.length < 3 && <GhostBtn type="button" onClick={() => setKeywords([...keywords, ''])} className="h-9 px-3 text-sm"><Plus className="h-4 w-4" /> Add keyword</GhostBtn>}</div>
        </Field>
        <Field label="Your price ($)"><TextInput aria-label="Your price" required type="number" min="0.01" step="any" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} /></Field>
      </div>}
      {error && <Note>{error}</Note>}
      <PrimaryBtn type="submit" disabled={!valid || busy} className="h-14 w-full text-base">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : null} Analyze my market <ArrowRight className="h-5 w-5" /></PrimaryBtn>
    </form>
  </div>;
}

// A first search phrase from a product title: no brand name, numbers, sizes or filler words.
const FILLER = new Set(['for', 'with', 'and', 'the', 'of', 'a', 'an', '100', 'natural', 'organic', 'premium', 'best', 'new', 'pack', 'oz', 'fl', 'count', 'grass', 'fed', 'face', 'body', 'skin', 'care']);
function starterKeyword(title: string, brand: string) {
  const brandWords = new Set(brand.toLowerCase().split(/\s+/).filter(Boolean));
  const words = title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w && !brandWords.has(w) && !/^\d/.test(w) && !FILLER.has(w));
  return words.slice(0, 3).join(' ') || title.toLowerCase().split(/\s+/).slice(0, 3).join(' ');
}

function TermAdder({ onAdd }: { onAdd: (term: string) => void }) {
  const [term, setTerm] = useState('');
  return <div className="flex gap-2"><TextInput aria-label="Add search term" value={term} onChange={e => setTerm(e.target.value)} placeholder="Add a term" /><GhostBtn type="button" disabled={!term.trim()} onClick={() => { onAdd(term.trim().toLowerCase()); setTerm(''); }}>Add</GhostBtn></div>;
}
