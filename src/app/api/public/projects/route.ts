import { NextRequest, NextResponse } from "next/server";
import { getProjects } from "@/services/siteData";
import { apiError } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projects = await getProjects({
      region: searchParams.get("region") || undefined,
      category: searchParams.get("category") || undefined,
    });
    return NextResponse.json({ projects, total: projects.length });
  } catch (err) {
    return apiError(err, "Failed to load projects");
  }
}
