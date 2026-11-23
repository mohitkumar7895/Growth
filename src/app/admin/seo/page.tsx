"use client";

import React, { useEffect, useState } from "react";
import { Save, CheckCircle2, Image as ImageIcon } from "lucide-react";
import type { SeoMetadataItem } from "@/types";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

export default function AdminSeoPage() {
  const [pages, setPages] = useState<SeoMetadataItem[]>([]);
  const [selected, setSelected] = useState<SeoMetadataItem | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/seo");
    const data = await res.json();
    const list = (data.pages || []) as SeoMetadataItem[];
    setPages(list);
    if (!selected && list.length > 0) setSelected(list[0]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const res = await fetch("/api/admin/seo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selected),
    });
    if (res.ok) {
      setToast(`SEO settings updated for ${selected.page_label}!`);
      setTimeout(() => setToast(null), 2800);
      load();
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="rounded-xl border border-[#164B34]/12 bg-white p-4 shadow-sm lg:col-span-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Page-Wise SEO Profiles
        </h3>
        <ul className="space-y-1.5">
          {pages.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setSelected(p)}
                className={`w-full rounded-lg border p-3 text-left text-xs transition ${
                  selected?.id === p.id
                    ? "border-[#164B34] bg-[#F6F7F2]"
                    : "border-gray-100 hover:bg-gray-50"
                }`}
              >
                <p className="font-semibold text-[#0C3323]">{p.page_label}</p>
                <p className="truncate text-[11px] text-gray-500">{p.meta_title}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-[#164B34]/12 bg-white p-6 shadow-sm lg:col-span-8">
        {toast && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
            <CheckCircle2 className="h-4 w-4" /> {toast}
          </div>
        )}
        {selected && (
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
              SEO Configuration: {selected.page_label}
            </h3>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Meta Title *</label>
              <input
                required
                value={selected.meta_title}
                onChange={(e) => setSelected({ ...selected, meta_title: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Meta Description</label>
              <textarea
                rows={3}
                value={selected.meta_description || ""}
                onChange={(e) =>
                  setSelected({ ...selected, meta_description: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Target Keywords</label>
              <input
                value={selected.keywords || ""}
                onChange={(e) => setSelected({ ...selected, keywords: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Open Graph Image</label>
                <div className="flex gap-2">
                  <input
                    value={selected.og_image || ""}
                    onChange={(e) => setSelected({ ...selected, og_image: e.target.value })}
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
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Canonical URL</label>
                <input
                  value={selected.canonical_url || ""}
                  onChange={(e) =>
                    setSelected({ ...selected, canonical_url: e.target.value })
                  }
                  placeholder="Optional custom canonical"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Robots Directive</label>
                <select
                  value={selected.robots}
                  onChange={(e) => setSelected({ ...selected, robots: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                >
                  <option value="index, follow">index, follow</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={Boolean(selected.include_in_sitemap)}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        include_in_sitemap: e.target.checked ? 1 : 0,
                      })
                    }
                    className="accent-[#164B34]"
                  />
                  Include in Dynamic sitemap.xml
                </label>
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-[#164B34] px-6 py-2.5 text-xs font-semibold text-white"
            >
              <Save className="h-4 w-4 text-[#E0C796]" /> Save SEO Metadata
            </button>
          </form>
        )}
      </div>

      <MediaPickerModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        filterType="image"
        onSelect={(url) => selected && setSelected({ ...selected, og_image: url })}
      />
    </div>
  );
}
