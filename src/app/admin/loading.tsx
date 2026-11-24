import React from "react";

export default function AdminLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="h-5 w-64 animate-pulse rounded-lg bg-[#164B34]/10" />
        <div className="h-9 w-32 animate-pulse rounded-lg bg-[#164B34]/15" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-[#164B34]/10 bg-white p-4 shadow-sm" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl border border-[#164B34]/10 bg-white shadow-sm" />
    </div>
  );
}
