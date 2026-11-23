import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  FileText,
  ExternalLink,
  MapPin,
  Building2,
} from "lucide-react";
import { getProjectBySlug } from "@/services/siteData";
import { buildPageMetadata } from "@/lib/seo";
import { safeJsonParse } from "@/lib/security";
import PageHeroBanner from "@/components/common/PageHeroBanner";
import ProjectGalleryClient from "@/components/projects/ProjectGalleryClient";
import EnquiryForm from "@/components/common/EnquiryForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };
  return buildPageMetadata("projects", {
    title: project.meta_title || `${project.name} — ${project.location} | Growth Realtech`,
    description: project.meta_description || project.short_description,
    ogImage: project.featured_image,
    canonical: project.canonical_url,
    path: `/projects/${project.slug}`,
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const amenities = safeJsonParse<string[]>(project.amenities_json, []);
  const specifications = safeJsonParse<Record<string, string>>(
    project.specifications_json,
    {}
  );

  const galleryImages =
    project.images && project.images.length > 0
      ? project.images
      : project.featured_image
      ? [
          {
            image_url: project.featured_image,
            alt_text: project.name,
            caption:
              "Conceptual architectural representation — verify actual site visuals during consultation",
          },
        ]
      : [];

  return (
    <>
      <PageHeroBanner
        badge={`${project.category} • ${project.region_filter}`}
        title={project.name}
        description={`${project.location} — ${project.short_description || ""}`}
        imageUrl={project.featured_image || "/images/project-commercial-plaza.jpg"}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: project.name },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Link
          href="/projects"
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#164B34] hover:text-[#C6A66C]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to All Projects
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Main Project Column */}
          <div className="space-y-8 lg:col-span-8">
            <ProjectGalleryClient
              projectName={project.name}
              images={galleryImages}
            />

            {/* Key Project Metrics */}
            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#164B34]/12 bg-white p-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#246C49]">
                  Location
                </p>
                <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-[#0C3323]">
                  <MapPin className="h-3.5 w-3.5 text-[#C6A66C]" />
                  {project.location}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#246C49]">
                  Developer (Ref)
                </p>
                <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-[#0C3323]">
                  <Building2 className="h-3.5 w-3.5 text-[#C6A66C]" />
                  {project.developer_name || "Confirmed on Consultation"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#246C49]">
                  Indicative Price
                </p>
                <p className="mt-1 text-sm font-semibold text-[#164B34]">
                  {project.price_range || "Price on Request"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#246C49]">
                  Project Status
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0C3323]">
                  {project.project_status || "Enquire for Latest Status"}
                </p>
              </div>
            </div>

            {/* RERA & Verification Transparency Box */}
            <div className="rounded-2xl border border-[#C6A66C]/40 bg-[#F6F7F2] p-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#164B34]" />
                <div>
                  <h2 className="font-editorial text-xl font-semibold text-[#0C3323]">
                    RERA Registration &amp; Verification Note
                  </h2>
                  <p className="mt-1 text-sm font-medium text-[#164B34]">
                    {project.rera_number ||
                      "Verify official UP-RERA registration details during consultation"}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#1C2921]/75">
                    {project.rera_status_note ||
                      "This listing is provided for reference and consulting orientation. Growth Realtech never invents prices, approvals, possession schedules, or guaranteed returns; official developer and UP-RERA disclosures are reviewed prior to any booking."}
                  </p>
                </div>
              </div>
            </div>

            {/* Overview */}
            <div className="rounded-2xl border border-[#164B34]/12 bg-white p-8">
              <h2 className="font-editorial text-3xl font-semibold text-[#0C3323]">
                Development Overview
              </h2>
              {project.configuration && (
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-[#246C49]">
                  Configuration: {project.configuration}
                </p>
              )}
              <div
                className="gr-prose mt-4"
                dangerouslySetInnerHTML={{
                  __html:
                    project.description || `<p>${project.short_description || ""}</p>`,
                }}
              />

              {/* Brochure & Official URL Buttons */}
              {(project.brochure_url || project.official_website_url) && (
                <div className="mt-6 flex flex-wrap gap-3 border-t border-[#164B34]/10 pt-5">
                  {project.brochure_url && (
                    <a
                      href={project.brochure_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0C3323] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#E0C796]"
                    >
                      <FileText className="h-4 w-4" />
                      Download Brochure PDF
                    </a>
                  )}
                  {project.official_website_url && (
                    <a
                      href={project.official_website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-[#164B34]/25 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#164B34]"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Official Reference URL
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Specifications */}
            {Object.keys(specifications).length > 0 && (
              <div className="rounded-2xl border border-[#164B34]/12 bg-white p-8">
                <h2 className="font-editorial text-3xl font-semibold text-[#0C3323]">
                  Project Specifications
                </h2>
                <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {Object.entries(specifications).map(([k, v]) => (
                    <div
                      key={k}
                      className="rounded-xl border border-[#164B34]/10 bg-[#F6F7F2] p-4"
                    >
                      <dt className="text-xs font-semibold uppercase tracking-wider text-[#246C49]">
                        {k}
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-[#0C3323]">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="rounded-2xl border border-[#164B34]/12 bg-white p-8">
                <h2 className="font-editorial text-3xl font-semibold text-[#0C3323]">
                  Featured Amenities
                </h2>
                <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {amenities.map((a, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2.5 text-sm text-[#1C2921]/85"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#C6A66C]" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Map Location */}
            {project.map_embed_url && (
              <div className="overflow-hidden rounded-2xl border border-[#164B34]/12 bg-white p-6">
                <h2 className="font-editorial text-3xl font-semibold text-[#0C3323]">
                  Corridor Location Map
                </h2>
                <iframe
                  title={`${project.name} Location Map`}
                  src={project.map_embed_url}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="mt-4 h-72 w-full rounded-xl border-0"
                />
              </div>
            )}
          </div>

          {/* Sticky Site Visit & Enquiry Form */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 rounded-2xl border border-[#C6A66C]/35 bg-[#0C3323] p-6 text-white shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C6A66C]">
                Project Advisory Desk
              </p>
              <h3 className="mt-1.5 font-editorial text-3xl font-semibold">
                Request Site Visit &amp; Dossier
              </h3>
              <p className="mt-2 text-xs text-white/75">
                Get current official availability, floor plans, UP-RERA verification support, and a scheduled walkthrough for {project.name}.
              </p>
              <div className="mt-6">
                <EnquiryForm
                  defaultEnquiryType="site_visit"
                  defaultInterest={project.name}
                  projectId={project.id}
                  defaultLocation={project.region_filter}
                  sourcePage={`/projects/${project.slug}`}
                  compact
                  dark
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
