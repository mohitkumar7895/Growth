"use client";

import React, { useEffect, useState } from "react";
import { Plus, Save, Trash2, Edit3, Image as ImageIcon, FileText, CheckCircle2, X } from "lucide-react";
import type { ProjectItem } from "@/types";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import RichTextEditor from "@/components/admin/RichTextEditor";

const EMPTY_PROJECT: Partial<ProjectItem> = {
  id: 0,
  name: "",
  slug: "",
  category: "Commercial",
  developer_name: "",
  location: "Noida",
  sector: "",
  region_filter: "Noida",
  short_description: "",
  description: "",
  featured_image: "/images/project-commercial-plaza.jpg",
  rera_number: "Verify official UP-RERA registration during consultation",
  rera_status_note: "Reference project showcase — confirm official details during consultation.",
  price_range: "Price on Request",
  configuration: "",
  project_status: "Enquire for Latest Status",
  amenities_json: "[]",
  specifications_json: "{}",
  map_embed_url: "",
  brochure_url: "",
  official_website_url: "",
  is_featured: 1,
  status: "published",
  sort_order: 10,
  meta_title: "",
  meta_description: "",
  canonical_url: "",
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [editing, setEditing] = useState<Partial<ProjectItem> | null>(null);
  const [amenitiesText, setAmenitiesText] = useState("");
  const [gallery, setGallery] = useState<{ image_url: string; alt_text?: string; caption?: string }[]>([]);
  const [pickerMode, setPickerMode] = useState<"featured" | "gallery" | "brochure" | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/projects");
    const data = await res.json();
    setProjects(data.projects || []);
  };

  useEffect(() => {
    load();
  }, []);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const openEditor = (p: Partial<ProjectItem>) => {
    setEditing(p);
    try {
      const a = JSON.parse(p.amenities_json || "[]");
      setAmenitiesText(Array.isArray(a) ? a.join("\n") : "");
    } catch {
      setAmenitiesText("");
    }
    setGallery(
      (p.images || []).map((img) => ({
        image_url: img.image_url,
        alt_text: img.alt_text || "",
        caption: img.caption || "",
      }))
    );
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
      gallery,
    };
    const res = await fetch("/api/admin/projects", {
      method: editing.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await res.json();
    if (res.ok) {
      flash(editing.id ? "Project updated!" : "Project created!");
      setEditing(null);
      load();
    } else {
      flash(d.error || "Failed to save project");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this project and its gallery permanently?")) return;
    await fetch(`/api/admin/projects?id=${id}`, { method: "DELETE" });
    flash("Project deleted");
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-gray-500">
          Manage flagship developments including RERA details, image galleries, brochures, and SEO.
        </p>
        <button
          type="button"
          onClick={() => openEditor({ ...EMPTY_PROJECT })}
          className="inline-flex items-center gap-2 rounded-lg bg-[#164B34] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0C3323]"
        >
          <Plus className="h-4 w-4 text-[#E0C796]" /> Add Project
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
              {editing.id ? `Edit Project: ${editing.name}` : "Create Featured Project"}
            </h3>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border px-3 py-1.5 text-xs"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Project Name *</label>
              <input
                required
                value={editing.name || ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Slug</label>
              <input
                value={editing.slug || ""}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Developer Name</label>
              <input
                value={editing.developer_name || ""}
                onChange={(e) => setEditing({ ...editing, developer_name: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Category</label>
              <select
                value={editing.category || "Commercial"}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="Commercial">Commercial</option>
                <option value="Residential">Residential</option>
                <option value="Industrial">Industrial</option>
                <option value="Plots & Land">Plots &amp; Land</option>
                <option value="Mixed-Use">Mixed-Use</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Region Filter</label>
              <select
                value={editing.region_filter || "Noida"}
                onChange={(e) => setEditing({ ...editing, region_filter: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="Noida">Noida</option>
                <option value="Greater Noida">Greater Noida</option>
                <option value="Yamuna Expressway">Yamuna Expressway</option>
                <option value="Delhi NCR">Delhi NCR</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Location *</label>
              <input
                required
                value={editing.location || ""}
                onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                placeholder="e.g., Sector 132, Noida"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">RERA Registration Details</label>
              <input
                value={editing.rera_number || ""}
                onChange={(e) => setEditing({ ...editing, rera_number: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Price Range</label>
              <input
                value={editing.price_range || ""}
                onChange={(e) => setEditing({ ...editing, price_range: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Project Status</label>
              <input
                value={editing.project_status || ""}
                onChange={(e) => setEditing({ ...editing, project_status: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Configuration</label>
              <input
                value={editing.configuration || ""}
                onChange={(e) => setEditing({ ...editing, configuration: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
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
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Brochure PDF URL</label>
              <div className="flex gap-2">
                <input
                  value={editing.brochure_url || ""}
                  onChange={(e) => setEditing({ ...editing, brochure_url: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setPickerMode("brochure")}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#F6F7F2] px-3 py-2 text-xs font-semibold text-[#164B34] ring-1 ring-[#164B34]/20"
                >
                  <FileText className="h-3.5 w-3.5" /> PDF
                </button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Google Map Embed URL</label>
              <input
                value={editing.map_embed_url || ""}
                onChange={(e) => setEditing({ ...editing, map_embed_url: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Official Website URL</label>
              <input
                value={editing.official_website_url || ""}
                onChange={(e) => setEditing({ ...editing, official_website_url: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
              />
            </div>
          </div>

          {/* Project Gallery */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold text-[#164B34]">
                Project Gallery ({gallery.length} images)
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
              {gallery.map((g, i) => (
                <div key={i} className="relative h-16 w-24 overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.image_url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Short Description</label>
            <textarea
              rows={2}
              value={editing.short_description || ""}
              onChange={(e) => setEditing({ ...editing, short_description: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Detailed Description</label>
            <RichTextEditor
              rows={6}
              value={editing.description || ""}
              onChange={(val) => setEditing({ ...editing, description: val })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Amenities (one per line)</label>
              <textarea
                rows={4}
                value={amenitiesText}
                onChange={(e) => setAmenitiesText(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Specifications JSON</label>
              <textarea
                rows={4}
                value={editing.specifications_json || "{}"}
                onChange={(e) => setEditing({ ...editing, specifications_json: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Meta Title</label>
              <input
                value={editing.meta_title || ""}
                onChange={(e) => setEditing({ ...editing, meta_title: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Meta Description</label>
              <input
                value={editing.meta_description || ""}
                onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
              />
            </div>
            <div className="flex items-end gap-3">
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
              <label className="flex items-center gap-1.5 pb-2 text-xs font-semibold">
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
            <Save className="h-4 w-4 text-[#E0C796]" /> Save Project
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div
              key={p.id}
              className="overflow-hidden rounded-xl border border-[#164B34]/12 bg-white shadow-sm"
            >
              <div className="relative h-40 w-full bg-[#0C3323]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.featured_image || "/images/project-commercial-plaza.jpg"}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-3 top-3 rounded-full bg-[#0C3323]/85 px-2.5 py-0.5 text-[10px] font-semibold text-[#E0C796]">
                  {p.category} • {p.region_filter}
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-editorial text-xl font-semibold text-[#0C3323]">{p.name}</h4>
                <p className="text-xs text-gray-500">{p.location}</p>
                <div className="mt-4 flex items-center justify-between border-t pt-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      p.status === "published"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {p.status}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditor(p)}
                      className="inline-flex items-center gap-1 rounded bg-[#F6F7F2] px-2.5 py-1 text-xs font-semibold text-[#164B34] hover:bg-[#164B34] hover:text-white"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MediaPickerModal
        open={Boolean(pickerMode)}
        onClose={() => setPickerMode(null)}
        filterType={pickerMode === "brochure" ? "document" : "image"}
        onSelect={(url) => {
          if (!editing) return;
          if (pickerMode === "featured") setEditing({ ...editing, featured_image: url });
          if (pickerMode === "brochure") setEditing({ ...editing, brochure_url: url });
          if (pickerMode === "gallery")
            setGallery((prev) => [
              ...prev,
              {
                image_url: url,
                alt_text: editing.name || "",
                caption: "Conceptual architectural representation",
              },
            ]);
        }}
      />
    </div>
  );
}
