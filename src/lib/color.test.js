import { describe, it, expect } from 'vitest';
import {
  parseColor,
  isValidColor,
  rgbToHex,
  hexToRgb,
  formatRgb,
  hslToHex,
} from './color.js';

describe('parseColor', () => {
  it('parses 6-digit hex', () => {
    expect(parseColor('#3b3bff')).toEqual({ r: 59, g: 59, b: 255, a: 1 });
  });

  it('parses 3-digit hex by doubling digits', () => {
    expect(parseColor('#abc')).toEqual({ r: 170, g: 187, b: 204, a: 1 });
  });

  it('parses 4-digit hex with alpha', () => {
    const result = parseColor('#abcd');
    expect(result.r).toBe(170);
    expect(result.a).toBeCloseTo(0.867, 2);
  });

  it('parses 8-digit hex with alpha', () => {
    const result = parseColor('#3b3bff80');
    expect(result.a).toBeCloseTo(0.502, 2);
  });

  it('is case-insensitive', () => {
    expect(parseColor('#ABC')).toEqual({ r: 170, g: 187, b: 204, a: 1 });
  });

  it('tolerates surrounding whitespace', () => {
    expect(parseColor('  #abc  ')).toEqual({ r: 170, g: 187, b: 204, a: 1 });
  });

  it('parses rgb() strings', () => {
    expect(parseColor('rgb(10, 20, 30)')).toEqual({ r: 10, g: 20, b: 30, a: 1 });
  });

  it('parses rgba() strings', () => {
    expect(parseColor('rgba(10, 20, 30, 0.5)')).toEqual({
      r: 10, g: 20, b: 30, a: 0.5,
    });
  });

  it('parses hsl() strings', () => {
    // hsl(0, 100%, 50%) is pure red
    expect(parseColor('hsl(0, 100%, 50%)')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it('returns null for invalid input', () => {
    expect(parseColor('')).toBeNull();
    expect(parseColor('#ggg')).toBeNull();
    expect(parseColor('#12345')).toBeNull();
    expect(parseColor('not-a-color')).toBeNull();
    expect(parseColor(null)).toBeNull();
    expect(parseColor(42)).toBeNull();
  });

  it('rejects out-of-range rgb values', () => {
    expect(parseColor('rgb(300, 0, 0)')).toBeNull();
    expect(parseColor('rgb(-1, 0, 0)')).toBeNull();
  });

  it('parses hsl() strings with percentages', () => {
    expect(parseColor('hsl(360, 100%, 50%)')).toEqual({ r: 255, g: 0, b: 0, a: 1});
  });
});
describe('isValidColor', () => {
  it('returns true for valid colors', () => {
    expect(isValidColor('#abc')).toBe(true);
    expect(isValidColor('rgb(0, 0, 0)')).toBe(true);
  });

  it('returns false for invalid colors', () => {
    expect(isValidColor('nope')).toBe(false);
    expect(isValidColor('#xyz')).toBe(false);
  });
});

describe('rgbToHex', () => {
  it('converts rgb object to hex', () => {
    expect(rgbToHex({ r: 59, g: 59, b: 255 })).toBe('#3b3bff');
  });

  it('pads single-digit hex values', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
    expect(rgbToHex({ r: 1, g: 2, b: 3 })).toBe('#010203');
  });

  it('clamps out-of-range values', () => {
    expect(rgbToHex({ r: 300, g: -10, b: 255 })).toBe('#ff00ff');
  });

  it('rounds non-integer values', () => {
    expect(rgbToHex({ r: 10.7, g: 20.2, b: 30.9 })).toBe('#0b141f');
  });
});

describe('hexToRgb', () => {
  it('converts 6-digit hex to rgb object', () => {
    expect(hexToRgb('#3b3bff')).toEqual({ r: 59, g: 59, b: 255 });
  });

  it('returns null for invalid hex', () => {
    expect(hexToRgb('nope')).toBeNull();
    expect(hexToRgb('#12')).toBeNull();
  });
});

describe('formatRgb', () => {
  it('formats without alpha when a is 1', () => {
    expect(formatRgb({ r: 10, g: 20, b: 30 })).toBe('rgb(10, 20, 30)');
  });

  it('formats with alpha when a < 1', () => {
    expect(formatRgb({ r: 10, g: 20, b: 30, a: 0.5 })).toBe(
      'rgba(10, 20, 30, 0.5)'
    );
  });

  it('rounds rgb values', () => {
    expect(formatRgb({ r: 10.7, g: 20.2, b: 30.9 })).toBe('rgb(11, 20, 31)');
  });
});

describe('hslToHex', () => {
  it('converts pure red', () => {
    expect(hslToHex(0, 100, 50)).toBe('#ff0000');
  });

  it('converts pure green', () => {
    expect(hslToHex(120, 100, 50)).toBe('#00ff00');
  });

  it('converts pure blue', () => {
    expect(hslToHex(240, 100, 50)).toBe('#0000ff');
  });

  it('treats 360° as 0°', () => {
    expect(hslToHex(360, 100, 50)).toBe('#ff0000');
  });

  it('produces gray when saturation is 0', () => {
    expect(hslToHex(0, 0, 50)).toBe('#808080');
  });
});
