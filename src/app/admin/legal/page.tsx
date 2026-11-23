"use client";

import React, { useEffect, useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";
import type { LegalPageItem } from "@/types";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function AdminLegalPage() {
  const [pages, setPages] = useState<LegalPageItem[]>([]);
  const [selected, setSelected] = useState<LegalPageItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/legal");
    const data = await res.json();
    const list = (data.pages || []) as LegalPageItem[];
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
    const res = await fetch("/api/admin/legal", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selected),
    });
    if (res.ok) {
      setToast(`${selected.title} updated and published!`);
      setTimeout(() => setToast(null), 2800);
      load();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {pages.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => setSelected(p)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold ${
              selected?.slug === p.slug
                ? "bg-[#0C3323] text-[#E0C796]"
                : "border bg-white text-gray-700"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      {selected && (
        <form onSubmit={handleSave} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Page Title</label>
            <input
              required
              value={selected.title}
              onChange={(e) => setSelected({ ...selected, title: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Legal Document Content</label>
            <RichTextEditor
              rows={12}
              value={selected.content}
              onChange={(val) => setSelected({ ...selected, content: val })}
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-[#164B34] px-6 py-2.5 text-xs font-semibold text-white"
          >
            <Save className="h-4 w-4 text-[#E0C796]" /> Save Legal Page
          </button>
        </form>
      )}
    </div>
  );
}
