/**
 * [NAME] Landing — lightweight SplitText replacement.
 *
 * Splits a container's text into lines > words > characters wrapped in masks,
 * animates them with GSAP, then reverts the DOM to plain, selectable text.
 *
 * Unlike the GSAP Club `SplitText` plugin this is dependency-free, SSR-safe
 * (the server renders plain text; the client mutates the DOM directly after
 * mount so there is no hydration mismatch), and reverts cleanly on completion.
 *
 * All spans are `aria-hidden="true"`; the root element keeps `aria-label` with
 * the full text for assistive technology.
 */

import gsap from "gsap";

type Timeline = ReturnType<typeof gsap.timeline>;

// Local aliases mirroring gsap's EaseString / EaseFunction (gsap does not
// export those type names from its main module).
type EaseLike = string | ((progress: number) => number);
type BuildCharTimelineOpts = {
  duration?: number;
  stagger?: number;
  lineOffset?: number;
  ease?: EaseLike;
};

export interface HeadlineLike {
  word: string;
  emphasis: boolean;
}

export interface SplitChar {
  el: HTMLSpanElement;
  char: string;
}

export interface SplitWord {
  el: HTMLSpanElement;
  chars: SplitChar[];
}

export interface SplitLine {
  el: HTMLDivElement; // outer line wrapper (layout)
  mask: HTMLDivElement; // overflow-hidden mask (clips animated chars)
  words: SplitWord[];
}

export interface SplitResult {
  root: HTMLElement;
  lines: SplitLine[];
  /** Original inner HTML, used to restore clean DOM on revert. */
  originalHTML: string;
  active: boolean;
  /** Build a paused GSAP timeline animating every character into place. */
  buildCharTimeline(opts: BuildCharTimelineOpts): Timeline;
  /** Kill animations and restore plain text DOM. */
  revert(): void;
}

const DEFAULTS = {
  duration: 0.9,
  stagger: 0.025,
  lineOffset: 0.12,
  ease: "power4.out",
} as const;

/**
 * Split every word of `text` into character spans inside `container`.
 * The container is emptied and rebuilt as mask > words > chars.
 */
function splitContainer(container: HTMLElement): SplitLine[] {
  const text = container.textContent ?? "";
  const words = text.split(" ");
  const lines: SplitLine[] = [];

  // One line per visual line — callers pass pre-split line containers.
  const lineEl = document.createElement("div");
  lineEl.style.display = "inline-block";
  lineEl.style.whiteSpace = "nowrap";
  lineEl.setAttribute("aria-hidden", "true");

  const mask = document.createElement("div");
  mask.style.overflow = "hidden";
  mask.style.position = "relative";
  // Padding-bottom keeps descenders (e.g. "g", "y") from being clipped.
  mask.style.paddingBottom = "0.18em";
  mask.setAttribute("aria-hidden", "true");

  let charCursor = 0;
  const splitWords: SplitWord[] = [];

  words.forEach((word, wIdx) => {
    const wordEl = document.createElement("span");
    wordEl.style.display = "inline-block";
    wordEl.style.whiteSpace = "nowrap";
    if (wIdx < words.length - 1) wordEl.style.marginRight = "0.26em";
    wordEl.setAttribute("aria-hidden", "true");

    const chars: SplitChar[] = [];
    Array.from(word).forEach((ch, cIdx) => {
      const charEl = document.createElement("span");
      charEl.style.display = "inline-block";
      charEl.style.willChange = "transform, opacity";
      charEl.style.transformOrigin = "0% 100%";
      charEl.setAttribute("aria-hidden", "true");
      charEl.textContent = ch;
      wordEl.appendChild(charEl);
      chars.push({ el: charEl, char: ch });
      charCursor += 1;
    });

    mask.appendChild(wordEl);
    splitWords.push({ el: wordEl, chars });
  });

  lineEl.appendChild(mask);
  container.appendChild(lineEl);
  lines.push({ el: lineEl, mask, words: splitWords });
  return lines;
}

/**
 * Initial GSAP state for every character (tilted, dropped, transparent).
 */
function setCharInitialState(lines: SplitLine[]): void {
  lines.forEach((line) => {
    line.words.forEach((word) => {
      word.chars.forEach(({ el }) => {
        const sign = Math.random() > 0.5 ? -1 : 1;
        const rotation = sign * (8 + Math.random() * 6); // 8–14 deg random ±
        gsap.set(el, {
          yPercent: 110,
          rotation,
          transformOrigin: "0% 100%",
          opacity: 0,
        });
      });
    });
  });
}

export function splitTextIntoLinesAndChars(
  container: HTMLElement
): SplitResult | null {
  if (!container || container.children.length > 0) return null;

  const originalHTML = container.innerHTML;
  const lines = splitContainer(container);
  setCharInitialState(lines);
  let active = true;

  let charTimeline: Timeline | null = null;

  const result: SplitResult = {
    root: container,
    lines,
    originalHTML,
    active: true,
    buildCharTimeline(opts: BuildCharTimelineOpts = {}) {
      const {
        duration = DEFAULTS.duration,
        stagger = DEFAULTS.stagger,
        lineOffset = DEFAULTS.lineOffset,
        ease = DEFAULTS.ease,
      } = opts;

      const tl = gsap.timeline({ paused: true });

      lines.forEach((line, lineIdx) => {
        const chars = line.words.flatMap((w) => w.chars.map((c) => c.el));
        tl.to(
          chars,
          {
            yPercent: 0,
            rotation: 0,
            opacity: 1,
            duration,
            stagger: {
              each: stagger,
              from: "start",
            },
            ease,
            clearProps: "transform,opacity,yPercent,rotation",
          },
          lineIdx * lineOffset
        );
      });

      charTimeline = tl;
      return tl;
    },
    revert() {
      if (!active) return;
      active = false;
      charTimeline?.kill();
      charTimeline = null;
      // Restore plain, selectable text; keeps SEO and accessibility clean.
      container.innerHTML = originalHTML;
      container.removeAttribute("style");
    },
  };

  return result;
}

/**
 * Split a headline root element into its visible line containers.
 * Expects direct children `[data-line="1"]`, `[data-line="2"]` holding plain text.
 */
export function splitHeadline(root: HTMLElement): SplitResult | null {
  if (!root) return null;
  const originalHTML = root.innerHTML;
  const lineEls = Array.from(
    root.querySelectorAll<HTMLElement>("[data-line]")
  ).sort(
    (a, b) =>
      Number(a.dataset.line ?? 0) - Number(b.dataset.line ?? 0)
  );

  if (lineEls.length === 0) return null;

  const lines: SplitLine[] = [];
  lineEls.forEach((lineEl) => {
    // Each line container holds plain text; split it into a mask > words > chars.
    const text = lineEl.textContent ?? "";
    lineEl.innerHTML = "";
    const splitted = splitContainer(lineEl);
    lines.push(...splitted);
  });

  setCharInitialState(lines);
  let active = true;
  let charTimeline: Timeline | null = null;

  const result: SplitResult = {
    root,
    lines,
    originalHTML,
    active: true,
    buildCharTimeline(opts: BuildCharTimelineOpts = {}) {
      const {
        duration = DEFAULTS.duration,
        stagger = DEFAULTS.stagger,
        lineOffset = DEFAULTS.lineOffset,
        ease = DEFAULTS.ease,
      } = opts;

      const tl = gsap.timeline({ paused: true });

      lines.forEach((line, lineIdx) => {
        const chars = line.words.flatMap((w) => w.chars.map((c) => c.el));
        tl.to(
          chars,
          {
            yPercent: 0,
            rotation: 0,
            opacity: 1,
            duration,
            stagger: { each: stagger, from: "start" },
            ease,
            clearProps: "transform,opacity,yPercent,rotation",
          },
          lineIdx * lineOffset
        );
      });

      charTimeline = tl;
      return tl;
    },
    revert() {
      if (!active) return;
      active = false;
      charTimeline?.kill();
      charTimeline = null;
      root.innerHTML = originalHTML;
    },
  };

  return result;
}


