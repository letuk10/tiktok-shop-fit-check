import { z } from 'zod';

const text = z.string().trim().min(1).max(200);
const email = z.string().trim().email().max(200);
const positive = z.number().finite().positive();
const nonnegative = z.number().finite().min(0);
const lookup = z.object({title:z.string(),brand:z.string(),image:z.string(),price:positive,lengthIn:nonnegative,widthIn:nonnegative,heightIn:nonnegative,weightLb:nonnegative,cogs:nonnegative.optional(),monthlyRevenue:nonnegative.optional(),keywords:z.array(z.string()).optional(),categoryPath:z.array(z.string()).optional(),fbaPickAndPackFee:nonnegative.optional(),monthlySold:nonnegative.optional(),provider:z.enum(['hub','keepa'])});
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
 if(step===3)return z.array(product).min(1).max(3).safeParse(s.products).success&&text.safeParse(a['amazonRevenue']).success&&text.safeParse(a['dtcRevenue']).success&&z.number().int().positive().safeParse(a['catalogSize']).success;
 if(step===4)return nonnegative.safeParse(s.assumptions['ownCost']).success;
 return true;
}
export const validVideoId=(id:string)=>/^\d{10,30}$/.test(id);
export const hasZeroCommission=(values:(number|null)[])=>values.some(v=>v===0);