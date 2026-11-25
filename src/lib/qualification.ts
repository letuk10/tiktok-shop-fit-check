import { z } from 'zod';

const text = z.string().trim().min(1).max(200);
const email = z.string().trim().email().max(200);
const positive = z.number().finite().positive();
const nonnegative = z.number().finite().min(0);
const lookup = z.object({title:z.string(),brand:z.string(),image:z.string(),price:nonnegative,lengthIn:nonnegative,widthIn:nonnegative,heightIn:nonnegative,weightLb:nonnegative,cogs:nonnegative.optional(),monthlyRevenue:nonnegative.optional(),keywords:z.array(z.string()).optional(),categoryPath:z.array(z.string()).optional(),fbaPickAndPackFee:nonnegative.optional(),monthlySold:nonnegative.optional(),provider:z.enum(['hub','keepa','amazon']),bsr:nonnegative.optional(),dealPrice:nonnegative.optional(),weightSuspect:z.boolean().optional()});
export const marketEntrySchema = z.object({brand:text,product:z.string().trim().min(1).max(2000),asin:z.string().max(10),keywords:z.array(text).min(1).max(8),price:positive,lookup:lookup.optional()});
const product = z.object({name:text,price:positive,cogs:nonnegative,weight:positive,length:positive,width:positive,height:positive});
export function qualificationReady(step:number, value:unknown):boolean {
 const state = z.object({role:z.string().nullable().optional(),submitter_name:z.string().nullable().optional(),submitter_email:z.string().nullable().optional(),client_name:z.string().nullable().optional(),client_email:z.string().nullable().optional(),branch:z.string().nullable().optional(),answers:z.record(z.any()),products:z.array(z.any()),assumptions:z.record(z.any())}).safeParse(value);
 if(!state.success)return false;
 const s=state.data,a=s.answers;
 if(step===1) return z.enum(['client','pod_leader','sales_exec']).safeParse(s.role).success && text.safeParse(s.submitter_name).success && email.safeParse(s.submitter_email).success && (s.role==='client'||(text.safeParse(s.client_name).success&&email.safeParse(s.client_email).success));
 if(step===2) {
  if(s.branch==='launch')return z.object({usSeller:z.enum(['yes','no','progress']),dtc:z.union([text,z.array(text).min(1)]),commitSamples:z.boolean(),commitAds:z.boolean()}).safeParse(a).success;
  if(s.branch==='optimize')return z.object({shopName:text,shopId:text,runsIt:z.enum(['inhouse','agency','nobody']),samplesNow:nonnegative,gmvMax:z.boolean(),probation:z.enum(['yes','no','unsure']),fulfillment:z.enum(['fbt','own','mcf']),challenge:text}).safeParse(a).success && (!a['gmvMax']||positive.safeParse(a['gmvMaxDaily']).success);
  return false;
 }
 if(step===3)return z.array(product).min(1).max(5).safeParse(s.products).success&&text.safeParse(a['amazonRevenue']).success&&text.safeParse(a['dtcRevenue']).success&&z.number().int().positive().safeParse(a['catalogSize']).success;
 if(step===4)return nonnegative.safeParse(s.assumptions['ownCost']).success;
 return true;
}
export const validVideoId=(id:string)=>/^\d{10,30}$/.test(id);
export const hasZeroCommission=(values:(number|null)[])=>values.some(v=>v===0);
/** Plain-language list of what still blocks Continue on a step. Mirrors qualificationReady. */
export function missingFields(step:number, value:any):string[] {
 const s=value??{}, a=s.answers??{}, out:string[]=[];
 const has=(v:unknown)=>text.safeParse(v).success, num=(v:unknown)=>nonnegative.safeParse(v).success, pos=(v:unknown)=>positive.safeParse(v).success;
 if(step===1){
  if(!['client','pod_leader','sales_exec'].includes(s.role))out.push('Your role');
  if(!has(s.submitter_name))out.push('Your name');
  if(!email.safeParse(s.submitter_email).success)out.push(has(s.submitter_email)?'Your email (check the format)':'Your email');
  if(s.role&&s.role!=='client'){if(!has(s.client_name))out.push('Partner contact name');if(!email.safeParse(s.client_email).success)out.push(has(s.client_email)?'Partner contact email (check the format)':'Partner contact email');}
 }
 if(step===2){
  if(s.branch!=='launch'&&s.branch!=='optimize')out.push('Whether the brand already sells on TikTok Shop');
  if(s.branch==='launch'){
   if(!['yes','no','progress'].includes(a.usSeller))out.push('US TikTok Shop seller account');
   if(!(has(a.dtc)||(Array.isArray(a.dtc)&&a.dtc.length)))out.push('Where you sell today');
   if(typeof a.commitSamples!=='boolean')out.push('Commitment to 150+ samples a month');
   if(typeof a.commitAds!=='boolean')out.push('Commitment to about $100/day in ads');
  }
  if(s.branch==='optimize'){
   if(!has(a.shopName)||!has(a.shopId))out.push('TikTok Shop name (search it and pick your shop)');
   if(!['inhouse','agency','nobody'].includes(a.runsIt))out.push('Who runs it today');
   if(!num(a.samplesNow))out.push('Samples sent per month');
   if(typeof a.gmvMax!=='boolean')out.push('Running GMV Max ads');
   else if(a.gmvMax&&!pos(a.gmvMaxDaily))out.push('GMV Max daily spend');
   if(!['yes','no','unsure'].includes(a.probation))out.push('Weekly creator outreach limit');
   if(!['fbt','own','mcf'].includes(a.fulfillment))out.push('How you fulfill today');
   if(!has(a.challenge))out.push('Biggest challenge');
  }
 }
 if(step===3){
  if(!has(a.amazonRevenue))out.push('Monthly Amazon revenue');
  if(!has(a.dtcRevenue))out.push('Monthly DTC revenue');
  if(!z.number().int().positive().safeParse(a.catalogSize).success)out.push('Number of products in catalog');
  (Array.isArray(s.products)?s.products:[]).forEach((p:any,i:number)=>{
   const name=p?.name?.trim()?p.name.trim().split(/\s+/).slice(0,4).join(' '):`Product ${i+1}`, miss:string[]=[];
   if(!has(p?.name))miss.push('name');
   if(!pos(p?.price))miss.push('selling price');
   if(!num(p?.cogs))miss.push('COGS per unit');
   if(!pos(p?.weight))miss.push('weight');
   if(!pos(p?.length)||!pos(p?.width)||!pos(p?.height))miss.push('package size (length, width, height)');
   if(miss.length)out.push(`${name}: ${miss.join(', ')}`);
  });
 }
 if(step===4&&!num(s.assumptions?.ownCost))out.push('Own / 3PL cost per order');
 return out;
}
