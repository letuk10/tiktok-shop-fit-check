import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { GhostBtn } from './ui';

export function InterestPrompt({title,children,undecided}:{title:string;children:ReactNode;undecided:boolean}) {
 const [open,setOpen]=useState(false);
 const inline=useRef<HTMLDivElement>(null);
 const offered=useRef(false);
 useEffect(()=>{
  const element=inline.current;
  if(!element||!undecided||offered.current)return;
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(e=>e.isIntersecting)&&!offered.current){offered.current=true;setOpen(true);observer.disconnect();}
  },{threshold:.35});
  observer.observe(element);
  return ()=>observer.disconnect();
 },[undecided]);
 return <>
  <div ref={inline} id="interest-gate" className="space-y-5 border-y border-signal bg-cloud/50 p-6 sm:p-8">
   <h2 className="text-2xl">{title}</h2>
   {children}
   <GhostBtn className="h-9 text-sm" onClick={()=>setOpen(true)}>Open in popup</GhostBtn>
  </div>
  <Dialog open={open} onOpenChange={setOpen}>
   <DialogContent aria-describedby={undefined} className="w-[calc(100%-2rem)] max-w-2xl max-h-[85dvh] overflow-y-auto rounded-lg p-6 sm:p-8">
    <DialogTitle className="pr-5 text-left text-2xl leading-snug">{title}</DialogTitle>
    <div className="space-y-5">{children}</div>
   </DialogContent>
  </Dialog>
 </>;
}