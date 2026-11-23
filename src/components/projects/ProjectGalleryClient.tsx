"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import ModalDialog from "@/components/common/ModalDialog";

interface GalleryImage {
  image_url: string;
  alt_text?: string | null;
  caption?: string | null;
}

export default function ProjectGalleryClient({
  projectName,
  images,
}: {
  projectName: string;
  images: GalleryImage[];
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const safeImages =
    images.length > 0
      ? images
      : [
          {
            image_url: "/images/project-commercial-plaza.jpg",
            alt_text: projectName,
            caption: "Conceptual architectural representation",
          },
        ];

  const current = safeImages[activeIdx] || safeImages[0];

  const prev = () =>
    setActiveIdx((i) => (i - 1 + safeImages.length) % safeImages.length);
  const next = () => setActiveIdx((i) => (i + 1) % safeImages.length);

  return (
    <div className="space-y-4">
      <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[#164B34]/15 bg-[#0C3323] shadow-lg">
        <Image
          src={current.image_url}
          alt={current.alt_text || projectName}
          fill
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute bottom-3 left-4 right-14">
          <p className="text-xs text-white/90">
            {current.caption ||
              "Conceptual architectural representation — confirm actual site photographs on consultation"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Expand image gallery"
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-[#C6A66C] hover:text-[#0C3323]"
        >
          <Expand className="h-4 w-4" />
        </button>

        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-[#0C3323]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-[#0C3323]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {safeImages.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`relative aspect-[16/10] overflow-hidden rounded-xl border-2 transition ${
                i === activeIdx
                  ? "border-[#C6A66C] ring-2 ring-[#C6A66C]/30"
                  : "border-transparent opacity-75 hover:opacity-100"
              }`}
            >
              <Image
                src={img.image_url}
                alt={img.alt_text || `${projectName} gallery ${i + 1}`}
                fill
                loading="lazy"
                sizes="20vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <ModalDialog
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={projectName}
        subtitle={current.caption || "Conceptual architectural representation"}
        maxWidthClass="w-[min(94dvw,56rem)]"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#0C3323]">
          <Image
            src={current.image_url}
            alt={current.alt_text || projectName}
            fill
            fetchPriority="low"
            sizes="90vw"
            className="object-cover"
          />
        </div>
      </ModalDialog>
    </div>
  );
}
