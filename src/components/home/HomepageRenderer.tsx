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
            <section key={section.id} className="bg-white py-12 sm:py-14 lg:py-16">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeader
                  badge={section.badge_text}
                  title={section.title}
                  subtitle={section.subtitle}
                  description={section.description}
                  align="center"
                />
                <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((item, idx) => (
                    <Reveal key={idx} delay={idx * 0.05}>
                      <div className="group h-full rounded-2xl border border-[#164B34]/12 bg-[#F6F7F2] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#C6A66C] hover:bg-white hover:shadow-xl">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0C3323] text-[#E0C796] shadow-md transition group-hover:bg-[#164B34]">
                          <DynamicIcon name={item.icon} className="h-5 w-5" />
                        </div>
                        <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-[#1C2921]/75">
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
            <section key={section.id} className="bg-[var(--gr-cream)] py-12 sm:py-14 lg:py-16">
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
                      className="gr-btn inline-flex shrink-0 items-center gap-2 self-start bg-[var(--gr-primary)] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[var(--gr-deep)] lg:self-end"
                    >
                      <span>{section.cta_primary_label}</span>
                      <ArrowRight className="h-4 w-4 text-[#E0C796]" />
                    </Link>
                  )}
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6 sm:mt-10 md:grid-cols-2 lg:grid-cols-3">
                  {categories.map((cat, idx) => (
                    <Reveal key={cat.id} delay={idx * 0.06}>
                      <Link
                        href={`/properties?category=${cat.slug}`}
                        className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-[#0C3323] shadow-lg"
                      >
                        <Image
                          src={cat.image_url || "/images/category-residential.jpg"}
                          alt={cat.name}
                          fill
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0C3323] via-[#0C3323]/45 to-transparent transition duration-500 group-hover:via-[#0C3323]/60" />
                        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-[#C6A66C]/50 bg-[#0C3323]/75 text-[#E0C796] backdrop-blur-sm">
                            <DynamicIcon name={cat.icon_name} className="h-4 w-4" />
                          </div>
                          <h3 className="font-editorial text-2xl font-semibold text-white sm:text-3xl">
                            {cat.name}
                          </h3>
                          {cat.short_description && (
                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/80 sm:text-sm">
                              {cat.short_description}
                            </p>
                          )}
                          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#E0C796]">
                            <span>View Opportunities</span>
                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
              className="relative overflow-hidden bg-[var(--gr-deep)] py-12 text-white sm:py-14 lg:py-16"
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
                  {/* Editorial Image Column */}
                  <Reveal className="lg:col-span-5">
                    <div className="relative">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[#C6A66C]/35 shadow-2xl">
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
                      <div className="glass-emerald relative z-10 mx-3 -mt-10 rounded-xl p-5 sm:mx-6 sm:-mt-12 lg:ml-6 lg:mr-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C6A66C]">
                          Our Commitment
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-white/90">
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
                      <blockquote className="mt-6 border-l-2 border-[#C6A66C] pl-5 font-editorial text-xl italic leading-relaxed text-[#E0C796]">
                        &ldquo;{about.philosophy}&rdquo;
                      </blockquote>
                    )}

                    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {about.mission && (
                        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
                          <h3 className="font-editorial text-xl font-semibold text-[#E0C796]">
                            Our Mission
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-white/75">
                            {about.mission}
                          </p>
                        </div>
                      )}
                      {about.vision && (
                        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
                          <h3 className="font-editorial text-xl font-semibold text-[#E0C796]">
                            Our Vision
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-white/75">
                            {about.vision}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 flex flex-wrap gap-4">
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
            <section key={section.id} className="bg-[var(--gr-cream)] py-12 sm:py-14 lg:py-16">
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
                    className="gr-btn inline-flex shrink-0 items-center gap-2 self-start border border-[#164B34]/25 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#164B34] transition hover:bg-[#164B34] hover:text-white lg:self-end"
                  >
                    <span>All Services</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
                  {services.slice(0, 8).map((service, idx) => (
                    <Reveal key={service.id} delay={idx * 0.05}>
                      <Link
                        href={`/services/${service.slug}`}
                        className="group flex h-full flex-col rounded-2xl border border-[#164B34]/12 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#C6A66C] hover:shadow-xl"
                      >
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F6F7F2] text-[#164B34] transition group-hover:bg-[#0C3323] group-hover:text-[#E0C796]">
                          <DynamicIcon name={service.icon_name} className="h-5 w-5" />
                        </div>
                        <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
                          {service.title}
                        </h3>
                        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-[#1C2921]/75">
                          {service.short_description}
                        </p>
                        <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#164B34] group-hover:text-[#C6A66C]">
                          <span>Explore Service</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
            <section key={section.id} className="bg-[var(--gr-cream)] py-12 sm:py-14 lg:py-16">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeader
                  badge={section.badge_text}
                  title={section.title}
                  subtitle={section.subtitle}
                  description={section.description}
                  align="center"
                />
                <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 md:grid-cols-2 lg:grid-cols-3">
                  {features.map((f, idx) => (
                    <Reveal key={idx} delay={idx * 0.06}>
                      <div className="flex h-full items-start gap-4 rounded-2xl border border-[#164B34]/12 bg-white p-6 transition hover:border-[#C6A66C] hover:shadow-lg">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#C6A66C]/40 bg-[#F6F7F2] text-[#164B34]">
                          <DynamicIcon name={f.icon} className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
                            {f.title}
                          </h3>
                          <p className="mt-1.5 text-sm leading-relaxed text-[#1C2921]/75">
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
              className="relative overflow-hidden bg-[var(--gr-deep)] py-12 text-white sm:py-14 lg:py-16"
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
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                  <SectionHeader
                    badge={section.badge_text}
                    title={section.title}
                    subtitle={section.subtitle}
                    description={section.description}
                    dark
                  />
                  <div className="flex flex-wrap gap-3">
                    {section.cta_primary_label && (
                      <Link
                        href={section.cta_primary_url || "/contact#enquiry"}
                        className="inline-flex items-center gap-2 rounded-lg bg-[var(--gr-gold)] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--gr-deep)] transition hover:bg-[var(--gr-light-gold)]"
                      >
                        <span>{section.cta_primary_label}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                    {section.cta_secondary_label && (
                      <Link
                        href={section.cta_secondary_url || "/properties?purpose=Investment"}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:border-[#C6A66C] hover:text-[#E0C796]"
                      >
                        <span>{section.cta_secondary_label}</span>
                      </Link>
                    )}
                  </div>
                </div>

                <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {highlights.map((h, idx) => (
                    <Reveal key={idx} delay={idx * 0.06}>
                      <div className="glass-emerald flex h-full flex-col rounded-2xl p-6 transition hover:-translate-y-1 hover:border-[#E0C796]">
                        <span className="mb-3 inline-block w-fit rounded-full bg-[#C6A66C]/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#E0C796]">
                          {h.tag}
                        </span>
                        <h3 className="font-editorial text-2xl font-semibold text-white">
                          {h.title}
                        </h3>
                        <p className="mt-2.5 text-xs leading-relaxed text-white/75 sm:text-sm">
                          {h.description}
                        </p>
                      </div>
                    </Reveal>
                  ))}
                </div>

                {data.disclaimer && (
                  <div className="mt-8 flex items-start gap-2.5 rounded-xl border border-[#C6A66C]/25 bg-black/25 p-4 text-xs text-white/70">
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
            <section key={section.id} className="bg-white py-12 sm:py-14 lg:py-16">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeader
                  badge={section.badge_text}
                  title={section.title}
                  subtitle={section.subtitle}
                  description={section.description}
                  align="center"
                />
                <div className="mt-8 grid grid-cols-1 gap-6 sm:mt-10 md:grid-cols-3">
                  {testimonials.slice(0, 3).map((t, idx) => (
                    <Reveal key={t.id} delay={idx * 0.08}>
                      <figure className="flex h-full flex-col rounded-2xl border border-[#164B34]/12 bg-[#F6F7F2] p-7">
                        <div className="flex items-center gap-1 text-[#C6A66C]" aria-label={`${t.rating} out of 5 stars`}>
                          {Array.from({ length: t.rating || 5 }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                        <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-[#1C2921]/85">
                          &ldquo;{t.feedback}&rdquo;
                        </blockquote>
                        <figcaption className="mt-6 border-t border-[#164B34]/10 pt-4">
                          <p className="font-editorial text-xl font-semibold text-[#0C3323]">
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
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (key === "blogs") {
          if (blogs.length === 0) return null;
          return (
            <section key={section.id} className="bg-[var(--gr-cream)] py-12 sm:py-14 lg:py-16">
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
                    className="gr-btn inline-flex shrink-0 items-center gap-2 self-start border border-[#164B34]/25 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#164B34] transition hover:bg-[#164B34] hover:text-white lg:self-end"
                  >
                    <span>Read All Insights</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6 sm:mt-10 md:grid-cols-3">
                  {blogs.slice(0, 3).map((post, idx) => (
                    <Reveal key={post.id} delay={idx * 0.08}>
                      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#164B34]/12 bg-white transition hover:-translate-y-1 hover:border-[#C6A66C] hover:shadow-xl">
                        <Link
                          href={`/insights/${post.slug}`}
                          className="relative block aspect-[16/10] w-full overflow-hidden bg-[#0C3323]"
                        >
                          <Image
                            src={post.featured_image || "/images/category-investment.jpg"}
                            alt={post.title}
                            fill
                            loading="lazy"
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition duration-700 group-hover:scale-105"
                          />
                          {post.category_name && (
                            <span className="absolute left-3.5 top-3.5 rounded-full bg-[#0C3323]/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#E0C796]">
                              {post.category_name}
                            </span>
                          )}
                        </Link>
                        <div className="flex flex-1 flex-col p-6">
                          <div className="flex items-center gap-3 text-xs text-[#1C2921]/55">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-[#C6A66C]" />
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
                          <h3 className="mt-2.5 font-editorial text-2xl font-semibold leading-snug text-[#0C3323]">
                            <Link
                              href={`/insights/${post.slug}`}
                              className="transition hover:text-[#164B34]"
                            >
                              {post.title}
                            </Link>
                          </h3>
                          {post.excerpt && (
                            <p className="mt-2.5 flex-1 line-clamp-3 text-sm leading-relaxed text-[#1C2921]/75">
                              {post.excerpt}
                            </p>
                          )}
                          <Link
                            href={`/insights/${post.slug}`}
                            className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#164B34] hover:text-[#C6A66C]"
                          >
                            <span>Read Article</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </article>
                    </Reveal>
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
              className="bg-white py-12 sm:py-14 lg:py-16"
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
