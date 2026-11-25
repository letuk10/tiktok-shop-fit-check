import { useEffect, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { PrimaryBtn } from './ui';

const BOOKING_URL='https://calendly.com/pablo-sophiesociety/30min';
export function BookCall({popup=false}:{popup?:boolean}) {
 const [open,setOpen]=useState(false);
 useEffect(()=>{if(popup)setOpen(true);},[popup]);
 return <>
  <div className="no-print space-y-3 border-y border-border py-6">
   <h2 className="text-2xl">Book a call with the Sophie TikTok Shop team</h2>
   <p className="text-caption">Walk through your plan with the Sophie Society team.</p>
   <PrimaryBtn onClick={()=>setOpen(true)}><CalendarCheck className="h-5 w-5"/> Book a call</PrimaryBtn>
  </div>
  <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90dvh] max-w-3xl overflow-y-auto">
   <DialogTitle>Book a call with Sophie Society</DialogTitle>
   <DialogDescription>Find a time to discuss your TikTok Shop plan.</DialogDescription>
   <p className="text-sm text-caption">Review your market, fulfillment and six-month projection with our team.</p>
   <PrimaryBtn onClick={()=>window.open(BOOKING_URL,'_blank','noopener,noreferrer')}><CalendarCheck className="h-5 w-5"/> Choose a time</PrimaryBtn>
  </DialogContent></Dialog>
 </>;
}