"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowUpRight, ShieldCheck, CalendarCheck } from "lucide-react";
import type { ProjectItem } from "@/types";
import { SectionHeader } from "@/components/animations/Reveal";
import ModalDialog from "@/components/common/ModalDialog";
import EnquiryForm from "@/components/common/EnquiryForm";

const FILTERS = [
  "All Projects",
  "Noida",
  "Greater Noida",
  "Yamuna Expressway",
  "Commercial",
  "Residential",
] as const;

export default function FeaturedProjectsSection({
  projects,
  badge,
  title,
  subtitle,
  description,
  showAllCta = true,
}: {
  projects: ProjectItem[];
  badge?: string | null;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  showAllCta?: boolean;
}) {
  const [activeFilter, setActiveFilter] = useState<string>("All Projects");
  const [enquiryProject, setEnquiryProject] = useState<ProjectItem | null>(null);

  const filtered = useMemo(() => {
    if (activeFilter === "All Projects") return projects;
    return projects.filter(
      (p) =>
        p.region_filter.toLowerCase() === activeFilter.toLowerCase() ||
        p.category.toLowerCase() === activeFilter.toLowerCase() ||
        p.location.toLowerCase().includes(activeFilter.toLowerCase())
    );
  }, [projects, activeFilter]);

  return (
    <section className="bg-white py-9 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <SectionHeader
            badge={badge}
            title={title}
            subtitle={subtitle}
            description={description}
          />
          {showAllCta && (
            <Link
              href="/projects"
              className="gr-btn inline-flex shrink-0 items-center gap-2 self-start border border-[#164B34]/25 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#164B34] transition hover:border-[#164B34] hover:bg-[#164B34] hover:text-white sm:px-5 sm:py-2.5 lg:self-end"
            >
              <span>View All Projects</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Working Category & Region Filters (swipeable row on mobile) */}
        <div className="no-scrollbar -mx-4 mt-5 flex flex-nowrap gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mt-7 sm:flex-wrap sm:overflow-visible sm:px-0">
          {FILTERS.map((filter) => {
            const selected = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition sm:px-5 sm:py-2.5 ${
                  selected
                    ? "bg-[var(--gr-primary)] text-white shadow-md"
                    : "border border-[#164B34]/15 bg-[#F6F7F2] text-[#1C2921]/80 hover:border-[#C6A66C] hover:text-[#0C3323]"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Project Cards: Horizontal snap-carousel on mobile, grid on tablet/desktop */}
        {filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#164B34]/10 bg-[#F6F7F2] p-10 text-center">
            <p className="text-sm text-[#1C2921]/70">
              No projects currently match the &ldquo;{activeFilter}&rdquo; filter.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-4 text-[11px] font-medium text-[#246C49] sm:hidden">
              Swipe horizontally to explore all {filtered.length} projects →
            </p>
            <div className="no-scrollbar -mx-4 mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:mt-8 sm:grid sm:grid-cols-2 sm:gap-7 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
              {filtered.map((project) => (
                <article
                  key={project.id}
                  className="group flex w-[82vw] max-w-[330px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[#164B34]/12 bg-[#F6F7F2] transition duration-300 hover:-translate-y-1.5 hover:border-[#C6A66C]/60 hover:shadow-2xl hover:shadow-[#0C3323]/10 sm:w-auto sm:max-w-none"
                >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0C3323]">
                  <Image
                    src={project.featured_image || "/images/project-commercial-plaza.jpg"}
                    alt={`${project.name} — ${project.location}`}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C3323]/75 via-transparent to-transparent" />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#0C3323]/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#E0C796] backdrop-blur-sm">
                      {project.category}
                    </span>
                    <span className="rounded-full border border-white/25 bg-black/30 px-3 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                      {project.region_filter}
                    </span>
                  </div>
                  <p className="absolute bottom-2.5 left-4 right-4 text-[10px] text-white/75">
                    Architectural concept visual • Verify actual site details on visit
                  </p>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#246C49]">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{project.location}</span>
                  </div>

                  <h3 className="mt-2 font-editorial text-2xl font-semibold text-[#0C3323]">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="transition hover:text-[#164B34]"
                    >
                      {project.name}
                    </Link>
                  </h3>

                  {project.short_description && (
                    <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-[#1C2921]/75">
                      {project.short_description}
                    </p>
                  )}

                  <div className="mt-5 space-y-2 border-t border-[#164B34]/10 pt-4 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#1C2921]/60">Indicative Pricing</span>
                      <span className="font-semibold text-[#164B34]">
                        {project.price_range || "Price on Request"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#1C2921]/60">Status</span>
                      <span className="font-medium text-[#1C2921]">
                        {project.project_status || "Enquire for Latest Status"}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 pt-1 text-[11px] text-[#246C49]">
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C6A66C]" />
                      <span>UP-RERA &amp; official disclosures verified during consultation</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2.5 pt-2">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--gr-primary)] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[var(--gr-deep)]"
                    >
                      <span>View Details</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setEnquiryProject(project)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#C6A66C] bg-white px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#0C3323] transition hover:bg-[#C6A66C]/15"
                    >
                      <CalendarCheck className="h-3.5 w-3.5 text-[#164B34]" />
                      <span>Enquire</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          </>
        )}
      </div>

      {/* Project Enquiry / Site Visit Native Modal */}
      <ModalDialog
        open={Boolean(enquiryProject)}
        onClose={() => setEnquiryProject(null)}
        title={enquiryProject ? `Enquire About ${enquiryProject.name}` : "Project Enquiry"}
        subtitle={
          enquiryProject
            ? `${enquiryProject.location} • Request verified UP-RERA details, floor plans & site visit`
            : undefined
        }
      >
        {enquiryProject && (
          <EnquiryForm
            defaultEnquiryType="project"
            defaultInterest={enquiryProject.name}
            projectId={enquiryProject.id}
            defaultLocation={enquiryProject.region_filter}
            sourcePage={`/projects/${enquiryProject.slug}`}
            compact
            onSuccess={() => {
              setTimeout(() => setEnquiryProject(null), 1800);
            }}
          />
        )}
      </ModalDialog>
    </section>
  );
}
