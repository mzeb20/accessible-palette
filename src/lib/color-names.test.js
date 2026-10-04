import { describe, it, expect } from 'vitest';
import { colorName, hueInfo } from './color-names.js';

describe('colorName — grayscale', () => {
  it('names pure black', () => {
    expect(colorName('#000000')).toBe('Black');
  });

  it('names pure white', () => {
    expect(colorName('#ffffff')).toBe('White');
  });

  it('names mid gray', () => {
    expect(colorName('#808080')).toBe('Gray');
  });
});

describe('colorName — primary hues', () => {
  it('names pure red', () => {
    expect(colorName('#ff0000')).toBe('Red');
  });

  it('names pure green', () => {
    expect(colorName('#00ff00')).toBe('Green');
  });

  it('names pure blue', () => {
    expect(colorName('#0000ff')).toBe('Blue');
  });

  it('names violet', () => {
    // hue ~270°
    expect(colorName('#7a3bff')).toBe('Violet');
  });
});

describe('colorName — brown special case', () => {
  it('names classic brown (#8b4513) as Brown, not Dark Orange', () => {
    expect(colorName('#8b4513')).toBe('Brown');
  });

  it('names dark orange with low lightness as Brown', () => {
    // hue ~30°, low lightness
    expect(colorName('#3d2608')).toBe('Dark Brown');
  });

  it('keeps bright orange as Orange, not Brown', () => {
    expect(colorName('#ff8800')).toBe('Orange');
  });
});

describe('colorName — lightness modifiers', () => {
  it('prefixes "Dark" for low lightness', () => {
    // dark blue
    expect(colorName('#0a1a4a')).toBe('Dark Blue');
  });

  it('prefixes "Light" for high lightness', () => {
    // light pink
    const name = colorName('#ffd0e0');
    expect(name).toMatch(/^Light|^Very Light/);
  });
});

describe('colorName — invalid input', () => {
  it('returns null for garbage', () => {
    expect(colorName('nope')).toBeNull();
    expect(colorName(null)).toBeNull();
  });
});

describe('hueInfo', () => {
  it('returns hue degrees, saturation, lightness, and name', () => {
    const info = hueInfo('#ff0000');
    expect(info.hue).toBe(0);
    expect(info.saturation).toBe(100);
    expect(info.lightness).toBe(50);
    expect(info.name).toBe('Red');
  });

  it('returns null for invalid input', () => {
    expect(hueInfo('nope')).toBeNull();
  });
});