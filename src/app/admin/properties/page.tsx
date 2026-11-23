"use client";

import React, { useEffect, useState } from "react";
import { Plus, Save, Trash2, Edit3, Image as ImageIcon, CheckCircle2, X } from "lucide-react";
import {
  BUDGET_RANGES,
  LOCATIONS,
  PROPERTY_TYPES,
  PURPOSES,
  type PropertyCategory,
  type PropertyItem,
} from "@/types";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import RichTextEditor from "@/components/admin/RichTextEditor";

const EMPTY_PROP: Partial<PropertyItem> = {
  id: 0,
  title: "",
  slug: "",
  category_id: null,
  property_type: "Residential",
  location: "Noida",
  sector: "",
  city: "Noida",
  budget_range: "₹1–2 Crore",
  price_display: "Price on Request",
  purpose: "End Use",
  property_status: "Available for Consultation",
  area_size: "",
  configuration: "",
  short_description: "",
  description: "",
  specifications_json: "{}",
  amenities_json: "[]",
  featured_image: "/images/category-residential.jpg",
  gallery_json: "[]",
  brochure_url: "",
  is_featured: 0,
  status: "published",
  meta_title: "",
  meta_description: "",
  canonical_url: "",
};

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [editing, setEditing] = useState<Partial<PropertyItem> | null>(null);
  const [amenitiesText, setAmenitiesText] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [pickerMode, setPickerMode] = useState<"featured" | "gallery" | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    const [pRes, cRes] = await Promise.all([
      fetch("/api/admin/properties"),
      fetch("/api/admin/categories"),
    ]);
    const [pData, cData] = await Promise.all([pRes.json(), cRes.json()]);
    setProperties(pData.properties || []);
    setCategories(cData.categories || []);
  };

  useEffect(() => {
    load();
  }, []);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const openEditor = (prop: Partial<PropertyItem>) => {
    setEditing(prop);
    try {
      const a = JSON.parse(prop.amenities_json || "[]");
      setAmenitiesText(Array.isArray(a) ? a.join("\n") : "");
    } catch {
      setAmenitiesText("");
    }
    try {
      const g = JSON.parse(prop.gallery_json || "[]");
      setGalleryUrls(Array.isArray(g) ? g : []);
    } catch {
      setGalleryUrls([]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const payload = {
      ...editing,
      amenities_json: JSON.stringify(
        amenitiesText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
      ),
      gallery_json: JSON.stringify(galleryUrls),
    };
    const res = await fetch("/api/admin/properties", {
      method: editing.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await res.json();
    if (res.ok) {
      flash(editing.id ? "Property updated!" : "Property created!");
      setEditing(null);
      load();
    } else {
      flash(d.error || "Failed to save property");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this property permanently?")) return;
    await fetch(`/api/admin/properties?id=${id}`, { method: "DELETE" });
    flash("Property deleted");
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-gray-500">
          Manage all properties indexed by Smart Property Search and the Properties directory.
        </p>
        <button
          type="button"
          onClick={() => openEditor({ ...EMPTY_PROP })}
          className="inline-flex items-center gap-2 rounded-lg bg-[#164B34] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0C3323]"
        >
          <Plus className="h-4 w-4 text-[#E0C796]" /> Add Property
        </button>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      {editing ? (
        <form
          onSubmit={handleSave}
          className="space-y-5 rounded-xl border border-[#164B34]/12 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
              {editing.id ? `Edit Property: ${editing.title}` : "Add New Property"}
            </h3>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border px-3 py-1.5 text-xs"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Title *</label>
              <input
                required
                value={editing.title || ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">URL Slug (auto if blank)</label>
              <input
                value={editing.slug || ""}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Property Type</label>
              <select
                value={editing.property_type || "Residential"}
                onChange={(e) => setEditing({ ...editing, property_type: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Category</label>
              <select
                value={editing.category_id || ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    category_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Location</label>
              <select
                value={editing.location || "Noida"}
                onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Sector / Micro-Market</label>
              <input
                value={editing.sector || ""}
                onChange={(e) => setEditing({ ...editing, sector: e.target.value })}
                placeholder="e.g., Sector 150 / YEIDA Belt"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Budget Band</label>
              <select
                value={editing.budget_range || "Open to Options"}
                onChange={(e) => setEditing({ ...editing, budget_range: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                {BUDGET_RANGES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Purpose</label>
              <select
                value={editing.purpose || "End Use"}
                onChange={(e) => setEditing({ ...editing, purpose: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                {PURPOSES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Indicative Price Display</label>
              <input
                value={editing.price_display || ""}
                onChange={(e) => setEditing({ ...editing, price_display: e.target.value })}
                placeholder="Price on Request"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Property Status</label>
              <input
                value={editing.property_status || ""}
                onChange={(e) => setEditing({ ...editing, property_status: e.target.value })}
                placeholder="Available for Consultation / Ready to Move"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Configuration</label>
              <input
                value={editing.configuration || ""}
                onChange={(e) => setEditing({ ...editing, configuration: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Featured Image</label>
              <div className="flex gap-2">
                <input
                  value={editing.featured_image || ""}
                  onChange={(e) => setEditing({ ...editing, featured_image: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setPickerMode("featured")}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#F6F7F2] px-3 py-2 text-xs font-semibold text-[#164B34] ring-1 ring-[#164B34]/20"
                >
                  <ImageIcon className="h-3.5 w-3.5" /> Pick
                </button>
              </div>
            </div>
          </div>

          {/* Multi-image Gallery */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold text-[#164B34]">
                Property Gallery Images ({galleryUrls.length})
              </label>
              <button
                type="button"
                onClick={() => setPickerMode("gallery")}
                className="inline-flex items-center gap-1 rounded-md bg-[#F6F7F2] px-3 py-1 text-xs font-semibold text-[#164B34] ring-1 ring-[#164B34]/20"
              >
                <Plus className="h-3.5 w-3.5" /> Add Gallery Image
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {galleryUrls.map((url, idx) => (
                <div key={idx} className="relative h-16 w-24 overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setGalleryUrls(galleryUrls.filter((_, i) => i !== idx))}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Short Summary</label>
            <textarea
              rows={2}
              value={editing.short_description || ""}
              onChange={(e) => setEditing({ ...editing, short_description: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Full Description</label>
            <RichTextEditor
              rows={6}
              value={editing.description || ""}
              onChange={(val) => setEditing({ ...editing, description: val })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                Amenities (one per line)
              </label>
              <textarea
                rows={4}
                value={amenitiesText}
                onChange={(e) => setAmenitiesText(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                Specifications JSON (e.g. {"{\"Key\":\"Value\"}"})
              </label>
              <textarea
                rows={4}
                value={editing.specifications_json || "{}"}
                onChange={(e) => setEditing({ ...editing, specifications_json: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs"
              />
            </div>
          </div>

          {/* SEO & Publish Controls */}
          <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Meta Title</label>
              <input
                value={editing.meta_title || ""}
                onChange={(e) => setEditing({ ...editing, meta_title: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Meta Description</label>
              <input
                value={editing.meta_description || ""}
                onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
              />
            </div>
            <div className="flex items-end gap-4">
              <select
                value={editing.status || "published"}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value as "published" | "draft" })
                }
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <label className="flex items-center gap-2 pb-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={Boolean(editing.is_featured)}
                  onChange={(e) =>
                    setEditing({ ...editing, is_featured: e.target.checked ? 1 : 0 })
                  }
                  className="accent-[#164B34]"
                />
                Featured
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-[#164B34] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#0C3323]"
          >
            <Save className="h-4 w-4 text-[#E0C796]" /> Save Property
          </button>
        </form>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#164B34]/12 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F7F2] text-[11px] uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F6F7F2]/60">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#0C3323]">{p.title}</p>
                      <p className="text-[11px] text-gray-400">/{p.slug}</p>
                    </td>
                    <td className="px-4 py-3">{p.property_type}</td>
                    <td className="px-4 py-3">{p.location}</td>
                    <td className="px-4 py-3">{p.budget_range}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          p.status === "published"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditor(p)}
                          className="inline-flex items-center gap-1 rounded bg-[#F6F7F2] px-2.5 py-1.5 font-semibold text-[#164B34] hover:bg-[#164B34] hover:text-white"
                        >
                          <Edit3 className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="rounded p-1.5 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <MediaPickerModal
        open={Boolean(pickerMode)}
        onClose={() => setPickerMode(null)}
        filterType="image"
        onSelect={(url) => {
          if (pickerMode === "featured" && editing) {
            setEditing({ ...editing, featured_image: url });
          } else if (pickerMode === "gallery") {
            setGalleryUrls((prev) => [...prev, url]);
          }
        }}
      />
    </div>
  );
}
