"use client";

import React from "react";
import { motion } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, y = 10, className = "" }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.22, delay: Math.min(delay, 0.06), ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({
  badge,
  title,
  subtitle,
  description,
  dark = false,
  align = "left",
}: {
  badge?: string | null;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  dark?: boolean;
  align?: "left" | "center";
}) {
  return (
    <Reveal
      className={
        align === "center"
          ? "mx-auto max-w-3xl text-center"
          : "max-w-3xl"
      }
    >
      {badge && (
        <div
          className={`mb-3 inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.22em] ${
            dark ? "text-[var(--gr-light-gold)]" : "text-[var(--gr-gold)]"
          }`}
        >
          <span className="h-[1px] w-7 bg-current" />
          <span>{badge}</span>
          {align === "center" && <span className="h-[1px] w-7 bg-current" />}
        </div>
      )}
      <h2
        className={`text-3xl font-semibold leading-[1.15] sm:text-4xl lg:text-5xl ${
          dark ? "text-white" : "text-[var(--gr-deep)]"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-2.5 text-sm font-medium tracking-wide ${
            dark ? "text-[var(--gr-light-gold)]/90" : "text-[var(--gr-secondary)]"
          }`}
        >
          {subtitle}
        </p>
      )}
      {description && (
        <p
          className={`mt-4 text-base leading-relaxed ${
            dark ? "text-white/75" : "text-[var(--gr-dark)]/75"
          }`}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
