"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { CARD_TRANSITION as C, cardPhase, SERVICE_CARD_COLOR } from "@/lib/serviceCardMotion";
import { easeInOutCubic } from "@/lib/particleEngine";

/** Inert presentation copies leave native swipe, links and React-owned cards intact. */
export function useMobileCardTransition(section: RefObject<HTMLElement>, host: RefObject<HTMLDivElement>, index: number) {
  const previous = useRef(index);
  useLayoutEffect(() => {
    const from = previous.current;
    previous.current = index;
    const root = section.current, overlay = host.current;
    if (!root || !overlay || from === index || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = root.querySelectorAll<HTMLElement>(".mobile-services-track > article");
    if (!cards[from] || !cards[index]) return;
    const clone = (i: number) => {
      const node = cards[i].cloneNode(true) as HTMLElement;
      node.removeAttribute("id");
      node.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"));
      node.setAttribute("aria-hidden", "true");
      node.setAttribute("inert", "");
      Object.assign(node.style, { position: "absolute", inset: "0", width: "100%", overflow: "hidden" });
      overlay.append(node);
      return node;
    };
    const incoming = clone(index), outgoing = clone(from);
    incoming.style.background = "#F8F9FC";
    const ink = document.createElement("div");
    Object.assign(ink.style, { position: "absolute", inset: "0", background: SERVICE_CARD_COLOR, zIndex: "0" });
    incoming.prepend(ink);
    const content = incoming.querySelector<HTMLElement>(".mobile-service-content");
    if (content) Object.assign(content.style, { position: "relative", zIndex: "1" });
    const layers = (node: HTMLElement) => Array.from(node.querySelectorAll<HTMLElement>(".mobile-service-title > div > span, .mobile-service-title h3, .mobile-service-arrow, .mobile-service-desc, .mobile-service-footer"));
    const enter = layers(incoming), leave = layers(outgoing);
    overlay.style.visibility = "visible";
    const state = { t: 0 };
    const clean = () => { overlay.replaceChildren(); overlay.style.visibility = "hidden"; };
    const draw = () => {
      const t = state.t;
      const exit = easeInOutCubic(cardPhase(t, C.EXIT_START, C.EXIT_END));
      outgoing.style.transform = `translate3d(${-exit * C.EXIT_WIDTH_RATIO * 100}%,0,0)`;
      outgoing.style.clipPath = `inset(0 ${exit * 100}% 0 0 round 22px)`;
      outgoing.style.visibility = t < C.EXIT_END ? "visible" : "hidden";
      incoming.style.transform = `translate3d(${12 * (1-exit)}px,0,0) scale(${.96 + exit*.04})`;
      ink.style.clipPath = `circle(${easeInOutCubic(cardPhase(t, C.INK_START, C.INK_END)) * C.INK_RADIUS}% at 0% 0%)`;
      enter.forEach((el, i) => { const p = cardPhase(t, C.CONTENT_START + i*C.CONTENT_STAGGER, 1); el.style.opacity = `${p}`; el.style.transform = `translate3d(0,${(1-p)*8}px,0)`; });
      leave.forEach((el, i) => { const p = 1-cardPhase(t, i*C.CONTENT_STAGGER, C.OUT_END); el.style.opacity = `${p}`; el.style.transform = `translate3d(0,${-(1-p)*8}px,0)`; });
    };
    draw();
    const tween = gsap.to(state, { t: 1, duration: .55, ease: "none", onUpdate: draw, onComplete: clean });
    const cancel = () => { tween.kill(); clean(); };
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    window.addEventListener("resize", cancel);
    motion.addEventListener("change", cancel);
    return () => { cancel(); window.removeEventListener("resize", cancel); motion.removeEventListener("change", cancel); };
  }, [section, host, index]);
}
