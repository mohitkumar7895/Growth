import React from "react";

export default function WebsiteLoading() {
  return (
    <div className="min-h-[70vh] bg-[#F6F7F2] pt-28">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-44 animate-pulse rounded-2xl bg-[#0C3323]/12" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-white shadow-sm" />
          ))}
        </div>
      </div>
    </div>
  );
}
