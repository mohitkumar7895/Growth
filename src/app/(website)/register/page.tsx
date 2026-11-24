import React from "react";
import type { Metadata } from "next";
import { getWebsiteSettings } from "@/services/siteData";
import CustomerRegistrationForm from "@/components/register/CustomerRegistrationForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Customer Registration | Growth Realtech",
  description:
    "Create your OTP-verified Growth Realtech customer profile to receive curated residential, commercial, industrial, and investment property opportunities in Noida, Greater Noida & Yamuna Expressway.",
};

export default async function RegisterPage() {
  const settings = await getWebsiteSettings();

  return (
    <section
      className="min-h-screen px-4 pb-16 pt-32 sm:px-6 sm:pt-40 lg:px-8"
      style={{
        background: "linear-gradient(135deg, #eef4ed 0%, #f8f8f4 100%)",
      }}
    >
      <CustomerRegistrationForm
        phone={settings.contact_phone || "+91 82875 69844"}
        primaryEmail={settings.contact_email || "growthrealtechnoida@gmail.com"}
        careEmail={settings.contact_email_secondary || "care@growthrealtech.in"}
        logoUrl={settings.logo_url || "/images/growth-realtech-logo.png"}
      />
    </section>
  );
}
