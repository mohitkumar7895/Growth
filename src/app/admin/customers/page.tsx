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
} from "lucide-react";

interface CustomerRow {
  id: number;
  full_name: string;
  email: string | null;
  full_phone: string;
  mobile_verified: number;
  requirement: string;
  property_type: string;
  preferred_location: string;
  budget_range: string;
  address_city: string | null;
  additional_details: string | null;
  status: string;
  internal_notes: string | null;
  assigned_to: number | null;
  created_at: string;
}

const STATUSES = ["Verified", "New", "Contacted", "Site Visit Scheduled", "Converted", "Closed"];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [staff, setStaff] = useState<{ id: number; name: string }[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<CustomerRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    const params = new URLSearchParams({ status: statusFilter });
    if (q) params.set("q", q);
    const res = await fetch(`/api/admin/customers?${params.toString()}`);
    const data = await res.json();
    setCustomers(data.customers || []);
    setStaff(data.staff || []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#164B34]/12 bg-white p-4 shadow-sm">
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
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search name, phone, location..."
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={load}
            className="rounded-lg bg-[#164B34] p-2 text-white"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

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
                  <th className="px-4 py-3">Requirement &amp; Type</th>
                  <th className="px-4 py-3">Location / Budget</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                      No customer registrations yet. Share <strong>/register</strong> with prospective clients.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className={`cursor-pointer ${
                        selected?.id === c.id ? "bg-[#F6F7F2]" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#0C3323]">{c.full_name}</p>
                        <p className="flex items-center gap-1 text-gray-600">
                          {c.full_phone}
                          {Boolean(c.mobile_verified) && (
                            <span
                              title="OTP Verified"
                              className="inline-flex items-center gap-0.5 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800"
                            >
                              <ShieldCheck className="h-3 w-3" /> OTP
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{c.requirement}</p>
                        <p className="text-gray-500">{c.property_type}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-800">{c.preferred_location}</p>
                        <p className="text-gray-500">{c.budget_range}</p>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-[#164B34]/12 bg-white p-6 shadow-sm lg:col-span-4">
          {selected ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="border-b pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
                    {selected.full_name}
                  </h3>
                  {Boolean(selected.mobile_verified) && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      ✓ OTP Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
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
                <p className="text-[10px] text-gray-500">
                  Registered: {new Date(selected.created_at).toLocaleString("en-IN")}
                </p>
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
              Select a registered customer profile to inspect details, WhatsApp/call them, or update follow-up status.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
