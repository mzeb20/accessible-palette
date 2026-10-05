import { describe, it, expect } from 'vitest';
import { simulateColor, simulatePalette, CVD_TYPES } from './cvd.js';

describe('CVD_TYPES', () => {
  it('includes the four expected types', () => {
    const keys = CVD_TYPES.map((t) => t.key);
    expect(keys).toEqual([
      'normal',
      'protanopia',
      'deuteranopia',
      'tritanopia',
    ]);
  });
});

describe('simulateColor', () => {
  it('returns the same hex for type "normal"', () => {
    expect(simulateColor('#ff0000', 'normal')).toBe('#ff0000');
  });

  it('returns a different hex for protanopia', () => {
    const result = simulateColor('#ff0000', 'protanopia');
    expect(result).not.toBe('#ff0000');
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('returns a different hex for deuteranopia', () => {
    const result = simulateColor('#00ff00', 'deuteranopia');
    expect(result).not.toBe('#00ff00');
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('returns a different hex for tritanopia', () => {
    const result = simulateColor('#0000ff', 'tritanopia');
    expect(result).not.toBe('#0000ff');
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('handles shorthand hex', () => {
    const result = simulateColor('#f00', 'protanopia');
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('returns null for invalid type', () => {
    expect(simulateColor('#ff0000', 'nonsense')).toBeNull();
    expect(simulateColor('#ff0000', '')).toBeNull();
    expect(simulateColor('#ff0000', null)).toBeNull();
  });

  it('returns null for invalid color', () => {
    expect(simulateColor('not-a-color', 'protanopia')).toBeNull();
    expect(simulateColor('', 'protanopia')).toBeNull();
    expect(simulateColor(null, 'protanopia')).toBeNull();
  });
});

describe('simulatePalette', () => {
  it('returns an array of the same length', () => {
    const input = ['#ff0000', '#00ff00', '#0000ff'];
    const output = simulatePalette(input, 'protanopia');
    expect(output).toHaveLength(3);
  });

  it('preserves order', () => {
    const input = ['#ff0000', '#00ff00'];
    const output = simulatePalette(input, 'deuteranopia');
    // Red should still map to something reddish-muddy,
    // green to something greenish-muddy — different values.
    expect(output[0]).not.toBe(output[1]);
  });

  it('passes through invalid entries unchanged', () => {
    const output = simulatePalette(['#ff0000', 'garbage'], 'normal');
    expect(output[0]).toBe('#ff0000');
    expect(output[1]).toBe('garbage');
  });

  it('returns empty array for non-array input', () => {
    expect(simulatePalette(null, 'protanopia')).toEqual([]);
    expect(simulatePalette('not-an-array', 'protanopia')).toEqual([]);
  });
});