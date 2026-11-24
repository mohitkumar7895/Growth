"use client";

import React, { useEffect, useState } from "react";
import { Save, CheckCircle2, Palette, Globe, PanelBottom, Image as ImageIcon } from "lucide-react";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"general" | "footer" | "appearance">("general");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pickerKey, setPickerKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings || {}));
  }, []);

  const setVal = (k: string, v: string) =>
    setSettings((prev) => ({ ...prev, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group: tab, settings }),
    });
    setSaving(false);
    if (res.ok) {
      setToast("Website settings saved and applied across the live site!");
      setTimeout(() => setToast(null), 3200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "general", label: "General, Contact & Social", icon: Globe },
          { id: "footer", label: "Footer Management", icon: PanelBottom },
          { id: "appearance", label: "Theme & Appearance", icon: Palette },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as typeof tab)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition ${
                tab === t.id
                  ? "bg-[#0C3323] text-[#E0C796]"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-[#F6F7F2]"
              }`}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="rounded-xl border border-[#164B34]/12 bg-white p-6 shadow-sm space-y-6"
      >
        {tab === "general" && (
          <>
            <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
              Brand Identity, Top Bar &amp; Contact Information
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Website Name</label>
                <input
                  value={settings.site_name || ""}
                  onChange={(e) => setVal("site_name", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Tagline</label>
                <input
                  value={settings.site_tagline || ""}
                  onChange={(e) => setVal("site_tagline", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Brand Logo URL</label>
                <div className="flex gap-2">
                  <input
                    value={settings.logo_url || ""}
                    onChange={(e) => setVal("logo_url", e.target.value)}
                    placeholder="Leave blank for Luxury GR Monogram"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setPickerKey("logo_url")}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#F6F7F2] px-3 py-2 text-xs font-semibold text-[#164B34] ring-1 ring-[#164B34]/20"
                  >
                    <ImageIcon className="h-3.5 w-3.5" /> Pick
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Favicon URL</label>
                <div className="flex gap-2">
                  <input
                    value={settings.favicon_url || ""}
                    onChange={(e) => setVal("favicon_url", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setPickerKey("favicon_url")}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#F6F7F2] px-3 py-2 text-xs font-semibold text-[#164B34] ring-1 ring-[#164B34]/20"
                  >
                    <ImageIcon className="h-3.5 w-3.5" /> Pick
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Phone Number</label>
                <input
                  value={settings.contact_phone || ""}
                  onChange={(e) => setVal("contact_phone", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Primary Email (Leads &amp; Contact)</label>
                <input
                  value={settings.contact_email || ""}
                  onChange={(e) => setVal("contact_email", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Official Care Email (care@growthrealtech.in)</label>
                <input
                  value={settings.contact_email_secondary || ""}
                  onChange={(e) => setVal("contact_email_secondary", e.target.value)}
                  placeholder="care@growthrealtech.in"
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Company Location</label>
                <input
                  value={settings.contact_location || ""}
                  onChange={(e) => setVal("contact_location", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Business Timings</label>
                <input
                  value={settings.business_timings || ""}
                  onChange={(e) => setVal("business_timings", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">WhatsApp Number (with country code)</label>
                <input
                  value={settings.whatsapp_number || ""}
                  onChange={(e) => setVal("whatsapp_number", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">WhatsApp Pre-filled Message</label>
                <input
                  value={settings.whatsapp_default_message || ""}
                  onChange={(e) => setVal("whatsapp_default_message", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Top Bar Announcement</label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    value={settings.top_bar_announcement || ""}
                    onChange={(e) => setVal("top_bar_announcement", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm"
                  />
                  <label className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-[#0C3323]">
                    <input
                      type="checkbox"
                      checked={settings.top_bar_enabled !== "false"}
                      onChange={(e) =>
                        setVal("top_bar_enabled", e.target.checked ? "true" : "false")
                      }
                      className="h-4 w-4 accent-[#164B34]"
                    />
                    Show Top Bar
                  </label>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Global SEO Meta Title</label>
                <input
                  value={settings.global_meta_title || ""}
                  onChange={(e) => setVal("global_meta_title", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Global OG Image</label>
                <div className="flex gap-2">
                  <input
                    value={settings.global_og_image || ""}
                    onChange={(e) => setVal("global_og_image", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setPickerKey("global_og_image")}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#F6F7F2] px-3 py-2 text-xs font-semibold text-[#164B34] ring-1 ring-[#164B34]/20"
                  >
                    <ImageIcon className="h-3.5 w-3.5" /> Pick
                  </button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Global SEO Meta Description</label>
                <textarea
                  rows={2}
                  value={settings.global_meta_description || ""}
                  onChange={(e) => setVal("global_meta_description", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-xs"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Google Maps Embed URL</label>
                <input
                  value={settings.google_maps_embed || ""}
                  onChange={(e) => setVal("google_maps_embed", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">LinkedIn URL</label>
                <input
                  value={settings.social_linkedin || ""}
                  onChange={(e) => setVal("social_linkedin", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Instagram URL</label>
                <input
                  value={settings.social_instagram || ""}
                  onChange={(e) => setVal("social_instagram", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">Facebook URL</label>
                <input
                  value={settings.social_facebook || ""}
                  onChange={(e) => setVal("social_facebook", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">YouTube URL</label>
                <input
                  value={settings.social_youtube || ""}
                  onChange={(e) => setVal("social_youtube", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                />
              </div>
            </div>
          </>
        )}

        {tab === "footer" && (
          <>
            <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
              Footer Content Management
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                  Company Description in Footer
                </label>
                <textarea
                  rows={4}
                  value={settings.footer_description || ""}
                  onChange={(e) => setVal("footer_description", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                  Short Advisory / Visual Disclaimer
                </label>
                <textarea
                  rows={3}
                  value={settings.footer_disclaimer_short || ""}
                  onChange={(e) => setVal("footer_disclaimer_short", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                  Copyright Notice
                </label>
                <input
                  value={settings.footer_copyright || ""}
                  onChange={(e) => setVal("footer_copyright", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm"
                />
              </div>
            </div>
          </>
        )}

        {tab === "appearance" && (
          <>
            <h3 className="font-editorial text-2xl font-semibold text-[#0C3323]">
              Brand Theme Colors, Header &amp; 3D Animation Preferences
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[
                { key: "color_primary", label: "Primary Forest Green" },
                { key: "color_deep", label: "Deep Green" },
                { key: "color_secondary", label: "Secondary Green" },
                { key: "color_gold", label: "Luxury Gold" },
                { key: "color_light_gold", label: "Light Gold" },
                { key: "color_cream", label: "Premium Cream" },
                { key: "color_dark_text", label: "Dark Text" },
              ].map((c) => (
                <div key={c.key} className="rounded-lg border border-gray-200 p-3">
                  <label className="block text-[11px] font-semibold text-gray-700">
                    {c.label}
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="color"
                      value={settings[c.key] || "#164B34"}
                      onChange={(e) => setVal(c.key, e.target.value)}
                      className="h-8 w-10 cursor-pointer rounded border-0"
                    />
                    <input
                      type="text"
                      value={settings[c.key] || ""}
                      onChange={(e) => setVal(c.key, e.target.value)}
                      className="w-full rounded border border-gray-200 px-2 py-1 font-mono text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                  Button Corner Style
                </label>
                <select
                  value={settings.button_style || "luxury-sharp"}
                  onChange={(e) => setVal("button_style", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                >
                  <option value="luxury-sharp">Luxury Architectural Sharp</option>
                  <option value="soft-rounded">Soft Rounded</option>
                  <option value="pill">Full Pill Rounded</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                  Header Style
                </label>
                <select
                  value={settings.header_style || "transparent-sticky"}
                  onChange={(e) => setVal("header_style", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                >
                  <option value="transparent-sticky">Transparent-to-Solid Sticky</option>
                  <option value="solid-always">Solid Deep Green Always</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                  Footer Style
                </label>
                <select
                  value={settings.footer_style || "deep-emerald"}
                  onChange={(e) => setVal("footer_style", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                >
                  <option value="deep-emerald">Deep Forest Emerald</option>
                  <option value="charcoal-forest">Dark Charcoal Forest</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                  3D Hero Experience
                </label>
                <select
                  value={settings.three_d_hero_enabled || "true"}
                  onChange={(e) => setVal("three_d_hero_enabled", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                >
                  <option value="true">Enabled (Three.js Architectural Layer)</option>
                  <option value="false">Disabled (Static Image Only)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                  Page Intro &amp; Scroll Animations
                </label>
                <select
                  value={settings.animations_enabled || "true"}
                  onChange={(e) => setVal("animations_enabled", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Minimal</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#164B34]">
                  Dynamic Sitemap (/sitemap.xml)
                </label>
                <select
                  value={settings.sitemap_enabled || "true"}
                  onChange={(e) => setVal("sitemap_enabled", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#164B34] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#0C3323] disabled:opacity-60"
        >
          <Save className="h-4 w-4 text-[#E0C796]" />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>

      <MediaPickerModal
        open={Boolean(pickerKey)}
        onClose={() => setPickerKey(null)}
        filterType="image"
        onSelect={(url) => {
          if (pickerKey) setVal(pickerKey, url);
        }}
      />
    </div>
  );
}
