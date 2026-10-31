"use client";

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import Link from "next/link";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ServiceItem } from "@/data/services";
import ServicesParticleCanvas, { evaluateServicesMasterTimeline, STEP_HOLD_PROGRESS, type ServicesHoverBridge } from "./ServicesParticleCanvas";
import { renderServiceToolIcon, hasServiceToolIcon } from "./ServiceToolIcons";

export const MOBILE_SERVICES_LAYOUT: "side" | "stacked" = "side";
export const MOBILE_STACKED_BELOW = 340;
export const SWIPE = { DIRECTION_PX: 9, DISTANCE_RATIO: .25, FLICK_PX_MS: .45, SYNC_LOCK_MS: 550, DECK_STEP_PX: 12 } as const;

type Entry = { service: ServiceItem; compactBullets: string[]; displayTools: string[] };
interface Props {
  entries: Entry[];
  progress: MutableRefObject<number>;
  bridge: MutableRefObject<ServicesHoverBridge>;
  onWebGLUnavailable: () => void;
}
const clamp = (n:number,min:number,max:number) => Math.max(min,Math.min(max,n));
/** Full fractional morph window, rather than spending the first part of a swipe in a hold. */
export function mobileDragProgress(position:number) {
  const i=Math.floor(clamp(position,0,3)), f=position-i;
  if(f<.001 || i===3) return STEP_HOLD_PROGRESS[i];
  return [ .15, .46, .77 ][i] + f * [ .16, .16, .15 ][i];
}
export default function MobileServices({entries,progress,bridge,onWebGLUnavailable}:Props) {
  const section=useRef<HTMLElement>(null), header=useRef<HTMLDivElement>(null), track=useRef<HTMLDivElement>(null);
  const contents=useRef<(HTMLDivElement|null)[]>([]), trigger=useRef<ScrollTrigger|null>(null);
  const [index,setIndex]=useState(0), active=useRef(0);
  const [stacked,setStacked]=useState(false), [nav,setNav]=useState(68);
  const [scales,setScales]=useState([1,1,1,1]);
  const [showParticles,setShowParticles]=useState(false);
  const width=useRef(1), locked=useRef<"page"|"track"|"control"|null>(null);
  const lockTimer=useRef<ReturnType<typeof setTimeout>>(), settleTimer=useRef<ReturnType<typeof setTimeout>>();
  const gesture=useRef<{pointer:number; startX:number;startY:number;time:number;origin:number;left:number;direction:"pending"|"x"|"y";finger:boolean;lastX:number}|null>(null);
  const setActive=useCallback((i:number)=>{active.current=i;setIndex(i);},[]);
  const unlock=useCallback(()=>{clearTimeout(lockTimer.current);locked.current=null;},[]);
  const lock=useCallback((source:"page"|"track"|"control")=>{clearTimeout(lockTimer.current);locked.current=source;lockTimer.current=setTimeout(()=>{locked.current=null;},SWIPE.SYNC_LOCK_MS);},[]);
  const seek=useCallback((i:number,source:"track"|"control"="control")=>{
    i=clamp(i,0,entries.length-1);lock(source);setActive(i);progress.current=STEP_HOLD_PROGRESS[i];
    track.current?.scrollTo({left:i*width.current,behavior:"smooth"});
    const st=trigger.current;
    if(st) window.scrollTo({top:st.start+(st.end-st.start)*STEP_HOLD_PROGRESS[i],behavior:"smooth"});
  },[entries.length,lock,progress,setActive]);
  useEffect(()=>{
    const el=section.current;
    if(!el) return;
    let raf=0,refresh:ReturnType<typeof setTimeout>;
    let previousWidth=innerWidth;
    const fit=()=>{
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>{
        if(innerWidth!==previousWidth) {
          previousWidth=innerWidth;gesture.current=null;unlock();clearTimeout(settleTimer.current);
          progress.current=STEP_HOLD_PROGRESS[active.current];
        }
        const navEl=document.querySelector<HTMLElement>('[data-site-navbar] > div:first-child');
        const navH=Math.ceil(navEl?.getBoundingClientRect().height || 68);setNav(navH);
        setShowParticles(window.innerWidth >= 768);
        const narrow=window.innerWidth<MOBILE_STACKED_BELOW;
        setStacked(MOBILE_SERVICES_LAYOUT==="stacked" || narrow);
        if(narrow && process.env.NODE_ENV!=="production" && el.dataset.narrow!=="true") console.info("[Services] stacked fallback: viewport below 340px");
        el.dataset.narrow=`${narrow}`;
        width.current=track.current?.clientWidth || 1;
        const next=contents.current.map(node=>{
          if(!node)return 1;
          const saved=node.style.cssText;
          node.style.transform="none";node.style.width="100%";node.style.height="auto";
          let level=0;node.dataset.mobileFit="0";
          let natural=node.scrollHeight;
          const available=track.current?.clientHeight || natural;
          while(natural>available-2 && level<2){node.dataset.mobileFit=`${++level}`;natural=node.scrollHeight;}
          node.style.cssText=saved;
          return Math.min(1,(available-2)/Math.max(1,natural));
        });
        setScales(old=>old.every((s,i)=>Math.abs(s-next[i])<.005)?old:next);
        if(track.current && !gesture.current) track.current.scrollLeft=active.current*width.current;
        clearTimeout(refresh);refresh=setTimeout(()=>ScrollTrigger.refresh(),180);
      });
    };
    fit();
    const ro=new ResizeObserver(fit);ro.observe(el);if(header.current)ro.observe(header.current);if(track.current)ro.observe(track.current);
    const navEl=document.querySelector<HTMLElement>('[data-site-navbar] > div:first-child');if(navEl)ro.observe(navEl);
    let alive=true;document.fonts.ready.then(()=>{if(alive)fit();});
    window.addEventListener("orientationchange",fit);window.addEventListener("resize",fit);
    return()=>{alive=false;cancelAnimationFrame(raf);clearTimeout(refresh);ro.disconnect();window.removeEventListener("orientationchange",fit);window.removeEventListener("resize",fit);};
  },[progress,unlock]);
  useEffect(()=>{
    const el=section.current;if(!el)return;
    const st=ScrollTrigger.create({trigger:el,start:()=>`top top+=${nav}`,end:()=>`+=${innerHeight*3.2}`,pin:true,pinSpacing:true,anticipatePin:1,invalidateOnRefresh:true,
      onUpdate:self=>{
        if(gesture.current?.direction==="x" || locked.current==="track" || locked.current==="control")return;
        progress.current=self.progress;
        const next=evaluateServicesMasterTimeline(self.progress).scrollIndex;
        if(next!==active.current){setActive(next);lock("page");track.current?.scrollTo({left:next*width.current,behavior:"smooth"});}
      }});
    trigger.current=st;
    return()=>{st.kill();trigger.current=null;};
  },[nav,lock,progress,setActive]);
  useEffect(()=>{
    const el=track.current;if(!el)return;
    const finish=()=>{
      const g=gesture.current;if(!g || g.finger || g.direction!=="x")return;
      const delta=el.scrollLeft-g.origin*width.current;
      const time=Math.max(1,performance.now()-g.time);
      const moved=Math.abs(delta)>width.current*SWIPE.DISTANCE_RATIO || Math.abs(g.lastX-g.startX)/time>SWIPE.FLICK_PX_MS;
      const direction=delta!==0?Math.sign(delta):Math.sign(g.startX-g.lastX);
      const next=clamp(g.origin+(moved?direction:0),0,entries.length-1);
      gesture.current=null;seek(next,"track");
    };
    const down=(e:PointerEvent)=>{
      if(e.pointerType!=="touch" && e.pointerType!=="pen")return;
      unlock();clearTimeout(settleTimer.current);
      gesture.current={pointer:e.pointerId,startX:e.clientX,startY:e.clientY,lastX:e.clientX,time:performance.now(),origin:active.current,left:el.scrollLeft,direction:"pending",finger:true};
    };
    const move=(e:PointerEvent)=>{
      const g=gesture.current;if(!g || e.pointerId!==g.pointer)return;
      g.lastX=e.clientX;
      const dx=e.clientX-g.startX,dy=e.clientY-g.startY;
      if(g.direction==="pending" && Math.max(Math.abs(dx),Math.abs(dy))>=SWIPE.DIRECTION_PX){
        g.direction=Math.abs(dx)>Math.abs(dy)?"x":"y";
        if(g.direction==="y" || (g.origin===0 && dx>0) || (g.origin===entries.length-1 && dx<0)) {gesture.current=null;return;}
      }
    };
    const end=(e:PointerEvent)=>{
      const g=gesture.current;if(!g || e.pointerId!==g.pointer)return;
      // Native horizontal scrolling cancels pointer events; keep ownership until touchend/scrollend.
      if(e.type==="pointercancel" && g.direction!=="y")return;
      g.finger=false;
      if(g.direction!=="x"){gesture.current=null;return;}
      clearTimeout(settleTimer.current);settleTimer.current=setTimeout(finish,100);
    };
    const touchEnd=()=>{const g=gesture.current;if(g){g.finger=false;if(g.direction==="x"){clearTimeout(settleTimer.current);settleTimer.current=setTimeout(finish,100);}else gesture.current=null;}};
    const scroll=()=>{
      const g=gesture.current;
      if(!g || g.direction==="y" || locked.current)return;
      if(Math.abs(el.scrollLeft-g.left)>2)g.direction="x";
      if(g.direction!=="x")return;
      const low=Math.max(0,g.origin-1)*width.current, high=Math.min(entries.length-1,g.origin+1)*width.current;
      if(el.scrollLeft<low || el.scrollLeft>high)el.scrollLeft=clamp(el.scrollLeft,low,high);
      progress.current=mobileDragProgress(el.scrollLeft/width.current);
      if(!g.finger){clearTimeout(settleTimer.current);settleTimer.current=setTimeout(finish,100);}
    };
    const scrollend=()=>{if(gesture.current)finish();else if(locked.current && Math.abs(el.scrollLeft-active.current*width.current)<2) { const st=trigger.current; if(!st || Math.abs(scrollY-(st.start+(st.end-st.start)*STEP_HOLD_PROGRESS[active.current]))<4)unlock(); }};
    el.addEventListener("pointerdown",down,{passive:true});el.addEventListener("pointermove",move,{passive:true});el.addEventListener("pointerup",end,{passive:true});el.addEventListener("pointercancel",end,{passive:true});el.addEventListener("scroll",scroll,{passive:true});el.addEventListener("scrollend",scrollend);
    window.addEventListener("touchend",touchEnd,{passive:true});window.addEventListener("touchcancel",touchEnd,{passive:true});
    return()=>{el.removeEventListener("pointerdown",down);el.removeEventListener("pointermove",move);el.removeEventListener("pointerup",end);el.removeEventListener("pointercancel",end);el.removeEventListener("scroll",scroll);el.removeEventListener("scrollend",scrollend);window.removeEventListener("touchend",touchEnd);window.removeEventListener("touchcancel",touchEnd);clearTimeout(lockTimer.current);clearTimeout(settleTimer.current);gesture.current=null;locked.current=null;};
  },[entries.length,progress,seek,unlock]);
  const card=(entry:Entry,i:number,preview=false)=> <div ref={preview?undefined:el=>{contents.current[i]=el;}} className="mobile-service-content" style={preview?undefined:{transform:`scale(${scales[i] || 1})`,transformOrigin:"top left",width:`${100/(scales[i] || 1)}%`,height:`${100/(scales[i] || 1)}%`}}>
    <div className="mobile-service-title"><div><span className="font-mono text-[9px] tracking-wide text-[#749BFF]">0{i+1} / DISCIPLINE</span><h3>{entry.service.title}</h3></div>{!preview && <Link href={`/services/${entry.service.slug}`} tabIndex={i===index?0:-1} aria-label={`Explore ${entry.service.title}`} className="mobile-service-arrow">↗</Link>}</div>
    <p className="mobile-service-desc">{entry.service.shortDesc}</p>
    <div className="mobile-service-footer"><div className="mobile-services-list"><h4>Services</h4><ul>{entry.compactBullets.map(text=><li key={text}>{text}</li>)}</ul></div><div className="mobile-services-tools"><h4>Tools</h4><div>{entry.displayTools.map((tool,k)=><span key={`${tool}-${k}`} title={tool} aria-label={tool} role="img" className="mobile-tool">{hasServiceToolIcon(tool) && renderServiceToolIcon(tool)}<span className={hasServiceToolIcon(tool)?"mobile-tool-label":"mobile-tool-fallback"}>{tool}</span></span>)}</div></div></div>
  </div>;
  return <section ref={section} id="services" data-active-step={index} className={`mobile-services-stage ${stacked?"is-stacked":"is-side"}`} style={{"--mobile-nav":`${nav}px`} as React.CSSProperties} aria-labelledby="mobile-services-heading">
    <header ref={header} className="mobile-services-heading"><div><span className="mobile-services-badge">04 CORE CAPABILITIES</span><h2 id="mobile-services-heading">Our <span>Services</span></h2></div><div className="mobile-service-steps"><span>0{index+1} / 04</span><div>{entries.map((e,i)=><button key={e.service.id} type="button" onClick={()=>seek(i)} aria-label={`Show ${e.service.title}`} aria-pressed={i===index}><span /></button>)}</div></div></header>
    <div className="mobile-services-row">{showParticles && <div className="mobile-services-shape"><ServicesParticleCanvas scrollProgressRef={progress} hoverBridgeRef={bridge} layoutMode="mobile" onWebGLUnavailable={onWebGLUnavailable} className="w-full h-full" /></div>}
      <div className="mobile-card-area">
        {[2,1].map(slot=>index+slot<entries.length?<div key={slot} aria-hidden="true" className={`mobile-deck-preview depth-${slot}`} style={{transform:`translateX(${slot*SWIPE.DECK_STEP_PX}px) scale(${slot===1?.97:.94})`}}>{card(entries[index+slot],index+slot,true)}</div>:null)}
        <div ref={track} className="mobile-services-track" role="region" aria-roledescription="carousel" aria-label="Our services" tabIndex={0} onKeyDown={e=>{if(e.key==="ArrowRight" || e.key==="ArrowLeft"){e.preventDefault();seek(index+(e.key==="ArrowRight"?1:-1));}}}>
          {entries.map((entry,i)=><article key={entry.service.id} className="mobile-service-card" role="group" aria-roledescription="slide" aria-label={`${i+1} of ${entries.length}: ${entry.service.title}`} aria-hidden={i!==index}>{card(entry,i)}</article>)}
        </div>
      </div></div>
    <div className="mobile-service-controls"><button type="button" onClick={()=>seek(index-1)} disabled={index===0} aria-label="Previous service">←</button><p aria-live="polite" aria-atomic="true">{index+1} of 4 · {entries[index].service.title}</p><button type="button" onClick={()=>seek(index+1)} disabled={index===3} aria-label="Next service">→</button></div>
  </section>;
}
