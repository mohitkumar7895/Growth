"use client";

import React, { useEffect, useState } from "react";
import { Search, Save, Trash2, Phone, MessageCircle, CheckCircle2 } from "lucide-react";
import { LEAD_STATUSES, type EnquiryItem } from "@/types";

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [staff, setStaff] = useState<{ id: number; name: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<EnquiryItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = async (p = page) => {
    const params = new URLSearchParams({
      page: String(p),
      pageSize: "15",
      status: statusFilter,
    });
    if (q) params.set("q", q);
    const res = await fetch(`/api/admin/enquiries?${params.toString()}`);
    const data = await res.json();
    setEnquiries(data.enquiries || []);
    setTotal(data.total || 0);
    setStaff(data.staff || []);
  };

  useEffect(() => {
    load(1);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const res = await fetch("/api/admin/enquiries", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selected.id,
        status: selected.status,
        internal_notes: selected.internal_notes,
        assigned_to: selected.assigned_to,
        follow_up_date: selected.follow_up_date
          ? String(selected.follow_up_date).slice(0, 10)
          : null,
      }),
    });
    if (res.ok) {
      setToast("Lead updated in CRM!");
      setTimeout(() => setToast(null), 2500);
      load(page);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this enquiry record?")) return;
    await fetch(`/api/admin/enquiries?id=${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    load(page);
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#164B34]/12 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          {["All", ...LEAD_STATUSES].map((st) => (
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
            onKeyDown={(e) => e.key === "Enter" && load(1)}
            placeholder="Search name, phone, property..."
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={() => load(1)}
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
        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-[#164B34]/12 bg-white shadow-sm lg:col-span-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F7F2] text-[11px] uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3">Interest / Location</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enquiries.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelected(lead)}
                    className={`cursor-pointer transition ${
                      selected?.id === lead.id ? "bg-[#F6F7F2]" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#0C3323]">{lead.name}</p>
                      <p className="text-gray-500">{lead.phone}</p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(lead.created_at).toLocaleDateString("en-IN")}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">
                        {lead.property_interest || lead.enquiry_type}
                      </p>
                      <p className="text-gray-500">{lead.preferred_location || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{lead.budget_range || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[#164B34]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#164B34]">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(lead.id);
                        }}
                        className="rounded p-1 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-gray-500">
            <span>Total Enquiries: {total}</span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  const next = page - 1;
                  setPage(next);
                  load(next);
                }}
                className="rounded border px-3 py-1 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={page * 15 >= total}
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  load(next);
                }}
                className="rounded border px-3 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Detail Drawer */}
        <div className="rounded-xl border border-[#164B34]/12 bg-white p-6 shadow-sm lg:col-span-4">
          {selected ? (
            <form onSubmit={handleSaveLead} className="space-y-4">
              <div className="border-b pb-3">
                <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
                  {selected.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {selected.phone} {selected.email ? `• ${selected.email}` : ""}
                </p>
                <div className="mt-3 flex gap-2">
                  <a
                    href={`tel:${selected.phone.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-1 rounded bg-[#0C3323] px-3 py-1.5 text-[11px] font-semibold text-[#E0C796]"
                  >
                    <Phone className="h-3 w-3" /> Call
                  </a>
                  <a
                    href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded bg-[#25D366] px-3 py-1.5 text-[11px] font-semibold text-white"
                  >
                    <MessageCircle className="h-3 w-3" /> WhatsApp
                  </a>
                </div>
              </div>

              <div className="space-y-1 rounded-lg bg-[#F6F7F2] p-3 text-xs">
                <p><strong>Interest:</strong> {selected.property_interest || "—"}</p>
                <p><strong>Location:</strong> {selected.preferred_location || "—"}</p>
                <p><strong>Budget:</strong> {selected.budget_range || "—"}</p>
                <p><strong>Purpose:</strong> {selected.purpose || "—"}</p>
                <p><strong>Message:</strong> {selected.message || "—"}</p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Lead Status</label>
                <select
                  value={selected.status}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      status: e.target.value as EnquiryItem["status"],
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                >
                  {LEAD_STATUSES.map((s) => (
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
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Follow-up Date</label>
                <input
                  type="date"
                  value={selected.follow_up_date ? String(selected.follow_up_date).slice(0, 10) : ""}
                  onChange={(e) =>
                    setSelected({ ...selected, follow_up_date: e.target.value || null })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Internal Notes</label>
                <textarea
                  rows={4}
                  value={selected.internal_notes || ""}
                  onChange={(e) =>
                    setSelected({ ...selected, internal_notes: e.target.value })
                  }
                  placeholder="Call summary, client preferences, site visit feedback..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#164B34] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0C3323]"
              >
                <Save className="h-4 w-4 text-[#E0C796]" /> Save Lead Updates
              </button>
            </form>
          ) : (
            <p className="py-12 text-center text-xs text-gray-500">
              Select any enquiry row to manage status, assignment, follow-up date, and internal notes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
