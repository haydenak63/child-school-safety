import sharp from "sharp";
import { AppError } from "@/lib/errors";
import { BiometricError } from "@/lib/biometric/errors";
import type { GrayImage } from "@/lib/biometric/types";

const MAX_BYTES = 2_000_000;
const MIN_DIM = 64;
const MAX_DIM = 2000;

export function decodeDataUrl(image: string): Buffer {
  const match = image.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/i);
  if (!match) {
    const raw = image.startsWith("data:") ? "" : image;
    if (!raw || raw.length < 32) {
      throw new AppError("VALIDATION", "Captured image is missing or invalid.");
    }
    try {
      return Buffer.from(raw, "base64");
    } catch {
      throw new AppError("VALIDATION", "Captured image is not valid base64.");
    }
  }
  return Buffer.from(match[2], "base64");
}

export async function bufferToGrayImage(buffer: Buffer): Promise<GrayImage> {
  if (buffer.byteLength > MAX_BYTES) {
    throw new AppError("VALIDATION", "Captured image is too large. Use a smaller capture.");
  }
  if (buffer.byteLength < 800) {
    throw new AppError("VALIDATION", "Captured image is too small.");
  }

  let meta;
  try {
    meta = await sharp(buffer, { failOn: "error" }).metadata();
  } catch {
    throw new AppError("VALIDATION", "Unable to read the captured image.");
  }

  const format = meta.format ?? "";
  if (!["jpeg", "png", "webp"].includes(format)) {
    throw new AppError("VALIDATION", "Image must be JPEG, PNG, or WebP.");
  }
  if ((meta.width ?? 0) < MIN_DIM || (meta.height ?? 0) < MIN_DIM) {
    throw new BiometricError("QUALITY_POOR", "Fingerprint not clear enough. Please reposition your finger and try again.");
  }
  if ((meta.width ?? 0) > MAX_DIM || (meta.height ?? 0) > MAX_DIM) {
    throw new AppError("VALIDATION", "Captured image dimensions are too large.");
  }

  const { data, info } = await sharp(buffer, { failOn: "error" })
    .rotate()
    .greyscale()
    .resize(192, 256, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  return { data: new Uint8Array(data), width: info.width, height: info.height };
}
