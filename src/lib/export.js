// ---------------------------------------------------------
// Palette exporters. Each function takes an array of
// { id, hex } swatches and returns a string ready to copy.
// All functions are pure. No DOM.
// ---------------------------------------------------------

import { colorName } from './color-names.js';

/**
 * Slugify a color name for use as a CSS/JS identifier.
 * "Very Light Violet" -> "very-light-violet"
 */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Ensure a slug is unique within a set. Appends -2, -3, etc.
 * on collisions.
 */
function uniqueSlug(base, used) {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let n = 2;
  while (used.has(`${base}-${n}`)) n++;
  const slug = `${base}-${n}`;
  used.add(slug);
  return slug;
}

/**
 * Export palette as CSS custom properties.
 * @param {{hex: string}[]} palette
 * @returns {string}
 */
export function toCss(palette) {
  if (!Array.isArray(palette) || palette.length === 0) {
    return ':root {\n  /* empty palette */\n}\n';
  }

  const lines = palette.map(
    (swatch, i) => `  --color-${i + 1}: ${swatch.hex};`
  );

  return `:root {\n${lines.join('\n')}\n}\n`;
}

/**
 * Export palette as JSON.
 * @param {{hex: string}[]} palette
 * @returns {string}
 */
export function toJson(palette) {
  if (!Array.isArray(palette)) palette = [];

  const data = {
    palette: palette.map((swatch) => ({
      name: colorName(swatch.hex) ?? 'Unknown',
      hex: swatch.hex,
    })),
  };

  return JSON.stringify(data, null, 2) + '\n';
}

/**
 * Export palette as a Tailwind config snippet.
 * @param {{hex: string}[]} palette
 * @returns {string}
 */
export function toTailwind(palette) {
  if (!Array.isArray(palette) || palette.length === 0) {
    return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {},\n    },\n  },\n};\n`;
  }

  const used = new Set();
  const entries = palette.map((swatch) => {
    const base = slugify(colorName(swatch.hex) ?? `color-${swatch.hex}`);
    const key = uniqueSlug(base, used);
    return `        '${key}': '${swatch.hex}',`;
  });

  return (
    `// tailwind.config.js\n` +
    `module.exports = {\n` +
    `  theme: {\n` +
    `    extend: {\n` +
    `      colors: {\n` +
    `${entries.join('\n')}\n` +
    `      },\n` +
    `    },\n` +
    `  },\n` +
    `};\n`
  );
}

/**
 * Map of format key -> exporter function. Used by the UI.
 */
export const EXPORTERS = {
  css: toCss,
  json: toJson,
  tailwind: toTailwind,
};