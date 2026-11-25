import { describe, expect, it } from "vitest";
import { keywordVariants, selectedCompetitors, opportunitySignals, economics, competitorInsights, creatorInsights, enrichedMetrics, projectScenario, quantile, videoInsights, billableWeight, computeAll, computeVerdict, DEFAULT_ASSUMPTIONS, emptyProduct, fbtFee, parseAsins, productEconomics, productMarketStats, topMarketProducts, type MarketData } from "@/lib/calc";

describe("fit check rules", () => {
  const market: MarketData = {ok: true, competitors: [{revenue: 999999, video_number: 1}], keywords: [{keyword: 'test', shops: [], products: Array.from({length: 21}, (_, i) => ({product_id: String(i), revenue: (i+1)*100, video_revenue: (i+1)*75, live_revenue: (i+1)*20, showcase_revenue: (i+1)*5, unit_price: i+1, commission_rate: .15, sales_volumn: 10}))}]};
  it("deduplicates by product id and keeps the revenue-ranked top 20 overall", () => {
    const k = {...market, keywords: [...market.keywords, {keyword: 'duplicate', shops: [], products: [{product_id: '20', revenue: 2100}]}]};
    const products = topMarketProducts(k);
    expect(products).toHaveLength(20);
    expect(products[0].product_id).toBe('20');
    expect(products.at(-1).product_id).toBe('1');
  });
  it("uses top-20 product GMV, units and product sales channels without shop data", () => {
    const stats = productMarketStats(market);
    expect(stats.gmv).toBe(23000);
    expect(stats.units).toBe(200);
    expect(stats.shares).toEqual([75, 20, 5]);
    expect(stats.medianCommission).toBe(15);
  });
  it("does not invent video GMV or scenarios without measured data", () => {
    const result = computeAll({branch: 'launch', answers: {}, products: [emptyProduct()], assumptions: DEFAULT_ASSUMPTIONS, kalodata: null});
    expect(result.gmvPerVideo).toBe(0);
    expect(result.scenarios).toEqual([]);
  });
  it("parses a raw ASIN", () => {expect(parseAsins('B0ABCDEFGH')).toEqual(['B0ABCDEFGH']);});
  it("FBT uses dimensional weight above 332 cubic inches and the official 3+ to 4 lb tier", () => {
    const p = { ...emptyProduct(), weight: 1.2, length: 10, width: 10, height: 5 }; // dim 3.01 -> 4 lb
    expect(billableWeight(p)).toBe(4);
    expect(fbtFee(p)).toBeCloseTo(6.92, 5);
  });
  it("contribution includes 6% referral, affiliate commission, COGS, official FBT, 2% ads and 3% returns", () => {
    const p = { ...emptyProduct(), price: 40, cogs: 8, weight: 1, length: 4, width: 4, height: 4 };
    const e = productEconomics(p, DEFAULT_ASSUMPTIONS, "fbt");
    expect(e.contribFloor).toBeCloseTo(40 - 2.4 - 40 * 0.15 * 0.7 - 8 - 5.10 - 0.8 - 1.2, 5);
  });
  it("parses ASINs from /dp/ and /gp/product/ links", () => {
    expect(parseAsins("https://www.amazon.com/x/dp/B0ABCDEFGH?ref=1")).toEqual(["B0ABCDEFGH"]);
    expect(parseAsins("https://amazon.com/gp/product/B012345678")).toEqual(["B012345678"]);
  });
  it("red when no US seller account", () => {
    const v = computeVerdict({ branch: "launch", answers: { usSeller: "no", commitSamples: true, amazonRevenue: "$100-250K" }, products: [emptyProduct(), emptyProduct()], avgMarginFloor: 30 });
    expect(v.verdict).toBe("red");
  });
  it("red when margin below 15%", () => {
    const v = computeVerdict({ branch: "launch", answers: { usSeller: "yes", commitSamples: true, amazonRevenue: "$100-250K" }, products: [emptyProduct(), emptyProduct()], avgMarginFloor: 12 });
    expect(v.verdict).toBe("red");
  });
  it("yellow when Amazon revenue below $50K", () => {
    const v = computeVerdict({ branch: "launch", answers: { usSeller: "yes", commitSamples: true, amazonRevenue: "$20-50K" }, products: [emptyProduct(), emptyProduct()], avgMarginFloor: 30 });
    expect(v.verdict).toBe("yellow");
  });
  it("green when profitable, committed and $50K+", () => {
    const v = computeVerdict({ branch: "launch", answers: { usSeller: "yes", commitSamples: true, amazonRevenue: "$50-100K" }, products: [emptyProduct(), emptyProduct()], avgMarginFloor: 30 });
    expect(v.verdict).toBe("green");
  });
});

describe('Kalodata-derived rules',()=>{
 const products=Array.from({length:6},(_,i)=>({product_id:String(i),product_name:`Product ${i}`,revenue:6000-i*100}));
 const k:MarketData={ok:true,keywords:[{keyword:'test',shops:[],products}],competitors:[],enriched:Object.fromEntries(products.map((p,i)=>[p.product_id,{product:p,detail:{...p,unit_price:20,commission_rate:20,creator_number:2400,video_number:100,live_number:10,video_revenue:10000+i*1000,live_revenue:1000,shopping_mall_revenue:500},newVideos:100,newVideosCapped:true,videos:[{video_id:p.product_id,ad:1,revenue:100,ads_roas:4,ad_revenue_ratio:70}],creators:[]}]))};
 const compute=(data:MarketData=k)=>computeAll({branch:'launch',answers:{},products:[emptyProduct()],assumptions:DEFAULT_ASSUMPTIONS,kalodata:data});
 it('uses only selected top five by revenue',()=>{expect(competitorInsights(k,{}).products.map(p=>p.product.product_id)).toEqual(['0','1','2','3','4']);expect(competitorInsights(k,{excludedProducts:['0']}).products.map(p=>p.product.product_id)).toEqual(['1','2','3','4','5']);});
 it('derives GMV per video and affiliate from measured counts',()=>{const e=k.enriched?.['0'];if(!e)throw new Error('fixture missing');expect(enrichedMetrics(e).gmvPerVideo).toBe(100);expect(enrichedMetrics(e).gmvPerAffiliate).toBe(2.5);});
 it('sets median commission rounded to whole percent with 10 percent minimum',()=>{expect(compute().assumptions.affiliatePct).toBe(20);const low={...k,enriched:Object.fromEntries(Object.entries(k.enriched??{}).map(([id,e])=>[id,{...e,detail:{...e.detail,commission_rate:6.4}}]))};expect(compute(low).assumptions.affiliatePct).toBe(10);});
 it('benchmarks GMV per video as the median of competitor revenue over videos',()=>{const r=compute();expect(r.plan.gmvPerVideo).toBe(58);expect(r.gmvPerVideo).toBe(58);expect(r.plan.creatorsPerVideo).toBe(1);});
 it('keeps the 150 sample floor when the category pace needs less',()=>{const r=compute();expect(r.plan.paceSamples).toBe(150);expect(r.assumptions.samplesPerMonth).toBe(150);});
 it('sends 150 samples in month one for a new shop and applies the post rate',()=>{expect(compute().scenarios[0]?.rows[0]?.samples).toBe(150);expect(compute().scenarios[0]?.rows[0]?.newVideos).toBe(60);});
 it('uses the new-shop revenue ramp and 35 percent monthly decay',()=>{const r=compute();expect(r.scenarios[0]?.rows[0]?.gmv).toBeCloseTo(60*58*.15);expect(r.scenarios[0]?.rows[1]?.cumVideos).toBeCloseTo(60*.65+60);expect(r.scenarios[0]?.rows[2]?.cumVideos).toBeCloseTo((60*.65+60)*.65+60);});
 it('starts ads in month three only after 100 videos are live and ads add cost, not GMV',()=>{const r=compute();expect(r.assumptions.adStartMonth).toBe(3);expect(r.assumptions.adDaily).toBe(100);const row=r.scenarios[0]?.rows[2];expect(row?.adSpend).toBe(3000);expect(row?.gmv).toBeCloseTo((row?.cumVideos??0)*(row?.gmvPerVideo??0));expect(compute({...k,teamOverrides:{roas:3}}).assumptions.roas).toBe(2.5);});
 it('shows the chosen pace and the 150 minimum path, inside the guardrails',()=>{const r=compute();expect(quantile([100,110,120,130,140],.25)).toBe(110);expect(r.scenarios.map(s=>s.label)).toEqual(['Category pace','Minimum']);expect(r.scenarios[0]?.rows[5]?.gmv).toBeLessThanOrEqual(2900+1e-6);expect(r.scenarios[0]?.rows[11]?.gmv).toBeLessThanOrEqual(5800+1e-6);expect(r.plan.paths.map(p=>p.key)).toEqual(['pace','minimum']);});
 it('calculates revenue-weighted ROAS across ad videos only',()=>{expect(videoInsights([{ad:1,revenue:100,ads_roas:2},{ad:1,revenue:300,ads_roas:6},{ad:0,revenue:999,ads_roas:20}]).roas).toBe(5);});
 it('supports shopping mall revenue as shop tab GMV',()=>{expect(productMarketStats({ok:true,competitors:[],keywords:[{keyword:'test',shops:[],products:[{revenue:100,shopping_mall_revenue:25}]}]}).shares[2]).toBe(25);});
 it('skips missing products and suppresses plans with fewer than two usable competitors',()=>{const missing={...k,enriched:{'0':k.enriched?.['0']??{product:products[0]}}};expect(compute(missing).scenarios).toEqual([]);expect(competitorInsights(missing,{}).products).toHaveLength(1);});
 it('uses creator follower buckets by count and revenue share',()=>{const c=creatorInsights([{creator_id:'a',creator_followers:'9999',revenue:10},{creator_id:'b',creator_followers:'10000',revenue:70},{creator_id:'c',creator_followers:'50000',revenue:10},{creator_id:'d',creator_followers:'250000',revenue:10}]);expect(c.buckets.map(b=>b.count)).toEqual([1,1,1,1]);expect(c.buckets.map(b=>b.share)).toEqual([10,70,10,10]);expect(c.leader).toBe('10K to 50K');});
 it('applies saved team overrides and ignores client plan assumptions',()=>{const r=compute({...k,teamOverrides:{postRate:.5,commission:25,samples:300,roas:3},adjustedAt:'2026-11-09'});expect(r.assumptions.videoRatePct).toBe(50);expect(r.assumptions.affiliatePct).toBe(25);expect(r.assumptions.samplesPerMonth).toBe(300);expect(r.assumptions.roas).toBe(2.5);expect(r.adjusted).toBe(true);expect(computeAll({branch:'launch',answers:{},products:[emptyProduct()],assumptions:{...DEFAULT_ASSUMPTIONS,roas:99,samplesPerMonth:9999},kalodata:k}).assumptions.roas).toBe(2.5);});
 it('starts existing-shop GMV from measured own products',()=>{const e=k.enriched?.['0'];if(!e)throw new Error('fixture missing');const r=computeAll({branch:'optimize',answers:{},products:[emptyProduct()],assumptions:DEFAULT_ASSUMPTIONS,kalodata:{...k,ownEnriched:{'0':e}}});const row=r.scenarios[0]?.rows[0];expect(row?.gmv).toBeGreaterThan(6000);expect(row?.gmv).toBeCloseTo(6000+((row?.cumVideos??0)-100)*(row?.gmvPerVideo??0));});
});

describe('Round 3 rules',()=>{
 it('broadens long-tail keywords by dropping filler words then shortening',()=>{expect(keywordVariants('beef tallow for skin')).toEqual(['beef tallow for skin','beef tallow skin','beef tallow','tallow']);});
 it('limits confirmed competitors to eight chosen products',()=>{const products=Array.from({length:14},(_,i)=>({product_id:String(i),revenue:900-i}));const k:MarketData={ok:true,competitors:[],keywords:[{keyword:'x',shops:[],products}]};expect(selectedCompetitors(k,{}).map(p=>p.product_id)).toEqual(['0','1','2','3','4']);expect(selectedCompetitors(k,{selectedProducts:['13','12','11','10','9','8','7','6','5','4','3']}).map(p=>p.product_id)).toEqual(['3','4','5','6','7','8','9','10']);});
 it('projects 12 months and finds profitable and payback months',()=>{const econ=economics([{...emptyProduct(),price:30,cogs:5}],DEFAULT_ASSUMPTIONS,'fbt');const s=projectScenario(150,DEFAULT_ASSUMPTIONS,econ,200);expect(s.rows).toHaveLength(12);const first=s.rows.findIndex(r=>r.net>0)+1;expect(s.profitableMonth).toBe(first||null);expect(s.rows[11]?.cumNet).toBeCloseTo(s.rows.reduce((n,r)=>n+r.net,0));expect(s.maxInvestment).toBeCloseTo(-Math.min(...s.rows.map(r=>r.cumNet)));});
 it('profit includes returns, Sophie fee, samples and ads after 100 videos are live',()=>{const a={...DEFAULT_ASSUMPTIONS,roas:0};const p={...emptyProduct(),price:40,cogs:8};const econ=economics([p],a,'fbt');const s=projectScenario(250,a,econ,100);const row=s.rows[2];if(!row)throw new Error('missing');const margin=1-.06-(a.affiliatePct/100)*(a.affiliateSharePct/100)-8/40-fbtFee(p)/40-.03;expect(row.adSpend).toBe(3000);expect(row.net).toBeCloseTo(row.gmv*margin-2997-250*(8+fbtFee(p))-3000);});
 it('does not start ads before 100 videos are live',()=>{const p={...emptyProduct(),price:40,cogs:8};const a={...DEFAULT_ASSUMPTIONS,videoRatePct:20};const econ=economics([p],a,'fbt');const s=projectScenario(150,a,econ,100);expect(s.rows[2]?.cumVideos).toBeLessThan(100);expect(s.rows[2]?.adSpend).toBe(0);});
 it('never displays launch profit before month three and keeps the early flag for the team',()=>{const p={...emptyProduct(),price:100,cogs:1,weight:.25,length:2,width:2,height:2};const econ=economics([p],DEFAULT_ASSUMPTIONS,'fbt');const s=projectScenario(250,DEFAULT_ASSUMPTIONS,econ,10000,{gmv:0,videos:0},{medianCompetitorGmv:100000,newShop:true});expect(s.profitableMonth===null||s.profitableMonth>=3).toBe(true);expect(s.earlyProfitFlag).toBe(true);});
 it('hides profit when any COGS is unknown',()=>{const r=computeAll({branch:'launch',answers:{},products:[{...emptyProduct(),cogs:0}],assumptions:DEFAULT_ASSUMPTIONS,kalodata:null});expect(r.profitAvailable).toBe(false);});
 it('labels opportunity signals from market thresholds',()=>{const mk=(rev:number[],growth=20)=>({ok:true,competitors:[],keywords:[{keyword:'x',shops:[],products:rev.map((r,i)=>({product_id:String(i),revenue:r,unit_price:20+i,revenue_growth_rate:growth}))}]}) as MarketData;
  const big=opportunitySignals(mk(Array(20).fill(30000)),{},21);expect(big.size).toBe('Large');expect(big.competition).toBe('Open');expect(big.momentum).toBe('Growing');
  const mid=opportunitySignals(mk([200000,1,1]),{},100);expect(mid.size).toBe('Mid');expect(mid.competition).toBe('Concentrated');expect(mid.priceFit).toBe('Premium');
  expect(opportunitySignals(mk([5000],-20),{}).momentum).toBe('Cooling');expect(opportunitySignals(mk([5000],0),{}).size).toBe('Niche');});
});
