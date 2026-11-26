"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Inbox,
  Sparkles,
  Mail,
  Building2,
  FileText,
  ArrowUpRight,
  Activity,
  Bell,
  FileSpreadsheet,
  Database,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

interface DashboardPayload {
  kpis: {
    totalEnquiries: number;
    newEnquiries: number;
    contactRequests: number;
    newContacts: number;
    propertyEnquiries: number;
    convertedLeads: number;
    totalProjects: number;
    publishedProjects: number;
    totalProperties: number;
    publishedProperties: number;
    totalBlogs: number;
    publishedBlogs: number;
  };
  charts: {
    enquiriesByStatus: { name: string; value: number }[];
    enquiriesByLocation: { name: string; value: number }[];
    monthlyTrend: { month: string; enquiries: number; contacts: number }[];
  };
  recentLeads: Array<{
    id: number;
    name: string;
    phone: string;
    enquiry_type: string;
    property_interest: string | null;
    preferred_location: string | null;
    status: string;
    created_at: string;
  }>;
  recentActivities: Array<{
    id: number;
    admin_name: string;
    action: string;
    module: string;
    details: string | null;
    created_at: string;
  }>;
  notifications: Array<{
    id: number;
    title: string;
    message: string;
    link_url: string | null;
    created_at: string;
  }>;
}

const CHART_COLORS = ["#164B34", "#C6A66C", "#246C49", "#0C3323", "#E0C796", "#4B7F67"];

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");

  const buildExportHref = (dataset: "all" | "enquiries" | "contacts" | "customers") => {
    const params = new URLSearchParams({ dataset });
    if (exportFrom) params.set("from", exportFrom);
    if (exportTo) params.set("to", exportTo);
    return `/api/admin/export?${params.toString()}`;
  };

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-white p-5 shadow-sm" />
        ))}
      </div>
    );
  }

  const kpiCards = [
    { label: "Total Enquiries", value: data.kpis.totalEnquiries, sub: `${data.kpis.newEnquiries} New Leads`, icon: Inbox, href: "/admin/enquiries" },
    { label: "Property & Project Leads", value: data.kpis.propertyEnquiries, sub: `${data.kpis.convertedLeads} Converted`, icon: Sparkles, href: "/admin/enquiries" },
    { label: "Contact Submissions", value: data.kpis.contactRequests, sub: `${data.kpis.newContacts} Unread`, icon: Mail, href: "/admin/contacts" },
    { label: "Projects Portfolio", value: `${data.kpis.publishedProjects}/${data.kpis.totalProjects}`, sub: `${data.kpis.publishedProperties} Active Properties`, icon: Building2, href: "/admin/projects" },
    { label: "Published Insights", value: `${data.kpis.publishedBlogs}/${data.kpis.totalBlogs}`, sub: "Blogs & Guides", icon: FileText, href: "/admin/blogs" },
  ];

  const markAllRead = async () => {
    await fetch("/api/admin/dashboard", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    const r = await fetch("/api/admin/dashboard");
    setData(await r.json());
  };

  return (
    <div className="space-y-6">
      {/* Live Database KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group rounded-xl border border-[#164B34]/10 bg-white p-5 shadow-sm transition hover:border-[#C6A66C] hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0C3323] text-[#E0C796]">
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400 transition group-hover:text-[#164B34]" />
              </div>
              <p className="mt-4 text-xs font-medium text-gray-500">{card.label}</p>
              <p className="mt-1 font-editorial text-3xl font-bold text-[#0C3323]">
                {card.value}
              </p>
              <p className="mt-1 text-[11px] font-medium text-[#246C49]">{card.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Excel Database Export Center */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#C6A66C]/40 bg-white p-4 shadow-sm sm:p-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#246C49]">
            Excel Reporting &amp; Database Backup
          </p>
          <h3 className="mt-0.5 font-editorial text-xl font-semibold text-[#0C3323]">
            Download Enquiries, Contacts &amp; Customer Database (.xlsx)
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            aria-label="Export from date"
            value={exportFrom}
            onChange={(e) => setExportFrom(e.target.value)}
            title="From Date"
            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700"
          />
          <input
            type="date"
            aria-label="Export to date"
            value={exportTo}
            onChange={(e) => setExportTo(e.target.value)}
            title="To Date"
            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700"
          />
          <a
            href={buildExportHref("all")}
            download
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0C3323] px-3.5 py-2 text-xs font-semibold text-[#E0C796] shadow-sm transition hover:bg-[#164B34]"
          >
            <Database className="h-3.5 w-3.5" /> Full Database (.xlsx)
          </a>
          <a
            href={buildExportHref("enquiries")}
            download
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#164B34]/25 bg-[#F6F7F2] px-3 py-2 text-xs font-semibold text-[#0C3323] transition hover:bg-[#E0C796]/30"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-[#164B34]" /> Enquiries
          </a>
          <a
            href={buildExportHref("contacts")}
            download
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#164B34]/25 bg-[#F6F7F2] px-3 py-2 text-xs font-semibold text-[#0C3323] transition hover:bg-[#E0C796]/30"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-[#164B34]" /> Contacts
          </a>
          <a
            href={buildExportHref("customers")}
            download
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#164B34]/25 bg-[#F6F7F2] px-3 py-2 text-xs font-semibold text-[#0C3323] transition hover:bg-[#E0C796]/30"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-[#164B34]" /> Customers
          </a>
        </div>
      </div>

      {/* Real Database Interactive Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Monthly Trend */}
        <div className="rounded-xl border border-[#164B34]/10 bg-white p-6 shadow-sm lg:col-span-7">
          <h3 className="font-editorial text-xl font-semibold text-[#0C3323]">
            Monthly Enquiries &amp; Contact Trend (Last 6 Months)
          </h3>
          <p className="text-xs text-gray-500">Live aggregation from MySQL `enquiries` &amp; `contact_submissions`</p>
          <div className="mt-5 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="enquiries"
                  name="Enquiries"
                  stroke="#164B34"
                  fill="#164B34"
                  fillOpacity={0.22}
                />
                <Area
                  type="monotone"
                  dataKey="contacts"
                  name="Contacts"
                  stroke="#C6A66C"
                  fill="#C6A66C"
                  fillOpacity={0.28}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Status Breakdown */}
        <div className="rounded-xl border border-[#164B34]/10 bg-white p-6 shadow-sm lg:col-span-5">
          <h3 className="font-editorial text-xl font-semibold text-[#0C3323]">
            Lead Pipeline Distribution
          </h3>
          <p className="text-xs text-gray-500">Enquiries grouped by CRM status</p>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.enquiriesByStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={82}
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {data.charts.enquiriesByStatus.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Location Distribution + Notifications */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-[#164B34]/10 bg-white p-6 shadow-sm lg:col-span-7">
          <h3 className="font-editorial text-xl font-semibold text-[#0C3323]">
            Enquiry Demand by Micro-Market / Category
          </h3>
          <div className="mt-5 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.enquiriesByLocation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" name="Leads" fill="#164B34" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-[#164B34]/10 bg-white p-6 shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-editorial text-xl font-semibold text-[#0C3323]">
              <Bell className="h-4 w-4 text-[#C6A66C]" /> Latest Alerts
            </h3>
            <button
              type="button"
              onClick={markAllRead}
              className="text-[11px] font-semibold text-[#164B34] hover:underline"
            >
              Mark all read
            </button>
          </div>
          <ul className="mt-4 space-y-3">
            {data.notifications.slice(0, 5).map((n) => (
              <li
                key={n.id}
                className="rounded-lg border border-[#164B34]/10 bg-[#F6F7F2] p-3 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-[#0C3323]">{n.title}</strong>
                  {n.link_url && (
                    <Link href={n.link_url} className="font-semibold text-[#164B34] hover:underline">
                      Open
                    </Link>
                  )}
                </div>
                <p className="mt-1 text-gray-600">{n.message}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent Leads & Activity Logs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="overflow-hidden rounded-xl border border-[#164B34]/10 bg-white shadow-sm lg:col-span-8">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="font-editorial text-xl font-semibold text-[#0C3323]">
              Recent Client Leads
            </h3>
            <Link href="/admin/enquiries" className="text-xs font-semibold text-[#164B34] hover:underline">
              Manage All Leads →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F7F2] text-[11px] uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Interest</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#F6F7F2]/60">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#0C3323]">{lead.name}</p>
                      <p className="text-gray-500">{lead.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {lead.property_interest || lead.enquiry_type}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {lead.preferred_location || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-[#164B34]/10 px-2.5 py-1 text-[10px] font-semibold text-[#164B34]">
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-[#164B34]/10 bg-white p-6 shadow-sm lg:col-span-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-editorial text-xl font-semibold text-[#0C3323]">
              <Activity className="h-4 w-4 text-[#C6A66C]" /> Recent Activity
            </h3>
            <Link href="/admin/logs" className="text-xs font-semibold text-[#164B34] hover:underline">
              All Logs
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {data.recentActivities.slice(0, 6).map((act) => (
              <li key={act.id} className="border-l-2 border-[#C6A66C] pl-3 text-xs">
                <p className="font-semibold text-[#0C3323]">
                  {act.action} <span className="font-normal text-gray-400">({act.module})</span>
                </p>
                <p className="text-gray-600">{act.details}</p>
                <p className="mt-0.5 text-[10px] text-gray-400">
                  {act.admin_name} • {new Date(act.created_at).toLocaleString("en-IN")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
