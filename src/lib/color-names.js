// ---------------------------------------------------------
// Color naming — maps a color to a name.
// Uses HSL rules so the logic is understandable and tweakable.
// ---------------------------------------------------------

import { parseColor } from './color.js';

/**
 * Hue sectors — every 30° gets a name. 12 sectors, 360°.
 * Hues are matched top-to-bottom by range.
 */
const HUE_SECTORS = [
  { max: 15,  name: 'Red' },
  { max: 45,  name: 'Orange' },
  { max: 75,  name: 'Yellow' },
  { max: 105, name: 'Yellow-Green' },
  { max: 135, name: 'Green' },
  { max: 165, name: 'Spring Green' },
  { max: 195, name: 'Cyan' },
  { max: 225, name: 'Azure' },
  { max: 255, name: 'Blue' },
  { max: 285, name: 'Violet' },
  { max: 315, name: 'Magenta' },
  { max: 345, name: 'Pink' },
  { max: 360, name: 'Red' }, // wrap-around
];

/**
 * Convert an { r, g, b } object to { h, s, l } (h in 0–360, s/l in 0–100).
 */
function rgbToHsl({ r, g, b }) {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;

  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const delta = max - min;

  const L = (max + min) / 2;
  let H = 0;
  let S = 0;

  if (delta !== 0) {
    S = L > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case R: H = ((G - B) / delta + (G < B ? 6 : 0)); break;
      case G: H = ((B - R) / delta + 2); break;
      case B: H = ((R - G) / delta + 4); break;
    }
    H *= 60;
  }

  return { h: H, s: S * 100, l: L * 100 };
}

/**
 * Find the hue sector name for a given hue (0–360).
 */
function hueName(h) {
  for (const sector of HUE_SECTORS) {
    if (h < sector.max) return sector.name;
  }
  return 'Red'; // safety fallback (shouldn't happen)
}

/**
 * Name a color. Accepts hex, rgb(), hsl() strings or { r, g, b } objects.
 * Returns a string like "Violet" or "Dark Olive Green".
 * Returns null on invalid input.
 */
export function colorName(input) {
  const parsed = typeof input === 'string' ? parseColor(input) : input;
  if (!parsed) return null;

  const { h, s, l } = rgbToHsl(parsed);

  // --- Grayscale ---
  if (s < 10) {
    if (l < 8) return 'Black';
    if (l < 25) return 'Dark Gray';
    if (l < 45) return 'Dim Gray';
    if (l < 60) return 'Gray';
    if (l < 80) return 'Light Gray';
    if (l < 95) return 'Very Light Gray';
    return 'White';
  }

  // --- Brown special case ---
  // Brown lives in the orange/yellow range but only at low lightness
  // and moderate saturation. Catch it before the generic "Dark Orange".
  const isBrownHue = h >= 15 && h < 50;
  if (isBrownHue && l < 45 && s > 15) {
    if (l < 20) return 'Dark Brown';
    return 'Brown';
  }

  // --- Named hue + lightness modifiers ---
  const hue = hueName(h);

  // Very dark colors read as near-black versions of the hue
  if (l < 15) return `Very Dark ${hue}`;
  if (l < 30) return `Dark ${hue}`;
  if (l > 90) return `Very Light ${hue}`;
  if (l > 75) return `Light ${hue}`;

  // Saturated, mid-lightness colors get the plain hue name
  return hue;
}

/**
 * Convenience: returns just the hue name in degrees + name,
 * useful for teaching / debugging.
 */
export function hueInfo(input) {
  const parsed = typeof input === 'string' ? parseColor(input) : input;
  if (!parsed) return null;
  const { h, s, l } = rgbToHsl(parsed);
  return {
    hue: Math.round(h),
    saturation: Math.round(s),
    lightness: Math.round(l),
    name: colorName(parsed),
  };
}