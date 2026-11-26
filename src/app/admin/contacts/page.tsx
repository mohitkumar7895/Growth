"use client";

import React, { useEffect, useState } from "react";
import {
  Save,
  Trash2,
  CheckCircle2,
  Search,
  FileSpreadsheet,
  Database,
  RotateCcw,
} from "lucide-react";
import type { ContactSubmissionItem } from "@/types";

const CONTACT_STATUSES = ["New", "Reviewed", "Responded", "Archived"] as const;

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactSubmissionItem[]>([]);
  const [selected, setSelected] = useState<ContactSubmissionItem | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [q, setQ] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const buildFilterParams = () => {
    const params = new URLSearchParams();
    if (statusFilter !== "All") params.set("status", statusFilter);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    if (q.trim()) params.set("q", q.trim());
    return params;
  };

  const load = async () => {
    const params = buildFilterParams();
    const res = await fetch(`/api/admin/contacts?${params.toString()}`);
    const data = await res.json();
    setContacts(data.contacts || []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, fromDate, toDate]);

  const resetFilters = () => {
    setStatusFilter("All");
    setFromDate("");
    setToDate("");
    setQ("");
  };

  const buildExportUrl = (dataset: "contacts" | "all") => {
    const params = buildFilterParams();
    params.set("dataset", dataset);
    return `/api/admin/export?${params.toString()}`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const res = await fetch("/api/admin/contacts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selected),
    });
    if (res.ok) {
      setToast("Contact submission updated!");
      setTimeout(() => setToast(null), 2500);
      load();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this contact submission?")) return;
    await fetch(`/api/admin/contacts?id=${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    load();
  };

  return (
    <div className="space-y-5">
      {/* Filters & Excel Export Toolbar */}
      <search className="block rounded-xl border border-[#164B34]/12 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {["All", ...CONTACT_STATUSES].map((st) => (
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
            <a
              href={buildExportUrl("contacts")}
              download
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#164B34] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0C3323]"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-[#E0C796]" />
              Export Contacts Excel (.xlsx)
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

        <div className="mt-3 grid grid-cols-1 gap-2.5 border-t border-gray-100 pt-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="date"
            aria-label="From date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            title="From Date"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700"
          />
          <input
            type="date"
            aria-label="To date"
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
              placeholder="Search sender name, phone, email, subject..."
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
            />
            <button
              type="button"
              onClick={load}
              aria-label="Search contact submissions"
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="overflow-hidden rounded-xl border border-[#164B34]/12 bg-white shadow-sm lg:col-span-7">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F7F2] text-[11px] uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-4 py-3">Sender</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                      No contact submissions match your current filters.
                    </td>
                  </tr>
                ) : (
                  contacts.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className={`cursor-pointer ${
                        selected?.id === c.id ? "bg-[#F6F7F2]" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#0C3323]">{c.name}</p>
                        <p className="tabular-nums text-gray-500">{c.phone}</p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(c.created_at).toLocaleString("en-IN")}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{c.subject || "General Contact"}</p>
                        <p className="line-clamp-1 text-gray-500">{c.message}</p>
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

        <div className="rounded-xl border border-[#164B34]/12 bg-white p-6 shadow-sm lg:col-span-5">
          {toast && (
            <div className="mb-3 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" /> {toast}
            </div>
          )}
          {selected ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="border-b pb-3">
                <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
                  {selected.name}
                </h3>
                <p className="tabular-nums text-xs text-gray-500">
                  {selected.phone} {selected.email ? `• ${selected.email}` : ""}
                </p>
              </div>
              <div className="rounded-lg bg-[#F6F7F2] p-4 text-xs leading-relaxed text-gray-800">
                <p className="mb-1 font-semibold text-[#0C3323]">{selected.subject}</p>
                <p>{selected.message}</p>
                <p className="mt-2 text-[10px] text-gray-500">
                  Submitted: {new Date(selected.created_at).toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Status</label>
                <select
                  value={selected.status}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      status: e.target.value as ContactSubmissionItem["status"],
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                >
                  {CONTACT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#164B34] px-4 py-2.5 text-xs font-semibold text-white"
              >
                <Save className="h-4 w-4 text-[#E0C796]" /> Save Contact Status
              </button>
            </form>
          ) : (
            <p className="py-12 text-center text-xs text-gray-500">
              Select a contact submission to read and respond.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
