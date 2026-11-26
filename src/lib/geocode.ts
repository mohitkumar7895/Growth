export interface DetailedGeoLocation {
  landmark: string | null;
  road: string | null;
  area: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  fullAddress: string;
}

function dedupeParts(parts: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of parts) {
    const clean = (raw || "").trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
  }
  return out;
}

function buildFormattedAddress(d: Omit<DetailedGeoLocation, "fullAddress">, fallback?: string): string {
  const mainParts = dedupeParts([d.landmark, d.road, d.area, d.city, d.state]);
  let combined = mainParts.join(", ");
  if (d.postcode && !combined.includes(d.postcode)) {
    combined = combined ? `${combined} - ${d.postcode}` : d.postcode;
  }
  if (combined.length >= 12) return combined.slice(0, 490);
  return (fallback || combined || "").trim().slice(0, 490);
}

/**
 * High-detail reverse geocoder returning Road, Mohalla/Colony/Area, Landmark,
 * City, State & PIN Code from GPS coordinates.
 */
export async function reverseGeocodeDetailed(
  lat: number,
  lng: number
): Promise<DetailedGeoLocation | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  let landmark: string | null = null;
  let road: string | null = null;
  let area: string | null = null;
  let city: string | null = null;
  let state: string | null = null;
  let postcode: string | null = null;
  let nominatimDisplay = "";

  // 1. Primary: OpenStreetMap Nominatim (zoom=18 gives building, road, mohalla/neighbourhood, suburb, sector)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5500);
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "GrowthRealtechCRM/1.0 (care@growthrealtech.in)",
        "Accept-Language": "en",
      },
      cache: "no-store",
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = (await res.json()) as {
        name?: string;
        display_name?: string;
        address?: Record<string, string>;
      };
      nominatimDisplay = (data.display_name || "").trim();
      const a = data.address || {};

      const landmarkParts = dedupeParts([
        a.house_number,
        data.name || a.building || a.amenity || a.shop || a.office || a.commercial || a.leisure,
      ]);
      landmark = landmarkParts.length ? landmarkParts.join(", ") : null;

      road =
        a.road ||
        a.residential ||
        a.pedestrian ||
        a.footway ||
        a.path ||
        a.highway ||
        null;

      // Capture Mohalla / Colony / Block / Sector / Suburb / Village
      const areaParts = dedupeParts([
        a.neighbourhood,
        a.quarter,
        a.hamlet,
        a.city_block,
        a.suburb,
        a.village,
        a.town,
        a.city_district,
        a.borough,
      ]);
      area = areaParts.length ? areaParts.join(", ") : null;

      city = a.city || a.state_district || a.county || null;
      state = a.state || null;
      postcode = a.postcode || null;
    }
  } catch {
    // Continue to Photon / BigDataCloud enrichment
  }

  // 2. Enrichment / Secondary: Photon (Komoot OSM reverse geocode) if road or area is still missing
  if (!road || !area) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4500);
      const url = `https://photon.komoot.io/reverse?lat=${encodeURIComponent(
        lat
      )}&lon=${encodeURIComponent(lng)}&lang=en`;

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "GrowthRealtechCRM/1.0 (care@growthrealtech.in)" },
        cache: "no-store",
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = (await res.json()) as {
          features?: Array<{
            properties?: {
              name?: string;
              housenumber?: string;
              street?: string;
              district?: string;
              locality?: string;
              city?: string;
              county?: string;
              state?: string;
              postcode?: string;
            };
          }>;
        };
        const p = data.features?.[0]?.properties;
        if (p) {
          if (!landmark && (p.housenumber || p.name)) {
            landmark = dedupeParts([p.housenumber, p.name]).join(", ") || null;
          }
          if (!road && p.street) {
            road = p.street;
          }
          if (!area && (p.locality || p.district)) {
            area = dedupeParts([p.locality, p.district]).join(", ") || null;
          }
          if (!city && (p.city || p.county)) {
            city = p.city || p.county || null;
          }
          if (!state && p.state) state = p.state;
          if (!postcode && p.postcode) postcode = p.postcode;
        }
      }
    } catch {
      // Fall through to BigDataCloud
    }
  }

  // 3. Fallback: BigDataCloud Reverse Geocode if still sparse
  if (!area && !city) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4500);
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(
        lat
      )}&longitude=${encodeURIComponent(lng)}&localityLanguage=en`;

      const res = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = (await res.json()) as {
          locality?: string;
          city?: string;
          principalSubdivision?: string;
          postcode?: string;
          localityInfo?: {
            administrative?: Array<{ name?: string; order?: number }>;
          };
        };
        const fineLocalities = (data.localityInfo?.administrative || [])
          .filter((item) => (item.order || 0) >= 6)
          .map((item) => item.name);
        const areaParts = dedupeParts([data.locality, ...fineLocalities]);
        if (!area && areaParts.length) area = areaParts.join(", ");
        if (!city && data.city) city = data.city;
        if (!state && data.principalSubdivision) state = data.principalSubdivision;
        if (!postcode && data.postcode) postcode = data.postcode;
      }
    } catch {
      // Ignore fallback error
    }
  }

  const fullAddress = buildFormattedAddress(
    { landmark, road, area, city, state, postcode },
    nominatimDisplay
  );

  if (!fullAddress) return null;

  return {
    landmark,
    road,
    area,
    city,
    state,
    postcode,
    fullAddress,
  };
}

export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number
): Promise<string | null> {
  const detailed = await reverseGeocodeDetailed(lat, lng);
  return detailed?.fullAddress || null;
}
