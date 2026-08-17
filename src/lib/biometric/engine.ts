import { BiometricError } from "@/lib/biometric/errors";
import type {
  FingerprintService,
  FingerprintTemplatePayload,
  GrayImage,
  MatchResult,
  Template,
} from "@/lib/biometric/types";

const WIDTH = 192;
const HEIGHT = 256;
const PATCH = 32;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function at(image: GrayImage, x: number, y: number): number {
  const sx = clamp(Math.round(x), 0, image.width - 1);
  const sy = clamp(Math.round(y), 0, image.height - 1);
  return image.data[sy * image.width + sx];
}

function resize(image: GrayImage, width: number, height: number): GrayImage {
  const data = new Uint8Array(width * height);
  const xRatio = image.width / width;
  const yRatio = image.height / height;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sx = (x + 0.5) * xRatio - 0.5;
      const sy = (y + 0.5) * yRatio - 0.5;
      const x0 = Math.floor(sx);
      const y0 = Math.floor(sy);
      const dx = sx - x0;
      const dy = sy - y0;
      const v00 = at(image, x0, y0);
      const v10 = at(image, x0 + 1, y0);
      const v01 = at(image, x0, y0 + 1);
      const v11 = at(image, x0 + 1, y0 + 1);
      data[y * width + x] = Math.round(
        v00 * (1 - dx) * (1 - dy) + v10 * dx * (1 - dy) + v01 * (1 - dx) * dy + v11 * dx * dy,
      );
    }
  }
  return { data, width, height };
}

function equalize(image: GrayImage): GrayImage {
  const hist = new Array<number>(256).fill(0);
  for (const value of image.data) hist[value] += 1;
  const cdf = new Array<number>(256).fill(0);
  cdf[0] = hist[0];
  for (let i = 1; i < 256; i++) cdf[i] = cdf[i - 1] + hist[i];
  const cdfMin = cdf.find((value) => value > 0) ?? 0;
  const denom = image.data.length - cdfMin || 1;
  const map = cdf.map((value) => Math.round(((value - cdfMin) / denom) * 255));
  const data = new Uint8Array(image.data.length);
  for (let i = 0; i < image.data.length; i++) data[i] = map[image.data[i]];
  return { data, width: image.width, height: image.height };
}

function stats(data: Uint8Array): { mean: number; std: number } {
  let sum = 0;
  for (const value of data) sum += value;
  const mean = sum / data.length;
  let variance = 0;
  for (const value of data) variance += (value - mean) ** 2;
  return { mean, std: Math.sqrt(variance / data.length) };
}

function laplacianVariance(image: GrayImage): number {
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  for (let y = 1; y < image.height - 1; y++) {
    for (let x = 1; x < image.width - 1; x++) {
      const value =
        at(image, x, y - 1) +
        at(image, x - 1, y) +
        at(image, x + 1, y) +
        at(image, x, y + 1) -
        4 * at(image, x, y);
      sum += value;
      sumSq += value * value;
      count += 1;
    }
  }
  const mean = sum / count;
  return sumSq / count - mean * mean;
}

function coverage(image: GrayImage): number {
  const { mean } = stats(image.data);
  const threshold = Math.min(220, mean + 12);
  let finger = 0;
  const insetX = Math.round(image.width * 0.18);
  const insetY = Math.round(image.height * 0.12);
  let total = 0;
  for (let y = insetY; y < image.height - insetY; y++) {
    for (let x = insetX; x < image.width - insetX; x++) {
      total += 1;
      const nx = (x + 0.5) / image.width * 2 - 1;
      const ny = (y + 0.5) / image.height * 2 - 1;
      if (nx * nx + ny * ny * 0.7 > 1) continue;
      if (at(image, x, y) < threshold) finger += 1;
    }
  }
  return total === 0 ? 0 : finger / total;
}

function alignToCentroid(image: GrayImage): GrayImage {
  const { mean } = stats(image.data);
  const threshold = mean - 4;
  let sumX = 0;
  let sumY = 0;
  let count = 0;
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      if (at(image, x, y) < threshold) {
        sumX += x;
        sumY += y;
        count += 1;
      }
    }
  }
  if (count < 40) return image;
  const cx = sumX / count;
  const cy = sumY / count;
  const dx = Math.round(image.width / 2 - cx);
  const dy = Math.round(image.height / 2 - cy);
  if (dx === 0 && dy === 0) return image;

  const data = new Uint8Array(image.data.length);
  data.fill(245);
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const sx = x - dx;
      const sy = y - dy;
      if (sx < 0 || sy < 0 || sx >= image.width || sy >= image.height) continue;
      data[y * image.width + x] = at(image, sx, sy);
    }
  }
  return { data, width: image.width, height: image.height };
}

function extractLbp(image: GrayImage): number[] {
  const hist = new Array<number>(256).fill(0);
  const neighbors = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
  ];
  for (let y = 1; y < image.height - 1; y++) {
    for (let x = 1; x < image.width - 1; x++) {
      const center = at(image, x, y);
      let code = 0;
      for (let i = 0; i < 8; i++) {
        const [ox, oy] = neighbors[i];
        if (at(image, x + ox, y + oy) >= center) code |= 1 << i;
      }
      hist[code] += 1;
    }
  }
  return l2Normalize(hist);
}

function extractHog(image: GrayImage): number[] {
  const cellsX = 8;
  const cellsY = 8;
  const bins = 9;
  const cellW = image.width / cellsX;
  const cellH = image.height / cellsY;
  const hist = new Array<number>(cellsX * cellsY * bins).fill(0);

  for (let y = 1; y < image.height - 1; y++) {
    for (let x = 1; x < image.width - 1; x++) {
      const gx = at(image, x + 1, y) - at(image, x - 1, y);
      const gy = at(image, x, y + 1) - at(image, x, y - 1);
      const mag = Math.hypot(gx, gy);
      if (mag < 1) continue;
      let angle = Math.atan2(gy, gx);
      if (angle < 0) angle += Math.PI;
      const bin = Math.min(bins - 1, Math.floor((angle / Math.PI) * bins));
      const cx = Math.min(cellsX - 1, Math.floor(x / cellW));
      const cy = Math.min(cellsY - 1, Math.floor(y / cellH));
      hist[(cy * cellsX + cx) * bins + bin] += mag;
    }
  }
  return l2Normalize(hist);
}

function extractPatch(image: GrayImage): number[] {
  const small = resize(image, PATCH, PATCH);
  const { mean, std } = stats(small.data);
  const denom = std < 1 ? 1 : std;
  return Array.from(small.data, (value) => (value - mean) / denom);
}

function extractDhash(image: GrayImage): string {
  const small = resize(image, 9, 8);
  let bits = BigInt(0);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const left = at(small, x, y);
      const right = at(small, x + 1, y);
      if (left > right) bits |= BigInt(1) << BigInt(y * 8 + x);
    }
  }
  return bits.toString(16).padStart(16, "0");
}

function l2Normalize(values: number[]): number[] {
  let sumSq = 0;
  for (const value of values) sumSq += value * value;
  const denom = Math.sqrt(sumSq) || 1;
  return values.map((value) => value / denom);
}

function cosine(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

function hammingHex(a: string, b: string): number {
  const left = BigInt(`0x${a}`);
  const right = BigInt(`0x${b}`);
  let xor = left ^ right;
  let count = 0;
  while (xor > BigInt(0)) {
    xor &= xor - BigInt(1);
    count += 1;
  }
  return count;
}

export function assessQuality(image: GrayImage): {
  quality: number;
  coverage: number;
  blur: number;
  contrast: number;
} {
  const cover = coverage(image);
  const blur = laplacianVariance(image);
  const contrast = stats(image.data).std;
  const coverScore = clamp(cover / 0.42, 0, 1);
  const blurScore = clamp(blur / 80, 0, 1);
  const contrastScore = clamp(contrast / 40, 0, 1);
  const quality = coverScore * 0.45 + blurScore * 0.3 + contrastScore * 0.25;
  return { quality, coverage: cover, blur, contrast };
}

export function assertUsableFingerprint(image: GrayImage): void {
  const quality = assessQuality(image);
  if (quality.coverage < 0.16) {
    throw new BiometricError(
      "NO_FINGERPRINT",
      "No fingerprint detected. Place your finger inside the guide and try again.",
      { coverage: quality.coverage },
    );
  }
  if (quality.blur < 8 || quality.contrast < 10 || quality.quality < 0.22) {
    throw new BiometricError(
      "QUALITY_POOR",
      "Fingerprint not clear enough. Please reposition your finger and try again.",
      { blur: quality.blur, contrast: quality.contrast, quality: quality.quality },
    );
  }
}

function preprocess(image: GrayImage): GrayImage {
  const sized =
    image.width === WIDTH && image.height === HEIGHT ? image : resize(image, WIDTH, HEIGHT);
  return equalize(alignToCentroid(sized));
}

function payloadFromPrepared(prepared: GrayImage): FingerprintTemplatePayload {
  const quality = assessQuality(prepared);
  const features = createTemplateFeatures(prepared);
  return {
    version: 1,
    algorithm: "camera-texture-v1",
    provider: "camera",
    width: prepared.width,
    height: prepared.height,
    lbp: features.lbp,
    hog: features.hog,
    patch: features.patch,
    dhash: features.dhash,
    quality: quality.quality,
  };
}

export function createTemplate(image: GrayImage): FingerprintTemplatePayload {
  return payloadFromPrepared(preprocess(image));
}

function createTemplateFeatures(image: GrayImage) {
  return {
    lbp: extractLbp(image),
    hog: extractHog(image),
    patch: extractPatch(image),
    dhash: extractDhash(image),
  };
}

export function serializeTemplate(payload: FingerprintTemplatePayload): Template {
  return {
    format: payload.algorithm,
    data: JSON.stringify(payload),
    quality: payload.quality,
  };
}

export function parseTemplate(template: Template): FingerprintTemplatePayload {
  const payload = JSON.parse(template.data) as FingerprintTemplatePayload;
  if (payload.algorithm !== "camera-texture-v1" || !payload.lbp || !payload.hog || !payload.patch) {
    throw new BiometricError("NO_MATCH", "Stored fingerprint template is not compatible with this provider.");
  }
  return payload;
}

function scoreAgainst(probe: FingerprintTemplatePayload, candidate: FingerprintTemplatePayload) {
  const ncc = cosine(probe.patch, candidate.patch);
  const lbp = cosine(probe.lbp, candidate.lbp);
  const hog = cosine(probe.hog, candidate.hog);
  const dhash = 1 - hammingHex(probe.dhash, candidate.dhash) / 64;
  const combined = ncc * 0.4 + lbp * 0.25 + hog * 0.25 + dhash * 0.1;
  return { ncc, lbp, hog, dhash, combined };
}

function shiftedProbe(image: GrayImage, dx: number, dy: number): GrayImage {
  if (dx === 0 && dy === 0) return image;
  const data = new Uint8Array(image.data.length);
  data.fill(245);
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const sx = x - dx;
      const sy = y - dy;
      if (sx < 0 || sy < 0 || sx >= image.width || sy >= image.height) continue;
      data[y * image.width + x] = at(image, sx, sy);
    }
  }
  return { data, width: image.width, height: image.height };
}

export function matchTemplate(
  image: GrayImage,
  candidate: FingerprintTemplatePayload,
): MatchResult {
  const prepared = preprocess(image);
  const quality = assessQuality(prepared);
  let best = scoreAgainst(payloadFromPrepared(prepared), candidate);

  for (const [dx, dy] of [
    [8, 0],
    [-8, 0],
    [0, 8],
    [0, -8],
  ] as const) {
    const shifted = payloadFromPrepared(shiftedProbe(prepared, dx, dy));
    const score = scoreAgainst(shifted, candidate);
    if (score.combined > best.combined) best = score;
  }

  return {
    matched: false,
    score: best.combined,
    confidence: clamp(best.combined, 0, 1),
    quality: quality.quality,
  };
}

export function identifyTemplate(
  image: GrayImage,
  gallery: Array<{ studentId: string; template: FingerprintTemplatePayload }>,
  threshold: number,
): MatchResult {
  assertUsableFingerprint(image);
  let best: MatchResult | undefined;

  for (const item of gallery) {
    const result = matchTemplate(image, item.template);
    if (!best || result.score > best.score) {
      best = { ...result, studentId: item.studentId };
    }
  }

  if (!best) {
    throw new BiometricError(
      "NO_MATCH",
      "No student matched. Enroll a fingerprint before using this terminal.",
    );
  }

  const matched = best.score >= threshold;
  return {
    ...best,
    matched,
    studentId: matched ? best.studentId : undefined,
    confidence: clamp(best.score, 0, 1),
  };
}

export const fingerprintService: FingerprintService = {
  enroll(image) {
    assertUsableFingerprint(image);
    return serializeTemplate(createTemplate(image));
  },
  createTemplate,
  match(image, template) {
    return matchTemplate(image, template);
  },
  identify(image, templates, threshold) {
    return identifyTemplate(image, templates, threshold);
  },
};

export function generateRidgeImage(
  width: number,
  height: number,
  options: { frequency: number; angle: number; phase?: number; noise?: number; seed?: number },
): GrayImage {
  const data = new Uint8Array(width * height);
  const phase = options.phase ?? 0;
  const noise = options.noise ?? 0;
  let seed = options.seed ?? 1;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const cos = Math.cos(options.angle);
  const sin = Math.sin(options.angle);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = (x + 0.5) / width * 2 - 1;
      const ny = (y + 0.5) / height * 2 - 1;
      const inside = nx * nx + ny * ny * 0.72 <= 1;
      if (!inside) {
        data[y * width + x] = 245;
        continue;
      }
      const projected = x * cos + y * sin;
      const ridge = 118 + 90 * Math.sin(projected * options.frequency + phase);
      const jitter = noise ? (rand() - 0.5) * noise : 0;
      data[y * width + x] = clamp(ridge + jitter, 0, 255);
    }
  }
  return { data, width, height };
}
