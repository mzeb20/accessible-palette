import { describe, it, expect } from 'vitest';
import {
  relativeLuminance,
  contrastRatio,
  formatRatio,
  passes,
  wcagReport,
  WCAG_THRESHOLDS,
} from './contrast.js';

describe('relativeLuminance', () => {
  it('returns 0 for black', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 5);
  });

  it('returns 1 for white', () => {
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);
  });

  it('weights green more than red, and red more than blue', () => {
    const red = relativeLuminance({ r: 255, g: 0, b: 0 });
    const green = relativeLuminance({ r: 0, g: 255, b: 0 });
    const blue = relativeLuminance({ r: 0, g: 0, b: 255 });
    expect(green).toBeGreaterThan(red);
    expect(red).toBeGreaterThan(blue);
  });

  it('mid-gray is between 0 and 1', () => {
    const l = relativeLuminance({ r: 128, g: 128, b: 128 });
    expect(l).toBeGreaterThan(0);
    expect(l).toBeLessThan(1);
  });
});

describe('contrastRatio', () => {
  it('black vs white is 21:1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('same color is 1:1', () => {
    expect(contrastRatio('#3b3bff', '#3b3bff')).toBeCloseTo(1, 5);
  });

  it('is symmetric', () => {
    const a = contrastRatio('#000000', '#ffffff');
    const b = contrastRatio('#ffffff', '#000000');
    expect(a).toBeCloseTo(b, 10);
  });

  it('accepts rgb objects as well as strings', () => {
    const r = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
    expect(r).toBeCloseTo(21, 1);
  });

  it('returns null for invalid input', () => {
    expect(contrastRatio('nope', '#ffffff')).toBeNull();
    expect(contrastRatio('#ffffff', 'also-nope')).toBeNull();
  });

  it('matches a known WCAG reference value', () => {
    // #777777 on #ffffff ≈ 4.48:1 (fails AA normal by a hair)
    const ratio = contrastRatio('#777777', '#ffffff');
    expect(ratio).toBeGreaterThan(4.4);
    expect(ratio).toBeLessThan(4.5);
  });
});

describe('formatRatio', () => {
  it('formats to 2 decimals', () => {
    expect(formatRatio(4.5231)).toBe('4.52');
    expect(formatRatio(21)).toBe('21.00');
  });

  it('returns em-dash for invalid input', () => {
    expect(formatRatio(null)).toBe('—');
    expect(formatRatio(NaN)).toBe('—');
  });
});

describe('passes', () => {
  it('returns true when ratio meets threshold', () => {
    expect(passes(4.5, 4.5)).toBe(true);
    expect(passes(7, 4.5)).toBe(true);
  });

  it('returns false when ratio is below threshold', () => {
    expect(passes(4.49, 4.5)).toBe(false);
  });
});

describe('wcagReport', () => {
  it('black on white passes all four levels', () => {
    const r = wcagReport('#000000', '#ffffff');
    expect(r.aaNormal).toBe(true);
    expect(r.aaaLarge).toBe(true);
    expect(r.aaaNormal).toBe(true);
    expect(r.aaaLarge).toBe(true);
    expect(r.formatted).toBe('21.00');
  });

  it('mid-gray on white fails AA normal, passes AA large', () => {
    const r = wcagReport('#777777', '#ffffff');
    expect(r.aaNormal).toBe(false);
    expect(r.aaLarge).toBe(true);
  });

  it('returns null for invalid input', () => {
    expect(wcagReport('nope', '#fff')).toBeNull();
  });
});