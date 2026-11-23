"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PageLoader({
  brandName = "Growth Realtech",
  logoUrl = "/images/growth-realtech-logo.png",
}: {
  brandName?: string;
  logoUrl?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const seen = sessionStorage.getItem("gr_intro_seen");
    if (!seen) {
      setVisible(true);
      sessionStorage.setItem("gr_intro_seen", "1");
      const timer = setTimeout(() => setVisible(false), 380);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.28, ease: "easeOut" } }}
          className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0C3323]/96 text-white"
        >
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-center"
          >
            {logoUrl ? (
              <div className="mx-auto mb-4 inline-flex rounded-2xl bg-white/95 px-6 py-4 shadow-2xl ring-1 ring-[#C6A66C]/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt={brandName}
                  className="h-16 w-auto object-contain"
                />
              </div>
            ) : (
              <>
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl border border-[#C6A66C]/60 bg-[#164B34]">
                  <span className="font-editorial text-2xl font-bold text-[#E0C796]">GR</span>
                </div>
                <p className="font-editorial text-3xl tracking-wide text-white">{brandName}</p>
              </>
            )}
            <div className="mx-auto mt-3 h-[2px] w-28 overflow-hidden rounded-full bg-white/15">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 0.85, ease: "easeInOut" }}
                className="h-full w-full bg-[#C6A66C]"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
