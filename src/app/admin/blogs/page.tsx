"use client";

import React, { useEffect, useState } from "react";
import { Plus, Save, Trash2, Edit3, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import type { BlogCategory, BlogItem } from "@/types";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface AdminBlogRow extends BlogItem {
  tag_names?: string[];
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<AdminBlogRow[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [editing, setEditing] = useState<Partial<AdminBlogRow> | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCatManager, setShowCatManager] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const res = await fetch("/api/admin/blog-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName.trim() }),
    });
    if (res.ok) {
      setNewCategoryName("");
      flash("Blog category added!");
      load();
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Delete this blog category?")) return;
    await fetch(`/api/admin/blog-categories?id=${id}`, { method: "DELETE" });
    flash("Blog category removed");
    load();
  };

  const load = async () => {
    const res = await fetch("/api/admin/blogs");
    const data = await res.json();
    setBlogs(data.blogs || []);
    setCategories(data.categories || []);
  };

  useEffect(() => {
    load();
  }, []);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const openEditor = (b: Partial<AdminBlogRow>) => {
    setEditing(b);
    setTagsInput((b.tag_names || []).join(", "));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const res = await fetch("/api/admin/blogs", {
      method: editing.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editing, tags }),
    });
    const d = await res.json();
    if (res.ok) {
      flash("Article saved!");
      setEditing(null);
      load();
    } else {
      flash(d.error || "Failed to save article");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this blog article permanently?")) return;
    await fetch(`/api/admin/blogs?id=${id}`, { method: "DELETE" });
    flash("Article deleted");
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-gray-500">
          Author, schedule, categorize, and publish real estate insights with full SEO metadata.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowCatManager((v) => !v)}
            className="rounded-lg border border-[#164B34]/25 bg-white px-4 py-2.5 text-xs font-semibold text-[#164B34] hover:bg-[#F6F7F2]"
          >
            {showCatManager ? "Hide Categories" : `Manage Categories (${categories.length})`}
          </button>
          <button
            type="button"
            onClick={() =>
              openEditor({
                id: 0,
                title: "",
                slug: "",
                category_id: categories[0]?.id || null,
                author_name: "Growth Realtech Advisory Desk",
                excerpt: "",
                content: "<h2>Article Heading</h2>\n<p>Start writing your insight here...</p>",
                featured_image: "/images/category-investment.jpg",
                reading_time: "5 min read",
                status: "published",
                published_at: new Date().toISOString().slice(0, 16),
                meta_title: "",
                meta_description: "",
                canonical_url: "",
              })
            }
            className="inline-flex items-center gap-2 rounded-lg bg-[#164B34] px-4 py-2.5 text-xs font-semibold text-white"
          >
            <Plus className="h-4 w-4 text-[#E0C796]" /> New Article
          </button>
        </div>
      </div>

      {showCatManager && (
        <div className="rounded-xl border border-[#164B34]/12 bg-white p-5 shadow-sm">
          <h3 className="font-editorial text-xl font-semibold text-[#0C3323]">
            Blog Categories
          </h3>
          <form onSubmit={handleAddCategory} className="mt-3 flex flex-wrap gap-2">
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name (e.g., Jewar Airport Updates)"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#164B34] px-4 py-2 text-xs font-semibold text-white"
            >
              Add Category
            </button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#164B34]/15 bg-[#F6F7F2] px-3 py-1 text-xs font-medium text-[#0C3323]"
              >
                {cat.name}
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete category"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {toast && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSave} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
              {editing.id ? "Edit Insight Article" : "Publish New Insight"}
            </h3>
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border px-3 py-1.5 text-xs">
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Article Title *</label>
              <input
                required
                value={editing.title || ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">URL Slug</label>
              <input
                value={editing.slug || ""}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
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
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Tags (comma separated)</label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Noida Expressway, UP-RERA, Commercial"
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Status</label>
                <select
                  value={editing.status || "draft"}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      status: e.target.value as "draft" | "published" | "scheduled",
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Reading Time</label>
                <input
                  value={editing.reading_time || ""}
                  onChange={(e) => setEditing({ ...editing, reading_time: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Excerpt</label>
            <textarea
              rows={2}
              value={editing.excerpt || ""}
              onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">Rich Article Body *</label>
            <RichTextEditor
              rows={10}
              value={editing.content || ""}
              onChange={(val) => setEditing({ ...editing, content: val })}
            />
          </div>

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
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">Canonical URL</label>
              <input
                value={editing.canonical_url || ""}
                onChange={(e) => setEditing({ ...editing, canonical_url: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
              />
            </div>
          </div>

          <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#164B34] px-6 py-2.5 text-xs font-semibold text-white">
            <Save className="h-4 w-4 text-[#E0C796]" /> Save Article
          </button>
        </form>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#164B34]/12 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F7F2] text-[11px] uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {blogs.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F6F7F2]/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#0C3323]">{b.title}</p>
                      <p className="text-[11px] text-gray-400">/{b.slug}</p>
                    </td>
                    <td className="px-4 py-3">{b.category_name || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          b.status === "published"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditor(b)}
                          className="inline-flex items-center gap-1 rounded bg-[#F6F7F2] px-2.5 py-1.5 font-semibold text-[#164B34]"
                        >
                          <Edit3 className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id)}
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
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        filterType="image"
        onSelect={(url) => editing && setEditing({ ...editing, featured_image: url })}
      />
    </div>
  );
}
