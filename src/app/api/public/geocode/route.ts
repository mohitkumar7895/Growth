import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { reverseGeocodeDetailed } from "@/lib/geocode";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`geocode:${ip}`, 30, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many location requests." }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return NextResponse.json({ error: "Invalid GPS coordinates." }, { status: 400 });
  }

  const detailed = await reverseGeocodeDetailed(lat, lng);
  return NextResponse.json({
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lng.toFixed(6)),
    address: detailed?.fullAddress || null,
    details: detailed
      ? {
          landmark: detailed.landmark,
          road: detailed.road,
          area: detailed.area,
          city: detailed.city,
          state: detailed.state,
          postcode: detailed.postcode,
        }
      : null,
  });
}
