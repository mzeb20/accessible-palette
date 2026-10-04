// ---------------------------------------------------------
// Color utilities — parsing and formatting
// All functions are pure: no DOM, no side effects.
// ---------------------------------------------------------

/**
 * Parse any supported color string into { r, g, b, a }.
 * Returns null if the input isn't a recognized color.
 *
 * Supported formats:
 *   - "#abc"            (3-digit hex)
 *   - "#aabbcc"         (6-digit hex)
 *   - "#abcd"           (4-digit hex with alpha)
 *   - "#aabbccdd"       (8-digit hex with alpha)
 *   - "rgb(1, 2, 3)"
 *   - "rgba(1, 2, 3, 0.5)"
 *   - "hsl(200, 50%, 40%)"
 *   - "hsla(200, 50%, 40%, 0.5)"
 */
export function parseColor(input) {
  if (typeof input !== 'string') return null;

  const value = input.trim().toLowerCase();
  if (!value) return null;

  if (value.startsWith('#')) return parseHex(value);
  if (value.startsWith('rgb')) return parseRgbFunction(value);
  if (value.startsWith('hsl')) return parseHslFunction(value);

  return null;
}

/**
 * Quick check: is this a valid color our tool understands?
 */
export function isValidColor(input) {
  return parseColor(input) !== null;
}

/**
 * Convert an { r, g, b } object to a lowercase hex string "#rrggbb".
 * Ignores alpha (use rgbToHexA if you need it).
 */
export function rgbToHex({ r, g, b }) {
  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    '#' +
    clamp(r).toString(16).padStart(2, '0') +
    clamp(g).toString(16).padStart(2, '0') +
    clamp(b).toString(16).padStart(2, '0')
  );
}

/**
 * Convenience wrapper: hex string -> { r, g, b }.
 * Returns null on invalid input.
 */
export function hexToRgb(hex) {
  const parsed = parseHex(hex);
  if (!parsed) return null;
  return { r: parsed.r, g: parsed.g, b: parsed.b };
}

/**
 * Format an { r, g, b, a } object as a CSS string.
 * Omits alpha when it's 1.
 */
export function formatRgb({ r, g, b, a = 1 }) {
  const R = Math.round(r);
  const G = Math.round(g);
  const B = Math.round(b);
  if (a >= 1) return `rgb(${R}, ${G}, ${B})`;
  return `rgba(${R}, ${G}, ${B}, ${a})`;
}

// ---------------------------------------------------------
// Internals
// ---------------------------------------------------------

function parseHex(hex) {
  // strip "#" and validate length
  const body = hex.replace(/^#/, '');
  const lengths = [3, 4, 6, 8];
  if (!lengths.includes(body.length)) return null;
  if (!/^[0-9a-f]+$/i.test(body)) return null;

  let r, g, b, a = 1;

  if (body.length === 3 || body.length === 4) {
    r = parseInt(body[0] + body[0], 16);
    g = parseInt(body[1] + body[1], 16);
    b = parseInt(body[2] + body[2], 16);
    if (body.length === 4) a = parseInt(body[3] + body[3], 16) / 255;
  } else {
    r = parseInt(body.slice(0, 2), 16);
    g = parseInt(body.slice(2, 4), 16);
    b = parseInt(body.slice(4, 6), 16);
    if (body.length === 8) a = parseInt(body.slice(6, 8), 16) / 255;
  }

  return { r, g, b, a };
}

function parseRgbFunction(str) {
  const match = str.match(/^rgba?\(([^)]+)\)$/);
  if (!match) return null;

  const parts = match[1].split(',').map((s) => s.trim());
  if (parts.length < 3 || parts.length > 4) return null;

  const r = Number(parts[0]);
  const g = Number(parts[1]);
  const b = Number(parts[2]);
  const a = parts.length === 4 ? Number(parts[3]) : 1;

  if ([r, g, b, a].some((n) => Number.isNaN(n))) return null;
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) return null;
  if (a < 0 || a > 1) return null;

  return { r, g, b, a };
}

function parseHslFunction(str) {
  const match = str.match(/^hsla?\(([^)]+)\)$/);
  if (!match) return null;

  const parts = match[1].split(',').map((s) => s.trim());
  if (parts.length < 3 || parts.length > 4) return null;

  const h = Number(parts[0]);
  const s = Number(parts[1].replace('%', ''));
  const l = Number(parts[2].replace('%', ''));
  const a = parts.length === 4 ? Number(parts[3]) : 1;

  if ([h, s, l, a].some((n) => Number.isNaN(n))) return null;
  if (s < 0 || s > 100 || l < 0 || l > 100) return null;
  if (a < 0 || a > 1) return null;

  return hslToRgb(h, s, l, a);
}

/**
 * Standard HSL -> RGB conversion.
 * h: 0–360, s: 0–100, l: 0–100, a: 0–1
 */
export function hslToRgb(h, s, l, a = 1) {
  const S = s / 100;
  const L = l / 100;
  const C = (1 - Math.abs(2 * L - 1)) * S;
  const Hp = ((h % 360) + 360) % 360 / 60;
  const X = C * (1 - Math.abs((Hp % 2) - 1));

  let r1 = 0, g1 = 0, b1 = 0;
  if (Hp >= 0 && Hp < 1) [r1, g1, b1] = [C, X, 0];
  else if (Hp < 2) [r1, g1, b1] = [X, C, 0];
  else if (Hp < 3) [r1, g1, b1] = [0, C, X];
  else if (Hp < 4) [r1, g1, b1] = [0, X, C];
  else if (Hp < 5) [r1, g1, b1] = [X, 0, C];
  else [r1, g1, b1] = [C, 0, X];

  const m = L - C / 2;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
    a,
  };
}

/**
 * Standard RGB -> HSL conversion.
 * Returns { h: 0–360, s: 0–100, l: 0–100 }.
 * Alpha is not included — use the original RGB object if you need it.
 */
export function rgbToHsl({ r, g, b }) {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;

  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const delta = max - min;

  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case R:
        h = (G - B) / delta + (G < B ? 6 : 0);
        break;
      case G:
        h = (B - R) / delta + 2;
        break;
      case B:
        h = (R - G) / delta + 4;
        break;
    }
    h *= 60;
  }

  return { h, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL values to a lowercase hex string "#rrggbb".
 * h: 0–360, s: 0–100, l: 0–100
 */
export function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l, 1);
  return rgbToHex({ r, g, b });
}