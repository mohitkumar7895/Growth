import { revalidatePath, revalidateTag } from "next/cache";

export const SITE_CACHE_TAG = "growth-site-data";

export function invalidateSiteCache(extraPaths: string[] = []) {
  try {
    revalidateTag(SITE_CACHE_TAG);
  } catch {
    // Safe fallback outside request scope
  }
  revalidatePath("/", "layout");
  for (const p of extraPaths) {
    revalidatePath(p);
  }
}
