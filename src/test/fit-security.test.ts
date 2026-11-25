import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks=vi.hoisted(()=>({from:vi.fn(),fetch:vi.fn()}));
vi.mock('@tanstack/react-start',()=>({createServerFn:()=>({inputValidator:(validate:(d:unknown)=>unknown)=>({handler:(handle:(args:{data:unknown})=>unknown)=>(args:{data:unknown})=>handle({data:validate(args.data)})})})}));
vi.mock('@/integrations/supabase/client.server',()=>({supabaseAdmin:{from:mocks.from}}));
import { adjustTeamAssumptions, refreshTeamData, runMarketScan, enrichMarketProduct, saveSubmission } from '@/lib/fit.functions';

const id='7e64b79a-b9ec-41a0-99a5-4ffdb408ab13';
describe('market cache and team permissions',()=>{
 beforeEach(()=>{vi.clearAllMocks();vi.stubEnv('TEAM_PASSCODE','private-test-pass');vi.stubGlobal('fetch',mocks.fetch);});
 it('rejects client overrides before accessing data',async()=>{
  await expect(adjustTeamAssumptions({data:{id,passcode:'wrong',overrides:{roas:99}}})).rejects.toThrow('Wrong passcode');
  expect(mocks.from).not.toHaveBeenCalled();
 });
 it('rejects client refresh before accessing data or Kalodata',async()=>{
  await expect(refreshTeamData({data:{id,passcode:'wrong'}})).rejects.toThrow('Wrong passcode');
  expect(mocks.from).not.toHaveBeenCalled();expect(mocks.fetch).not.toHaveBeenCalled();
 });
 it('returns cached keyword searches without re-calling Kalodata',async()=>{
  const cached={ok:true,productOnly:true,keywords:[],competitors:[]};
  mocks.from.mockReturnValue({select:()=>({eq:()=>({single:async()=>({data:{kalodata:cached}})})})});
  expect(await runMarketScan({data:{id}})).toEqual(cached);expect(mocks.fetch).not.toHaveBeenCalled();
 });
 it('returns cached enrichment without re-calling any endpoint',async()=>{
  const product={product_id:'123',revenue:100};const cached={ok:true,productOnly:true,keywords:[{keyword:'test',products:[product],shops:[]}],competitors:[],enriched:{'123':{product,attempted:true,detail:{revenue:100}}}};
  mocks.from.mockReturnValue({select:()=>({eq:()=>({single:async()=>({data:{kalodata:cached,answers:{}}})})})});
  expect(await enrichMarketProduct({data:{id,productId:'123'}})).toEqual(cached);expect(mocks.fetch).not.toHaveBeenCalled();
 });
 it('public saves preserve protected assumptions and accept only own 3PL cost',async()=>{
  const update=vi.fn(()=>({eq:async()=>({error:null})}));
  let reads=0;
  const select=vi.fn(()=>({eq:()=>({single:async()=>({data:reads++===0?{step_reached:0,answers:{},assumptions:{roas:4,samplesPerMonth:250,ownCost:6.5}}:null})})}));
  mocks.from.mockReturnValue({select,update});
  await saveSubmission({data:{id,patch:{assumptions:{roas:99,samplesPerMonth:9999,ownCost:7}}}});
  expect(update).toHaveBeenCalledWith({assumptions:{roas:4,samplesPerMonth:250,ownCost:7}});
 });
 it('rejects progression with unanswered required questions before writing',async()=>{
  const update=vi.fn();
  mocks.from.mockReturnValue({select:()=>({eq:()=>({single:async()=>({data:{answers:{flowStep:1},products:[],assumptions:{}}})})}),update});
  await expect(saveSubmission({data:{id,patch:{answers:{flowStep:2}}}})).rejects.toThrow('Please complete every required question');
  expect(update).not.toHaveBeenCalled();
 });
});