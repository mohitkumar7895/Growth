"use client";

import React, { useEffect, useState } from "react";
import { Plus, Save, Trash2, Star, CheckCircle2 } from "lucide-react";
import type { TestimonialItem } from "@/types";

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [form, setForm] = useState<Partial<TestimonialItem>>({
    id: 0,
    client_name: "",
    designation: "",
    company: "",
    feedback: "",
    rating: 5,
    property_context: "",
    status: "published",
    is_featured: 1,
  });
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/testimonials");
    const data = await res.json();
    setItems(data.testimonials || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/testimonials", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setToast("Testimonial saved!");
      setTimeout(() => setToast(null), 2500);
      setForm({ id: 0, client_name: "", designation: "", company: "", feedback: "", rating: 5, property_context: "", status: "published", is_featured: 1 });
      load();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`/api/admin/testimonials?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <form
        onSubmit={handleSave}
        className="space-y-3.5 rounded-xl border border-[#164B34]/12 bg-white p-6 shadow-sm lg:col-span-5"
      >
        <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
          {form.id ? "Edit Testimonial" : "Add Verified Client Testimonial"}
        </h3>
        {toast && (
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" /> {toast}
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs font-semibold text-[#164B34]">Client Name *</label>
          <input
            required
            value={form.client_name || ""}
            onChange={(e) => setForm({ ...form, client_name: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Designation</label>
            <input
              value={form.designation || ""}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Company / City</label>
            <input
              value={form.company || ""}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-[#164B34]">Advisory Context</label>
          <input
            value={form.property_context || ""}
            onChange={(e) => setForm({ ...form, property_context: e.target.value })}
            placeholder="e.g., Commercial Office — Noida Expressway"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-[#164B34]">Genuine Client Feedback *</label>
          <textarea
            required
            rows={4}
            value={form.feedback || ""}
            onChange={(e) => setForm({ ...form, feedback: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Rating (1–5)</label>
            <select
              value={form.rating || 5}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r} Stars</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Status</label>
            <select
              value={form.status || "published"}
              onChange={(e) => setForm({ ...form, status: e.target.value as "published" | "draft" })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#164B34] px-4 py-2.5 text-xs font-semibold text-white">
            {form.id ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {form.id ? "Update" : "Add Testimonial"}
          </button>
          {Boolean(form.id) && (
            <button type="button" onClick={() => setForm({ id: 0, client_name: "", feedback: "", rating: 5, status: "published" })} className="rounded-lg border px-3 text-xs">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3 lg:col-span-7">
        {items.map((t) => (
          <div key={t.id} className="rounded-xl border border-[#164B34]/12 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-editorial text-xl font-semibold text-[#0C3323]">{t.client_name}</p>
                <p className="text-xs text-gray-500">
                  {[t.designation, t.company].filter(Boolean).join(" • ")}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[#C6A66C]">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-gray-700">&ldquo;{t.feedback}&rdquo;</p>
            <div className="mt-4 flex items-center justify-between border-t pt-3">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${t.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-700"}`}>
                {t.status}
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setForm(t)} className="rounded bg-[#F6F7F2] px-2.5 py-1 text-xs font-semibold text-[#164B34]">
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(t.id)} className="rounded p-1 text-red-500 hover:bg-red-50">
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
