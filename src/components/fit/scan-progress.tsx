import { useEffect, useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { enrichMarketProduct, findOwnProducts } from '@/lib/fit.functions';
import { productKey, selectedCompetitors, type Answers, type MarketData } from '@/lib/calc';
import { Check, Loader2 } from 'lucide-react';
import { GhostBtn, Note } from './ui';

export function ScanProgress({id,k,answers,onData,own=false,onBusy}:{id:string;k:MarketData|null;answers:Answers;onData:(k:MarketData)=>void;own?:boolean;onBusy?:(busy:boolean)=>void}) {
 const enrich=useServerFn(enrichMarketProduct), find=useServerFn(findOwnProducts);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[active,setActive]=useState('');
 const running=useRef(false);
 const products=own?k?.ownProducts??[]:selectedCompetitors(k,answers);
 const cache=own?k?.ownEnriched:k?.enriched;
 const key=products.map(productKey).join(',');
 async function run() {
  if(running.current||!k?.ok)return;
  running.current=true;setBusy(true);onBusy?.(true);setError('');
  try {
   let latest=k;
   if(own) latest=await find({data:{id,shopId:answers.shopId}});
   const list=own?latest.ownProducts??[]:selectedCompetitors(latest,answers);
   onData(latest);
   if(own && !list.length) setError("No product data was available for your shop. You can continue with market benchmarks.");
   for(const p of list) {const idp=productKey(p);if((own?latest.ownEnriched:latest.enriched)?.[idp]?.attempted)continue;setActive(idp);latest=await enrich({data:{id,productId:idp,own}});onData(latest);}
  } catch {setError('The scan stopped. Continue to finish the remaining products.');}
  finally {running.current=false;setBusy(false);setActive('');onBusy?.(false);}
 }
 useEffect(()=>{if(own||products.some(p=>!cache?.[productKey(p)]?.attempted))void run();},[key,own,answers.shopId]);
 return <div className="space-y-3" aria-live="polite">
  {busy&&<p className="text-sm font-semibold text-navy">{own?'Analyzing your products':'Analyzing selected competitors'}</p>}
  {products.map(p=>{const e=cache?.[productKey(p)];return <div key={productKey(p)} className="flex items-center gap-3 border-b border-border py-2 text-sm">{e?.attempted?<Check className="h-4 w-4 shrink-0 text-growth"/>:active===productKey(p)?<Loader2 className="h-4 w-4 shrink-0 animate-spin text-signal"/>:<span className="h-4 w-4 shrink-0 rounded-full border border-border"/>}<span className="min-w-0 flex-1 truncate">{p.product_name}</span><span className="shrink-0 text-xs text-caption">{e?.attempted?e.detail?'Complete':'Unavailable':active===productKey(p)?'Scanning':'Waiting'}</span></div>;})}
  {error&&<><Note>{error}</Note><GhostBtn onClick={()=>void run()} disabled={busy}>Continue scan</GhostBtn></>}
 </div>;
}