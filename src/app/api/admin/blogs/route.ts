import { NextRequest, NextResponse } from "next/server";
import { invalidateSiteCache } from "@/lib/cache";
import { query, queryOne, execute } from "@/lib/db";
import { requireAdmin, logActivity } from "@/lib/auth";
import { blogSchema } from "@/lib/validations";
import { apiError, getClientIp, slugify, sanitizeHtmlBasic } from "@/lib/security";

export async function GET() {
  try {
    await requireAdmin("blogs.manage");
    const [blogs, categories, tags] = await Promise.all([
      query(
        `SELECT b.*, bc.name AS category_name
         FROM blogs b
         LEFT JOIN blog_categories bc ON bc.id = b.category_id
         ORDER BY b.created_at DESC`
      ),
      query("SELECT * FROM blog_categories ORDER BY sort_order ASC, name ASC"),
      query("SELECT * FROM blog_tags ORDER BY name ASC"),
    ]);

    const rels = await query<{ blog_id: number; name: string }>(
      `SELECT btr.blog_id, bt.name
       FROM blog_tag_relations btr
       JOIN blog_tags bt ON bt.id = btr.tag_id`
    );
    const tagMap = new Map<number, string[]>();
    for (const r of rels) {
      const arr = tagMap.get(r.blog_id) || [];
      arr.push(r.name);
      tagMap.set(r.blog_id, arr);
    }

    const enriched = (blogs as Array<{ id: number }>).map((b) => ({
      ...b,
      tag_names: tagMap.get(b.id) || [],
    }));

    return NextResponse.json({ blogs: enriched, categories, tags });
  } catch (err) {
    return apiError(err, "Failed to load blogs");
  }
}

async function syncBlogTags(blogId: number, tagNames?: string[]) {
  if (!Array.isArray(tagNames)) return;
  await execute("DELETE FROM blog_tag_relations WHERE blog_id = ?", [blogId]);
  for (const raw of tagNames) {
    const clean = raw.trim();
    if (!clean) continue;
    const tSlug = slugify(clean);
    await execute(
      "INSERT IGNORE INTO blog_tags (name, slug) VALUES (?, ?)",
      [clean, tSlug]
    );
    const tag = await queryOne<{ id: number }>(
      "SELECT id FROM blog_tags WHERE slug = ? LIMIT 1",
      [tSlug]
    );
    if (tag) {
      await execute(
        "INSERT IGNORE INTO blog_tag_relations (blog_id, tag_id) VALUES (?, ?)",
        [blogId, tag.id]
      );
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin("blogs.manage");
    const body = await req.json();
    const parsed = blogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid blog article data" },
        { status: 400 }
      );
    }
    const d = parsed.data;
    const slug = slugify(d.slug || d.title);
    const pubDate =
      d.published_at || (d.status === "published" ? new Date().toISOString().slice(0, 19).replace("T", " ") : null);

    const res = await execute(
      `INSERT INTO blogs
        (title, slug, category_id, author_id, author_name, excerpt, content, featured_image,
         reading_time, status, published_at, meta_title, meta_description, canonical_url, og_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.title,
        slug,
        d.category_id || null,
        admin.id,
        d.author_name || admin.name,
        d.excerpt || null,
        sanitizeHtmlBasic(d.content),
        d.featured_image || null,
        d.reading_time || "5 min read",
        d.status,
        pubDate,
        d.meta_title || `${d.title} | Growth Realtech`,
        d.meta_description || d.excerpt || null,
        d.canonical_url || null,
        d.og_image || d.featured_image || null,
      ]
    );

    await syncBlogTags(res.insertId, d.tags);

    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "CREATE_BLOG",
      module: "blogs",
      entityId: res.insertId,
      details: `Created blog '${d.title}' (${d.status})`,
      ipAddress: getClientIp(req),
    });

    invalidateSiteCache(["/insights"]);
    return NextResponse.json({ success: true, id: res.insertId, slug }, { status: 201 });
  } catch (err) {
    return apiError(err, "Failed to create blog post");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin("blogs.manage");
    const body = await req.json();
    const id = Number(body.id);
    if (!id) return NextResponse.json({ error: "Blog ID required" }, { status: 400 });

    const parsed = blogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid blog article data" },
        { status: 400 }
      );
    }
    const d = parsed.data;
    const slug = slugify(d.slug || d.title);
    const pubDate =
      d.published_at || (d.status === "published" ? new Date().toISOString().slice(0, 19).replace("T", " ") : null);

    await execute(
      `UPDATE blogs SET
        title = ?, slug = ?, category_id = ?, author_name = ?, excerpt = ?, content = ?,
        featured_image = ?, reading_time = ?, status = ?, published_at = ?,
        meta_title = ?, meta_description = ?, canonical_url = ?, og_image = ?
       WHERE id = ?`,
      [
        d.title,
        slug,
        d.category_id || null,
        d.author_name || admin.name,
        d.excerpt || null,
        sanitizeHtmlBasic(d.content),
        d.featured_image || null,
        d.reading_time || "5 min read",
        d.status,
        pubDate,
        d.meta_title || `${d.title} | Growth Realtech`,
        d.meta_description || d.excerpt || null,
        d.canonical_url || null,
        d.og_image || d.featured_image || null,
        id,
      ]
    );

    await syncBlogTags(id, d.tags);

    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "UPDATE_BLOG",
      module: "blogs",
      entityId: id,
      details: `Updated blog '${d.title}'`,
      ipAddress: getClientIp(req),
    });

    invalidateSiteCache(["/insights"]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to update blog post");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin("blogs.manage");
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Blog ID required" }, { status: 400 });
    await execute("DELETE FROM blogs WHERE id = ?", [id]);
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "DELETE_BLOG",
      module: "blogs",
      entityId: id,
      details: `Deleted blog post #${id}`,
      ipAddress: getClientIp(req),
    });
    invalidateSiteCache(["/insights"]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to delete blog post");
  }
}
