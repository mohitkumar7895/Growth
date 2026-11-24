"use client";

import React, { useState } from "react";
import { Phone, CalendarCheck, MessageCircle } from "lucide-react";
import ModalDialog from "./ModalDialog";
import EnquiryForm from "./EnquiryForm";

export default function FloatingActions({
  whatsappNumber,
  whatsappMessage,
  phone,
  logoUrl = "/images/growth-realtech-logo.png",
}: {
  whatsappNumber: string;
  whatsappMessage: string;
  phone: string;
  logoUrl?: string;
}) {
  const [open, setOpen] = useState(false);
  const cleanWa = whatsappNumber.replace(/\D/g, "") || "918287569844";
  const waHref = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
    whatsappMessage ||
      "Hello Growth Realtech, I would like to schedule a personalised real estate consultation."
  )}`;

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2.5 sm:bottom-5 sm:right-5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2 rounded-full border border-[#C6A66C]/50 bg-[#0C3323] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#E0C796] shadow-xl transition hover:-translate-y-0.5 hover:bg-[#164B34]"
        >
          <CalendarCheck className="h-4 w-4 text-[#C6A66C]" />
          <span className="hidden sm:inline">Enquire Now</span>
        </button>

        <div className="flex items-center gap-2.5">
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            aria-label={`Call ${phone}`}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#C6A66C]/45 bg-white text-[#164B34] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#F6F7F2]"
          >
            <Phone className="h-4 w-4" />
          </a>

          {/* WhatsApp Floating Button with Official Company Logo */}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with Growth Realtech on WhatsApp"
            title="WhatsApp Growth Realtech (+91 82875 69844)"
            className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-white p-1.5 shadow-2xl ring-[3px] ring-[#25D366] transition hover:-translate-y-0.5 hover:scale-105 sm:h-16 sm:w-16"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl || "/images/growth-realtech-logo.png"}
              alt="WhatsApp Growth Realtech"
              className="h-full w-full rounded-full object-contain"
            />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md ring-2 ring-white">
              <MessageCircle className="h-3 w-3 fill-current" />
            </span>
          </a>
        </div>
      </div>

      <ModalDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Schedule a Private Consultation"
        subtitle="Direct advisory for Noida, Greater Noida & Yamuna Expressway"
      >
        <EnquiryForm
          defaultEnquiryType="consultation"
          compact
          sourcePage="floating-cta"
          onSuccess={() => {
            setTimeout(() => setOpen(false), 3500);
          }}
        />
      </ModalDialog>
    </>
  );
}
