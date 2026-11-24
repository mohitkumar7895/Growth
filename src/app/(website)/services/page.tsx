import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getServices } from "@/services/siteData";
import { buildPageMetadata } from "@/lib/seo";
import PageHeroBanner from "@/components/common/PageHeroBanner";
import { DynamicIcon } from "@/components/common/IconRenderer";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("services", { path: "/services" });
}

export default async function ServicesPage() {
  const services = await getServices(true);

  return (
    <>
      <PageHeroBanner
        badge="Advisory Practice"
        title="Specialized Real Estate Consulting Services"
        description="End-to-end residential, commercial, industrial, land, leasing, resale, and investment advisory tailored to clients across Noida, Greater Noida, and the Yamuna Expressway."
        imageUrl="/images/projects/onyx-by-splendor.jpg"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {services.map((service) => (
            <article
              key={service.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#164B34]/12 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#C6A66C] hover:shadow-xl"
            >
              <div className="relative h-56 w-full overflow-hidden bg-[#0C3323]">
                <Image
                  src={service.featured_image || "/images/category-commercial.jpg"}
                  alt={service.title}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C3323]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#C6A66C]/50 bg-[#0C3323]/85 text-[#E0C796]">
                    <DynamicIcon name={service.icon_name} className="h-5 w-5" />
                  </div>
                  <h2 className="font-editorial text-2xl font-semibold text-white sm:text-3xl">
                    {service.title}
                  </h2>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <p className="flex-1 text-sm leading-relaxed text-[#1C2921]/80 sm:text-base">
                  {service.short_description}
                </p>
                <Link
                  href={`/services/${service.slug}`}
                  className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#164B34] transition group-hover:text-[#C6A66C]"
                >
                  <span>View Service Details</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
