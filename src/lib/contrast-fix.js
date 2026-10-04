// ---------------------------------------------------------
// Suggest a nearby color that passes WCAG contrast.
// Strategy: adjust lightness in HSL space, keeping hue and
// saturation as close to the original as possible.
// ---------------------------------------------------------

import { parseColor, rgbToHsl, hslToHex } from './color.js';
import { contrastRatio, WCAG_THRESHOLDS } from './contrast.js';

const MAX_STEPS = 100;

/**
 * Walk lightness in a direction until contrast passes.
 * Returns { hex, steps } or null if not found.
 */
function searchLightness(baseHsl, fixedHex, direction, threshold) {
  // direction: -1 to darken, +1 to lighten
  for (let step = 1; step <= MAX_STEPS; step++) {
    const newL = baseHsl.l + direction * step;
    if (newL < 0 || newL > 100) break;

    const candidate = hslToHex(baseHsl.h, baseHsl.s, newL);
    const ratio = contrastRatio(candidate, fixedHex);
    if (ratio !== null && ratio >= threshold) {
      return { hex: candidate, steps: step };
    }
  }
  return null;
}

/**
 * Suggest the nearest color to `hexA` that passes `threshold`
 * against `hexB`. Keeps hue and saturation; only adjusts lightness.
 * Returns { hex, direction, steps, target } or null if no fix found.
 * `target` is 'A' or 'B' — which of the two inputs should change.
 */
export function suggestFix(hexA, hexB, threshold = WCAG_THRESHOLDS.AA_NORMAL) {
  const a = parseColor(hexA);
  const b = parseColor(hexB);
  if (!a || !b) return null;

  // Already passes?
  const currentRatio = contrastRatio(hexA, hexB);
  if (currentRatio !== null && currentRatio >= threshold) {
    return { hex: hexA, direction: 'none', steps: 0, target: 'A' };
  }

  const aHsl = rgbToHsl(a);
  const bHsl = rgbToHsl(b);

  const darkenA  = searchLightness(aHsl, hexB, -1, threshold);
  const lightenA = searchLightness(aHsl, hexB, +1, threshold);
  const darkenB  = searchLightness(bHsl, hexA, -1, threshold);
  const lightenB = searchLightness(bHsl, hexA, +1, threshold);

  const candidates = [
    darkenA  && { ...darkenA,  target: 'A', direction: 'darker'  },
    lightenA && { ...lightenA, target: 'A', direction: 'lighter' },
    darkenB  && { ...darkenB,  target: 'B', direction: 'darker'  },
    lightenB && { ...lightenB, target: 'B', direction: 'lighter' },
  ].filter(Boolean);

  if (candidates.length === 0) return null;

  // Pick the candidate requiring the fewest lightness steps.
  candidates.sort((x, y) => x.steps - y.steps);
  return candidates[0];
}