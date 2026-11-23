"use client";

import React, { useRef, useState } from "react";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, Eye } from "lucide-react";

export default function RichTextEditor({
  value,
  onChange,
  rows = 10,
  placeholder = "Write rich content here...",
}: {
  value: string;
  onChange: (val: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);

  const wrapSelection = (before: string, after: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || "Text";
    const updated =
      value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(updated);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[#164B34]/20 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#164B34]/10 bg-[#F6F7F2] px-3 py-2">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            title="Heading 2"
            onClick={() => wrapSelection("<h2>", "</h2>\n")}
            className="rounded p-1.5 text-[#164B34] hover:bg-white"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Heading 3"
            onClick={() => wrapSelection("<h3>", "</h3>\n")}
            className="rounded p-1.5 text-[#164B34] hover:bg-white"
          >
            <Heading3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Bold"
            onClick={() => wrapSelection("<strong>", "</strong>")}
            className="rounded p-1.5 text-[#164B34] hover:bg-white"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Italic"
            onClick={() => wrapSelection("<em>", "</em>")}
            className="rounded p-1.5 text-[#164B34] hover:bg-white"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Paragraph"
            onClick={() => wrapSelection("<p>", "</p>\n")}
            className="rounded px-2 py-1 text-xs font-semibold text-[#164B34] hover:bg-white"
          >
            P
          </button>
          <button
            type="button"
            title="Bullet List"
            onClick={() => wrapSelection("<ul>\n  <li>", "</li>\n</ul>\n")}
            className="rounded p-1.5 text-[#164B34] hover:bg-white"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Numbered List"
            onClick={() => wrapSelection("<ol>\n  <li>", "</li>\n</ol>\n")}
            className="rounded p-1.5 text-[#164B34] hover:bg-white"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Insert Link"
            onClick={() => wrapSelection('<a href="https://">', "</a>")}
            className="rounded p-1.5 text-[#164B34] hover:bg-white"
          >
            <Link2 className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setPreview((v) => !v)}
          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${
            preview ? "bg-[#164B34] text-white" : "text-[#164B34] hover:bg-white"
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          {preview ? "Edit HTML" : "Preview"}
        </button>
      </div>

      {preview ? (
        <div
          className="gr-prose min-h-[12rem] p-4 text-sm"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-4 font-mono text-xs leading-relaxed text-[#1C2921] focus:outline-none"
        />
      )}
    </div>
  );
}
