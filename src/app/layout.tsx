import type { Metadata } from "next";
import { getWebsiteSettings } from "@/services/siteData";
import { buildOrganizationJsonLd } from "@/lib/seo";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.global_meta_title || "Growth Realtech | Real Estate Consulting Noida",
      template: `%s | ${settings.site_name || "Growth Realtech"}`,
    },
    description: settings.global_meta_description,
    icons: settings.favicon_url ? { icon: settings.favicon_url } : undefined,
    openGraph: {
      type: "website",
      siteName: settings.site_name || "Growth Realtech",
      title: settings.global_meta_title,
      description: settings.global_meta_description,
      images: settings.global_og_image ? [{ url: settings.global_og_image }] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getWebsiteSettings();
  const orgJsonLd = buildOrganizationJsonLd(settings);

  const btnRadius =
    settings.button_style === "pill"
      ? "9999px"
      : settings.button_style === "soft-rounded"
      ? "0.85rem"
      : "0.4rem";

  const dynamicThemeVars = `
    :root {
      --gr-primary: ${settings.color_primary || "#164B34"};
      --gr-deep: ${settings.color_deep || "#0C3323"};
      --gr-secondary: ${settings.color_secondary || "#246C49"};
      --gr-gold: ${settings.color_gold || "#C6A66C"};
      --gr-light-gold: ${settings.color_light_gold || "#E0C796"};
      --gr-cream: ${settings.color_cream || "#F6F7F2"};
      --gr-dark: ${settings.color_dark_text || "#1C2921"};
      --gr-btn-radius: ${btnRadius};
    }
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
        />
        <style dangerouslySetInnerHTML={{ __html: dynamicThemeVars }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="min-h-screen antialiased selection:bg-[#C6A66C]/30 selection:text-[#0C3323]">
        {children}
      </body>
    </html>
  );
}
