"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Save,
  Trash2,
  Phone,
  MessageCircle,
  CheckCircle2,
  ShieldCheck,
  FileSpreadsheet,
  Database,
  MapPin,
  Clock,
  Copy,
  RotateCcw,
  ExternalLink,
} from "lucide-react";

interface CustomerRow {
  id: number;
  full_name: string;
  email: string | null;
  email_verified?: number;
  full_phone: string;
  mobile_verified: number;
  verification_method?: "email" | "phone";
  requirement: string;
  property_type: string;
  preferred_location: string;
  budget_range: string;
  address_city: string | null;
  additional_details: string | null;
  registration_date?: string | null;
  registration_time?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  location_accuracy?: number | null;
  coordinates_label?: string | null;
  geo_address?: string | null;
  ip_address?: string | null;
  status: string;
  internal_notes: string | null;
  assigned_to: number | null;
  created_at: string;
}

const STATUSES = ["Verified", "New", "Contacted", "Site Visit Scheduled", "Converted", "Closed"];
const LOCATION_FILTERS = [
  "All",
  "Noida",
  "Greater Noida",
  "Greater Noida West",
  "Yamuna Expressway",
  "Other Delhi NCR",
  "Other",
];
const PROPERTY_TYPE_FILTERS = [
  "All",
  "Residential",
  "Commercial",
  "Industrial / Warehouse",
  "Plots / Land",
  "Pre-rented property",
  "Not sure yet",
];

function formatRegistrationDate(row: CustomerRow): string {
  if (row.registration_date) return String(row.registration_date).slice(0, 10);
  return new Date(row.created_at).toLocaleDateString("en-IN");
}

function formatRegistrationTime(row: CustomerRow): string {
  if (row.registration_time) return `${String(row.registration_time)} IST`;
  return new Date(row.created_at).toLocaleTimeString("en-IN");
}

function getMapsUrl(row: CustomerRow): string | null {
  if (row.latitude === null || row.latitude === undefined || row.longitude === null || row.longitude === undefined) {
    return null;
  }
  const lat = Number(row.latitude);
  const lng = Number(row.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [staff, setStaff] = useState<{ id: number; name: string }[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<CustomerRow | null>(null);
  const [refreshingGeo, setRefreshingGeo] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const buildFilterParams = () => {
    const params = new URLSearchParams();
    if (statusFilter !== "All") params.set("status", statusFilter);
    if (locationFilter !== "All") params.set("location", locationFilter);
    if (propertyTypeFilter !== "All") params.set("propertyType", propertyTypeFilter);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    if (q.trim()) params.set("q", q.trim());
    return params;
  };

  const load = async () => {
    const params = buildFilterParams();
    const res = await fetch(`/api/admin/customers?${params.toString()}`);
    const data = await res.json();
    setCustomers(data.customers || []);
    setStaff(data.staff || []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, locationFilter, propertyTypeFilter, fromDate, toDate]);

  const resetFilters = () => {
    setStatusFilter("All");
    setLocationFilter("All");
    setPropertyTypeFilter("All");
    setFromDate("");
    setToDate("");
    setQ("");
  };

  const buildExportUrl = (dataset: "customers" | "all") => {
    const params = buildFilterParams();
    params.set("dataset", dataset);
    return `/api/admin/export?${params.toString()}`;
  };

  const copyOpenRegistrationLink = async () => {
    const url = `${window.location.origin}/register`;
    try {
      await navigator.clipboard.writeText(url);
      setToast(`Copied open registration link: ${url}`);
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast(`Share link: ${url}`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleRefreshGeoAddress = async () => {
    if (!selected || selected.latitude == null || selected.longitude == null) return;
    setRefreshingGeo(true);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          refreshGeoAddress: true,
          latitude: Number(selected.latitude),
          longitude: Number(selected.longitude),
        }),
      });
      const data = await res.json();
      if (res.ok && data.geo_address) {
        setSelected({ ...selected, geo_address: data.geo_address });
        setToast("Detailed Road, Mohalla & Area address updated!");
        setTimeout(() => setToast(null), 2500);
        load();
      }
    } finally {
      setRefreshingGeo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const res = await fetch("/api/admin/customers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selected),
    });
    if (res.ok) {
      setToast("Customer profile updated!");
      setTimeout(() => setToast(null), 2500);
      load();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this customer registration permanently?")) return;
    await fetch(`/api/admin/customers?id=${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    load();
  };

  return (
    <div className="space-y-5">
      {/* Filters, Open Link & Excel Export Bar */}
      <search className="block rounded-xl border border-[#164B34]/12 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {["All", ...STATUSES].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  statusFilter === st
                    ? "bg-[#0C3323] text-[#E0C796]"
                    : "bg-[#F6F7F2] text-gray-700 hover:bg-gray-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copyOpenRegistrationLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#164B34]/25 bg-white px-3 py-2 text-xs font-semibold text-[#164B34] transition hover:bg-[#F6F7F2]"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy Open /register Link
            </button>
            <a
              href={buildExportUrl("customers")}
              download
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#164B34] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0C3323]"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-[#E0C796]" />
              Export Filtered Excel (.xlsx)
            </a>
            <a
              href={buildExportUrl("all")}
              download
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#C6A66C] bg-[#F6F7F2] px-3 py-2 text-xs font-semibold text-[#0C3323] transition hover:bg-[#E0C796]/30"
            >
              <Database className="h-3.5 w-3.5 text-[#164B34]" />
              Full Database (.xlsx)
            </a>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2.5 border-t border-gray-100 pt-3 sm:grid-cols-2 lg:grid-cols-6">
          <select
            aria-label="Filter by location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700"
          >
            {LOCATION_FILTERS.map((loc) => (
              <option key={loc} value={loc}>
                {loc === "All" ? "All Locations" : loc}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by property type"
            value={propertyTypeFilter}
            onChange={(e) => setPropertyTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700"
          >
            {PROPERTY_TYPE_FILTERS.map((pt) => (
              <option key={pt} value={pt}>
                {pt === "All" ? "All Property Types" : pt}
              </option>
            ))}
          </select>

          <input
            type="date"
            aria-label="From registration date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            title="From Date"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700"
          />

          <input
            type="date"
            aria-label="To registration date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            title="To Date"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700"
          />

          <div className="flex items-center gap-1.5 lg:col-span-2">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              placeholder="Search name, email, phone..."
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
            />
            <button
              type="button"
              onClick={load}
              aria-label="Search customers"
              className="rounded-lg bg-[#164B34] p-2 text-white hover:bg-[#0C3323]"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={resetFilters}
              title="Reset filters"
              aria-label="Reset filters"
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </search>

      {toast && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="overflow-hidden rounded-xl border border-[#164B34]/12 bg-white shadow-sm lg:col-span-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F7F2] text-[11px] uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Requirement &amp; Location</th>
                  <th className="px-4 py-3">Date / Time &amp; GPS</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                      No customer registrations match your filters. Share <strong>/register</strong> with prospective clients.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => {
                    const mapsUrl = getMapsUrl(c);
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelected(c)}
                        className={`cursor-pointer ${
                          selected?.id === c.id ? "bg-[#F6F7F2]" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#0C3323]">{c.full_name}</p>
                          <p className="tabular-nums text-gray-600">{c.full_phone}</p>
                          {c.email && <p className="text-[11px] text-gray-500">{c.email}</p>}
                          <span className="mt-1 inline-flex items-center gap-0.5 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            <ShieldCheck className="h-3 w-3" />
                            {c.verification_method === "phone" ? "Mobile OTP" : "Email OTP"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">
                            {c.requirement} ({c.property_type})
                          </p>
                          <p className="text-gray-500">
                            {c.preferred_location} · {c.budget_range}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="flex items-center gap-1 tabular-nums text-gray-700">
                            <Clock className="h-3 w-3 text-[#246C49]" />
                            {formatRegistrationDate(c)}
                          </p>
                          <p className="tabular-nums text-[11px] text-gray-500">
                            {formatRegistrationTime(c)}
                          </p>
                          {c.coordinates_label ? (
                            <div className="mt-0.5 space-y-0.5">
                              <p className="flex items-center gap-1 tabular-nums text-[10px] font-medium text-[#164B34]">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {mapsUrl ? (
                                  <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="underline hover:text-[#0C3323]"
                                  >
                                    {c.coordinates_label}
                                  </a>
                                ) : (
                                  c.coordinates_label
                                )}
                              </p>
                              {c.geo_address && (
                                <p className="line-clamp-2 max-w-[230px] text-[10px] leading-snug text-gray-600">
                                  {c.geo_address}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="mt-0.5 text-[10px] text-gray-400">GPS not shared</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-[#164B34]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#164B34]">
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(c.id);
                            }}
                            className="rounded p-1 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t px-4 py-3 text-xs text-gray-500">
            Showing {customers.length} customer registration record{customers.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="rounded-xl border border-[#164B34]/12 bg-white p-6 shadow-sm lg:col-span-4">
          {selected ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="border-b pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
                    {selected.full_name}
                  </h3>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    ✓ {selected.verification_method === "phone" ? "Mobile OTP" : "Email OTP"} Verified
                  </span>
                </div>
                <p className="tabular-nums text-xs text-gray-500">
                  {selected.full_phone} {selected.email ? `• ${selected.email}` : ""}
                </p>
                <div className="mt-3 flex gap-2">
                  <a
                    href={`tel:${selected.full_phone}`}
                    className="inline-flex items-center gap-1 rounded bg-[#0C3323] px-3 py-1.5 text-[11px] font-semibold text-[#E0C796]"
                  >
                    <Phone className="h-3 w-3" /> Call
                  </a>
                  <a
                    href={`https://wa.me/${selected.full_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Hello ${selected.full_name}, thank you for registering with Growth Realtech regarding ${selected.requirement} (${selected.property_type}) in ${selected.preferred_location}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded bg-[#25D366] px-3 py-1.5 text-[11px] font-semibold text-white"
                  >
                    <MessageCircle className="h-3 w-3" /> WhatsApp Client
                  </a>
                </div>
              </div>

              <div className="space-y-1.5 rounded-lg bg-[#F6F7F2] p-3 text-xs">
                <p><strong>Interested In:</strong> {selected.requirement}</p>
                <p><strong>Property Type:</strong> {selected.property_type}</p>
                <p><strong>Location:</strong> {selected.preferred_location}</p>
                <p><strong>Budget:</strong> {selected.budget_range}</p>
                <p><strong>Address / City:</strong> {selected.address_city || "—"}</p>
                <p><strong>Details:</strong> {selected.additional_details || "—"}</p>
                <div className="mt-2 border-t border-[#164B34]/10 pt-2 text-[11px]">
                  <p>
                    <strong>Registration Date:</strong>{" "}
                    <span className="tabular-nums">{formatRegistrationDate(selected)}</span>
                  </p>
                  <p>
                    <strong>Registration Time:</strong>{" "}
                    <span className="tabular-nums">{formatRegistrationTime(selected)}</span>
                  </p>
                  <p>
                    <strong>GPS Co-ordinates:</strong>{" "}
                    {selected.coordinates_label ? (
                      <span className="tabular-nums">
                        {selected.coordinates_label}
                        {selected.location_accuracy ? ` (±${selected.location_accuracy}m)` : ""}
                      </span>
                    ) : (
                      "Not captured"
                    )}
                  </p>
                  <div className="pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <strong>Current Location (Road / Area / Mohalla):</strong>
                      {selected.latitude != null && selected.longitude != null && (
                        <button
                          type="button"
                          onClick={handleRefreshGeoAddress}
                          disabled={refreshingGeo}
                          className="text-[10px] font-semibold text-[#164B34] underline hover:text-[#0C3323] disabled:opacity-50"
                        >
                          {refreshingGeo ? "Fetching..." : "Refresh Address"}
                        </button>
                      )}
                    </div>
                    <p className="mt-0.5 leading-relaxed text-[#0C3323]">
                      {selected.geo_address || "—"}
                    </p>
                  </div>
                  {getMapsUrl(selected) && (
                    <a
                      href={getMapsUrl(selected)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 font-semibold text-[#164B34] underline"
                    >
                      <MapPin className="h-3 w-3" /> Open Co-ordinates on Google Maps
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {selected.ip_address && (
                    <p className="mt-0.5 text-[10px] text-gray-500">
                      IP Address: {selected.ip_address}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Status</label>
                <select
                  value={selected.status}
                  onChange={(e) => setSelected({ ...selected, status: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Assigned Advisor</label>
                <select
                  value={selected.assigned_to || ""}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      assigned_to: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                >
                  <option value="">-- Unassigned --</option>
                  {staff.map((st) => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Internal Notes</label>
                <textarea
                  rows={4}
                  value={selected.internal_notes || ""}
                  onChange={(e) =>
                    setSelected({ ...selected, internal_notes: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#164B34] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0C3323]"
              >
                <Save className="h-4 w-4 text-[#E0C796]" /> Save Profile Updates
              </button>
            </form>
          ) : (
            <p className="py-12 text-center text-xs text-gray-500">
              Select a registered customer profile to inspect Date, Time, GPS Co-ordinates, OTP verification status, or update follow-up notes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
