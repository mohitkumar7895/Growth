"use client";

import React, { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";

interface LogRow {
  id: number;
  admin_name: string;
  action: string;
  module: string;
  entity_id: string | null;
  details: string | null;
  ip_address: string | null;
  created_at: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [mod, setMod] = useState("all");

  useEffect(() => {
    fetch(`/api/admin/logs?module=${mod}`)
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || []));
  }, [mod]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#164B34]/12 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#0C3323]">
          <ScrollText className="h-4 w-4 text-[#C6A66C]" />
          System Audit &amp; Activity Logs
        </div>
        <select
          value={mod}
          onChange={(e) => setMod(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
        >
          <option value="all">All Modules</option>
          {["auth", "homepage", "navigation", "properties", "projects", "categories", "services", "blogs", "enquiries", "contacts", "media", "settings", "seo", "legal", "users"].map(
            (m) => (
              <option key={m} value={m}>{m}</option>
            )
          )}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#164B34]/12 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F7F2] text-[11px] uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-[#F6F7F2]/50">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                    {new Date(l.created_at).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#0C3323]">{l.admin_name}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#164B34]">{l.action}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{l.module}</td>
                  <td className="px-4 py-3 text-gray-700">{l.details || "—"}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-gray-400">
                    {l.ip_address || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
