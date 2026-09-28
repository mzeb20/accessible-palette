// ---------------------------------------------------------
// App state — a single source of truth for the palette.
// No DOM here. No rendering. Just data + mutations.
// ---------------------------------------------------------

import { hslToHex } from './lib/color.js';
/**
 * @typedef {{ id: string, hex: string }} Swatch
 */

let palette = [];
const listeners = new Set();

/**
 * Generate a short unique id. Good enough for a UI palette.
 */
function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * A pleasant random hex color (avoids near-black and near-white).
 * Uses HSL for consistency: random hue, medium saturation, mid lightness.
 */
function randomPleasantHex() {
  const h = Math.floor(Math.random() * 360);
  const s = 60 + Math.floor(Math.random() * 30); // 60–90%
  const l = 40 + Math.floor(Math.random() * 20); // 40–60%
  return hslToHex(h, s, l);
}

// ---------------------------------------------------------
// Public API
// ---------------------------------------------------------

export function getPalette() {
  return palette;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  for (const listener of listeners) listener(palette);
}

export function addSwatch(hex) {
  palette = [...palette, { id: makeId(), hex: hex ?? randomPleasantHex() }];
  notify();
}

export function removeSwatch(id) {
  palette = palette.filter((s) => s.id !== id);
  notify();
}

export function updateSwatch(id, hex) {
  palette = palette.map((s) => (s.id === id ? { ...s, hex } : s));
  notify();
}

/**
 * Seed the palette with a starting set of colors.
 * Called once on app init.
 */
export function seedPalette() {
  if (palette.length > 0) return;
  palette = [
    { id: makeId(), hex: '#3b3bff' },
    { id: makeId(), hex: '#ff5a5f' },
    { id: makeId(), hex: '#f7b500' },
    { id: makeId(), hex: '#167d3d' },
  ];
  notify();
}