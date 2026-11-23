"use client";

import React, { useEffect, useState } from "react";
import { Plus, Save, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import type { PropertyCategory } from "@/types";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [form, setForm] = useState<Partial<PropertyCategory>>({
    id: 0,
    name: "",
    slug: "",
    short_description: "",
    description: "",
    image_url: "/images/category-residential.jpg",
    icon_name: "Building2",
    sort_order: 10,
    is_active: 1,
    is_featured: 1,
  });
  const [mediaOpen, setMediaOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories || []);
  };

  useEffect(() => {
    load();
  }, []);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/categories", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      flash(form.id ? "Category updated!" : "Category added!");
      setForm({
        id: 0,
        name: "",
        slug: "",
        short_description: "",
        description: "",
        image_url: "/images/category-residential.jpg",
        icon_name: "Building2",
        sort_order: categories.length + 1,
        is_active: 1,
        is_featured: 1,
      });
      load();
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= categories.length) return;
    const copy = [...categories];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    await fetch("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reorder: copy.map((c, i) => ({ id: c.id, sort_order: i + 1 })),
      }),
    });
    flash("Category order updated!");
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this property category?")) return;
    await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
    flash("Category deleted");
    load();
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="rounded-xl border border-[#164B34]/12 bg-white p-6 shadow-sm lg:col-span-5">
        <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
          {form.id ? "Edit Category" : "Add Property Category"}
        </h3>
        {toast && (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" /> {toast}
          </div>
        )}
        <form onSubmit={handleSave} className="mt-4 space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Category Name *</label>
            <input
              required
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Short Description</label>
            <textarea
              rows={2}
              value={form.short_description || ""}
              onChange={(e) => setForm({ ...form, short_description: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Category HD Image</label>
            <div className="flex gap-2">
              <input
                value={form.image_url || ""}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
              />
              <button
                type="button"
                onClick={() => setMediaOpen(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-[#F6F7F2] px-3 py-2 text-xs font-semibold text-[#164B34] ring-1 ring-[#164B34]/20"
              >
                <ImageIcon className="h-3.5 w-3.5" /> Pick
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Icon Name</label>
            <select
              value={form.icon_name || "Building2"}
              onChange={(e) => setForm({ ...form, icon_name: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
            >
              {["Home", "Building2", "Factory", "Map", "KeyRound", "Landmark", "Building", "Briefcase"].map(
                (ic) => (
                  <option key={ic} value={ic}>{ic}</option>
                )
              )}
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs font-medium">
            <input
              type="checkbox"
              checked={Boolean(form.is_active)}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })}
              className="accent-[#164B34]"
            />
            Active on Website
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#164B34] px-4 py-2.5 text-xs font-semibold text-white"
            >
              {form.id ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {form.id ? "Update Category" : "Add Category"}
            </button>
            {Boolean(form.id) && (
              <button
                type="button"
                onClick={() => setForm({ id: 0, name: "", slug: "", short_description: "", image_url: "/images/category-residential.jpg", icon_name: "Building2", is_active: 1, is_featured: 1 })}
                className="rounded-lg border px-3 py-2 text-xs"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-[#164B34]/12 bg-white p-6 shadow-sm lg:col-span-7">
        <h3 className="font-editorial text-xl font-semibold text-[#0C3323]">
          Property Categories ({categories.length})
        </h3>
        <ul className="mt-4 divide-y divide-gray-100">
          {categories.map((cat, idx) => (
            <li key={cat.id} className="flex items-center justify-between gap-3 py-3 text-xs">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image_url || "/images/category-residential.jpg"}
                  alt={cat.name}
                  className="h-12 w-16 rounded-lg object-cover"
                />
                <div>
                  <p className="font-semibold text-[#0C3323]">{cat.name}</p>
                  <p className="line-clamp-1 text-gray-500">{cat.short_description}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} className="rounded border p-1 disabled:opacity-30">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => move(idx, 1)} disabled={idx === categories.length - 1} className="rounded border p-1 disabled:opacity-30">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setForm(cat)}
                  className="rounded bg-[#F6F7F2] px-2.5 py-1 font-semibold text-[#164B34] hover:bg-[#164B34] hover:text-white"
                >
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(cat.id)} className="rounded p-1 text-red-500 hover:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <MediaPickerModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        filterType="image"
        onSelect={(url) => setForm((f) => ({ ...f, image_url: url }))}
      />
    </div>
  );
}
