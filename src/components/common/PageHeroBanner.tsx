import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

export default function PageHeroBanner({
  badge,
  title,
  description,
  imageUrl = "/images/hero-skyline.jpg",
  breadcrumbs,
}: {
  badge?: string;
  title: string;
  description?: string | null;
  imageUrl?: string;
  breadcrumbs: { label: string; href?: string }[];
}) {
  const jsonLd = buildBreadcrumbJsonLd(
    breadcrumbs.map((b) => ({ name: b.label, url: b.href || "/" }))
  );

  return (
    <section className="relative overflow-hidden bg-[var(--gr-deep)] pb-16 pt-36 text-white sm:pb-20 sm:pt-44">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="absolute inset-0 z-0 opacity-25">
        <Image
          src={imageUrl}
          alt={title}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(110deg, rgba(12,51,35,0.95) 0%, rgba(22,75,52,0.82) 60%, rgba(12,51,35,0.92) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-white/70">
            {breadcrumbs.map((crumb, idx) => (
              <li key={idx} className="inline-flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-[#C6A66C]" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="transition hover:text-[#E0C796]">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[#E0C796]">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {badge && (
          <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C6A66C]">
            <span className="h-[1px] w-6 bg-[#C6A66C]" />
            {badge}
          </p>
        )}
        <h1 className="max-w-4xl font-editorial text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
