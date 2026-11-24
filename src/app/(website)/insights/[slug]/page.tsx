import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Tag, User } from "lucide-react";
import { getBlogBySlug, getBlogs } from "@/services/siteData";
import { buildPageMetadata } from "@/lib/seo";
import PageHeroBanner from "@/components/common/PageHeroBanner";
import EnquiryForm from "@/components/common/EnquiryForm";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return { title: "Article Not Found" };
  return buildPageMetadata("insights", {
    title: blog.meta_title || blog.title,
    description: blog.meta_description || blog.excerpt,
    ogImage: blog.og_image || blog.featured_image,
    canonical: blog.canonical_url,
    path: `/insights/${blog.slug}`,
  });
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, recent] = await Promise.all([
    getBlogBySlug(slug),
    getBlogs({ limit: 4 }),
  ]);
  if (!post) notFound();

  const related = recent.filter((r) => r.slug !== post.slug).slice(0, 3);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.meta_description,
    author: { "@type": "Organization", name: post.author_name || "Growth Realtech" },
    datePublished: post.published_at || undefined,
    image: post.featured_image || undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <PageHeroBanner
        badge={post.category_name || "Market Insights"}
        title={post.title}
        description={post.excerpt}
        imageUrl={post.featured_image || "/images/category-investment.jpg"}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Insights", href: "/insights" },
          { label: post.title },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Link
          href="/insights"
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#164B34] hover:text-[#C6A66C]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to All Insights
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <article className="lg:col-span-8">
            <div className="overflow-hidden rounded-2xl border border-[#164B34]/12 bg-white shadow-sm">
              {post.featured_image && (
                <div className="relative aspect-[16/9] w-full bg-[#0C3323]">
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="p-6 sm:p-10">
                <div className="flex flex-wrap items-center gap-4 border-b border-[#164B34]/10 pb-5 text-xs text-[#1C2921]/65">
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-[#C6A66C]" />
                    {post.author_name}
                  </span>
                  {post.published_at && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#C6A66C]" />
                      {new Date(post.published_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#C6A66C]" />
                    {post.reading_time || "5 min read"}
                  </span>
                </div>

                <div
                  className="gr-prose mt-7"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {post.tags && post.tags.length > 0 && (
                  <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-[#164B34]/10 pt-6">
                    <Tag className="h-4 w-4 text-[#C6A66C]" />
                    {post.tags.map((t) => (
                      <Link
                        key={t.id}
                        href={`/insights?tag=${t.slug}`}
                        className="rounded-full bg-[#F6F7F2] px-3.5 py-1 text-xs font-medium text-[#164B34] hover:bg-[#164B34] hover:text-white"
                      >
                        #{t.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </article>

          <aside className="space-y-6 lg:col-span-4">
            <div className="sticky top-28 rounded-2xl border border-[#C6A66C]/35 bg-[#0C3323] p-6 text-white shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C6A66C]">
                Need Personalised Guidance?
              </p>
              <h2 className="mt-1 font-editorial text-2xl font-semibold">
                Speak With Our Noida Advisors
              </h2>
              <p className="mt-2 text-xs text-white/75">
                Have questions on UP-RERA verification, expressway corridors, or shortlisting? Request a call back.
              </p>
              <div className="mt-5">
                <EnquiryForm
                  defaultEnquiryType="consultation"
                  defaultInterest={post.title}
                  sourcePage={`/insights/${post.slug}`}
                  compact
                  dark
                />
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mt-16 border-t border-[#164B34]/12 pt-12">
            <h2 className="font-editorial text-3xl font-semibold text-[#0C3323]">
              Related Insights
            </h2>
            <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/insights/${r.slug}`}
                  className="group overflow-hidden rounded-xl border border-[#164B34]/12 bg-white transition hover:border-[#C6A66C] hover:shadow-lg"
                >
                  <div className="relative h-44 w-full">
                    <Image
                      src={r.featured_image || "/images/category-investment.jpg"}
                      alt={r.title}
                      fill
                      loading="lazy"
                      sizes="33vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#246C49]">
                      {r.category_name}
                    </p>
                    <h3 className="mt-1 font-editorial text-xl font-semibold text-[#0C3323]">
                      {r.title}
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
