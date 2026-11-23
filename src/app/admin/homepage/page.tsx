"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Save,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  CheckCircle2,
  Code2,
} from "lucide-react";
import type { HomepageSection } from "@/types";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

const ICON_OPTIONS = [
  "Compass",
  "ShieldCheck",
  "MapPinned",
  "Handshake",
  "UserCheck",
  "MessageSquareText",
  "TrendingUp",
  "HeartHandshake",
  "Award",
  "Building",
  "Building2",
  "Home",
  "Factory",
  "Map",
  "KeyRound",
  "Landmark",
  "Briefcase",
  "Sparkles",
];

function parseJsonObject(raw: string | null | undefined): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export default function AdminHomepagePage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [selected, setSelected] = useState<HomepageSection | null>(null);
  const [structured, setStructured] = useState<Record<string, unknown>>({});
  const [showRawJson, setShowRawJson] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const selectSection = (s: HomepageSection, isNew = false) => {
    setCreating(isNew);
    setSelected(s);
    setStructured(parseJsonObject(s.content_json));
    setShowRawJson(false);
  };

  const load = async (keepId?: number) => {
    setLoading(true);
    const res = await fetch("/api/admin/homepage");
    const data = await res.json();
    const list = (data.sections || []) as HomepageSection[];
    setSections(list);
    if (keepId) {
      const found = list.find((item) => item.id === keepId);
      if (found) selectSection(found, false);
    } else if (!selected && list.length > 0) {
      selectSection(list[0], false);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const updateStructured = (next: Record<string, unknown>) => {
    setStructured(next);
    if (selected) {
      setSelected({ ...selected, content_json: JSON.stringify(next, null, 2) });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    const payload = {
      ...selected,
      content_json: showRawJson
        ? selected.content_json
        : JSON.stringify(structured),
    };
    const res = await fetch("/api/admin/homepage", {
      method: creating ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await res.json();
    setSaving(false);
    if (res.ok) {
      setCreating(false);
      flash("Section saved and live on your website immediately!");
      load(creating ? d.id : selected.id);
    } else {
      flash(d.error || "Failed to save section");
    }
  };

  const toggleVisibility = async (s: HomepageSection) => {
    const updated = { ...s, is_visible: s.is_visible ? 0 : 1 };
    setSections((prev) => prev.map((x) => (x.id === s.id ? updated : x)));
    if (selected?.id === s.id) setSelected(updated);
    await fetch("/api/admin/homepage", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    flash(updated.is_visible ? `'${s.title}' is now visible on homepage` : `'${s.title}' hidden from homepage`);
  };

  const handleMove = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    const copy = [...sections];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    const reordered = copy.map((s, i) => ({ ...s, sort_order: i + 1 }));
    setSections(reordered);
    await fetch("/api/admin/homepage", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reorder: reordered.map((s) => ({ id: s.id, sort_order: s.sort_order })),
      }),
    });
    flash("Section display order updated!");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this homepage section permanently?")) return;
    const res = await fetch(`/api/admin/homepage?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setSelected(null);
      flash("Section deleted");
      load();
    }
  };

  const startNewCustomSection = () => {
    selectSection(
      {
        id: 0,
        section_key: "",
        section_type: "custom",
        title: "New Custom Editorial Section",
        subtitle: "Optional subheading",
        badge_text: "Featured Highlight",
        description: "Describe your bespoke real estate offering or announcement here.",
        content_json: "{}",
        image_url: "/images/hero-skyline.jpg",
        video_url: "",
        cta_primary_label: "Book a Consultation",
        cta_primary_url: "/contact#enquiry",
        cta_secondary_label: "",
        cta_secondary_url: "",
        background_style: "cream",
        sort_order: sections.length + 1,
        is_visible: 1,
        status: "published",
      },
      true
    );
  };

  // Visual editors per section_key / section_type
  const renderVisualContentEditor = () => {
    if (!selected) return null;
    const key = selected.section_type || selected.section_key;

    if (key === "hero") {
      const stats = Array.isArray(structured.stats)
        ? (structured.stats as { label: string; value: string }[])
        : [];
      return (
        <div className="space-y-4 rounded-xl border border-[#164B34]/15 bg-[#F6F7F2] p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C3323]">
            Hero Experience Settings
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#0C3323]">
              <input
                type="checkbox"
                checked={structured.enable3D !== false}
                onChange={(e) =>
                  updateStructured({ ...structured, enable3D: e.target.checked })
                }
                className="h-4 w-4 accent-[#164B34]"
              />
              Enable Interactive 3D Architectural Canvas
            </label>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#164B34]">
                Scroll Indicator Text
              </label>
              <input
                value={String(structured.scrollIndicatorText || "Scroll to Explore")}
                onChange={(e) =>
                  updateStructured({ ...structured, scrollIndicatorText: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#164B34]">Hero Highlights Bar</span>
              <button
                type="button"
                onClick={() =>
                  updateStructured({
                    ...structured,
                    stats: [...stats, { label: "New Label", value: "Highlight" }],
                  })
                }
                className="inline-flex items-center gap-1 rounded bg-[#164B34] px-2.5 py-1 text-[11px] font-semibold text-white"
              >
                <Plus className="h-3 w-3" /> Add Item
              </button>
            </div>
            {stats.map((st, idx) => (
              <div key={idx} className="grid grid-cols-1 gap-2 rounded-lg bg-white p-3 sm:grid-cols-12">
                <input
                  value={st.value}
                  onChange={(e) => {
                    const copy = [...stats];
                    copy[idx] = { ...copy[idx], value: e.target.value };
                    updateStructured({ ...structured, stats: copy });
                  }}
                  placeholder="Value (e.g., Noida & NCR)"
                  className="rounded border px-2.5 py-1.5 text-xs sm:col-span-5"
                />
                <input
                  value={st.label}
                  onChange={(e) => {
                    const copy = [...stats];
                    copy[idx] = { ...copy[idx], label: e.target.value };
                    updateStructured({ ...structured, stats: copy });
                  }}
                  placeholder="Label (e.g., Corridors Covered)"
                  className="rounded border px-2.5 py-1.5 text-xs sm:col-span-6"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateStructured({
                      ...structured,
                      stats: stats.filter((_, i) => i !== idx),
                    })
                  }
                  className="flex items-center justify-center rounded border border-red-200 p-1.5 text-red-500 hover:bg-red-50 sm:col-span-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (key === "about") {
      return (
        <div className="space-y-3 rounded-xl border border-[#164B34]/15 bg-[#F6F7F2] p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C3323]">
            About Growth Realtech Narrative (Updates Both Homepage &amp; /about Page)
          </h4>
          {[
            { field: "philosophy", label: "Brand Philosophy Quote" },
            { field: "mission", label: "Our Mission" },
            { field: "vision", label: "Our Vision" },
            { field: "commitment", label: "Our Commitment Highlight" },
          ].map((f) => (
            <div key={f.field}>
              <label className="mb-1 block text-xs font-semibold text-[#164B34]">{f.label}</label>
              <textarea
                rows={2}
                value={String(structured[f.field] || "")}
                onChange={(e) =>
                  updateStructured({ ...structured, [f.field]: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs"
              />
            </div>
          ))}
        </div>
      );
    }

    if (key === "trust_highlights" || key === "why_choose") {
      const listKey = key === "trust_highlights" ? "items" : "features";
      const list = Array.isArray(structured[listKey])
        ? (structured[listKey] as { icon: string; title: string; description: string }[])
        : [];
      return (
        <div className="space-y-3 rounded-xl border border-[#164B34]/15 bg-[#F6F7F2] p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C3323]">
              {key === "trust_highlights" ? "Trust & Brand Highlights" : "Why Choose Features"} ({list.length})
            </h4>
            <button
              type="button"
              onClick={() =>
                updateStructured({
                  ...structured,
                  [listKey]: [...list, { icon: "ShieldCheck", title: "New Feature", description: "Description..." }],
                })
              }
              className="inline-flex items-center gap-1 rounded bg-[#164B34] px-3 py-1.5 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Add Card
            </button>
          </div>
          {list.map((item, idx) => (
            <div key={idx} className="space-y-2 rounded-lg border border-gray-200 bg-white p-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                <select
                  value={item.icon || "ShieldCheck"}
                  onChange={(e) => {
                    const copy = [...list];
                    copy[idx] = { ...copy[idx], icon: e.target.value };
                    updateStructured({ ...structured, [listKey]: copy });
                  }}
                  className="rounded border px-2 py-1.5 text-xs sm:col-span-4"
                >
                  {ICON_OPTIONS.map((ic) => (
                    <option key={ic} value={ic}>{ic}</option>
                  ))}
                </select>
                <input
                  value={item.title}
                  onChange={(e) => {
                    const copy = [...list];
                    copy[idx] = { ...copy[idx], title: e.target.value };
                    updateStructured({ ...structured, [listKey]: copy });
                  }}
                  placeholder="Card Title"
                  className="rounded border px-2.5 py-1.5 text-xs font-semibold sm:col-span-7"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateStructured({
                      ...structured,
                      [listKey]: list.filter((_, i) => i !== idx),
                    })
                  }
                  className="flex items-center justify-center rounded border border-red-200 p-1.5 text-red-500 hover:bg-red-50 sm:col-span-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <textarea
                rows={2}
                value={item.description}
                onChange={(e) => {
                  const copy = [...list];
                  copy[idx] = { ...copy[idx], description: e.target.value };
                  updateStructured({ ...structured, [listKey]: copy });
                }}
                placeholder="Card description..."
                className="w-full rounded border px-2.5 py-1.5 text-xs"
              />
            </div>
          ))}
        </div>
      );
    }

    if (key === "approach") {
      const steps = Array.isArray(structured.steps)
        ? (structured.steps as { number: string; title: string; description: string }[])
        : [];
      return (
        <div className="space-y-3 rounded-xl border border-[#164B34]/15 bg-[#F6F7F2] p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C3323]">
              Advisory Process Steps (Updates Homepage &amp; /approach Page)
            </h4>
            <button
              type="button"
              onClick={() =>
                updateStructured({
                  ...structured,
                  steps: [
                    ...steps,
                    {
                      number: `0${steps.length + 1}`,
                      title: "New Process Step",
                      description: "Step details...",
                    },
                  ],
                })
              }
              className="inline-flex items-center gap-1 rounded bg-[#164B34] px-3 py-1.5 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Add Step
            </button>
          </div>
          {steps.map((step, idx) => (
            <div key={idx} className="space-y-2 rounded-lg border border-gray-200 bg-white p-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                <input
                  value={step.number}
                  onChange={(e) => {
                    const copy = [...steps];
                    copy[idx] = { ...copy[idx], number: e.target.value };
                    updateStructured({ ...structured, steps: copy });
                  }}
                  placeholder="01"
                  className="rounded border px-2.5 py-1.5 text-xs font-bold sm:col-span-2"
                />
                <input
                  value={step.title}
                  onChange={(e) => {
                    const copy = [...steps];
                    copy[idx] = { ...copy[idx], title: e.target.value };
                    updateStructured({ ...structured, steps: copy });
                  }}
                  placeholder="Step Title"
                  className="rounded border px-2.5 py-1.5 text-xs font-semibold sm:col-span-9"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateStructured({
                      ...structured,
                      steps: steps.filter((_, i) => i !== idx),
                    })
                  }
                  className="flex items-center justify-center rounded border border-red-200 p-1.5 text-red-500 hover:bg-red-50 sm:col-span-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <textarea
                rows={2}
                value={step.description}
                onChange={(e) => {
                  const copy = [...steps];
                  copy[idx] = { ...copy[idx], description: e.target.value };
                  updateStructured({ ...structured, steps: copy });
                }}
                className="w-full rounded border px-2.5 py-1.5 text-xs"
              />
            </div>
          ))}
        </div>
      );
    }

    if (key === "investment_opportunities") {
      const highlights = Array.isArray(structured.highlights)
        ? (structured.highlights as { title: string; tag: string; description: string }[])
        : [];
      return (
        <div className="space-y-3 rounded-xl border border-[#164B34]/15 bg-[#F6F7F2] p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C3323]">
            Investment Opportunities Desk
          </h4>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#164B34]">
              Risk Disclaimer Notice
            </label>
            <input
              value={String(structured.disclaimer || "")}
              onChange={(e) =>
                updateStructured({ ...structured, disclaimer: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs"
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-[#164B34]">Investment Cards</span>
            <button
              type="button"
              onClick={() =>
                updateStructured({
                  ...structured,
                  highlights: [
                    ...highlights,
                    { title: "New Asset Class", tag: "NCR Corridor", description: "Details..." },
                  ],
                })
              }
              className="inline-flex items-center gap-1 rounded bg-[#164B34] px-3 py-1.5 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Add Opportunity
            </button>
          </div>
          {highlights.map((h, idx) => (
            <div key={idx} className="space-y-2 rounded-lg border border-gray-200 bg-white p-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                <input
                  value={h.title}
                  onChange={(e) => {
                    const copy = [...highlights];
                    copy[idx] = { ...copy[idx], title: e.target.value };
                    updateStructured({ ...structured, highlights: copy });
                  }}
                  placeholder="Title"
                  className="rounded border px-2.5 py-1.5 text-xs font-semibold sm:col-span-6"
                />
                <input
                  value={h.tag}
                  onChange={(e) => {
                    const copy = [...highlights];
                    copy[idx] = { ...copy[idx], tag: e.target.value };
                    updateStructured({ ...structured, highlights: copy });
                  }}
                  placeholder="Badge Tag"
                  className="rounded border px-2.5 py-1.5 text-xs sm:col-span-5"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateStructured({
                      ...structured,
                      highlights: highlights.filter((_, i) => i !== idx),
                    })
                  }
                  className="flex items-center justify-center rounded border border-red-200 p-1.5 text-red-500 hover:bg-red-50 sm:col-span-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <textarea
                rows={2}
                value={h.description}
                onChange={(e) => {
                  const copy = [...highlights];
                  copy[idx] = { ...copy[idx], description: e.target.value };
                  updateStructured({ ...structured, highlights: copy });
                }}
                className="w-full rounded border px-2.5 py-1.5 text-xs"
              />
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-gray-600">
          Visually edit Hero, About Us, Trust Pillars, Approach Steps, Why Choose, Investment Desk, or create custom sections — no coding required.
        </p>
        <button
          type="button"
          onClick={startNewCustomSection}
          className="inline-flex items-center gap-2 rounded-lg bg-[#164B34] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0C3323]"
        >
          <Plus className="h-4 w-4 text-[#E0C796]" /> Add Custom Section
        </button>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Sections Order List */}
        <div className="rounded-xl border border-[#164B34]/12 bg-white p-4 shadow-sm lg:col-span-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Homepage Sections ({sections.length})
          </h3>
          {loading ? (
            <p className="py-6 text-center text-xs text-gray-400">Loading sections...</p>
          ) : (
            <ul className="space-y-1.5">
              {sections.map((s, idx) => (
                <li
                  key={s.id}
                  className={`flex items-center justify-between gap-2 rounded-lg border p-2.5 text-xs transition ${
                    selected?.id === s.id && !creating
                      ? "border-[#164B34] bg-[#F6F7F2]"
                      : "border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => selectSection(s, false)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate font-semibold text-[#0C3323]">
                      {idx + 1}. {s.title}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {s.section_key} • {s.is_visible ? "Visible" : "Hidden"}
                    </p>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleVisibility(s)}
                      title={s.is_visible ? "Hide section" : "Show section"}
                      className="rounded p-1 hover:bg-gray-200"
                    >
                      {s.is_visible ? (
                        <Eye className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, -1)}
                      disabled={idx === 0}
                      className="rounded p-1 hover:bg-gray-200 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 1)}
                      disabled={idx === sections.length - 1}
                      className="rounded p-1 hover:bg-gray-200 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right Editor Form */}
        <div className="rounded-xl border border-[#164B34]/12 bg-white p-5 shadow-sm sm:p-6 lg:col-span-8">
          {selected ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
                    {creating ? "Create New Section" : `Edit: ${selected.title}`}
                  </h3>
                  <p className="text-xs text-gray-500">
                    All edits save directly to MySQL and refresh the live website immediately.
                  </p>
                </div>
                {!creating && selected.section_type === "custom" && (
                  <button
                    type="button"
                    onClick={() => handleDelete(selected.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete Section
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                    Section Heading *
                  </label>
                  <input
                    type="text"
                    required
                    value={selected.title}
                    onChange={(e) => setSelected({ ...selected, title: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm focus:border-[#164B34] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                    Eyebrow Badge Text
                  </label>
                  <input
                    type="text"
                    value={selected.badge_text || ""}
                    onChange={(e) => setSelected({ ...selected, badge_text: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm focus:border-[#164B34] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={selected.subtitle || ""}
                  onChange={(e) => setSelected({ ...selected, subtitle: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm focus:border-[#164B34] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={selected.description || ""}
                  onChange={(e) => setSelected({ ...selected, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm focus:border-[#164B34] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                    Section Image
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selected.image_url || ""}
                      onChange={(e) => setSelected({ ...selected, image_url: e.target.value })}
                      placeholder="/images/..."
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaOpen(true)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#F6F7F2] px-3 py-2 text-xs font-semibold text-[#164B34] ring-1 ring-[#164B34]/20 hover:bg-[#164B34] hover:text-white"
                    >
                      <ImageIcon className="h-3.5 w-3.5" /> Pick
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                    Background Video URL (optional MP4)
                  </label>
                  <input
                    type="text"
                    value={selected.video_url || ""}
                    onChange={(e) => setSelected({ ...selected, video_url: e.target.value })}
                    placeholder="https://... or /uploads/..."
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                    Primary CTA Label
                  </label>
                  <input
                    type="text"
                    value={selected.cta_primary_label || ""}
                    onChange={(e) =>
                      setSelected({ ...selected, cta_primary_label: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                    Primary CTA Link
                  </label>
                  <input
                    type="text"
                    value={selected.cta_primary_url || ""}
                    onChange={(e) =>
                      setSelected({ ...selected, cta_primary_url: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                    Secondary CTA Label
                  </label>
                  <input
                    type="text"
                    value={selected.cta_secondary_label || ""}
                    onChange={(e) =>
                      setSelected({ ...selected, cta_secondary_label: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                    Secondary CTA Link
                  </label>
                  <input
                    type="text"
                    value={selected.cta_secondary_url || ""}
                    onChange={(e) =>
                      setSelected({ ...selected, cta_secondary_url: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                    Background Theme
                  </label>
                  <select
                    value={selected.background_style}
                    onChange={(e) =>
                      setSelected({ ...selected, background_style: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                  >
                    <option value="cream">Premium Cream</option>
                    <option value="white">Crisp White</option>
                    <option value="deep-green">Deep Forest Green</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                    Publish Status
                  </label>
                  <select
                    value={selected.status}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        status: e.target.value as "published" | "draft",
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#0C3323]">
                    <input
                      type="checkbox"
                      checked={Boolean(selected.is_visible)}
                      onChange={(e) =>
                        setSelected({ ...selected, is_visible: e.target.checked ? 1 : 0 })
                      }
                      className="h-4 w-4 accent-[#164B34]"
                    />
                    Visible on Homepage
                  </label>
                </div>
              </div>

              {/* Dedicated No-Code Visual Editor for Section Cards/Steps/Narrative */}
              {renderVisualContentEditor()}

              {/* Optional Power-User Raw JSON Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowRawJson((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 hover:text-[#164B34]"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  {showRawJson ? "Hide Advanced JSON" : "Show Advanced JSON (Optional)"}
                </button>
                {showRawJson && (
                  <textarea
                    rows={6}
                    value={selected.content_json || "{}"}
                    onChange={(e) => {
                      setSelected({ ...selected, content_json: e.target.value });
                      setStructured(parseJsonObject(e.target.value));
                    }}
                    className="mt-2 w-full rounded-lg border border-gray-200 bg-[#F6F7F2] p-3 font-mono text-xs"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#164B34] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#0C3323] disabled:opacity-60 sm:w-auto"
              >
                <Save className="h-4 w-4 text-[#E0C796]" />
                {saving ? "Saving..." : "Save & Publish Changes"}
              </button>
            </form>
          ) : (
            <p className="py-12 text-center text-sm text-gray-500">
              Select a homepage section on the left to edit.
            </p>
          )}
        </div>
      </div>

      <MediaPickerModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        filterType="image"
        onSelect={(url) => {
          if (selected) setSelected({ ...selected, image_url: url });
        }}
      />
    </div>
  );
}
