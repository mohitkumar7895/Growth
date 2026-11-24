import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { getServiceBySlug, getServices } from "@/services/siteData";
import { buildPageMetadata } from "@/lib/seo";
import { safeJsonParse } from "@/lib/security";
import PageHeroBanner from "@/components/common/PageHeroBanner";
import EnquiryForm from "@/components/common/EnquiryForm";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service Not Found" };
  return buildPageMetadata("services", {
    title: service.meta_title || `${service.title} | Growth Realtech`,
    description: service.meta_description || service.short_description,
    ogImage: service.featured_image,
    canonical: service.canonical_url,
    path: `/services/${service.slug}`,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, allServices] = await Promise.all([
    getServiceBySlug(slug),
    getServices(true),
  ]);
  if (!service) notFound();

  const highlights = safeJsonParse<string[]>(service.highlights_json, []);
  const processSteps = safeJsonParse<string[]>(service.process_json, []);

  return (
    <>
      <PageHeroBanner
        badge="Growth Realtech Consulting"
        title={service.title}
        description={service.short_description}
        imageUrl={service.featured_image || "/images/category-commercial.jpg"}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.title },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Link
          href="/services"
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#164B34] hover:text-[#C6A66C]"
        >
          <ArrowLeft className="h-4 w-4" /> All Consulting Services
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            <div className="rounded-2xl border border-[#164B34]/12 bg-white p-8">
              <h2 className="font-editorial text-3xl font-semibold text-[#0C3323]">
                How We Advise You
              </h2>
              <div
                className="gr-prose mt-4"
                dangerouslySetInnerHTML={{
                  __html: service.description || `<p>${service.short_description || ""}</p>`,
                }}
              />
            </div>

            {highlights.length > 0 && (
              <div className="rounded-2xl border border-[#164B34]/12 bg-white p-8">
                <h2 className="font-editorial text-3xl font-semibold text-[#0C3323]">
                  Key Advisory Scope
                </h2>
                <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {highlights.map((h, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-xl bg-[#F6F7F2] p-4 text-sm text-[#1C2921]"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C6A66C]" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {processSteps.length > 0 && (
              <div className="rounded-2xl border border-[#164B34]/12 bg-white p-8">
                <h2 className="font-editorial text-3xl font-semibold text-[#0C3323]">
                  Engagement Workflow
                </h2>
                <ol className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {processSteps.map((step, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-4 rounded-xl border border-[#164B34]/10 p-4"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0C3323] font-editorial text-lg font-bold text-[#E0C796]">
                        0{i + 1}
                      </span>
                      <span className="text-sm font-medium text-[#0C3323]">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Other Services */}
            <div className="rounded-2xl border border-[#164B34]/12 bg-white p-8">
              <h2 className="font-editorial text-2xl font-semibold text-[#0C3323]">
                Explore Related Verticals
              </h2>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {allServices
                  .filter((s) => s.slug !== service.slug)
                  .map((s) => (
                    <Link
                      key={s.id}
                      href={`/services/${s.slug}`}
                      className="rounded-full border border-[#164B34]/20 bg-[#F6F7F2] px-4 py-2 text-xs font-semibold text-[#164B34] transition hover:border-[#C6A66C] hover:bg-[#0C3323] hover:text-[#E0C796]"
                    >
                      {s.title}
                    </Link>
                  ))}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 rounded-2xl border border-[#C6A66C]/35 bg-[#0C3323] p-6 text-white shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C6A66C]">
                Speak With an Advisor
              </p>
              <h3 className="mt-1.5 font-editorial text-3xl font-semibold">
                Consult on {service.title}
              </h3>
              <p className="mt-2 text-xs text-white/75">
                Share your requirements and our Noida specialist will prepare a structured brief.
              </p>
              <div className="mt-6">
                <EnquiryForm
                  defaultEnquiryType="consultation"
                  defaultInterest={service.title}
                  sourcePage={`/services/${service.slug}`}
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
