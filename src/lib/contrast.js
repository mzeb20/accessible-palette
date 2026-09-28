// ---------------------------------------------------------
// WCAG 2.1 contrast ratio calculations.
// Reference: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
// All functions are pure. No DOM.
// ---------------------------------------------------------

import { parseColor } from './color.js';

/** WCAG 2.1 thresholds */
export const WCAG_THRESHOLDS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5,
};

/**
 * Linearize a single sRGB channel (0–255) per WCAG.
 * @param {number} channel
 * @returns {number} linear value 0–1
 */
function channelLuminance(channel) {
  const c = channel / 255;
  return c <= 0.03928
    ? c / 12.92
    : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Relative luminance of an { r, g, b } object, per WCAG.
 * Returns 0 (black) to 1 (white).
 */
export function relativeLuminance({ r, g, b }) {
  const R = channelLuminance(r);
  const G = channelLuminance(g);
  const B = channelLuminance(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * WCAG contrast ratio between two colors.
 * Accepts hex, rgb(), hsl() strings OR { r, g, b } objects.
 * Returns 1–21, or null on invalid input.
 * Order of arguments does not matter.
 */
export function contrastRatio(colorA, colorB) {
  const a = typeof colorA === 'string' ? parseColor(colorA) : colorA;
  const b = typeof colorB === 'string' ? parseColor(colorB) : colorB;

  if (!a || !b) return null;

  const La = relativeLuminance(a);
  const Lb = relativeLuminance(b);

  const lighter = Math.max(La, Lb);
  const darker = Math.min(La, Lb);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Format a ratio for display with 2 decimals.
 * Example: 4.5231 → "4.52"
 */
export function formatRatio(ratio) {
  if (typeof ratio !== 'number' || Number.isNaN(ratio)) return '—';
  return ratio.toFixed(2);
}

/**
 * Test a ratio against a threshold.
 */
export function passes(ratio, threshold) {
  if (typeof ratio !== 'number' || Number.isNaN(ratio)) return false;
  return ratio >= threshold;
}

/**
 * Full WCAG report for a color pair.
 * Returns null if either color is invalid.
 */
export function wcagReport(colorA, colorB) {
  const ratio = contrastRatio(colorA, colorB);
  if (ratio === null) return null;

  return {
    ratio,
    formatted: formatRatio(ratio),
    aaNormal: passes(ratio, WCAG_THRESHOLDS.AA_NORMAL),
    aaLarge: passes(ratio, WCAG_THRESHOLDS.AA_LARGE),
    aaaNormal: passes(ratio, WCAG_THRESHOLDS.AAA_NORMAL),
    aaaLarge: passes(ratio, WCAG_THRESHOLDS.AAA_LARGE),
  };
}