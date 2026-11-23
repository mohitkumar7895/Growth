import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Star, Calendar, ShieldAlert } from "lucide-react";
import type {
  HomepageSection,
  PropertyCategory,
  ProjectItem,
  ServiceItem,
  TestimonialItem,
  BlogItem,
  FaqItem,
  WebsiteSettingsMap,
} from "@/types";
import { safeJsonParse } from "@/lib/security";
import HeroSection from "./HeroSection";
import SmartPropertySearch from "./SmartPropertySearch";
import FeaturedProjectsSection from "./FeaturedProjectsSection";
import ApproachTimeline from "./ApproachTimeline";
import ContactSection from "./ContactSection";
import { Reveal, SectionHeader } from "@/components/animations/Reveal";
import { DynamicIcon } from "@/components/common/IconRenderer";

interface HomepageRendererProps {
  sections: HomepageSection[];
  settings: WebsiteSettingsMap;
  categories: PropertyCategory[];
  projects: ProjectItem[];
  services: ServiceItem[];
  testimonials: TestimonialItem[];
  blogs: BlogItem[];
  faqs: FaqItem[];
}

export default function HomepageRenderer({
  sections,
  settings,
  categories,
  projects,
  services,
  testimonials,
  blogs,
  faqs,
}: HomepageRendererProps) {
  const enable3DGlobal = settings.three_d_hero_enabled !== "false";

  return (
    <>
      {sections.map((section) => {
        const key = section.section_type || section.section_key;

        if (key === "hero") {
          return (
            <HeroSection
              key={section.id}
              section={section}
              enable3DGlobal={enable3DGlobal}
            />
          );
        }

        if (key === "property_search") {
          return (
            <SmartPropertySearch
              key={section.id}
              title={section.title}
              subtitle={section.subtitle}
            />
          );
        }

        if (key === "trust_highlights") {
          const data = safeJsonParse<{
            items?: { icon: string; title: string; description: string }[];
          }>(section.content_json, {});
          const items = data.items || [];
          return (
            <section key={section.id} className="bg-white py-9 sm:py-14 lg:py-16">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeader
                  badge={section.badge_text}
                  title={section.title}
                  subtitle={section.subtitle}
                  description={section.description}
                  align="center"
                />
                <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 lg:grid-cols-4">
                  {items.map((item, idx) => (
                    <Reveal key={idx} delay={idx * 0.05}>
                      <div className="group h-full rounded-2xl border border-[#164B34]/12 bg-[#F6F7F2] p-4 transition duration-300 hover:-translate-y-1 hover:border-[#C6A66C] hover:bg-white hover:shadow-xl sm:p-6">
                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#0C3323] text-[#E0C796] shadow-md transition group-hover:bg-[#164B34] sm:mb-4 sm:h-11 sm:w-11">
                          <DynamicIcon name={item.icon} className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <h3 className="font-editorial text-lg font-semibold leading-snug text-[#0C3323] sm:text-2xl">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#1C2921]/75 sm:mt-2 sm:text-sm">
                          {item.description}
                        </p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (key === "property_categories") {
          return (
            <section key={section.id} className="bg-[var(--gr-cream)] py-9 sm:py-14 lg:py-16">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                  <SectionHeader
                    badge={section.badge_text}
                    title={section.title}
                    subtitle={section.subtitle}
                    description={section.description}
                  />
                  {section.cta_primary_label && (
                    <Link
                      href={section.cta_primary_url || "/properties"}
                      className="gr-btn inline-flex shrink-0 items-center gap-2 self-start bg-[var(--gr-primary)] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[var(--gr-deep)] sm:px-6 sm:py-3 lg:self-end"
                    >
                      <span>{section.cta_primary_label}</span>
                      <ArrowRight className="h-4 w-4 text-[#E0C796]" />
                    </Link>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-6 lg:grid-cols-3">
                  {categories.map((cat, idx) => (
                    <Reveal key={cat.id} delay={idx * 0.05}>
                      <Link
                        href={`/properties?category=${cat.slug}`}
                        className="group relative block aspect-[4/4] overflow-hidden rounded-xl bg-[#0C3323] shadow-lg sm:aspect-[4/3] sm:rounded-2xl"
                      >
                        <Image
                          src={cat.image_url || "/images/category-residential.jpg"}
                          alt={cat.name}
                          fill
                          loading="lazy"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0C3323] via-[#0C3323]/50 to-transparent transition duration-500 group-hover:via-[#0C3323]/60" />
                        <div className="absolute inset-0 flex flex-col justify-end p-3.5 text-white sm:p-6">
                          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg border border-[#C6A66C]/50 bg-[#0C3323]/75 text-[#E0C796] backdrop-blur-sm sm:mb-3 sm:h-10 sm:w-10">
                            <DynamicIcon name={cat.icon_name} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </div>
                          <h3 className="font-editorial text-lg font-semibold leading-tight text-white sm:text-3xl">
                            {cat.name}
                          </h3>
                          {cat.short_description && (
                            <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/80 sm:mt-2 sm:text-sm sm:leading-relaxed">
                              {cat.short_description}
                            </p>
                          )}
                          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#E0C796] sm:mt-4 sm:gap-1.5 sm:text-xs sm:tracking-[0.18em]">
                            <span>Explore</span>
                            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:h-4 sm:w-4" />
                          </span>
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (key === "featured_projects") {
          return (
            <FeaturedProjectsSection
              key={section.id}
              projects={projects}
              badge={section.badge_text}
              title={section.title}
              subtitle={section.subtitle}
              description={section.description}
            />
          );
        }

        if (key === "about") {
          const about = safeJsonParse<{
            philosophy?: string;
            mission?: string;
            vision?: string;
            commitment?: string;
          }>(section.content_json, {});

          return (
            <section
              key={section.id}
              className="relative overflow-hidden bg-[var(--gr-deep)] py-9 text-white sm:py-14 lg:py-16"
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-10">
                  {/* Editorial Image Column */}
                  <Reveal className="lg:col-span-5">
                    <div className="relative">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-[#C6A66C]/35 shadow-2xl lg:aspect-[4/5]">
                        <Image
                          src={section.image_url || "/images/about-interior.jpg"}
                          alt="Growth Realtech Luxury Advisory"
                          fill
                          loading="lazy"
                          sizes="(max-width: 1024px) 100vw, 42vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0C3323]/75 via-transparent to-transparent" />
                      </div>
                      <div className="glass-emerald relative z-10 mx-3 -mt-8 rounded-xl p-4 sm:mx-6 sm:-mt-12 sm:p-5 lg:ml-6 lg:mr-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C6A66C]">
                          Our Commitment
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-white/90 sm:mt-1.5 sm:text-sm">
                          {about.commitment ||
                            "Clear communication, disciplined property sourcing, and end-to-end consulting across Noida and NCR."}
                        </p>
                      </div>
                    </div>
                  </Reveal>

                  {/* Editorial Narrative Column */}
                  <div className="lg:col-span-7">
                    <SectionHeader
                      badge={section.badge_text}
                      title={section.title}
                      subtitle={section.subtitle}
                      description={section.description}
                      dark
                    />

                    {about.philosophy && (
                      <blockquote className="mt-4 border-l-2 border-[#C6A66C] pl-4 font-editorial text-lg italic leading-relaxed text-[#E0C796] sm:mt-6 sm:pl-5 sm:text-xl">
                        &ldquo;{about.philosophy}&rdquo;
                      </blockquote>
                    )}

                    <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-7 sm:gap-5">
                      {about.mission && (
                        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5 sm:p-5">
                          <h3 className="font-editorial text-lg font-semibold text-[#E0C796] sm:text-xl">
                            Our Mission
                          </h3>
                          <p className="mt-1.5 text-xs leading-relaxed text-white/75 sm:mt-2 sm:text-sm">
                            {about.mission}
                          </p>
                        </div>
                      )}
                      {about.vision && (
                        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5 sm:p-5">
                          <h3 className="font-editorial text-lg font-semibold text-[#E0C796] sm:text-xl">
                            Our Vision
                          </h3>
                          <p className="mt-1.5 text-xs leading-relaxed text-white/75 sm:mt-2 sm:text-sm">
                            {about.vision}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
                      {section.cta_primary_label && (
                        <Link
                          href={section.cta_primary_url || "/about"}
                          className="inline-flex items-center gap-2 rounded-lg bg-[var(--gr-gold)] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--gr-deep)] transition hover:bg-[var(--gr-light-gold)]"
                        >
                          <span>{section.cta_primary_label}</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                      {section.cta_secondary_label && (
                        <Link
                          href={section.cta_secondary_url || "/contact#enquiry"}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:border-[#C6A66C] hover:text-[#E0C796]"
                        >
                          <span>{section.cta_secondary_label}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        if (key === "services") {
          return (
            <section key={section.id} className="bg-[var(--gr-cream)] py-9 sm:py-14 lg:py-16">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                  <SectionHeader
                    badge={section.badge_text}
                    title={section.title}
                    subtitle={section.subtitle}
                    description={section.description}
                  />
                  <Link
                    href="/services"
                    className="gr-btn inline-flex shrink-0 items-center gap-2 self-start border border-[#164B34]/25 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#164B34] transition hover:bg-[#164B34] hover:text-white sm:px-5 sm:py-2.5 lg:self-end"
                  >
                    <span>All Services</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 lg:grid-cols-4">
                  {services.slice(0, 8).map((service, idx) => (
                    <Reveal key={service.id} delay={idx * 0.04}>
                      <Link
                        href={`/services/${service.slug}`}
                        className="group flex h-full flex-col rounded-xl border border-[#164B34]/12 bg-white p-4 transition duration-300 hover:-translate-y-1 hover:border-[#C6A66C] hover:shadow-xl sm:rounded-2xl sm:p-6"
                      >
                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#F6F7F2] text-[#164B34] transition group-hover:bg-[#0C3323] group-hover:text-[#E0C796] sm:mb-5 sm:h-12 sm:w-12">
                          <DynamicIcon name={service.icon_name} className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <h3 className="font-editorial text-lg font-semibold leading-snug text-[#0C3323] sm:text-2xl">
                          {service.title}
                        </h3>
                        <p className="mt-1.5 line-clamp-3 flex-1 text-xs leading-relaxed text-[#1C2921]/75 sm:mt-2.5 sm:line-clamp-none sm:text-sm">
                          {service.short_description}
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#164B34] group-hover:text-[#C6A66C] sm:mt-5 sm:gap-1.5 sm:text-xs">
                          <span>Details</span>
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1 sm:h-3.5 sm:w-3.5" />
                        </span>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (key === "approach") {
          const data = safeJsonParse<{
            steps?: { number: string; title: string; description: string }[];
          }>(section.content_json, {});
          return (
            <ApproachTimeline
              key={section.id}
              badge={section.badge_text}
              title={section.title}
              subtitle={section.subtitle}
              description={section.description}
              steps={data.steps || []}
              ctaLabel={section.cta_primary_label}
              ctaUrl={section.cta_primary_url}
            />
          );
        }

        if (key === "why_choose") {
          const data = safeJsonParse<{
            features?: { icon: string; title: string; description: string }[];
          }>(section.content_json, {});
          const features = data.features || [];
          return (
            <section key={section.id} className="bg-[var(--gr-cream)] py-9 sm:py-14 lg:py-16">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeader
                  badge={section.badge_text}
                  title={section.title}
                  subtitle={section.subtitle}
                  description={section.description}
                  align="center"
                />
                <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 lg:grid-cols-3">
                  {features.map((f, idx) => (
                    <Reveal key={idx} delay={idx * 0.04}>
                      <div className="flex h-full flex-col items-start gap-2.5 rounded-xl border border-[#164B34]/12 bg-white p-4 transition hover:border-[#C6A66C] hover:shadow-lg sm:flex-row sm:gap-4 sm:rounded-2xl sm:p-6">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#C6A66C]/40 bg-[#F6F7F2] text-[#164B34] sm:h-11 sm:w-11">
                          <DynamicIcon name={f.icon} className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div>
                          <h3 className="font-editorial text-lg font-semibold leading-snug text-[#0C3323] sm:text-2xl">
                            {f.title}
                          </h3>
                          <p className="mt-1 text-xs leading-relaxed text-[#1C2921]/75 sm:mt-1.5 sm:text-sm">
                            {f.description}
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (key === "investment_opportunities") {
          const data = safeJsonParse<{
            disclaimer?: string;
            highlights?: { title: string; description: string; tag: string }[];
          }>(section.content_json, {});
          const highlights = data.highlights || [];
          return (
            <section
              key={section.id}
              className="relative overflow-hidden bg-[var(--gr-deep)] py-9 text-white sm:py-14 lg:py-16"
            >
              {section.image_url && (
                <div className="absolute inset-0 opacity-20">
                  <Image
                    src={section.image_url}
                    alt={section.title}
                    fill
                    loading="lazy"
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                  <SectionHeader
                    badge={section.badge_text}
                    title={section.title}
                    subtitle={section.subtitle}
                    description={section.description}
                    dark
                  />
                  <div className="flex flex-wrap gap-2.5 sm:gap-3">
                    {section.cta_primary_label && (
                      <Link
                        href={section.cta_primary_url || "/contact#enquiry"}
                        className="gr-btn inline-flex items-center gap-2 bg-[var(--gr-gold)] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--gr-deep)] transition hover:bg-[var(--gr-light-gold)] sm:px-6"
                      >
                        <span>{section.cta_primary_label}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                    {section.cta_secondary_label && (
                      <Link
                        href={section.cta_secondary_url || "/properties?purpose=Investment"}
                        className="gr-btn inline-flex items-center gap-2 border border-white/25 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white transition hover:border-[#C6A66C] hover:text-[#E0C796] sm:px-6"
                      >
                        <span>{section.cta_secondary_label}</span>
                      </Link>
                    )}
                  </div>
                </div>

                <p className="mt-5 text-[11px] font-medium text-[#E0C796] sm:hidden">
                  Swipe to explore all {highlights.length} investment avenues →
                </p>
                <div className="no-scrollbar -mx-4 mt-3 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 xl:grid-cols-5">
                  {highlights.map((h, idx) => (
                    <div
                      key={idx}
                      className="glass-emerald flex w-[76vw] max-w-[290px] shrink-0 snap-start flex-col rounded-2xl p-5 transition hover:-translate-y-1 hover:border-[#E0C796] sm:w-auto sm:max-w-none sm:p-6"
                    >
                      <span className="mb-2.5 inline-block w-fit rounded-full bg-[#C6A66C]/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#E0C796]">
                        {h.tag}
                      </span>
                      <h3 className="font-editorial text-xl font-semibold text-white sm:text-2xl">
                        {h.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-white/75 sm:text-sm">
                        {h.description}
                      </p>
                    </div>
                  ))}
                </div>

                {data.disclaimer && (
                  <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-[#C6A66C]/25 bg-black/25 p-3.5 text-xs text-white/70 sm:mt-8 sm:p-4">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#C6A66C]" />
                    <p>{data.disclaimer}</p>
                  </div>
                )}
              </div>
            </section>
          );
        }

        if (key === "testimonials") {
          if (testimonials.length === 0) return null;
          return (
            <section key={section.id} className="bg-white py-9 sm:py-14 lg:py-16">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeader
                  badge={section.badge_text}
                  title={section.title}
                  subtitle={section.subtitle}
                  description={section.description}
                  align="center"
                />
                <div className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:mt-10 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
                  {testimonials.slice(0, 3).map((t) => (
                    <figure
                      key={t.id}
                      className="flex w-[84vw] max-w-[340px] shrink-0 snap-start flex-col rounded-2xl border border-[#164B34]/12 bg-[#F6F7F2] p-5 md:w-auto md:max-w-none md:p-7"
                    >
                      <div className="flex items-center gap-1 text-[#C6A66C]" aria-label={`${t.rating} out of 5 stars`}>
                        {Array.from({ length: t.rating || 5 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <blockquote className="mt-3 flex-1 text-xs leading-relaxed text-[#1C2921]/85 sm:mt-4 sm:text-sm">
                        &ldquo;{t.feedback}&rdquo;
                      </blockquote>
                      <figcaption className="mt-4 border-t border-[#164B34]/10 pt-3.5 sm:mt-6 sm:pt-4">
                        <p className="font-editorial text-lg font-semibold text-[#0C3323] sm:text-xl">
                          {t.client_name}
                        </p>
                        {(t.designation || t.company) && (
                          <p className="text-xs text-[#1C2921]/65">
                            {[t.designation, t.company].filter(Boolean).join(" • ")}
                          </p>
                        )}
                        {t.property_context && (
                          <p className="mt-1 text-[11px] font-medium text-[#246C49]">
                            {t.property_context}
                          </p>
                        )}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (key === "blogs") {
          if (blogs.length === 0) return null;
          return (
            <section key={section.id} className="bg-[var(--gr-cream)] py-9 sm:py-14 lg:py-16">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                  <SectionHeader
                    badge={section.badge_text}
                    title={section.title}
                    subtitle={section.subtitle}
                    description={section.description}
                  />
                  <Link
                    href="/insights"
                    className="gr-btn inline-flex shrink-0 items-center gap-2 self-start border border-[#164B34]/25 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#164B34] transition hover:bg-[#164B34] hover:text-white sm:px-5 sm:py-2.5 lg:self-end"
                  >
                    <span>Read All Insights</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:mt-10 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
                  {blogs.slice(0, 3).map((post) => (
                    <article
                      key={post.id}
                      className="group flex w-[82vw] max-w-[330px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[#164B34]/12 bg-white transition hover:-translate-y-1 hover:border-[#C6A66C] hover:shadow-xl md:w-auto md:max-w-none"
                    >
                      <Link
                        href={`/insights/${post.slug}`}
                        className="relative block aspect-[16/10] w-full overflow-hidden bg-[#0C3323]"
                      >
                        <Image
                          src={post.featured_image || "/images/category-investment.jpg"}
                          alt={post.title}
                          fill
                          loading="lazy"
                          sizes="(max-width: 768px) 82vw, 33vw"
                          className="object-cover transition duration-700 group-hover:scale-105"
                        />
                        {post.category_name && (
                          <span className="absolute left-3 top-3 rounded-full bg-[#0C3323]/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#E0C796]">
                            {post.category_name}
                          </span>
                        )}
                      </Link>
                      <div className="flex flex-1 flex-col p-4 sm:p-6">
                        <div className="flex items-center gap-2 text-[11px] text-[#1C2921]/55 sm:text-xs">
                          <Calendar className="h-3.5 w-3.5 text-[#C6A66C]" />
                          <span>
                            {post.published_at
                              ? new Date(post.published_at).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Latest Insight"}
                          </span>
                          <span>•</span>
                          <span>{post.reading_time || "5 min read"}</span>
                        </div>
                        <h3 className="mt-2 font-editorial text-xl font-semibold leading-snug text-[#0C3323] sm:text-2xl">
                          <Link
                            href={`/insights/${post.slug}`}
                            className="transition hover:text-[#164B34]"
                          >
                            {post.title}
                          </Link>
                        </h3>
                        {post.excerpt && (
                          <p className="mt-2 flex-1 line-clamp-2 text-xs leading-relaxed text-[#1C2921]/75 sm:line-clamp-3 sm:text-sm">
                            {post.excerpt}
                          </p>
                        )}
                        <Link
                          href={`/insights/${post.slug}`}
                          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#164B34] hover:text-[#C6A66C]"
                        >
                          <span>Read Article</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (key === "faqs") {
          if (faqs.length === 0) return null;
          return (
            <section
              key={section.id}
              aria-labelledby="home-faq-heading"
              className="bg-white py-9 sm:py-14 lg:py-16"
            >
              <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  {section.badge_text && (
                    <div className="mb-3 inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--gr-gold)]">
                      <span className="h-[1px] w-7 bg-current" />
                      <span>{section.badge_text}</span>
                      <span className="h-[1px] w-7 bg-current" />
                    </div>
                  )}
                  <h2
                    id="home-faq-heading"
                    className="font-editorial text-3xl font-semibold text-[#0C3323] sm:text-4xl lg:text-5xl"
                  >
                    {section.title}
                  </h2>
                  {section.description && (
                    <p className="mt-3 text-base text-[#1C2921]/75">
                      {section.description}
                    </p>
                  )}
                </div>

                {/* Native Accessible Accordion (modern-web-guidance: accordion) */}
                <div className="gr-accordion mt-8 border-t border-[#164B34]/14 sm:mt-10">
                  {faqs.map((faq) => (
                    <details key={faq.id}>
                      <summary className="text-base sm:text-lg">
                        {faq.question}
                      </summary>
                      <div className="pb-5 pl-8 pr-2 text-sm leading-relaxed text-[#1C2921]/80 sm:text-base">
                        <p>{faq.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (key === "contact") {
          return (
            <ContactSection
              key={section.id}
              settings={settings}
              badge={section.badge_text}
              title={section.title}
              subtitle={section.subtitle}
              description={section.description}
            />
          );
        }

        // Custom CMS Section added dynamically from Admin -> Homepage Management
        const isDark = section.background_style === "deep-green";
        return (
          <section
            key={section.id}
            className={`py-20 ${
              isDark
                ? "bg-[var(--gr-deep)] text-white"
                : section.background_style === "white"
                ? "bg-white"
                : "bg-[var(--gr-cream)]"
            }`}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                <div className={section.image_url ? "lg:col-span-7" : "lg:col-span-12"}>
                  <SectionHeader
                    badge={section.badge_text}
                    title={section.title}
                    subtitle={section.subtitle}
                    description={section.description}
                    dark={isDark}
                  />
                  {(section.cta_primary_label || section.cta_secondary_label) && (
                    <div className="mt-7 flex flex-wrap gap-3">
                      {section.cta_primary_label && (
                        <Link
                          href={section.cta_primary_url || "/contact"}
                          className="inline-flex items-center gap-2 rounded-lg bg-[var(--gr-gold)] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--gr-deep)]"
                        >
                          {section.cta_primary_label}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                      {section.cta_secondary_label && (
                        <Link
                          href={section.cta_secondary_url || "/properties"}
                          className="inline-flex items-center gap-2 rounded-lg border border-current px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                        >
                          {section.cta_secondary_label}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
                {section.image_url && (
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl lg:col-span-5">
                    <Image
                      src={section.image_url}
                      alt={section.title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 1024px) 100vw, 42vw"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
