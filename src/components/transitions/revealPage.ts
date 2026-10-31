import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { PAGE_TRANSITION as C } from "@/config/pageTransition.config";
gsap.registerPlugin(SplitText);

/** Split presentation copies, never React-owned text or existing GSAP/Framer nodes. */
export function revealPage(root: HTMLElement) {
  const cleanup: Array<() => void> = [];
  const timeline = gsap.timeline();
  const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal], [data-page-header] > p, [data-page-header] > div:first-child'));
  elements.forEach((element, order) => {
    if (element.closest('[data-reveal="stagger-children"]') !== element && element.parentElement?.closest('[data-reveal="stagger-children"]')) return;
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height || rect.top > innerHeight || rect.bottom < 0) return;
    const copy = element.cloneNode(true) as HTMLElement;
    copy.removeAttribute("id");
    copy.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
    copy.setAttribute("aria-hidden", "true");
    copy.setAttribute("inert", "");
    const style = getComputedStyle(element);
    copy.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;margin:0;z-index:43;pointer-events:none;`;
    for (const property of ["font", "font-family", "font-size", "font-weight", "font-style", "line-height", "letter-spacing", "text-align", "color"]) copy.style.setProperty(property, style.getPropertyValue(property));
    copy.style.transform = "none";
    copy.style.opacity = "1";
    copy.style.filter = "none";
    copy.querySelectorAll<HTMLElement>("[style]").forEach(node => { node.style.transform = "none"; node.style.opacity = "1"; node.style.filter = "none"; });
    document.body.append(copy);
    const visibility = element.style.visibility;
    element.style.visibility = "hidden";
    let split: SplitText | undefined;
    const isLabel = element.parentElement?.hasAttribute("data-page-header") && element === element.parentElement.firstElementChild && !element.matches("h1") && !element.querySelector("h1");
    const start = .45 + Math.min(order, 4) * .09;
    if (element.dataset.reveal === "lines" || element.matches("p")) {
      split = SplitText.create(copy, { type: "lines", mask: "lines", linesClass: "page-reveal-line" });
      timeline.fromTo(split.lines, { yPercent: 110 }, { yPercent: 0, duration: C.TEXT_DURATION, stagger: C.LINE_STAGGER, ease: C.EASE_TEXT }, start);
    } else {
      const targets = element.dataset.reveal === "stagger-children" ? Array.from(copy.children) : copy;
      timeline.fromTo(targets, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: C.LINE_STAGGER, ease: C.EASE_TEXT }, start + (isLabel ? 0 : .15));
    }
    cleanup.push(() => { split?.revert(); copy.remove(); element.style.visibility = visibility; });
  });
  const restore = () => cleanup.splice(0).forEach(fn => fn());
  // Rotation/resizing cancels presentation copies rather than leaving stale masks.
  const onResize = () => { timeline.progress(1); restore(); };
  window.addEventListener("resize", onResize, { once: true });
  timeline.eventCallback("onComplete", () => { window.removeEventListener("resize", onResize); restore(); });
  return { timeline, cleanup: () => { window.removeEventListener("resize", onResize); timeline.kill(); restore(); } };
}
