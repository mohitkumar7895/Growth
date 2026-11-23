import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, execute } from "@/lib/db";
import { requireAdmin, logActivity } from "@/lib/auth";
import { uploadMediaFile, deleteMediaStorage, isCloudinaryConfigured } from "@/lib/media";
import { apiError, getClientIp } from "@/lib/security";
import type { MediaAsset } from "@/types";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin("dashboard.view");
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const q = searchParams.get("q");

    const conditions: string[] = [];
    const params: unknown[] = [];
    if (type && type !== "all") {
      conditions.push("file_type = ?");
      params.push(type);
    }
    if (q) {
      conditions.push("(original_name LIKE ? OR alt_text LIKE ? OR folder LIKE ?)");
      const like = `%${q}%`;
      params.push(like, like, like);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const assets = await query<MediaAsset>(
      `SELECT * FROM media_library ${where} ORDER BY created_at DESC`,
      params
    );
    return NextResponse.json({
      assets,
      cloudinaryEnabled: isCloudinaryConfigured(),
    });
  } catch (err) {
    return apiError(err, "Failed to load media library");
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin("media.manage");
    const formData = await req.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "general");
    const altText = String(formData.get("alt_text") || "");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const uploaded = await uploadMediaFile(file, folder);
    const res = await execute(
      `INSERT INTO media_library
        (file_name, original_name, file_url, file_type, mime_type, file_size, alt_text, folder, storage_provider, public_id, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uploaded.fileName,
        uploaded.originalName,
        uploaded.fileUrl,
        uploaded.fileType,
        uploaded.mimeType,
        uploaded.fileSize,
        altText || uploaded.originalName,
        folder,
        uploaded.storageProvider,
        uploaded.publicId,
        admin.id,
      ]
    );

    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "UPLOAD_MEDIA",
      module: "media",
      entityId: res.insertId,
      details: `Uploaded '${uploaded.originalName}' (${uploaded.storageProvider})`,
      ipAddress: getClientIp(req),
    });

    const asset = await queryOne<MediaAsset>(
      "SELECT * FROM media_library WHERE id = ?",
      [res.insertId]
    );
    return NextResponse.json({ success: true, asset }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && (err.message.includes("Unsupported") || err.message.includes("exceeds"))) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return apiError(err, "Failed to upload media file");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin("media.manage");
    const b = await req.json();
    const id = Number(b.id);
    if (!id) return NextResponse.json({ error: "Media ID required" }, { status: 400 });

    await execute(
      "UPDATE media_library SET alt_text = ?, folder = ? WHERE id = ?",
      [b.alt_text || "", b.folder || "general", id]
    );
    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "UPDATE_MEDIA",
      module: "media",
      entityId: id,
      details: `Updated alt text for media #${id}`,
      ipAddress: getClientIp(req),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to update media asset");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin("media.manage");
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Media ID required" }, { status: 400 });

    const asset = await queryOne<MediaAsset>(
      "SELECT * FROM media_library WHERE id = ?",
      [id]
    );
    if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

    await deleteMediaStorage(
      asset.file_url,
      asset.storage_provider,
      asset.public_id,
      asset.file_type
    );
    await execute("DELETE FROM media_library WHERE id = ?", [id]);

    await logActivity({
      adminId: admin.id,
      adminName: admin.name,
      action: "DELETE_MEDIA",
      module: "media",
      entityId: id,
      details: `Deleted media '${asset.original_name}'`,
      ipAddress: getClientIp(req),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to delete media asset");
  }
}
