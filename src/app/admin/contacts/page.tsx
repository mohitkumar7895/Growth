"use client";

import React, { useEffect, useState } from "react";
import { Save, Trash2, CheckCircle2 } from "lucide-react";
import type { ContactSubmissionItem } from "@/types";

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactSubmissionItem[]>([]);
  const [selected, setSelected] = useState<ContactSubmissionItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/contacts");
    const data = await res.json();
    setContacts(data.contacts || []);
  };

  useEffect(() => {
    load();
  }, []);

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
              {contacts.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`cursor-pointer ${selected?.id === c.id ? "bg-[#F6F7F2]" : "hover:bg-gray-50"}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#0C3323]">{c.name}</p>
                    <p className="text-gray-500">{c.phone}</p>
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
              ))}
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
              <p className="text-xs text-gray-500">
                {selected.phone} {selected.email ? `• ${selected.email}` : ""}
              </p>
            </div>
            <div className="rounded-lg bg-[#F6F7F2] p-4 text-xs leading-relaxed text-gray-800">
              <p className="mb-1 font-semibold text-[#0C3323]">{selected.subject}</p>
              <p>{selected.message}</p>
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
                {["New", "Reviewed", "Responded", "Archived"].map((s) => (
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
  );
}
