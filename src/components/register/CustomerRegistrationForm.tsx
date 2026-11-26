"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Lock,
  CheckCircle2,
  MessageCircle,
  ArrowUpRight,
  Loader2,
  Mail,
  MapPin,
  Clock,
  Navigation,
} from "lucide-react";

const COUNTRY_CODES = [
  { code: "+91", label: "+91 India" },
  { code: "+65", label: "+65 Singapore" },
  { code: "+971", label: "+971 UAE" },
  { code: "+1", label: "+1 USA" },
];

const REQUIREMENTS = [
  "Buy a property",
  "Investment",
  "Sell / Resale",
  "Rent / Lease",
  "Commercial space",
];

const PROPERTY_TYPE_OPTIONS = [
  "Residential",
  "Commercial",
  "Industrial / Warehouse",
  "Plots / Land",
  "Pre-rented property",
  "Not sure yet",
];

const LOCATION_OPTIONS = [
  "Noida",
  "Greater Noida",
  "Greater Noida West",
  "Yamuna Expressway",
  "Other Delhi NCR",
  "Other",
];

const BUDGET_OPTIONS = [
  "Below ₹50 lakh",
  "₹50 lakh – ₹1 crore",
  "₹1 – ₹2 crore",
  "₹2 – ₹5 crore",
  "Above ₹5 crore",
  "To be discussed",
];

interface GeoAddressDetails {
  landmark: string | null;
  road: string | null;
  area: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
}

interface GeoCoordsState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  address: string | null;
  details: GeoAddressDetails | null;
  errorMessage: string | null;
  resolvingAddress: boolean;
  status: "idle" | "locating" | "captured" | "denied" | "unsupported";
}

interface CompletedRecord {
  date: string;
  time: string;
  coordinates: string | null;
  geoAddress?: string | null;
  mapsUrl: string | null;
}

export default function CustomerRegistrationForm({
  phone = "+91 82875 69844",
  primaryEmail = "growthrealtechnoida@gmail.com",
  careEmail = "care@growthrealtech.in",
  logoUrl = "/images/growth-realtech-logo.png",
}: {
  phone?: string;
  primaryEmail?: string;
  careEmail?: string;
  logoUrl?: string;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    mobile: "",
    requirement: "",
    type: "",
    location: "",
    budget: "",
    address: "",
    details: "",
    consent: false,
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [verificationToken, setVerificationToken] = useState("");

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completedRecord, setCompletedRecord] = useState<CompletedRecord | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [invalidField, setInvalidField] = useState<string | null>(null);

  const [liveStamp, setLiveStamp] = useState<{ date: string; time: string }>({
    date: "",
    time: "",
  });

  const [geo, setGeo] = useState<GeoCoordsState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    address: null,
    details: null,
    errorMessage: null,
    resolvingAddress: false,
    status: "idle",
  });

  const geoWatchIdRef = useRef<number | null>(null);
  const geoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<{
    text: string;
    type: "info" | "success" | "error";
  } | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const reqRef = useRef<HTMLSelectElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const locRef = useRef<HTMLSelectElement>(null);
  const budgetRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const date = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(now);
      const time = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(now);
      setLiveStamp({ date, time: `${time} IST` });
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const resolveAddressFromCoords = async (lat: number, lng: number) => {
    setGeo((prev) => ({ ...prev, resolvingAddress: true }));
    try {
      const res = await fetch(
        `/api/public/geocode?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`
      );
      if (res.ok) {
        const data = await res.json();
        setGeo((prev) => ({
          ...prev,
          address: data.address || prev.address,
          details: data.details || prev.details,
          resolvingAddress: false,
        }));
      } else {
        setGeo((prev) => ({ ...prev, resolvingAddress: false }));
      }
    } catch {
      setGeo((prev) => ({ ...prev, resolvingAddress: false }));
    }
  };

  const stopGeoWatch = () => {
    if (geoWatchIdRef.current !== null && typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
      geoWatchIdRef.current = null;
    }
    if (geoTimerRef.current) {
      clearTimeout(geoTimerRef.current);
      geoTimerRef.current = null;
    }
  };

  const captureCoordinates = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGeo((prev) => ({ ...prev, status: "unsupported" }));
      return;
    }
    stopGeoWatch();
    setGeo((prev) => ({ ...prev, status: "locating" }));

    let bestAccuracy = Infinity;
    let lastResolvedLat: number | null = null;
    let lastResolvedLng: number | null = null;

    const handlePosition = (pos: GeolocationPosition) => {
      const acc = Math.round(pos.coords.accuracy);
      const lat = Number(pos.coords.latitude.toFixed(6));
      const lng = Number(pos.coords.longitude.toFixed(6));

      // Always keep the most accurate GPS fix received
      if (acc < bestAccuracy) {
        bestAccuracy = acc;
        setGeo((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          accuracy: acc,
          status: "captured",
        }));

        const movedSignificantly =
          lastResolvedLat === null ||
          lastResolvedLng === null ||
          Math.abs(lat - lastResolvedLat) > 0.0002 ||
          Math.abs(lng - lastResolvedLng) > 0.0002;

        if (movedSignificantly) {
          lastResolvedLat = lat;
          lastResolvedLng = lng;
          void resolveAddressFromCoords(lat, lng);
        }

        // Stop watching once we lock an accurate fix (<= 30 meters)
        if (acc <= 30) {
          stopGeoWatch();
        }
      }
    };

    const handleError = (err?: GeolocationPositionError) => {
      stopGeoWatch();
      let msg = "Location permission not granted. Allow Location in browser settings.";
      if (typeof window !== "undefined" && !window.isSecureContext) {
        msg = "GPS requires HTTPS on live domains.";
      } else if (err?.code === 2) {
        msg = "GPS signal unavailable on this device.";
      } else if (err?.code === 3) {
        msg = "Location lookup timed out — click Refresh Accurate GPS to retry.";
      }
      setGeo((prev) =>
        prev.status === "captured"
          ? prev
          : { ...prev, status: "denied", errorMessage: msg }
      );
    };

    setGeo((prev) => ({ ...prev, errorMessage: null }));

    // 1. Immediate high-accuracy fix (triggers browser permission prompt reliably)
    navigator.geolocation.getCurrentPosition(handlePosition, handleError, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0,
    });

    // 2. Refine GPS lock for up to 7 seconds to capture the most accurate reading
    geoWatchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    geoTimerRef.current = setTimeout(() => {
      stopGeoWatch();
    }, 7000);
  };

  useEffect(() => {
    captureCoordinates();
    return () => stopGeoWatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentFullPhone = () =>
    `${form.countryCode}${form.mobile.replace(/\D/g, "")}`;

  const currentCleanEmail = () => form.email.trim().toLowerCase();

  const resetOtpState = () => {
    setVerified(false);
    setVerifiedEmail("");
    setVerificationToken("");
    setOtpSent(false);
    setOtp("");
  };

  const handleEmailChange = (email: string) => {
    setForm((prev) => ({ ...prev, email }));
    if (invalidField === "email") setInvalidField(null);
    if (verified && email.trim().toLowerCase() !== verifiedEmail) {
      resetOtpState();
    }
  };

  const handleSendOtp = async () => {
    setStatus(null);
    setInvalidField(null);

    const email = currentCleanEmail();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInvalidField("email");
      setStatus({
        text: "Please enter a valid email address to receive the OTP.",
        type: "error",
      });
      emailRef.current?.focus();
      return;
    }

    setSendingOtp(true);
    try {
      const res = await fetch("/api/public/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: form.name.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ text: data.error || "Unable to send Email OTP.", type: "error" });
      } else {
        setOtpSent(true);
        setStatus({
          text: data.message || "OTP sent to your email address. Please check your inbox.",
          type: "success",
        });
        setTimeout(() => otpInputRef.current?.focus(), 60);
      }
    } catch {
      setStatus({ text: "Network error while sending Email OTP.", type: "error" });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanOtp = otp.trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      setInvalidField("otp");
      setStatus({ text: "Please enter the 6-digit Email OTP.", type: "error" });
      otpInputRef.current?.focus();
      return;
    }
    setVerifyingOtp(true);
    setStatus(null);
    setInvalidField(null);
    try {
      const email = currentCleanEmail();
      const res = await fetch("/api/public/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: cleanOtp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInvalidField("otp");
        setStatus({ text: data.error || "Invalid OTP.", type: "error" });
      } else {
        setVerified(true);
        setVerifiedEmail(email);
        setVerificationToken(data.verificationToken);
        setStatus({
          text: data.message || "Your email address has been successfully verified.",
          type: "success",
        });
      }
    } catch {
      setStatus({ text: "Network error while verifying OTP.", type: "error" });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvalidField(null);

    if (!form.name.trim()) {
      setInvalidField("name");
      setStatus({ text: "Please enter your full name.", type: "error" });
      nameRef.current?.focus();
      return;
    }

    const mobileDigits = form.mobile.replace(/\D/g, "");
    if (mobileDigits.length < 8 || mobileDigits.length > 15) {
      setInvalidField("mobile");
      setStatus({ text: "Please enter a valid mobile number.", type: "error" });
      mobileRef.current?.focus();
      return;
    }

    const email = currentCleanEmail();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInvalidField("email");
      setStatus({ text: "Please enter a valid email address.", type: "error" });
      emailRef.current?.focus();
      return;
    }

    if (!verified || verifiedEmail !== email || !verificationToken) {
      setInvalidField("otp");
      setStatus({
        text: "Please verify your email address using Email OTP before completing registration.",
        type: "error",
      });
      otpInputRef.current?.focus();
      return;
    }

    if (!form.requirement) {
      setInvalidField("requirement");
      setStatus({ text: "Please select what you are interested in.", type: "error" });
      reqRef.current?.focus();
      return;
    }
    if (!form.type) {
      setInvalidField("type");
      setStatus({ text: "Please select a property type.", type: "error" });
      typeRef.current?.focus();
      return;
    }
    if (!form.location) {
      setInvalidField("location");
      setStatus({ text: "Please select a preferred location.", type: "error" });
      locRef.current?.focus();
      return;
    }
    if (!form.budget) {
      setInvalidField("budget");
      setStatus({ text: "Please select an approximate budget.", type: "error" });
      budgetRef.current?.focus();
      return;
    }
    if (!form.consent) {
      setInvalidField("consent");
      setStatus({ text: "Please provide consent to continue.", type: "error" });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/public/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          email,
          phone: currentFullPhone(),
          verificationMethod: "email",
          verificationToken,
          latitude: geo.latitude,
          longitude: geo.longitude,
          locationAccuracy: geo.accuracy,
          geoAddress: geo.address,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({
          text: data.error || "Unable to complete registration.",
          type: "error",
        });
      } else {
        setCompleted(true);
        setCompletedRecord(data.registrationRecord || null);
        setWhatsappUrl(data.whatsappUrl || null);
        setStatus({
          text:
            data.message ||
            "Registration completed successfully. Thank you for choosing Growth Realtech.",
          type: "success",
        });
        setForm({
          name: "",
          email: "",
          countryCode: "+91",
          mobile: "",
          requirement: "",
          type: "",
          location: "",
          budget: "",
          address: "",
          details: "",
          consent: false,
        });
        resetOtpState();
      }
    } catch {
      setStatus({ text: "Network error while completing registration.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const step2Active = verified || completed;
  const step3Active = completed;

  return (
    <div className="mx-auto w-full max-w-[780px] overflow-hidden rounded-[24px] border border-[#dfe7df] bg-white shadow-[0_24px_70px_rgba(23,60,41,0.13)]">
      {/* Header matching Growth Realtech brand */}
      <div className="flex items-center justify-between gap-4 bg-[#123528] px-5 py-6 text-white sm:px-8 sm:py-7">
        <div className="flex items-center gap-3.5">
          {logoUrl ? (
            <div className="rounded-xl bg-white/98 px-2.5 py-1.5 shadow-md ring-1 ring-[#C6A66C]/45">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt="Growth Realtech"
                className="h-11 w-auto object-contain sm:h-12"
              />
            </div>
          ) : (
            <div className="grid h-12 w-12 place-items-center rounded-[14px] border border-white/35 font-serif text-2xl text-[#d7e7c2]">
              G
            </div>
          )}
          <div>
            <b className="block text-[15px] tracking-[0.13em] text-white sm:text-[17px]">
              GROWTH REALTECH
            </b>
            <small className="mt-0.5 block text-[10px] tracking-[0.12em] text-[#c6d7ca]">
              TRUST · TRANSPARENCY · SAFE INVESTMENT
            </small>
          </div>
        </div>
        <div className="hidden text-right text-[11px] uppercase leading-snug tracking-[0.12em] text-[#d7e7c2] sm:block">
          Open Customer
          <br />
          Registration
        </div>
      </div>

      {/* Main Card Body */}
      <div className="p-5 sm:p-8 sm:pb-9">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#286044]">
          Open Registration Link · Email OTP Verified
        </div>
        <h1
          id="reg-form-heading"
          className="mt-1.5 font-sans text-2xl font-bold tracking-[-0.03em] text-[#123528] sm:text-[30px]"
        >
          Create your customer profile
        </h1>
        <p className="mt-1.5 text-sm text-[#69776e]">
          Register your details with Email OTP verification to receive curated residential, commercial, and investment property opportunities.
        </p>

        {/* 3-Step Progress Bars */}
        <div className="my-5 flex gap-2" aria-label="Registration progress">
          <span className="h-[5px] flex-1 rounded-full bg-[#286044]" />
          <span
            className={`h-[5px] flex-1 rounded-full transition-colors ${
              step2Active ? "bg-[#286044]" : "bg-[#e8eee8]"
            }`}
          />
          <span
            className={`h-[5px] flex-1 rounded-full transition-colors ${
              step3Active ? "bg-[#286044]" : "bg-[#e8eee8]"
            }`}
          />
        </div>

        {/* Live Date, Time & GPS Co-ordinates Audit Strip */}
        <div className="mb-6 rounded-xl border border-[#164B34]/15 bg-[#F6F7F2] px-4 py-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[#1C2921]">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Clock className="h-3.5 w-3.5 text-[#286044]" aria-hidden="true" />
                <span className="tabular-nums">
                  {liveStamp.date ? `${liveStamp.date} · ${liveStamp.time}` : "Recording IST Timestamp..."}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <MapPin className="h-3.5 w-3.5 text-[#286044]" aria-hidden="true" />
                {geo.status === "captured" && geo.latitude !== null && geo.longitude !== null ? (
                  <span className="tabular-nums text-[#164B34]">
                    GPS: {geo.latitude.toFixed(6)}, {geo.longitude.toFixed(6)}
                    {geo.accuracy ? ` (±${geo.accuracy}m)` : ""}
                  </span>
                ) : geo.status === "locating" ? (
                  <span className="text-[#536258]">Detecting high-accuracy GPS…</span>
                ) : (
                  <span className="text-[#69776e]">
                    {geo.errorMessage || "GPS co-ordinates not captured yet"}
                  </span>
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={captureCoordinates}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#164B34]/25 bg-white px-3 py-1.5 text-[11px] font-bold text-[#123528] transition hover:border-[#164B34] hover:bg-[#edf3ed]"
            >
              <Navigation className="h-3 w-3 text-[#286044]" aria-hidden="true" />
              {geo.status === "captured" ? "Refresh Accurate GPS" : "Capture GPS Co-ordinates"}
            </button>
          </div>
          {(geo.address || geo.resolvingAddress) && (
            <div className="mt-2 space-y-1 border-t border-[#164B34]/10 pt-2 text-[11px] leading-relaxed text-[#286044]">
              {geo.details && (geo.details.road || geo.details.area || geo.details.landmark) && (
                <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                  {geo.details.road && (
                    <span>
                      <strong className="text-[#123528]">Road:</strong> {geo.details.road}
                    </span>
                  )}
                  {geo.details.area && (
                    <span>
                      <strong className="text-[#123528]">Area / Mohalla:</strong> {geo.details.area}
                    </span>
                  )}
                  {geo.details.city && (
                    <span>
                      <strong className="text-[#123528]">City:</strong> {geo.details.city}
                      {geo.details.postcode ? ` - ${geo.details.postcode}` : ""}
                    </span>
                  )}
                </div>
              )}
              <p>
                <strong className="text-[#123528]">Current Location:</strong>{" "}
                {geo.address || "Resolving Road, Area / Mohalla from GPS..."}
              </p>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          action="/api/public/customers"
          method="POST"
          aria-labelledby="reg-form-heading"
          noValidate
        >
          {/* Section 01: Personal Information */}
          <div className="mb-3.5 mt-2 border-b border-[#dfe7df] pb-2 text-[13px] font-extrabold text-[#123528]">
            01 &nbsp; Personal information &amp; Email OTP verification
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="reg-name"
                className="mb-1.5 block text-[11px] font-bold text-[#536258]"
              >
                Full name <span aria-hidden="true">*</span>
              </label>
              <input
                ref={nameRef}
                id="reg-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                enterKeyHint="next"
                aria-invalid={invalidField === "name" ? "true" : undefined}
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (invalidField === "name") setInvalidField(null);
                }}
                placeholder="Enter your full name"
                className="min-h-[48px] w-full rounded-[11px] border border-[#dce5dc] bg-[#fcfdfb] px-3.5 py-3 text-base text-[#1d2b23] outline-none focus:border-[#5a916c] focus:ring-2 focus:ring-[#397b54]/15 sm:text-sm"
              />
            </div>

            {/* Mobile Number (Entry Only — No Mobile OTP) */}
            <div>
              <label
                htmlFor="reg-mobile"
                className="mb-1.5 block text-[11px] font-bold text-[#536258]"
              >
                Mobile number <span aria-hidden="true">*</span>
              </label>
              <div className="grid grid-cols-[110px_1fr] gap-2">
                <select
                  id="reg-country"
                  name="countryCode"
                  aria-label="Country dialing code"
                  value={form.countryCode}
                  onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                  className="min-h-[48px] rounded-[11px] border border-[#dce5dc] bg-[#fcfdfb] px-2 py-3 text-base text-[#1d2b23] outline-none focus:border-[#5a916c] sm:text-sm"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  ref={mobileRef}
                  id="reg-mobile"
                  name="mobile"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  enterKeyHint="next"
                  required
                  maxLength={15}
                  aria-invalid={invalidField === "mobile" ? "true" : undefined}
                  value={form.mobile}
                  onChange={(e) => {
                    setForm({ ...form, mobile: e.target.value });
                    if (invalidField === "mobile") setInvalidField(null);
                  }}
                  placeholder="10-digit mobile number"
                  className="min-h-[48px] w-full rounded-[11px] border border-[#dce5dc] bg-[#fcfdfb] px-3.5 py-3 text-base tabular-nums text-[#1d2b23] outline-none focus:border-[#5a916c] focus:ring-2 focus:ring-[#397b54]/15 sm:text-sm"
                />
              </div>
            </div>

            {/* Email Address + Email OTP Verification */}
            <div className="rounded-2xl border border-[#164B34]/15 bg-[#F8FAF7] p-4 sm:col-span-2">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-[#123528]">
                <Mail className="h-3.5 w-3.5 text-[#286044]" aria-hidden="true" />
                <span>Email Address &amp; OTP Verification *</span>
              </div>

              <div className="mt-3">
                <label
                  htmlFor="reg-email"
                  className="mb-1.5 block text-[11px] font-bold text-[#536258]"
                >
                  Email address <span aria-hidden="true">*</span>
                </label>
                <input
                  ref={emailRef}
                  id="reg-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="next"
                  aria-invalid={invalidField === "email" ? "true" : undefined}
                  value={form.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="name@example.com"
                  className="min-h-[48px] w-full rounded-[11px] border border-[#dce5dc] bg-white px-3.5 py-3 text-base text-[#1d2b23] outline-none focus:border-[#5a916c] focus:ring-2 focus:ring-[#397b54]/15 sm:text-sm"
                />
                <p id="otp-helper-text" className="mt-1.5 text-[11px] text-[#536258]">
                  A 6-digit one-time password (OTP) will be sent to your email address for verification.
                </p>
              </div>

              {/* Inline Email OTP Input & Buttons */}
              <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label
                    htmlFor="reg-otp"
                    className="mb-1.5 block text-[11px] font-bold text-[#536258]"
                  >
                    Enter 6-digit Email OTP
                  </label>
                  <input
                    ref={otpInputRef}
                    id="reg-otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    enterKeyHint="done"
                    maxLength={6}
                    aria-describedby="otp-helper-text"
                    aria-invalid={invalidField === "otp" ? "true" : undefined}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ""));
                      if (invalidField === "otp") setInvalidField(null);
                    }}
                    placeholder="6-digit Email OTP"
                    disabled={!otpSent || verified}
                    className="min-h-[48px] w-full rounded-[11px] border border-[#dce5dc] bg-white px-3.5 py-3 text-base font-bold tracking-[0.28em] tabular-nums text-[#1d2b23] outline-none focus:border-[#5a916c] disabled:bg-[#f0f3ef] disabled:text-[#758078] sm:text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || verified}
                  className="inline-flex min-h-[48px] items-center justify-center gap-1.5 whitespace-nowrap rounded-[11px] border border-[#dce7dc] bg-[#edf3ed] px-4 py-3 text-[13px] font-bold text-[#123528] transition hover:bg-[#dce9dc] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sendingOtp && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {otpSent && !verified ? "Resend Email OTP" : "Send Email OTP"}
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={!otpSent || verifyingOtp || verified}
                  className="inline-flex min-h-[48px] items-center justify-center gap-1.5 whitespace-nowrap rounded-[11px] border border-[#dce7dc] bg-[#123528] px-5 py-3 text-[13px] font-bold text-white transition hover:bg-[#286044] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {verifyingOtp && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Verify OTP
                </button>
              </div>

              {verified && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#277044]">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span>Email verified ({verifiedEmail})</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 02: Property Requirement */}
          <div className="mb-3.5 mt-7 border-b border-[#dfe7df] pb-2 text-[13px] font-extrabold text-[#123528]">
            02 &nbsp; Property requirement
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="reg-requirement"
                className="mb-1.5 block text-[11px] font-bold text-[#536258]"
              >
                I am interested in <span aria-hidden="true">*</span>
              </label>
              <select
                ref={reqRef}
                id="reg-requirement"
                name="requirement"
                required
                aria-invalid={invalidField === "requirement" ? "true" : undefined}
                value={form.requirement}
                onChange={(e) => {
                  setForm({ ...form, requirement: e.target.value });
                  if (invalidField === "requirement") setInvalidField(null);
                }}
                className="min-h-[48px] w-full rounded-[11px] border border-[#dce5dc] bg-[#fcfdfb] px-3.5 py-3 text-base text-[#1d2b23] outline-none focus:border-[#5a916c] sm:text-sm"
              >
                <option value="">Select requirement</option>
                {REQUIREMENTS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="reg-type"
                className="mb-1.5 block text-[11px] font-bold text-[#536258]"
              >
                Property type <span aria-hidden="true">*</span>
              </label>
              <select
                ref={typeRef}
                id="reg-type"
                name="type"
                required
                aria-invalid={invalidField === "type" ? "true" : undefined}
                value={form.type}
                onChange={(e) => {
                  setForm({ ...form, type: e.target.value });
                  if (invalidField === "type") setInvalidField(null);
                }}
                className="min-h-[48px] w-full rounded-[11px] border border-[#dce5dc] bg-[#fcfdfb] px-3.5 py-3 text-base text-[#1d2b23] outline-none focus:border-[#5a916c] sm:text-sm"
              >
                <option value="">Select property type</option>
                {PROPERTY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="reg-location"
                className="mb-1.5 block text-[11px] font-bold text-[#536258]"
              >
                Preferred location <span aria-hidden="true">*</span>
              </label>
              <select
                ref={locRef}
                id="reg-location"
                name="location"
                required
                aria-invalid={invalidField === "location" ? "true" : undefined}
                value={form.location}
                onChange={(e) => {
                  setForm({ ...form, location: e.target.value });
                  if (invalidField === "location") setInvalidField(null);
                }}
                className="min-h-[48px] w-full rounded-[11px] border border-[#dce5dc] bg-[#fcfdfb] px-3.5 py-3 text-base text-[#1d2b23] outline-none focus:border-[#5a916c] sm:text-sm"
              >
                <option value="">Select location</option>
                {LOCATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="reg-budget"
                className="mb-1.5 block text-[11px] font-bold text-[#536258]"
              >
                Approximate budget <span aria-hidden="true">*</span>
              </label>
              <select
                ref={budgetRef}
                id="reg-budget"
                name="budget"
                required
                aria-invalid={invalidField === "budget" ? "true" : undefined}
                value={form.budget}
                onChange={(e) => {
                  setForm({ ...form, budget: e.target.value });
                  if (invalidField === "budget") setInvalidField(null);
                }}
                className="min-h-[48px] w-full rounded-[11px] border border-[#dce5dc] bg-[#fcfdfb] px-3.5 py-3 text-base text-[#1d2b23] outline-none focus:border-[#5a916c] sm:text-sm"
              >
                <option value="">Select budget</option>
                {BUDGET_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="reg-address"
                className="mb-1.5 block text-[11px] font-bold text-[#536258]"
              >
                Address / City
              </label>
              <input
                id="reg-address"
                name="address"
                type="text"
                autoComplete="street-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Enter your city or address"
                className="min-h-[48px] w-full rounded-[11px] border border-[#dce5dc] bg-[#fcfdfb] px-3.5 py-3 text-base text-[#1d2b23] outline-none focus:border-[#5a916c] sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="reg-details"
                className="mb-1.5 block text-[11px] font-bold text-[#536258]"
              >
                Additional requirement
              </label>
              <textarea
                id="reg-details"
                name="details"
                rows={3}
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                placeholder="Preferred project, configuration, size, timeline or any other details"
                className="w-full rounded-[11px] border border-[#dce5dc] bg-[#fcfdfb] px-3.5 py-3 text-base text-[#1d2b23] outline-none focus:border-[#5a916c] sm:text-sm"
              />
            </div>
          </div>

          {/* Consent */}
          <div className="my-5 flex items-start gap-2.5 text-xs text-[#69776e]">
            <input
              id="reg-consent"
              name="consent"
              type="checkbox"
              required
              checked={form.consent}
              onChange={(e) => {
                setForm({ ...form, consent: e.target.checked });
                if (invalidField === "consent") setInvalidField(null);
              }}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#123528]"
            />
            <label htmlFor="reg-consent" className="cursor-pointer leading-relaxed">
              I agree that Growth Realtech may contact me by phone, SMS, WhatsApp or email regarding my property enquiry and log my registration date, time, and location co-ordinates. I have read the{" "}
              <Link href="/privacy-policy" className="font-semibold text-[#123528] underline">
                privacy notice
              </Link>
              .
            </label>
          </div>

          {/* Status Message & Recorded Audit Stamp */}
          {status && (
            <div
              role="status"
              aria-live="polite"
              className={`my-4 rounded-[12px] px-4 py-3.5 text-xs font-medium ${
                status.type === "success"
                  ? "border border-[#27623a]/20 bg-[#edf7ef] text-[#27623a]"
                  : status.type === "error"
                  ? "border border-[#9b3d32]/20 bg-[#fff0ee] text-[#9b3d32]"
                  : "bg-[#eef4fa] text-[#315674]"
              }`}
            >
              <p>{status.text}</p>

              {completedRecord && (
                <div className="mt-3 rounded-lg bg-white/80 p-3 text-[11px] text-[#123528]">
                  <p className="font-bold uppercase tracking-wider text-[#286044]">
                    Registration Audit Record Saved
                  </p>
                  <div className="mt-1.5 grid grid-cols-1 gap-1 sm:grid-cols-2">
                    <p>
                      <strong>Date:</strong> {completedRecord.date}
                    </p>
                    <p>
                      <strong>Time:</strong> {completedRecord.time}
                    </p>
                    <p className="sm:col-span-2">
                      <strong>GPS Co-ordinates:</strong>{" "}
                      {completedRecord.coordinates ? (
                        completedRecord.mapsUrl ? (
                          <a
                            href={completedRecord.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#164B34] underline"
                          >
                            {completedRecord.coordinates} (View on Map)
                          </a>
                        ) : (
                          completedRecord.coordinates
                        )
                      ) : (
                        "Not shared by browser"
                      )}
                    </p>
                    {completedRecord.geoAddress && (
                      <p className="sm:col-span-2">
                        <strong>GPS Address:</strong> {completedRecord.geoAddress}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-105"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Send Registration Details on WhatsApp ({phone})
                </a>
              )}
            </div>
          )}

          {/* Actions Row */}
          <div className="mt-5 flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-[#69776e]">
              <Lock className="h-3.5 w-3.5 text-[#286044]" aria-hidden="true" />
              Secured with Email OTP validation, timestamp &amp; geo-location record.
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-1.5 rounded-[11px] bg-[#c7a56a] px-6 py-3 text-[13px] font-bold text-[#17271f] shadow-md transition hover:bg-[#d8b87d] disabled:opacity-50 sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving Profile...
                </>
              ) : (
                <>
                  <span>Complete registration</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Footer Strip */}
      <div className="flex flex-col justify-between gap-1 border-t border-[#dfe7df] bg-[#f7f9f6] px-5 py-4 text-[11px] text-[#69776e] sm:flex-row sm:px-8">
        <span>Growth Realtech · Noida, India</span>
        <span className="tabular-nums">
          {phone} · {careEmail} · {primaryEmail}
        </span>
      </div>
    </div>
  );
}
