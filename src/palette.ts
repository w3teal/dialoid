import { inflateSync } from "zlib";
import { colors } from "./theme";

/** Warm gradient stops used when the image cannot be sampled. */
export const FALLBACK_PALETTE = ["#3d352d", "#332d27", "#282420"];

const TINT_STRENGTH = 0.4;
const TINT = [1, 3, 5].map((offset) =>
  parseInt(colors.background.slice(offset, offset + 2), 16),
);

function readU32(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3]) >>>
    0
  );
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

/** Decodes an 8-bit RGB/RGBA PNG into flat RGBA pixels. */
function decodePng(bytes: Uint8Array): Uint8Array {
  if (bytes.length < 8) throw new Error("empty PNG");

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const compressed: Uint8Array[] = [];

  while (offset + 12 <= bytes.length) {
    const length = readU32(bytes, offset);
    const type = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7],
    );
    const data = bytes.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      width = readU32(data, 0);
      height = readU32(data, 4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === "IDAT") {
      compressed.push(data);
    } else if (type === "IEND") {
      break;
    }

    offset += 12 + length;
  }

  if (
    !width ||
    !height ||
    bitDepth !== 8 ||
    interlace !== 0 ||
    (colorType !== 2 && colorType !== 6)
  ) {
    throw new Error("unsupported PNG layout");
  }

  const channels = colorType === 2 ? 3 : 4;
  const total = compressed.reduce((sum, chunk) => sum + chunk.length, 0);
  const pngData = new Uint8Array(total);
  let copied = 0;
  for (const chunk of compressed) {
    pngData.set(chunk, copied);
    copied += chunk.length;
  }

  const raw = inflateSync(pngData);
  const stride = width * channels;
  const previous = new Uint8Array(stride);
  const current = new Uint8Array(stride);
  const pixels = new Uint8Array(width * height * 4);
  let position = 0;
  let target = 0;

  for (let y = 0; y < height; y++) {
    const filter = raw[position++];

    for (let i = 0; i < stride; i++) {
      const left = i >= channels ? current[i - channels] : 0;
      const up = previous[i];
      const upLeft = i >= channels ? previous[i - channels] : 0;

      let value = raw[position + i];
      if (filter === 1) value += left;
      else if (filter === 2) value += up;
      else if (filter === 3) value += Math.floor((left + up) / 2);
      else if (filter === 4) value += paeth(left, up, upLeft);

      current[i] = value & 0xff;
    }

    for (let x = 0; x < width; x++) {
      const base = x * channels;
      pixels[target++] = current[base];
      pixels[target++] = current[base + 1];
      pixels[target++] = current[base + 2];
      pixels[target++] = colorType === 2 ? 255 : current[base + 3];
    }

    previous.set(current);
    position += stride;
  }

  return pixels;
}

function rgbToHsv(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let hue = 0;

  if (delta !== 0) {
    if (max === rn) hue = ((gn - bn) / delta) % 6;
    else if (max === gn) hue = (bn - rn) / delta + 2;
    else hue = (rn - gn) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }

  return { hue, saturation: max === 0 ? 0 : delta / max, value: max };
}

type Bucket = { weight: number; r: number; g: number; b: number };

/** Picks the three strongest hue families and tints them. */
function paletteFromPixels(pixels: Uint8Array): string[] {
  const buckets = new Map<number, Bucket>();

  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 160) continue;
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const { hue, saturation, value } = rgbToHsv(r, g, b);
    if (saturation < 0.1 || value < 0.12) continue;

    const key = Math.floor(hue / 30) % 12;
    const weight = 1 + saturation * 2;
    const bucket = buckets.get(key) ?? { weight: 0, r: 0, g: 0, b: 0 };

    bucket.weight += weight;
    bucket.r += r * weight;
    bucket.g += g * weight;
    bucket.b += b * weight;
    buckets.set(key, bucket);
  }

  const strongest = [...buckets.entries()]
    .sort((a, b) => b[1].weight - a[1].weight)
    .slice(0, 3)
    .sort((a, b) => a[0] - b[0]);

  const mix = (value: number, tint: number) =>
    Math.round(value * (1 - TINT_STRENGTH) + tint * TINT_STRENGTH);
  const hex = (value: number) => value.toString(16).padStart(2, "0");
  const tinted = strongest.map(([, bucket]) => {
    const rgb = [bucket.r, bucket.g, bucket.b].map((sum, i) =>
      mix(sum / bucket.weight, TINT[i]),
    );
    return `#${rgb.map(hex).join("")}`;
  });

  return [...tinted, ...FALLBACK_PALETTE].slice(0, 3);
}

/** Turns PNG bytes into gradient stops for the UI. */
export function paletteFromPng(bytes: Uint8Array): string[] {
  return paletteFromPixels(decodePng(bytes));
}
