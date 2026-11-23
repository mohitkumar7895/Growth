"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Search, ArrowUpRight, RotateCcw, Loader2 } from "lucide-react";
import {
  BUDGET_RANGES,
  LOCATIONS,
  PROPERTY_TYPES,
  PURPOSES,
  type PropertyCategory,
  type PropertyItem,
} from "@/types";

export default function PropertiesDirectoryClient({
  initialProperties,
  categories,
  initialFilters,
}: {
  initialProperties: PropertyItem[];
  categories: PropertyCategory[];
  initialFilters: {
    property_type: string;
    location: string;
    budget_range: string;
    purpose: string;
    category: string;
    q: string;
  };
}) {
  const [filters, setFilters] = useState(initialFilters);
  const [properties, setProperties] = useState<PropertyItem[]>(initialProperties);
  const [loading, setLoading] = useState(false);

  const runFilter = async (next = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(next).forEach(([k, v]) => {
        if (v && v !== "All") params.set(k, v);
      });
      const res = await fetch(`/api/public/properties?${params.toString()}`);
      const data = await res.json();
      setProperties(data.properties || []);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    const clean = {
      property_type: "All",
      location: "All",
      budget_range: "All",
      purpose: "All",
      category: "",
      q: "",
    };
    setFilters(clean);
    runFilter(clean);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      {/* Filter Bar */}
      <div className="rounded-2xl border border-[#164B34]/15 bg-white p-6 shadow-lg">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#164B34]">
              Keyword Search
            </label>
            <input
              type="search"
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              placeholder="Search sector, location, or title..."
              className="w-full rounded-lg border border-[#164B34]/20 bg-[#F6F7F2] px-3.5 py-2.5 text-sm focus:border-[#164B34] focus:bg-white focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#164B34]">
              Property Type
            </label>
            <select
              value={filters.property_type}
              onChange={(e) =>
                setFilters({ ...filters, property_type: e.target.value, category: "" })
              }
              className="w-full rounded-lg border border-[#164B34]/20 bg-[#F6F7F2] px-3 py-2.5 text-sm focus:border-[#164B34] focus:bg-white focus:outline-none"
            >
              <option value="All">All Types</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#164B34]">
              Location
            </label>
            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="w-full rounded-lg border border-[#164B34]/20 bg-[#F6F7F2] px-3 py-2.5 text-sm focus:border-[#164B34] focus:bg-white focus:outline-none"
            >
              <option value="All">All Locations</option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#164B34]">
              Budget
            </label>
            <select
              value={filters.budget_range}
              onChange={(e) =>
                setFilters({ ...filters, budget_range: e.target.value })
              }
              className="w-full rounded-lg border border-[#164B34]/20 bg-[#F6F7F2] px-3 py-2.5 text-sm focus:border-[#164B34] focus:bg-white focus:outline-none"
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
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#164B34]">
              Purpose
            </label>
            <select
              value={filters.purpose}
              onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}
              className="w-full rounded-lg border border-[#164B34]/20 bg-[#F6F7F2] px-3 py-2.5 text-sm focus:border-[#164B34] focus:bg-white focus:outline-none"
            >
              <option value="All">Any Purpose</option>
              {PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills + Actions */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#164B34]/10 pt-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                const next = { ...filters, category: "" };
                setFilters(next);
                runFilter(next);
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                !filters.category
                  ? "bg-[#0C3323] text-[#E0C796]"
                  : "bg-[#F6F7F2] text-[#1C2921]/75 hover:bg-[#164B34]/10"
              }`}
            >
              All Verticals
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  const next = { ...filters, category: c.slug, property_type: "All" };
                  setFilters(next);
                  runFilter(next);
                }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  filters.category === c.slug
                    ? "bg-[#0C3323] text-[#E0C796]"
                    : "bg-[#F6F7F2] text-[#1C2921]/75 hover:bg-[#164B34]/10"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#164B34]/20 px-4 py-2 text-xs font-semibold text-[#1C2921]/75 hover:bg-[#F6F7F2]"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
            <button
              type="button"
              onClick={() => runFilter()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--gr-primary)] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[var(--gr-deep)]"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Search className="h-3.5 w-3.5 text-[#E0C796]" />
              )}
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-[#1C2921]/75">
          Showing <strong className="text-[#0C3323]">{properties.length}</strong>{" "}
          curated {properties.length === 1 ? "property" : "properties"}
        </p>
      </div>

      {/* Results Grid */}
      {properties.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[#164B34]/12 bg-white p-14 text-center">
          <h2 className="font-editorial text-3xl font-semibold text-[#0C3323]">
            No Exact Match Found
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-[#1C2921]/70">
            Try widening your filters or speak directly with our Noida advisors to access off-market residential, commercial, and land inventory.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg border border-[#164B34] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#164B34]"
            >
              Clear All Filters
            </button>
            <Link
              href="/contact#enquiry"
              className="rounded-lg bg-[var(--gr-gold)] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--gr-deep)]"
            >
              Request Custom Shortlist
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#164B34]/12 bg-white transition duration-300 hover:-translate-y-1 hover:border-[#C6A66C] hover:shadow-xl"
            >
              <Link
                href={`/properties/${item.slug}`}
                className="relative block aspect-[16/10] w-full overflow-hidden bg-[#0C3323]"
              >
                <Image
                  src={item.featured_image || "/images/category-residential.jpg"}
                  alt={item.title}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute left-3.5 top-3.5 flex gap-2">
                  <span className="rounded-full bg-[#0C3323]/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#E0C796]">
                    {item.property_type}
                  </span>
                  {item.purpose && (
                    <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold text-[#0C3323]">
                      {item.purpose}
                    </span>
                  )}
                </div>
              </Link>
              <div className="flex flex-1 flex-col p-6">
                <p className="flex items-center gap-1.5 text-xs font-medium text-[#246C49]">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {item.sector ? `${item.sector}, ${item.location}` : item.location}
                  </span>
                </p>
                <h2 className="mt-2 font-editorial text-2xl font-semibold text-[#0C3323]">
                  <Link href={`/properties/${item.slug}`} className="hover:text-[#164B34]">
                    {item.title}
                  </Link>
                </h2>
                {item.short_description && (
                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-[#1C2921]/75">
                    {item.short_description}
                  </p>
                )}
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#164B34]/10 pt-4 text-xs">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-[#1C2921]/50">
                      Budget Band
                    </span>
                    <span className="font-semibold text-[#0C3323]">
                      {item.budget_range || "Open to Options"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-[#1C2921]/50">
                      Status
                    </span>
                    <span className="font-semibold text-[#164B34]">
                      {item.property_status || "Consultation"}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/properties/${item.slug}`}
                  className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--gr-primary)] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[var(--gr-deep)]"
                >
                  <span>Explore Opportunity</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
