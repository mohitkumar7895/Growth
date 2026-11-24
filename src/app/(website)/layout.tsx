import React, { Suspense } from "react";
import {
  getWebsiteSettings,
  getNavigationMenus,
  getServices,
  getPropertyCategories,
} from "@/services/siteData";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import FloatingActions from "@/components/common/FloatingActions";
import TopProgressBar from "@/components/common/TopProgressBar";

export const dynamic = "force-dynamic";

export default async function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, headerMenu, footerQuick, services, categories] =
    await Promise.all([
      getWebsiteSettings(),
      getNavigationMenus("header", true),
      getNavigationMenus("footer_quick", true),
      getServices(true),
      getPropertyCategories(true),
    ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <TopProgressBar />
      </Suspense>
      <SiteHeader settings={settings} menuItems={headerMenu} />
      <main className="flex-1">{children}</main>
      <SiteFooter
        settings={settings}
        quickLinks={footerQuick}
        services={services}
        categories={categories}
      />
      <FloatingActions
        whatsappNumber={settings.whatsapp_number || "918287569844"}
        whatsappMessage={settings.whatsapp_default_message || ""}
        phone={settings.contact_phone || "+91 82875 69844"}
        logoUrl={settings.logo_url || "/images/growth-realtech-logo.png"}
      />
    </div>
  );
}
