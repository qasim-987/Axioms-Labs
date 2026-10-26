"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MOTION_EASE, STAGGER } from "@/lib/motionTokens";

interface SplitTextRevealProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "span";
  className?: string;
  charClassName?: string;
  accentFromWordIndex?: number;
  accentClassName?: string;
  delay?: number;
  stagger?: number;
  triggerOnLoad?: boolean;
}

export default function SplitTextReveal({
  text,
  as: Tag = "h2",
  className = "",
  charClassName = "",
  accentFromWordIndex,
  accentClassName = "text-brand-light",
  delay = 0,
  stagger = STAGGER.char,
  triggerOnLoad = false,
}: SplitTextRevealProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  const words = text.split(" ");
  let globalCharIndex = 0;

  return (
    <Tag aria-label={text} className={`${className} [perspective:800px]`}>
      <motion.span
        aria-hidden="true"
        initial="hidden"
        {...(triggerOnLoad
          ? { animate: "visible" }
          : {
              whileInView: "visible",
              viewport: { once: true, amount: 0.3 },
            })}
        className="inline"
      >
        {words.map((word, wIdx) => {
          const isAccentWord =
            accentFromWordIndex !== undefined && wIdx >= accentFromWordIndex;

          return (
            <span
              key={wIdx}
              className="inline-block whitespace-nowrap mr-[0.26em] last:mr-0"
            >
              {Array.from(word).map((char, cIdx) => {
                const charDelay = delay + globalCharIndex * stagger;
                globalCharIndex += 1;

                return (
                  <motion.span
                    key={cIdx}
                    variants={{
                      hidden: {
                        opacity: 0,
                        y: "62%",
                        rotateX: -38,
                        filter: "blur(6px)",
                      },
                      visible: {
                        opacity: 1,
                        y: "0%",
                        rotateX: 0,
                        filter: "blur(0px)",
                        transition: {
                          duration: 0.72,
                          delay: charDelay,
                          ease: MOTION_EASE.cinematicOut,
                        },
                      },
                    }}
                    className={`inline-block will-change-transform origin-bottom ${
                      isAccentWord ? accentClassName : ""
                    } ${charClassName}`}
                  >
                    {char}
                  </motion.span>
                );
              })}
            </span>
          );
        })}
      </motion.span>
    </Tag>
  );
}
