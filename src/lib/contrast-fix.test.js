import { describe, it, expect } from 'vitest';
import { suggestFix } from './contrast-fix.js';
import { contrastRatio, WCAG_THRESHOLDS } from './contrast.js';

describe('suggestFix', () => {
  it('returns steps:0 when the pair already passes', () => {
    const result = suggestFix('#000000', '#ffffff');
    expect(result).not.toBeNull();
    expect(result.steps).toBe(0);
    expect(result.direction).toBe('none');
  });

  it('suggests a darker version when text is too light', () => {
    // #999999 on white fails AA normal
    const result = suggestFix('#999999', '#ffffff');
    expect(result).not.toBeNull();

    // The fixed color should pass the threshold
    const ratio = contrastRatio(result.hex, '#ffffff');
    expect(ratio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA_NORMAL);
  });

  it('suggests a lighter version when background is too dark', () => {
    // Very dark background vs mid text
    const result = suggestFix('#222222', '#444444');
    expect(result).not.toBeNull();
    const ratio = contrastRatio(result.hex, result.target === 'A' ? '#444444' : '#222222');
    expect(ratio).toBeGreaterThanOrEqual(WCAG_THRESHOLDS.AA_NORMAL);
  });

  it('keeps hue and saturation mostly intact', () => {
    // Red on white, too light
    const result = suggestFix('#ff8080', '#ffffff');
    expect(result).not.toBeNull();

    // The suggestion should still be recognizably red
    // (not turned into black or gray)
    expect(result.hex).not.toBe('#000000');
    expect(result.hex).not.toBe('#808080');
  });

  it('returns null for invalid input', () => {
    expect(suggestFix('nope', '#ffffff')).toBeNull();
    expect(suggestFix('#ffffff', 'nope')).toBeNull();
  });

  it('respects a custom threshold', () => {
    // Very high threshold should require a bigger change
    const strict = suggestFix('#888888', '#ffffff', WCAG_THRESHOLDS.AAA_NORMAL);
    const loose = suggestFix('#888888', '#ffffff', WCAG_THRESHOLDS.AA_NORMAL);
    expect(strict.steps).toBeGreaterThan(loose.steps);
  });
});