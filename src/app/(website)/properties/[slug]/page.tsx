import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, CheckCircle2, ArrowLeft, ShieldCheck } from "lucide-react";
import { getPropertyBySlug, getProperties } from "@/services/siteData";
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
  const property = await getPropertyBySlug(slug);
  if (!property) return { title: "Property Not Found" };
  return buildPageMetadata("properties", {
    title: property.meta_title || `${property.title} | Growth Realtech`,
    description: property.meta_description || property.short_description,
    ogImage: property.featured_image,
    canonical: property.canonical_url,
    path: `/properties/${property.slug}`,
  });
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const specs = safeJsonParse<Record<string, string>>(property.specifications_json, {});
  const amenities = safeJsonParse<string[]>(property.amenities_json, []);
  const gallery = safeJsonParse<string[]>(property.gallery_json, []);
  const related = (await getProperties({ limit: 4 })).filter(
    (p) => p.slug !== property.slug
  );

  return (
    <>
      <PageHeroBanner
        badge={`${property.property_type} • ${property.purpose || "Advisory"}`}
        title={property.title}
        description={property.short_description}
        imageUrl={property.featured_image || "/images/category-residential.jpg"}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Properties", href: "/properties" },
          { label: property.title },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Link
          href="/properties"
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#164B34] hover:text-[#C6A66C]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Properties
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left Content */}
          <div className="space-y-8 lg:col-span-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-[#164B34]/15 bg-[#0C3323] shadow-lg">
              <Image
                src={property.featured_image || "/images/category-residential.jpg"}
                alt={property.title}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
              <span className="absolute bottom-3 left-4 rounded-md bg-black/55 px-3 py-1 text-[11px] text-white/85 backdrop-blur-sm">
                Conceptual architectural representation • Verify actual site visuals during consultation
              </span>
            </div>

            {gallery.length > 1 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {gallery.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-[16/10] overflow-hidden rounded-xl border border-[#164B34]/10"
                  >
                    <Image
                      src={img}
                      alt={`${property.title} visual ${i + 1}`}
                      fill
                      loading="lazy"
                      sizes="33vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Quick Fact Bar */}
            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-[#164B34]/12 bg-white p-6 sm:grid-cols-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#246C49]">
                  Location
                </p>
                <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-[#0C3323]">
                  <MapPin className="h-3.5 w-3.5 text-[#C6A66C]" />
                  {property.location}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#246C49]">
                  Budget Band
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0C3323]">
                  {property.budget_range || "Open to Options"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#246C49]">
                  Indicative Pricing
                </p>
                <p className="mt-1 text-sm font-semibold text-[#164B34]">
                  {property.price_display || "Price on Request"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#246C49]">
                  Configuration
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0C3323]">
                  {property.configuration || "Enquire for Details"}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-[#164B34]/12 bg-white p-8">
              <h2 className="font-editorial text-3xl font-semibold text-[#0C3323]">
                Property Overview
              </h2>
              <div
                className="gr-prose mt-4"
                dangerouslySetInnerHTML={{
                  __html: property.description || `<p>${property.short_description || ""}</p>`,
                }}
              />
            </div>

            {/* Specifications */}
            {Object.keys(specs).length > 0 && (
              <div className="rounded-2xl border border-[#164B34]/12 bg-white p-8">
                <h2 className="font-editorial text-3xl font-semibold text-[#0C3323]">
                  Key Particulars
                </h2>
                <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {Object.entries(specs).map(([k, v]) => (
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
                  Highlights &amp; Amenities
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
          </div>

          {/* Right Sticky Consultation Panel */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 rounded-2xl border border-[#C6A66C]/35 bg-[#0C3323] p-6 text-white shadow-xl">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E0C796]">
                <ShieldCheck className="h-4 w-4 text-[#C6A66C]" />
                <span>Verified Consultation Desk</span>
              </div>
              <h3 className="font-editorial text-2xl font-semibold">
                Enquire for This Property
              </h3>
              <p className="mt-1.5 text-xs text-white/75">
                Receive verified pricing, layout sheets, and guided site visit slots from our Noida team.
              </p>
              <div className="mt-6">
                <EnquiryForm
                  defaultEnquiryType="property"
                  defaultInterest={property.title}
                  propertyId={property.id}
                  defaultLocation={property.location}
                  sourcePage={`/properties/${property.slug}`}
                  compact
                  dark
                />
              </div>
            </div>
          </aside>
        </div>

        {/* Related Opportunities */}
        {related.length > 0 && (
          <div className="mt-20 border-t border-[#164B34]/12 pt-14">
            <h2 className="font-editorial text-3xl font-semibold text-[#0C3323]">
              More Curated Opportunities
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {related.slice(0, 3).map((rel) => (
                <Link
                  key={rel.id}
                  href={`/properties/${rel.slug}`}
                  className="group overflow-hidden rounded-xl border border-[#164B34]/12 bg-white transition hover:border-[#C6A66C] hover:shadow-lg"
                >
                  <div className="relative h-44 w-full overflow-hidden">
                    <Image
                      src={rel.featured_image || "/images/category-residential.jpg"}
                      alt={rel.title}
                      fill
                      loading="lazy"
                      sizes="33vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-[#246C49]">{rel.location}</p>
                    <h3 className="mt-1 font-editorial text-xl font-semibold text-[#0C3323]">
                      {rel.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
