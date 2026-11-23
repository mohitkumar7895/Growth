"use client";

import React, { useState } from "react";
import { MessageCircle, Phone, CalendarCheck } from "lucide-react";
import ModalDialog from "./ModalDialog";
import EnquiryForm from "./EnquiryForm";

export default function FloatingActions({
  whatsappNumber,
  whatsappMessage,
  phone,
}: {
  whatsappNumber: string;
  whatsappMessage: string;
  phone: string;
}) {
  const [open, setOpen] = useState(false);
  const cleanWa = whatsappNumber.replace(/\D/g, "") || "918287569844";
  const waHref = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
    whatsappMessage ||
      "Hello Growth Realtech, I would like to schedule a personalised real estate consultation."
  )}`;

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2 rounded-full border border-[#C6A66C]/50 bg-[#0C3323] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#E0C796] shadow-xl transition hover:-translate-y-0.5 hover:bg-[#164B34]"
        >
          <CalendarCheck className="h-4 w-4 text-[#C6A66C]" />
          <span className="hidden sm:inline">Enquire Now</span>
        </button>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            aria-label={`Call ${phone}`}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#C6A66C]/40 bg-white text-[#164B34] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#F6F7F2]"
          >
            <Phone className="h-4 w-4" />
          </a>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Growth Realtech"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:-translate-y-0.5 hover:brightness-105"
          >
            <MessageCircle className="h-5 w-5" />
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
            setTimeout(() => setOpen(false), 1800);
          }}
        />
      </ModalDialog>
    </>
  );
}
