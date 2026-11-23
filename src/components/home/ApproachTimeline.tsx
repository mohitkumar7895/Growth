"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/animations/Reveal";

interface StepItem {
  number: string;
  title: string;
  description: string;
}

export default function ApproachTimeline({
  badge,
  title,
  subtitle,
  description,
  steps,
  ctaLabel,
  ctaUrl,
}: {
  badge?: string | null;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  steps: StepItem[];
  ctaLabel?: string | null;
  ctaUrl?: string | null;
}) {
  return (
    <section className="bg-white py-12 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={badge}
          title={title}
          subtitle={subtitle}
          description={description}
          align="center"
        />

        <div className="relative mt-9 sm:mt-10">
          {/* Connecting gold line on desktop */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-12 hidden h-[1px] bg-gradient-to-r from-transparent via-[#C6A66C]/60 to-transparent lg:block"
          />

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: index * 0.1 }}
                className="group relative rounded-2xl border border-[#164B34]/12 bg-[#F6F7F2] p-7 transition hover:-translate-y-1 hover:border-[#C6A66C] hover:bg-white hover:shadow-xl"
              >
                <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-[#C6A66C]/50 bg-[#0C3323] font-editorial text-2xl font-bold text-[#E0C796] shadow-md transition group-hover:scale-105">
                  {step.number}
                </div>
                <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#1C2921]/75">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {ctaLabel && ctaUrl && (
          <div className="mt-12 text-center">
            <Link
              href={ctaUrl}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--gr-primary)] px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition hover:bg-[var(--gr-deep)]"
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="h-4 w-4 text-[#E0C796]" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
