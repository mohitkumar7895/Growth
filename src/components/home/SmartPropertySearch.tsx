"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, MapPin, ArrowRight, Loader2, X } from "lucide-react";
import {
  BUDGET_RANGES,
  LOCATIONS,
  PROPERTY_TYPES,
  PURPOSES,
  type PropertyItem,
} from "@/types";

const STATUS_OPTIONS = [
  "All",
  "Available for Consultation",
  "Ready to Move",
  "Ready / Developing Options",
  "Operational / Pre-leased",
];

export default function SmartPropertySearch({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string | null;
}) {
  const router = useRouter();
  const [filters, setFilters] = useState({
    property_type: "All",
    location: "All",
    budget_range: "All",
    purpose: "All",
    property_status: "All",
  });
  const [results, setResults] = useState<PropertyItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v && v !== "All") params.set(k, v);
    });
    return params.toString();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const qs = buildQueryString();
      const res = await fetch(`/api/public/properties?${qs}`);
      const data = await res.json();
      setResults(data.properties || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const goToDirectory = () => {
    const qs = buildQueryString();
    router.push(`/properties${qs ? `?${qs}` : ""}`);
  };

  return (
    <section
      id="smart-search"
      className="relative z-20 -mt-8 pb-10 sm:-mt-10 sm:pb-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#C6A66C]/35 bg-white p-6 shadow-2xl shadow-[#0C3323]/10 sm:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#164B34]/10 pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C6A66C]">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Smart Property Discovery
              </span>
              <h2 className="mt-1 font-editorial text-2xl font-semibold text-[#0C3323] sm:text-3xl">
                {title || "Find Your Ideal Real Estate Opportunity"}
              </h2>
              {subtitle && (
                <p className="mt-1 text-xs text-[#1C2921]/65 sm:text-sm">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={goToDirectory}
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#164B34] transition hover:text-[#C6A66C]"
            >
              Open Full Directory
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          >
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#164B34]">
                Property Type
              </label>
              <select
                value={filters.property_type}
                onChange={(e) =>
                  setFilters({ ...filters, property_type: e.target.value })
                }
                className="w-full rounded-lg border border-[#164B34]/20 bg-[#F6F7F2] px-3.5 py-3 text-sm text-[#1C2921] focus:border-[#164B34] focus:bg-white focus:outline-none"
              >
                <option value="All">All Property Types</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#164B34]">
                Preferred Location
              </label>
              <select
                value={filters.location}
                onChange={(e) =>
                  setFilters({ ...filters, location: e.target.value })
                }
                className="w-full rounded-lg border border-[#164B34]/20 bg-[#F6F7F2] px-3.5 py-3 text-sm text-[#1C2921] focus:border-[#164B34] focus:bg-white focus:outline-none"
              >
                <option value="All">All NCR Locations</option>
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#164B34]">
                Budget Band
              </label>
              <select
                value={filters.budget_range}
                onChange={(e) =>
                  setFilters({ ...filters, budget_range: e.target.value })
                }
                className="w-full rounded-lg border border-[#164B34]/20 bg-[#F6F7F2] px-3.5 py-3 text-sm text-[#1C2921] focus:border-[#164B34] focus:bg-white focus:outline-none"
              >
                <option value="All">Any Budget</option>
                {BUDGET_RANGES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#164B34]">
                Purpose
              </label>
              <select
                value={filters.purpose}
                onChange={(e) =>
                  setFilters({ ...filters, purpose: e.target.value })
                }
                className="w-full rounded-lg border border-[#164B34]/20 bg-[#F6F7F2] px-3.5 py-3 text-sm text-[#1C2921] focus:border-[#164B34] focus:bg-white focus:outline-none"
              >
                <option value="All">Any Purpose</option>
                {PURPOSES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#164B34]">
                Property Status
              </label>
              <select
                value={filters.property_status}
                onChange={(e) =>
                  setFilters({ ...filters, property_status: e.target.value })
                }
                className="w-full rounded-lg border border-[#164B34]/20 bg-[#F6F7F2] px-3.5 py-3 text-sm text-[#1C2921] focus:border-[#164B34] focus:bg-white focus:outline-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "Any Status" : s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--gr-primary)] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition hover:bg-[var(--gr-deep)] disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 text-[#E0C796]" />
                )}
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Instant Live Database Search Results */}
          {results !== null && (
            <div className="mt-8 border-t border-[#164B34]/10 pt-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-[#0C3323]">
                  Found{" "}
                  <span className="font-bold text-[#164B34]">{results.length}</span>{" "}
                  matching {results.length === 1 ? "opportunity" : "opportunities"} from our live database
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={goToDirectory}
                    className="text-xs font-semibold text-[#164B34] underline underline-offset-4 hover:text-[#C6A66C]"
                  >
                    View on Properties Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setResults(null)}
                    className="inline-flex items-center gap-1 rounded-md border border-[#164B34]/20 px-2.5 py-1 text-xs text-[#1C2921]/70 hover:bg-[#F6F7F2]"
                  >
                    <X className="h-3.5 w-3.5" /> Close
                  </button>
                </div>
              </div>

              {results.length === 0 ? (
                <div className="rounded-xl bg-[#F6F7F2] p-6 text-center">
                  <p className="text-sm text-[#1C2921]/75">
                    No exact match for this filter combination right now. Our Noida advisory desk also sources off-market opportunities tailored to your criteria.
                  </p>
                  <Link
                    href="/contact#enquiry"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--gr-gold)] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--gr-deep)]"
                  >
                    Request Custom Shortlist
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  {results.slice(0, 6).map((item) => (
                    <Link
                      key={item.id}
                      href={`/properties/${item.slug}`}
                      className="group overflow-hidden rounded-xl border border-[#164B34]/12 bg-[#F6F7F2] transition hover:-translate-y-1 hover:border-[#C6A66C] hover:shadow-lg"
                    >
                      <div className="relative h-44 w-full overflow-hidden">
                        <Image
                          src={item.featured_image || "/images/category-residential.jpg"}
                          alt={item.title}
                          fill
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-[#0C3323]/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#E0C796]">
                          {item.property_type}
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="flex items-center gap-1 text-xs text-[#246C49]">
                          <MapPin className="h-3.5 w-3.5" />
                          {item.sector ? `${item.sector}, ${item.location}` : item.location}
                        </p>
                        <h3 className="mt-1 line-clamp-1 font-editorial text-xl font-semibold text-[#0C3323] group-hover:text-[#164B34]">
                          {item.title}
                        </h3>
                        <div className="mt-3 flex items-center justify-between border-t border-[#164B34]/10 pt-2.5 text-xs">
                          <span className="font-semibold text-[#164B34]">
                            {item.price_display || "Price on Request"}
                          </span>
                          <span className="text-[#1C2921]/60">{item.purpose}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
