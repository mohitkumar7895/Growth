import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight, Search } from "lucide-react";
import { getBlogs, getBlogCategories } from "@/services/siteData";
import { buildPageMetadata } from "@/lib/seo";
import PageHeroBanner from "@/components/common/PageHeroBanner";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("insights", { path: "/insights" });
}

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const [blogs, categories] = await Promise.all([
    getBlogs({ categorySlug: sp.category, tagSlug: sp.tag, q: sp.q }),
    getBlogCategories(),
  ]);

  return (
    <>
      <PageHeroBanner
        badge="Real Estate Insights & Research"
        title="Market Perspectives & Buying Guides"
        description="Practical articles on Noida property updates, Yamuna Expressway corridors, UP-RERA verification, commercial real estate, and prudent investment diligence."
        imageUrl="/images/category-investment.jpg"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Insights" }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Search & Category Filter */}
        <div className="flex flex-col justify-between gap-6 rounded-2xl border border-[#164B34]/12 bg-white p-6 shadow-sm lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/insights"
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                !sp.category
                  ? "bg-[#0C3323] text-[#E0C796]"
                  : "bg-[#F6F7F2] text-[#1C2921]/75 hover:bg-[#164B34]/10"
              }`}
            >
              All Insights
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/insights?category=${cat.slug}`}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  sp.category === cat.slug
                    ? "bg-[#0C3323] text-[#E0C796]"
                    : "bg-[#F6F7F2] text-[#1C2921]/75 hover:bg-[#164B34]/10"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <form action="/insights" className="flex shrink-0 items-center gap-2">
            <input
              type="search"
              name="q"
              defaultValue={sp.q || ""}
              placeholder="Search insights..."
              className="w-full rounded-lg border border-[#164B34]/20 bg-[#F6F7F2] px-3.5 py-2 text-sm focus:border-[#164B34] focus:bg-white focus:outline-none sm:w-56"
            />
            <button
              type="submit"
              aria-label="Search insights"
              className="rounded-lg bg-[var(--gr-primary)] p-2.5 text-white hover:bg-[var(--gr-deep)]"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Blog Grid */}
        {blogs.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-[#164B34]/12 bg-white p-14 text-center">
            <h2 className="font-editorial text-3xl font-semibold text-[#0C3323]">
              No Articles Matched Your Filter
            </h2>
            <p className="mt-2 text-sm text-[#1C2921]/70">
              Try exploring all categories or clearing your search query.
            </p>
            <Link
              href="/insights"
              className="mt-5 inline-block rounded-lg bg-[#0C3323] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#E0C796]"
            >
              View All Insights
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#164B34]/12 bg-white transition hover:-translate-y-1 hover:border-[#C6A66C] hover:shadow-xl"
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
                  <div className="flex items-center gap-2 text-xs text-[#1C2921]/55">
                    <Calendar className="h-3.5 w-3.5 text-[#C6A66C]" />
                    <span>
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Recent"}
                    </span>
                    <span>•</span>
                    <span>{post.reading_time || "5 min read"}</span>
                  </div>
                  <h2 className="mt-2.5 font-editorial text-2xl font-semibold leading-snug text-[#0C3323]">
                    <Link
                      href={`/insights/${post.slug}`}
                      className="hover:text-[#164B34]"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-relaxed text-[#1C2921]/75">
                      {post.excerpt}
                    </p>
                  )}
                  <Link
                    href={`/insights/${post.slug}`}
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#164B34] hover:text-[#C6A66C]"
                  >
                    Read Full Guide <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
