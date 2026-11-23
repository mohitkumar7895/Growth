"use client";

import React, { useEffect, useState } from "react";
import { Plus, Save, Trash2, CheckCircle2 } from "lucide-react";
import type { FaqItem } from "@/types";

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [form, setForm] = useState<Partial<FaqItem>>({
    id: 0,
    question: "",
    answer: "",
    category: "General",
    sort_order: 10,
    is_active: 1,
  });
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/faqs");
    const data = await res.json();
    setFaqs(data.faqs || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/faqs", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setToast("FAQ saved!");
      setTimeout(() => setToast(null), 2500);
      setForm({ id: 0, question: "", answer: "", category: "General", sort_order: faqs.length + 1, is_active: 1 });
      load();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this FAQ?")) return;
    await fetch(`/api/admin/faqs?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-xl border border-[#164B34]/12 bg-white p-6 shadow-sm lg:col-span-5"
      >
        <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
          {form.id ? "Edit FAQ" : "Add New FAQ"}
        </h3>
        {toast && (
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" /> {toast}
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs font-semibold text-[#164B34]">Question *</label>
          <input
            required
            value={form.question || ""}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-[#164B34]">Answer *</label>
          <textarea
            required
            rows={5}
            value={form.answer || ""}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Category</label>
            <input
              value={form.category || ""}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Order</label>
            <input
              type="number"
              value={form.sort_order ?? 0}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium">
          <input
            type="checkbox"
            checked={Boolean(form.is_active)}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })}
            className="accent-[#164B34]"
          />
          Visible on Website
        </label>
        <div className="flex gap-2">
          <button type="submit" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#164B34] px-4 py-2.5 text-xs font-semibold text-white">
            {form.id ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {form.id ? "Update FAQ" : "Add FAQ"}
          </button>
          {Boolean(form.id) && (
            <button type="button" onClick={() => setForm({ id: 0, question: "", answer: "", category: "General", is_active: 1 })} className="rounded-lg border px-3 text-xs">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3 lg:col-span-7">
        {faqs.map((faq) => (
          <div key={faq.id} className="rounded-xl border border-[#164B34]/12 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="rounded bg-[#F6F7F2] px-2 py-0.5 text-[10px] font-semibold text-[#164B34]">
                  {faq.category}
                </span>
                <h4 className="mt-1.5 font-semibold text-[#0C3323]">{faq.question}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-600">{faq.answer}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button type="button" onClick={() => setForm(faq)} className="rounded bg-[#F6F7F2] px-2.5 py-1 text-xs font-semibold text-[#164B34]">
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(faq.id)} className="rounded p-1 text-red-500 hover:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
