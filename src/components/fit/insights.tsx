import { competitorInsights, SOURCE, num, pct, usd, productKey, type Answers, type MarketData } from '@/lib/calc';
import { Note, Stat, GhostBtn } from './ui';
import { useState } from 'react';
import { Play, TriangleAlert } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { hasZeroCommission, validVideoId } from '@/lib/qualification';

export function SourceLine() {return <p className="mt-3 text-xs text-caption">{SOURCE}</p>;}
const money=(v:number|null)=>v===null?'n/a':usd(v);
const count=(v:number|null)=>v===null?'n/a':num(v);
const percent=(v:number|null)=>v===null?'n/a':pct(v);
const roas=(v:number|null)=>v===null?'n/a':`${v.toFixed(2)}x`;
type Metrics=ReturnType<typeof competitorInsights>['market'];
function cells(p:Metrics, capped?:boolean) {return [money(p.gmv),money(p.price),percent(p.commission),count(p.affiliates),`${count(p.newVideos)}${capped?'+':''}`,count(p.videos),count(p.lives),`${percent(p.videoShare)} / ${percent(p.liveShare)} / ${percent(p.shopShare)}`,percent(p.adsShare),roas(p.roas),money(p.gmvPerAffiliate),money(p.robustTrimmedMean),percent(p.hitRate)];}

type Part='benchmark'|'videos'|'creators'|'ads';
export function MarketInsights({k,answers,parts=['benchmark','videos','creators','ads']}:{k:MarketData|null;answers:Answers;parts?:Part[]}) {
 const show=(x:Part)=>parts.includes(x);
 const d=competitorInsights(k,answers);
 const [video,setVideo]=useState<{id:string;handle:string}|null>(null);
 if(!d.hasData) return <Note>Not enough market data for this keyword. Try a broader keyword.</Note>;
 return <div className="space-y-10">
  {d.sellerRunVideoCount > 0 && <Note>{d.sellerRunVideoCount} seller-run videos were excluded from affiliate creator benchmarks.</Note>}
  {hasZeroCommission([...d.products.map(p=>p.commission),d.market.commission,...d.own.map(p=>p.commission)]) && <Note tone="neutral"><span className="flex items-start gap-2"><TriangleAlert className="h-5 w-5 shrink-0"/> A 0% commission may mean TikTok Shop commission data was retrieved incorrectly. Verify it before using this benchmark.</span></Note>}
  {show('benchmark')&&<section className="space-y-4">
   <h2 className="text-2xl">How the top {d.products.length} products sell on TikTok</h2>
   <div className="overflow-x-auto border-y border-border"><table className="w-full min-w-[1800px] text-sm">
    <thead><tr className="border-b border-border text-left">{['Product','30d GMV','Price','Commission','Active affiliates','New videos / month','Videos with views','Lives','GMV: videos / lives / shop tab','Top videos as ads','Ad ROAS','GMV per affiliate','Affiliate GMV per video (trimmed)','Video hit rate'].map(h=><th key={h} className="eyebrow px-3 py-3">{h}</th>)}</tr></thead>
    <tbody>{d.products.map(p=><tr key={productKey(p.product)} className="border-b border-border"><td className="px-3 py-3"><div className="flex w-60 items-center gap-3">{(p.product.master_image_url||p.product.image_url)&&<img className="h-10 w-10 rounded object-cover" src={p.product.master_image_url||p.product.image_url} alt=""/>}<span className="line-clamp-2">{p.product.product_name}</span></div></td>{cells(p,p.capped).map((v,i)=><td key={i} className="px-3 py-3">{v}</td>)}</tr>)}
    <tr className="bg-cloud font-semibold text-navy"><td className="px-3 py-3">Market average (median)</td>{cells(d.market).map((v,i)=><td key={i} className="px-3 py-3">{v}</td>)}</tr>
    {d.own.map(p=><tr key={productKey(p.product)} className="border-t border-border bg-growth/10"><td className="px-3 py-3"><span className="block font-semibold">You vs market average</span><span className="line-clamp-2 w-60">{p.product.product_name}</span></td>{cells(p,p.capped).map((v,i)=><td key={i} className="px-3 py-3">{v}</td>)}</tr>)}
    </tbody></table></div><SourceLine/>
    <p className="text-xs text-caption">Counts and rates use medians of available products. Affiliate GMV per video excludes seller-run accounts and removes the top 5% of videos. Hit rate is the share of affiliate videos earning over $500. Video and creator rankings are sampled, not the whole market.</p>
  </section>}
  {show('videos')&&<section className="space-y-4"><h2 className="text-2xl">Top 10 videos</h2>
   {d.topVideos.length?<div className="overflow-x-auto border-y border-border"><table className="w-full min-w-[900px] text-sm"><thead><tr className="border-b border-border text-left">{['Creator','Followers','30d revenue','Views','Type','ROAS','Published',''].map(h=><th key={h} className="eyebrow px-3 py-3">{h}</th>)}</tr></thead><tbody>{d.topVideos.map(v=><tr key={v.video_id} className="border-b border-border"><td className="px-3 py-3">@{v.belonged_creator_handle}</td><td className="px-3">{v.followers===undefined?'n/a':num(Number(v.followers))}</td><td className="px-3">{usd(Number(v.revenue)||0)}</td><td className="px-3">{num(Number(v.views)||0)}</td><td className="px-3"><span className="rounded bg-cloud px-2 py-1 text-xs font-semibold">{Number(v.ad)===1?'Ad':'Organic'}</span></td><td className="px-3">{v.ads_roas===undefined?'n/a':roas(Number(v.ads_roas))}</td><td className="px-3">{v.publish_date?.split(' ')[0]??'n/a'}</td><td className="px-3"><GhostBtn className="h-9 whitespace-nowrap px-3 text-sm" disabled={!validVideoId(String(v.video_id))} onClick={()=>setVideo({id:String(v.video_id),handle:v.belonged_creator_handle??''})}><Play className="h-4 w-4"/> Watch video</GhostBtn></td></tr>)}</tbody></table></div>:<Note>Video rankings are unavailable for these products.</Note>}<SourceLine/>
  </section>}
  {show('creators')&&<section className="space-y-4"><h2 className="text-2xl">Creator profile</h2>
   <p>{d.creators.leader?`Most sales come from creators with ${d.creators.leader} followers.`:'Creator profile data is unavailable.'}</p>
   <div className="overflow-x-auto"><table className="w-full min-w-[540px] text-sm"><thead><tr className="border-b border-border text-left">{['Followers','Creators','Revenue share',...(d.own.length?['Your creators','Your revenue share']:[])].map(h=><th key={h} className="eyebrow p-3">{h}</th>)}</tr></thead><tbody>{d.creators.buckets.map((b,i)=><tr key={b.label} className="border-b border-border"><td className="p-3">{b.label}</td><td className="p-3">{b.count}</td><td className="p-3">{pct(b.share)}</td>{d.own.length>0&&<><td className="p-3">{d.ownCreators.buckets[i]?.count??0}</td><td className="p-3">{pct(d.ownCreators.buckets[i]?.share??0)}</td></>}</tr>)}</tbody></table></div>
   <p className="text-sm">Revenue from videos: {percent(d.creators.videoShare)}. Lives: {percent(d.creators.liveShare)}.</p>
   {d.own.length>0&&<p className="text-sm">You vs market average: videos {percent(d.ownCreators.videoShare)}, lives {percent(d.ownCreators.liveShare)}.</p>}<SourceLine/>
  </section>}
  {show('ads')&&<section className="space-y-4"><h2 className="text-2xl">Ads</h2>
   <div className="grid gap-3 sm:grid-cols-3"><Stat label="Top videos running as ads" value={percent(d.ads.adsShare)}/><Stat label="Revenue-weighted ad ROAS" value={roas(d.ads.roas)}/><Stat label="Ad revenue ratio" value={percent(d.ads.adRevenueRatio)}/></div>
   {d.own.length>0&&<p className="text-sm">You vs market average: {percent(d.ownAds.adsShare)} ad videos, {roas(d.ownAds.roas)} ROAS, {percent(d.ownAds.adRevenueRatio)} ad revenue ratio.</p>}
   <p className="text-xs text-caption">ROAS is Kalodata's estimate. Ads metrics cover the returned top videos; revenue ratios are revenue-weighted across ad videos.</p><SourceLine/>
  </section>}
  <Dialog open={!!video} onOpenChange={open=>{if(!open)setVideo(null);}}><DialogContent className="max-h-[95dvh] max-w-md overflow-y-auto"><DialogTitle>Video by @{video?.handle}</DialogTitle><DialogDescription>TikTok Shop competitor video</DialogDescription>{video&&<><iframe title={`TikTok video by ${video.handle}`} src={`https://www.tiktok.com/player/v1/${video.id}?autoplay=0`} allow="fullscreen; encrypted-media" allowFullScreen className="mx-auto aspect-[9/16] max-h-[68dvh] w-full rounded border border-border"/><p className="text-xs text-caption">If TikTok cannot play this video here, <a href={`https://www.tiktok.com/@${encodeURIComponent(video.handle)}/video/${video.id}`} target="_blank" rel="noreferrer" className="font-semibold text-signal">open it on TikTok</a>.</p></>}</DialogContent></Dialog>
 </div>;
}