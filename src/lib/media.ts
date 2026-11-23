import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_MIME_TYPES: Record<string, { ext: string; type: "image" | "video" | "document" }> = {
  "image/jpeg": { ext: "jpg", type: "image" },
  "image/png": { ext: "png", type: "image" },
  "image/webp": { ext: "webp", type: "image" },
  "image/avif": { ext: "avif", type: "image" },
  "image/svg+xml": { ext: "svg", type: "image" },
  "video/mp4": { ext: "mp4", type: "video" },
  "video/webm": { ext: "webm", type: "video" },
  "application/pdf": { ext: "pdf", type: "document" },
};

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export async function uploadMediaFile(
  file: File,
  folder = "general"
): Promise<{
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileType: "image" | "video" | "document";
  mimeType: string;
  fileSize: number;
  storageProvider: "local" | "cloudinary";
  publicId: string | null;
}> {
  const mimeInfo = ALLOWED_MIME_TYPES[file.type];
  if (!mimeInfo) {
    throw new Error(
      `Unsupported file type '${file.type}'. Allowed: JPG, PNG, WebP, AVIF, SVG, MP4, WebM, PDF.`
    );
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("File exceeds maximum allowed size of 15MB.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "") || "general";
  const uniqueId = crypto.randomBytes(8).toString("hex");
  const fileName = `${Date.now()}-${uniqueId}.${mimeInfo.ext}`;

  if (isCloudinaryConfigured()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    const resourceType =
      mimeInfo.type === "video" ? "video" : mimeInfo.type === "document" ? "raw" : "image";

    const uploaded = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `growth-realtech/${safeFolder}`,
            resource_type: resourceType,
          },
          (error, result) => {
            if (error || !result) reject(error || new Error("Cloudinary upload failed"));
            else resolve({ secure_url: result.secure_url, public_id: result.public_id });
          }
        );
        stream.end(buffer);
      }
    );

    return {
      fileName,
      originalName: file.name,
      fileUrl: uploaded.secure_url,
      fileType: mimeInfo.type,
      mimeType: file.type,
      fileSize: file.size,
      storageProvider: "cloudinary",
      publicId: uploaded.public_id,
    };
  }

  // Local storage under public/uploads/<folder>/
  const uploadDir = path.join(process.cwd(), "public", "uploads", safeFolder);
  await fs.mkdir(uploadDir, { recursive: true });
  const diskPath = path.join(uploadDir, fileName);
  await fs.writeFile(diskPath, buffer);

  return {
    fileName,
    originalName: file.name,
    fileUrl: `/uploads/${safeFolder}/${fileName}`,
    fileType: mimeInfo.type,
    mimeType: file.type,
    fileSize: file.size,
    storageProvider: "local",
    publicId: null,
  };
}

export async function deleteMediaStorage(
  fileUrl: string,
  storageProvider: "local" | "cloudinary",
  publicId: string | null,
  fileType: "image" | "video" | "document"
): Promise<void> {
  if (storageProvider === "cloudinary" && publicId && isCloudinaryConfigured()) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    const resourceType =
      fileType === "video" ? "video" : fileType === "document" ? "raw" : "image";
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return;
  }

  if (fileUrl.startsWith("/uploads/")) {
    const diskPath = path.join(process.cwd(), "public", fileUrl);
    await fs.unlink(diskPath).catch(() => {});
  }
}
