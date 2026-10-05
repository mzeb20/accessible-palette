// ---------------------------------------------------------
// Color vision deficiency (CVD) simulation.
// Uses linear-RGB matrix transforms, applied after
// converting sRGB -> linear light. No external library.
//
// Reference: Viénot, Brettel & Mollon (1999), simplified.
// ---------------------------------------------------------

import { parseColor } from './color.js';

export const CVD_TYPES = [
  { key: 'normal', label: 'Normal' },
  { key: 'protanopia', label: 'Protanopia' },
  { key: 'deuteranopia', label: 'Deuteranopia' },
  { key: 'tritanopia', label: 'Tritanopia' },
];

const VALID_TYPES = new Set(CVD_TYPES.map((t) => t.key));

// Transformation matrices in linear RGB.
// Rows = [R', G', B'] output; columns = [R, G, B] input.
const MATRICES = {
  protanopia: [
    [0.56667, 0.43333, 0.0],
    [0.55833, 0.44167, 0.0],
    [0.0,     0.24167, 0.75833],
  ],
  deuteranopia: [
    [0.625,   0.375,   0.0],
    [0.7,     0.3,     0.0],
    [0.0,     0.3,     0.7],
  ],
  tritanopia: [
    [0.95,    0.05,    0.0],
    [0.0,     0.43333, 0.56667],
    [0.0,     0.475,   0.525],
  ],
};

/**
 * sRGB channel (0–255) -> linear (0–1).
 */
function srgbToLinear(c) {
  const n = c / 255;
  return n <= 0.04045
    ? n / 12.92
    : Math.pow((n + 0.055) / 1.055, 2.4);
}

/**
 * Linear (0–1) -> sRGB channel (0–255), clamped.
 */
function linearToSrgb(v) {
  const n =
    v <= 0.0031308
      ? v * 12.92
      : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(n * 255)));
}

/**
 * Apply a 3x3 matrix to a linear RGB triple.
 */
function applyMatrix([r, g, b], m) {
  return [
    m[0][0] * r + m[0][1] * g + m[0][2] * b,
    m[1][0] * r + m[1][1] * g + m[1][2] * b,
    m[2][0] * r + m[2][1] * g + m[2][2] * b,
  ];
}

/**
 * { r, g, b } -> "#rrggbb", clamped and padded.
 */
function rgbToHex({ r, g, b }) {
  return (
    '#' +
    [r, g, b]
      .map((n) =>
        Math.max(0, Math.min(255, Math.round(n)))
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  );
}

/**
 * Simulate a single color under a given CVD type.
 * @param {string} hex — a color string parseColor understands
 * @param {string} type — one of CVD_TYPES[].key
 * @returns {string|null} — simulated hex string, or null on invalid input
 */
export function simulateColor(hex, type) {
  if (!hex || !VALID_TYPES.has(type)) return null;

  const rgb = parseColor(hex);
  if (!rgb) return null;

  // Normal is a no-op
  if (type === 'normal') return rgbToHex(rgb);

  const m = MATRICES[type];
  if (!m) return rgbToHex(rgb);

  const linear = [
    srgbToLinear(rgb.r),
    srgbToLinear(rgb.g),
    srgbToLinear(rgb.b),
  ];
  const transformed = applyMatrix(linear, m);

  return rgbToHex({
    r: linearToSrgb(transformed[0]),
    g: linearToSrgb(transformed[1]),
    b: linearToSrgb(transformed[2]),
  });
}

/**
 * Simulate a whole palette (array of hex strings) under a CVD type.
 * Invalid entries pass through unchanged.
 */
export function simulatePalette(hexes, type) {
  if (!Array.isArray(hexes)) return [];
  return hexes.map((hex) => simulateColor(hex, type) ?? hex);
}