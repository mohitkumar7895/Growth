"use client";

import React, { useEffect, useState } from "react";
import { Upload, Check, Search, FileText, Film, Loader2 } from "lucide-react";
import ModalDialog from "@/components/common/ModalDialog";
import type { MediaAsset } from "@/types";

export default function MediaPickerModal({
  open,
  onClose,
  onSelect,
  filterType = "all",
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, asset?: MediaAsset) => void;
  filterType?: "all" | "image" | "video" | "document";
}) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== "all") params.set("type", filterType);
      if (q) params.set("q", q);
      const res = await fetch(`/api/admin/media?${params.toString()}`);
      const data = await res.json();
      setAssets(data.assets || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filterType]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "uploads");
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
      } else if (data.asset) {
        setAssets((prev) => [data.asset, ...prev]);
      }
    } catch {
      setError("Network error while uploading");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Select From Media Library"
      subtitle="Choose an existing asset or upload a new image, video, or PDF brochure"
      maxWidthClass="w-[min(94dvw,56rem)]"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadAssets()}
              placeholder="Search files by name or alt text..."
              className="w-full max-w-xs rounded-lg border border-[#164B34]/20 px-3 py-2 text-xs focus:border-[#164B34] focus:outline-none"
            />
            <button
              type="button"
              onClick={loadAssets}
              className="rounded-lg bg-[#0C3323] px-3 py-2 text-xs font-medium text-white"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#C6A66C] px-4 py-2 text-xs font-semibold text-[#0C3323] transition hover:bg-[#E0C796]">
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            <span>{uploading ? "Uploading..." : "Upload New File"}</span>
            <input type="file" onChange={handleUpload} className="hidden" />
          </label>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500">Loading media...</div>
        ) : (
          <div className="grid max-h-96 grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
            {assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => {
                  onSelect(asset.file_url, asset);
                  onClose();
                }}
                className="group relative overflow-hidden rounded-xl border border-[#164B34]/15 bg-[#F6F7F2] text-left transition hover:border-[#C6A66C] hover:shadow-md"
              >
                <div className="flex h-28 w-full items-center justify-center overflow-hidden bg-[#0C3323]/10">
                  {asset.file_type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.file_url}
                      alt={asset.alt_text || asset.original_name}
                      className="h-full w-full object-cover"
                    />
                  ) : asset.file_type === "video" ? (
                    <Film className="h-8 w-8 text-[#164B34]" />
                  ) : (
                    <FileText className="h-8 w-8 text-[#164B34]" />
                  )}
                </div>
                <div className="p-2">
                  <p className="truncate text-[11px] font-medium text-[#0C3323]">
                    {asset.original_name}
                  </p>
                  <p className="text-[10px] uppercase text-gray-500">{asset.folder}</p>
                </div>
                <span className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-[#164B34] text-white group-hover:flex">
                  <Check className="h-3.5 w-3.5" />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </ModalDialog>
  );
}
