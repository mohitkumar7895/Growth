import React from "react";
import { getCurrentAdmin } from "@/lib/auth";
import { getWebsiteSettings } from "@/services/siteData";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return <>{children}</>;
  }

  const settings = await getWebsiteSettings();
  return (
    <AdminShell
      admin={admin}
      brandName={settings.site_name || "Growth Realtech"}
      logoUrl={settings.logo_url || "/images/growth-realtech-logo.png"}
    >
      {children}
    </AdminShell>
  );
}
