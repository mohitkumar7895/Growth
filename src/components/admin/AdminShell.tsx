"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Navigation,
  Building,
  Building2,
  FolderKanban,
  Briefcase,
  MessageSquareQuote,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Users,
  Mail,
  Inbox,
  Search,
  Scale,
  Settings,
  ScrollText,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import type { AdminSessionUser } from "@/lib/auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  group: string;
}

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: "dashboard.view", group: "Overview" },
  { label: "Enquiries CRM", href: "/admin/enquiries", icon: Inbox, permission: "enquiries.manage", group: "Leads & CRM" },
  { label: "Contact Requests", href: "/admin/contacts", icon: Mail, permission: "contacts.manage", group: "Leads & CRM" },
  { label: "Homepage & About", href: "/admin/homepage", icon: Home, permission: "homepage.manage", group: "Website CMS" },
  { label: "Navigation Menus", href: "/admin/navigation", icon: Navigation, permission: "navigation.manage", group: "Website CMS" },
  { label: "Properties", href: "/admin/properties", icon: Building, permission: "properties.manage", group: "Real Estate" },
  { label: "Featured Projects", href: "/admin/projects", icon: Building2, permission: "projects.manage", group: "Real Estate" },
  { label: "Categories", href: "/admin/categories", icon: FolderKanban, permission: "categories.manage", group: "Real Estate" },
  { label: "Services", href: "/admin/services", icon: Briefcase, permission: "services.manage", group: "Real Estate" },
  { label: "Blogs & Insights", href: "/admin/blogs", icon: FileText, permission: "blogs.manage", group: "Editorial" },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote, permission: "testimonials.manage", group: "Editorial" },
  { label: "FAQs", href: "/admin/faqs", icon: HelpCircle, permission: "faqs.manage", group: "Editorial" },
  { label: "Media Library", href: "/admin/media", icon: ImageIcon, permission: "media.manage", group: "Assets & SEO" },
  { label: "SEO & Sitemap", href: "/admin/seo", icon: Search, permission: "seo.manage", group: "Assets & SEO" },
  { label: "Legal Pages", href: "/admin/legal", icon: Scale, permission: "legal.manage", group: "Assets & SEO" },
  { label: "Settings & Appearance", href: "/admin/settings", icon: Settings, permission: "settings.manage", group: "System" },
  { label: "Users & Roles", href: "/admin/users", icon: Users, permission: "users.manage", group: "System" },
  { label: "Activity Logs", href: "/admin/logs", icon: ScrollText, permission: "logs.view", group: "System" },
];

export default function AdminShell({
  admin,
  brandName = "Growth Realtech",
  logoUrl = "/images/growth-realtech-logo.png",
  children,
}: {
  admin: AdminSessionUser;
  brandName?: string;
  logoUrl?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const canSee = (perm?: string) => {
    if (!perm) return true;
    if (admin.roleSlug === "super_admin") return true;
    return admin.permissions.includes(perm);
  };

  const visibleItems = ADMIN_NAV.filter((i) => canSee(i.permission));
  const groups = Array.from(new Set(visibleItems.map((i) => i.group)));

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#0C3323] text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
        <Link href="/admin" className="flex items-center gap-2.5">
          {logoUrl ? (
            <div className="rounded-lg bg-white/95 px-2.5 py-1 shadow-sm ring-1 ring-[#C6A66C]/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt={brandName}
                className="h-8 w-auto object-contain"
              />
            </div>
          ) : (
            <span className="font-editorial text-lg font-semibold text-white">{brandName}</span>
          )}
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#C6A66C]">
            CMS
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C6A66C]/80">
              {group}
            </p>
            <ul className="space-y-0.5">
              {visibleItems
                .filter((item) => item.group === group)
                .map((item) => {
                  const Icon = item.icon;
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition ${
                          active
                            ? "bg-[#164B34] text-[#E0C796] shadow-sm ring-1 ring-[#C6A66C]/40"
                            : "text-white/75 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 rounded-lg bg-white/5 px-3 py-2.5">
          <p className="truncate text-xs font-semibold text-white">{admin.name}</p>
          <p className="truncate text-[11px] text-[#E0C796]">{admin.roleName}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-white/80 transition hover:border-red-400/50 hover:bg-red-500/15 hover:text-red-200"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F3F5F0]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">{sidebarContent}</aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-64 shrink-0 shadow-2xl">{sidebarContent}</div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Panel */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[#164B34]/10 bg-white px-4 py-3.5 shadow-sm sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin menu"
              className="rounded-lg border border-[#164B34]/15 p-2 text-[#164B34] lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h2 className="font-editorial text-xl font-semibold text-[#0C3323] sm:text-2xl">
              {visibleItems.find((i) =>
                i.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(i.href)
              )?.label || "Admin Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#164B34]/20 bg-[#F6F7F2] px-3.5 py-2 text-xs font-semibold text-[#164B34] transition hover:border-[#C6A66C] hover:bg-white"
            >
              <span>View Live Site</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
