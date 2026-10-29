"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const HIDE_CONCEPT_BUILDER: "mobile" | "all" | "none" = "mobile";
const CaseStudies = dynamic(() => import("./CaseStudies"), { ssr: false });

/** No SSR subtree, import, images, or effects on excluded viewports. */
export default function ConceptBuildsGate() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const mq=matchMedia("(min-width: 1024px)");
    const update=()=>setShow(HIDE_CONCEPT_BUILDER === "none" || (HIDE_CONCEPT_BUILDER === "mobile" && mq.matches));
    update();mq.addEventListener("change",update);
    return()=>mq.removeEventListener("change",update);
  },[]);
  useEffect(()=>{const timer=setTimeout(()=>ScrollTrigger.refresh(),220);return()=>clearTimeout(timer);},[show]);
  // Stable React-owned slots: GSAP wraps/reparents pinned siblings and the mounted
  // section. Insert/remove the slot, never a node GSAP has moved into a spacer.
  // display:contents adds no layout box or empty mobile gap.
  return <div data-concept-gate style={{display:"contents"}}>{show ? <div data-concept-mounted style={{display:"contents"}}><CaseStudies /></div> : null}</div>;
}
