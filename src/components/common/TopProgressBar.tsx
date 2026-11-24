"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Lightweight 0ms-feedback navigation progress bar.
 * Fires immediately on any internal anchor click and completes smoothly on route commit.
 */
export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const finish = () => {
    if (trickleRef.current) {
      clearInterval(trickleRef.current);
      trickleRef.current = null;
    }
    setProgress(100);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 180);
  };

  // Complete bar whenever route or query changes
  useEffect(() => {
    if (visible) {
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString()]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href") || "";
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      try {
        const nextUrl = new URL(anchor.href, window.location.origin);
        if (nextUrl.origin !== window.location.origin) return;
        if (nextUrl.pathname === window.location.pathname && nextUrl.search === window.location.search) {
          return;
        }
      } catch {
        return;
      }

      // Start instant progress feedback
      if (timerRef.current) clearTimeout(timerRef.current);
      if (trickleRef.current) clearInterval(trickleRef.current);
      setVisible(true);
      setProgress(28);
      trickleRef.current = setInterval(() => {
        setProgress((prev) => (prev < 86 ? prev + Math.max(2, (88 - prev) * 0.2) : prev));
      }, 120);
      // Failsafe auto-clear if navigation was aborted
      timerRef.current = setTimeout(() => finish(), 4000);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (trickleRef.current) clearInterval(trickleRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-[3px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-[#C6A66C] via-[#E0C796] to-[#246C49] shadow-[0_0_10px_rgba(198,166,108,0.85)] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
