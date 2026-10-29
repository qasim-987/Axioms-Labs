"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createSharedParticleStage, generateFibonacciSphereBuffer, renderStaticParticleCloud2D, stepScreenSpaceRepulsionSpring } from "@/lib/particleEngine";
import { getPerformanceTier } from "@/lib/performanceTier";

export const RELEASE_MODE: "settle" | "freeze" = "settle";
export const RELEASE_SETTLE_MS = 180;

/** Touch-only, demand-rendered view of the shared sphere. Desktop renderer is untouched. */
export default function TouchHeroSphere({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const tier = getPerformanceTier();
    const count = tier.particleCount;
    const base = generateFibonacciSphereBuffer(count, {jitter: .05, surfaceBias: 1});
    const positions = new Float32Array(base);
    const offsets = new Float32Array(count * 3), velocities = new Float32Array(count * 3);
    const highlights = new Float32Array(count), seeds = Float32Array.from({length:count}, (_, i) => (i * .61803398875) % 1);
    let releaseTimer: ReturnType<typeof setTimeout> | undefined;
    let raf = 0, pressed: number | null = null, settleStart = 0, disposed = false;
    let pointerX = 0, pointerY = 0, originX = 0, originY = 0;
    let redraw = () => {};
    const stage = createSharedParticleStage(host, {
      maxDpr:tier.dprCap, antialias:tier.antialias, enablePointer:false,
      onResize: () => redraw(), onContextRestored: () => redraw(),
      onContextLost: () => { cancelAnimationFrame(raf); raf = 0; pressed = null; host.dataset.running = "false"; },
    });
    const canvas = stage?.renderer.domElement ?? document.createElement("canvas");
    if (!stage) { canvas.style.cssText = "width:100%;height:100%;display:block"; host.appendChild(canvas); }
    canvas.style.touchAction = "pan-y";
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position",new THREE.BufferAttribute(positions,3));
    const palette = ["#3186FF","#1E3A8A","#3186FF","#749BFF","#202124","#FC413D","#FBBC04","#00B95C"].map(c=>new THREE.Color(c));
    const colors = new Float32Array(count*3);
    for(let i=0;i<count;i++) colors.set(palette[i%palette.length].toArray(),i*3);
    geometry.setAttribute("color",new THREE.BufferAttribute(colors,3));
    const material = new THREE.PointsMaterial({size:2.4, vertexColors:true, transparent:true, opacity:.72, depthWrite:false});
    const points = new THREE.Points(geometry,material);
    points.rotation.x = .12;
    stage?.scene.add(points);
    const releaseOffsets = new Float32Array(count*3);
    const draw = () => {
      if(disposed || stage?.isContextLost()) return;
      if(stage) {
        const m = stage.getMetrics();
        const radius = Math.min(m.height*.34,Math.max(100,Math.min(m.width*.34,220))) * m.pxToWorld;
        points.scale.setScalar(radius);
        for(let i=0;i<positions.length;i++) positions[i]=base[i]+offsets[i];
        (geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        stage.renderer.render(stage.scene,stage.camera);
      } else renderStaticParticleCloud2D(canvas,base);
      host.dataset.frames = `${Number(host.dataset.frames || 0) + 1}`;
    };
    const stop = () => { clearTimeout(releaseTimer); cancelAnimationFrame(raf); raf=0; host.dataset.running="false"; };
    const tick = (now: number) => {
      raf=0;
      if(disposed) return;
      if(pressed !== null && stage && !reduced.matches) {
        const m=stage.getMetrics();
        stepScreenSpaceRepulsionSpring({count,startPositions:base,targetPositions:base,seeds,morphProgress:0,
          displacements:offsets,velocities,highlights,shapeScaleWorld:points.scale.x,
          rotationX:points.rotation.x,rotationY:0,groupX:0,groupY:0,groupZ:0,cameraZ:stage.camera.position.z,
          stageWidth:m.width,stageHeight:m.height,pxToWorld:m.pxToWorld,cursorX:pointerX,cursorY:pointerY,
          cursorActive:true,time:now/1000,influenceRadiusPx:112,repelStrengthPx:70});
      } else if(settleStart) {
        const t=Math.min(1,(now-settleStart)/RELEASE_SETTLE_MS), weight=Math.pow(1-t,3);
        for(let i=0;i<offsets.length;i++) offsets[i]=releaseOffsets[i]*weight;
        if(t===1) { settleStart=0; velocities.fill(0); clearTimeout(releaseTimer); }
      }
      if(pressed===null && !settleStart) host.dataset.running="false";
      draw();
      if((pressed!==null && !reduced.matches && stage) || settleStart) { host.dataset.running="true"; raf=requestAnimationFrame(tick); }
      else host.dataset.running="false";
    };
    const start = () => { if(!raf) {host.dataset.running="true"; raf=requestAnimationFrame(tick);} };
    const coords = (e:PointerEvent) => { const r=canvas.getBoundingClientRect();pointerX=e.clientX-r.left;pointerY=e.clientY-r.top; };
    const release = (e?:PointerEvent) => {
      if(pressed===null || (e && e.pointerId!==pressed)) return;
      const id=pressed; pressed=null;
      if(canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
      canvas.style.filter=""; canvas.style.transform="";
      if(RELEASE_MODE==="freeze") {stop(); return;}
      releaseOffsets.set(offsets); settleStart=performance.now();
      clearTimeout(releaseTimer);
      releaseTimer=setTimeout(()=>{
        // Hard wall-clock deadline, independent of the number of rendered frames.
        if(pressed!==null || disposed)return;
        settleStart=0;offsets.fill(0);velocities.fill(0);stop();draw();
      },RELEASE_SETTLE_MS);
      if(reduced.matches || !stage) {settleStart=0;stop();draw();} else start();
    };
    const down = (e:PointerEvent) => {
      if((e.pointerType!=="touch" && e.pointerType!=="pen") || pressed!==null) return;
      clearTimeout(releaseTimer);pressed=e.pointerId; settleStart=0; velocities.fill(0);coords(e); originX=e.clientX;originY=e.clientY;
      canvas.setPointerCapture(e.pointerId);
      if(reduced.matches || !stage) {canvas.style.filter="brightness(1.15)";canvas.style.transform="scale(1.015)";draw();} else start();
    };
    const move = (e:PointerEvent) => {
      if(e.pointerId!==pressed) return;
      coords(e);
      const r=canvas.getBoundingClientRect();
      if(e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) release(e);
      // pan-y remains native; browser cancellation will end any scrolling gesture.
      if(Math.abs(e.clientY-originY)>10 && Math.abs(e.clientY-originY)>Math.abs(e.clientX-originX)) release(e);
    };
    canvas.addEventListener("pointerdown",down,{passive:true});canvas.addEventListener("pointermove",move,{passive:true});
    const ends=["pointerup","pointercancel","lostpointercapture","pointerleave"] as const;
    ends.forEach(name=>canvas.addEventListener(name,release,{passive:true}));
    const visibility=()=>{if(document.hidden) release();};
    document.addEventListener("visibilitychange",visibility);
    const observer=new ResizeObserver(draw);observer.observe(host);
    const motionChange=()=>{release();offsets.fill(0);stop();draw();};reduced.addEventListener("change",motionChange);
    let dprQuery:MediaQueryList;
    const dprChange=()=>{dprQuery?.removeEventListener("change",dprChange);stage?.setMaxDpr(tier.dprCap);draw();dprQuery=matchMedia(`(resolution: ${devicePixelRatio}dppx)`);dprQuery.addEventListener("change",dprChange);};
    redraw=draw;dprChange();host.dataset.running="false";
    return()=>{disposed=true;stop();observer.disconnect();dprQuery.removeEventListener("change",dprChange);reduced.removeEventListener("change",motionChange);document.removeEventListener("visibilitychange",visibility);
      canvas.removeEventListener("pointerdown",down);canvas.removeEventListener("pointermove",move);ends.forEach(name=>canvas.removeEventListener(name,release));geometry.dispose();material.dispose();stage?.dispose();if(!stage)canvas.remove();};
  },[]);
  return <div ref={ref} data-touch-hero="true" className={`touch-hero-sphere absolute inset-0 select-none ${className}`} aria-hidden="true" />;
}
