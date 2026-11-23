"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Network error while connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0C3323] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex rounded-2xl bg-white/95 px-5 py-3 shadow-xl ring-1 ring-[#C6A66C]/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/growth-realtech-logo.png"
              alt="Growth Realtech"
              className="h-14 w-auto object-contain"
            />
          </div>
          <p className="mt-1.5 text-xs uppercase tracking-[0.22em] text-[#C6A66C]">
            Authorized Administrative Portal
          </p>
        </div>

        <div className="rounded-2xl border border-[#C6A66C]/30 bg-white p-8 shadow-2xl">
          <div className="mb-6 flex items-center gap-2 text-xs font-medium text-[#246C49]">
            <ShieldCheck className="h-4 w-4 text-[#C6A66C]" />
            <span>Protected HTTP-Only Session Authentication</span>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#164B34]">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#164B34]/45" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@growthrealtech.com"
                  className="w-full rounded-lg border border-[#164B34]/20 bg-[#F6F7F2] py-3 pl-10 pr-4 text-sm text-[#1C2921] focus:border-[#164B34] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#164B34]">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#164B34]/45" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secure password"
                  className="w-full rounded-lg border border-[#164B34]/20 bg-[#F6F7F2] py-3 pl-10 pr-4 text-sm text-[#1C2921] focus:border-[#164B34] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#164B34] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-lg transition hover:bg-[#0C3323] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-[#164B34]/10 pt-5 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#164B34] hover:text-[#C6A66C]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Return to Live Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
