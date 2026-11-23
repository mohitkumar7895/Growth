"use client";

import React, { useEffect, useState } from "react";
import { Upload, Trash2, Copy, Check, FileText, Film, Search, Loader2, Save } from "lucide-react";
import type { MediaAsset } from "@/types";

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [cloudinaryEnabled, setCloudinaryEnabled] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [q, setQ] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [altEdits, setAltEdits] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const params = new URLSearchParams();
    if (filterType !== "all") params.set("type", filterType);
    if (q) params.set("q", q);
    const res = await fetch(`/api/admin/media?${params.toString()}`);
    const data = await res.json();
    setAssets(data.assets || []);
    setCloudinaryEnabled(Boolean(data.cloudinaryEnabled));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "library");
        const res = await fetch("/api/admin/media", { method: "POST", body: fd });
        const d = await res.json();
        if (!res.ok) setError(d.error || "Upload failed");
      }
      await load();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const saveAlt = async (asset: MediaAsset) => {
    await fetch("/api/admin/media", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: asset.id,
        alt_text: altEdits[asset.id] ?? asset.alt_text ?? "",
        folder: asset.folder,
      }),
    });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this media file permanently?")) return;
    await fetch(`/api/admin/media?id=${id}`, { method: "DELETE" });
    load();
  };

  const copyUrl = (id: number, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#164B34]/12 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {["all", "image", "video", "document"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold capitalize ${
                filterType === t
                  ? "bg-[#0C3323] text-[#E0C796]"
                  : "bg-[#F6F7F2] text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
          <div className="flex items-center gap-1.5 pl-2">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              placeholder="Search media..."
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
            />
            <button type="button" onClick={load} className="rounded-lg bg-[#164B34] p-2 text-white">
              <Search className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#F6F7F2] px-3 py-1 text-[11px] font-medium text-[#164B34]">
            Storage: {cloudinaryEnabled ? "Cloudinary CDN" : "Local /public/uploads"}
          </span>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#164B34] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0C3323]">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 text-[#E0C796]" />
            )}
            <span>{uploading ? "Uploading..." : "Upload Files"}</span>
            <input type="file" multiple onChange={handleUpload} className="hidden" />
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="overflow-hidden rounded-xl border border-[#164B34]/12 bg-white shadow-sm"
          >
            <div className="flex h-40 w-full items-center justify-center bg-[#0C3323]/5">
              {asset.file_type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={asset.file_url}
                  alt={asset.alt_text || asset.original_name}
                  className="h-full w-full object-cover"
                />
              ) : asset.file_type === "video" ? (
                <Film className="h-10 w-10 text-[#164B34]" />
              ) : (
                <FileText className="h-10 w-10 text-[#164B34]" />
              )}
            </div>
            <div className="space-y-2 p-3 text-xs">
              <p className="truncate font-semibold text-[#0C3323]" title={asset.original_name}>
                {asset.original_name}
              </p>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={altEdits[asset.id] ?? asset.alt_text ?? ""}
                  onChange={(e) =>
                    setAltEdits((prev) => ({ ...prev, [asset.id]: e.target.value }))
                  }
                  placeholder="Alt text for SEO..."
                  className="w-full rounded border border-gray-200 px-2 py-1 text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => saveAlt(asset)}
                  title="Save alt text"
                  className="rounded bg-[#F6F7F2] p-1.5 text-[#164B34] hover:bg-[#164B34] hover:text-white"
                >
                  <Save className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <button
                  type="button"
                  onClick={() => copyUrl(asset.id, asset.file_url)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#164B34] hover:text-[#C6A66C]"
                >
                  {copiedId === asset.id ? (
                    <>
                      <Check className="h-3 w-3" /> Copied URL
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy URL
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(asset.id)}
                  className="rounded p-1 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
