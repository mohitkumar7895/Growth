import { NextRequest, NextResponse } from "next/server";
import { getProperties } from "@/services/siteData";
import { apiError } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const properties = await getProperties({
      property_type: searchParams.get("property_type") || undefined,
      location: searchParams.get("location") || undefined,
      budget_range: searchParams.get("budget_range") || undefined,
      purpose: searchParams.get("purpose") || undefined,
      property_status: searchParams.get("property_status") || undefined,
      category: searchParams.get("category") || undefined,
      q: searchParams.get("q") || undefined,
    });
    return NextResponse.json({ properties, total: properties.length });
  } catch (err) {
    return apiError(err, "Failed to search properties");
  }
}
