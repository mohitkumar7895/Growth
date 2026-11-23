"use client";

import React, { useEffect, useState } from "react";
import { Plus, Save, Trash2, Edit3, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import type { ServiceItem } from "@/types";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [editing, setEditing] = useState<Partial<ServiceItem> | null>(null);
  const [highlights, setHighlights] = useState("");
  const [processSteps, setProcessSteps] = useState("");
  const [mediaOpen, setMediaOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/services");
    const data = await res.json();
    setServices(data.services || []);
  };

  useEffect(() => {
    load();
  }, []);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const openEditor = (s: Partial<ServiceItem>) => {
    setEditing(s);
    try {
      setHighlights(JSON.parse(s.highlights_json || "[]").join("\n"));
    } catch {
      setHighlights("");
    }
    try {
      setProcessSteps(JSON.parse(s.process_json || "[]").join("\n"));
    } catch {
      setProcessSteps("");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const res = await fetch("/api/admin/services", {
      method: editing.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editing,
        highlights_json: JSON.stringify(highlights.split("\n").map((x) => x.trim()).filter(Boolean)),
        process_json: JSON.stringify(processSteps.split("\n").map((x) => x.trim()).filter(Boolean)),
      }),
    });
    if (res.ok) {
      flash("Service saved!");
      setEditing(null);
      load();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this consulting service?")) return;
    await fetch(`/api/admin/services?id=${id}`, { method: "DELETE" });
    flash("Service deleted");
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Manage all Growth Realtech advisory services and their detail pages.</p>
        <button
          type="button"
          onClick={() =>
            openEditor({
              id: 0,
              title: "",
              slug: "",
              short_description: "",
              description: "",
              icon_name: "Briefcase",
              featured_image: "/images/category-commercial.jpg",
              status: "published",
              is_featured: 1,
              sort_order: services.length + 1,
            })
          }
          className="inline-flex items-center gap-2 rounded-lg bg-[#164B34] px-4 py-2.5 text-xs font-semibold text-white"
        >
          <Plus className="h-4 w-4 text-[#E0C796]" /> Add Service
        </button>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSave} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
              {editing.id ? `Edit Service: ${editing.title}` : "Add New Service"}
            </h3>
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border px-3 py-1.5 text-xs">
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Service Title *</label>
              <input
                required
                value={editing.title || ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
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
                  onClick={() => setMediaOpen(true)}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#F6F7F2] px-3 py-2 text-xs font-semibold text-[#164B34] ring-1 ring-[#164B34]/20"
                >
                  <ImageIcon className="h-3.5 w-3.5" /> Pick
                </button>
              </div>
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
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Detailed Service Content</label>
            <RichTextEditor
              rows={6}
              value={editing.description || ""}
              onChange={(val) => setEditing({ ...editing, description: val })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Advisory Highlights (one per line)</label>
              <textarea
                rows={4}
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Process Steps (one per line)</label>
              <textarea
                rows={4}
                value={processSteps}
                onChange={(e) => setProcessSteps(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
              />
            </div>
          </div>

          <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#164B34] px-6 py-2.5 text-xs font-semibold text-white">
            <Save className="h-4 w-4 text-[#E0C796]" /> Save Service
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div key={s.id} className="flex flex-col rounded-xl border border-[#164B34]/12 bg-white p-5 shadow-sm">
              <h4 className="font-editorial text-xl font-semibold text-[#0C3323]">{s.title}</h4>
              <p className="mt-1.5 flex-1 line-clamp-3 text-xs text-gray-600">{s.short_description}</p>
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  {s.status}
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditor(s)}
                    className="inline-flex items-center gap-1 rounded bg-[#F6F7F2] px-2.5 py-1 text-xs font-semibold text-[#164B34]"
                  >
                    <Edit3 className="h-3 w-3" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id)}
                    className="rounded p-1 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MediaPickerModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        filterType="image"
        onSelect={(url) => editing && setEditing({ ...editing, featured_image: url })}
      />
    </div>
  );
}
