"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save, ArrowUp, ArrowDown, CheckCircle2 } from "lucide-react";
import type { NavigationItem } from "@/types";

export default function AdminNavigationPage() {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [form, setForm] = useState({
    id: 0,
    label: "",
    url: "/",
    location: "header" as NavigationItem["location"],
    target: "_self",
    sort_order: 10,
    is_active: true,
    is_cta: false,
  });
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/navigation");
    const data = await res.json();
    setItems(data.items || []);
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
    const method = form.id ? "PUT" : "POST";
    const res = await fetch("/api/admin/navigation", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      flash(form.id ? "Menu item updated!" : "Menu item added!");
      setForm({
        id: 0,
        label: "",
        url: "/",
        location: "header",
        target: "_self",
        sort_order: items.length + 1,
        is_active: true,
        is_cta: false,
      });
      load();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this navigation menu item?")) return;
    await fetch(`/api/admin/navigation?id=${id}`, { method: "DELETE" });
    flash("Menu item removed");
    load();
  };

  const move = async (location: string, idx: number, dir: -1 | 1) => {
    const group = items.filter((i) => i.location === location);
    const target = idx + dir;
    if (target < 0 || target >= group.length) return;
    [group[idx], group[target]] = [group[target], group[idx]];
    await fetch("/api/admin/navigation", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reorder: group.map((g, i) => ({ id: g.id, sort_order: i + 1 })),
      }),
    });
    flash("Menu order saved");
    load();
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Form */}
      <div className="rounded-xl border border-[#164B34]/12 bg-white p-6 shadow-sm lg:col-span-4">
        <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
          {form.id ? "Edit Menu Link" : "Add Menu Link"}
        </h3>
        {toast && (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" /> {toast}
          </div>
        )}
        <form onSubmit={handleSave} className="mt-4 space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Label *</label>
            <input
              type="text"
              required
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="e.g., Projects"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">URL *</label>
            <input
              type="text"
              required
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="/projects or https://..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Location</label>
              <select
                value={form.location}
                onChange={(e) =>
                  setForm({
                    ...form,
                    location: e.target.value as NavigationItem["location"],
                  })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
              >
                <option value="header">Header Navbar</option>
                <option value="footer_quick">Footer Explore</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Target</label>
              <select
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
              >
                <option value="_self">Same Tab</option>
                <option value="_blank">New Tab</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-1 text-xs">
            <label className="flex items-center gap-2 font-medium">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="accent-[#164B34]"
              />
              Enabled
            </label>
            <label className="flex items-center gap-2 font-medium">
              <input
                type="checkbox"
                checked={form.is_cta}
                onChange={(e) => setForm({ ...form, is_cta: e.target.checked })}
                className="accent-[#164B34]"
              />
              Highlight as Gold CTA Button
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#164B34] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0C3323]"
            >
              {form.id ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {form.id ? "Update Link" : "Add Link"}
            </button>
            {form.id > 0 && (
              <button
                type="button"
                onClick={() =>
                  setForm({
                    id: 0,
                    label: "",
                    url: "/",
                    location: "header",
                    target: "_self",
                    sort_order: 10,
                    is_active: true,
                    is_cta: false,
                  })
                }
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lists */}
      <div className="space-y-6 lg:col-span-8">
        {(["header", "footer_quick"] as const).map((loc) => {
          const list = items.filter((i) => i.location === loc);
          return (
            <div
              key={loc}
              className="rounded-xl border border-[#164B34]/12 bg-white p-6 shadow-sm"
            >
              <h3 className="font-editorial text-xl font-semibold text-[#0C3323]">
                {loc === "header" ? "Header Primary Navigation" : "Footer Quick Navigation"}
              </h3>
              <ul className="mt-4 divide-y divide-gray-100">
                {list.map((item, idx) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#0C3323]">{item.label}</span>{" "}
                      <span className="text-gray-400">({item.url})</span>
                      {Boolean(item.is_cta) && (
                        <span className="ml-2 rounded bg-[#C6A66C]/25 px-2 py-0.5 text-[10px] font-semibold text-[#0C3323]">
                          CTA
                        </span>
                      )}
                      {!item.is_active && (
                        <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-[10px] text-gray-600">
                          Hidden
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => move(loc, idx, -1)}
                        disabled={idx === 0}
                        className="rounded border p-1 disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(loc, idx, 1)}
                        disabled={idx === list.length - 1}
                        className="rounded border p-1 disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            id: item.id,
                            label: item.label,
                            url: item.url,
                            location: item.location,
                            target: item.target,
                            sort_order: item.sort_order,
                            is_active: Boolean(item.is_active),
                            is_cta: Boolean(item.is_cta),
                          })
                        }
                        className="rounded bg-[#F6F7F2] px-2.5 py-1 font-semibold text-[#164B34] hover:bg-[#164B34] hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="rounded p-1 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
