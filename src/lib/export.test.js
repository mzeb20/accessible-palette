import { describe, it, expect } from 'vitest';
import { toCss, toJson, toTailwind, EXPORTERS } from './export.js';

const sample = [
  { id: 'a', hex: '#3b3bff' },
  { id: 'b', hex: '#ff5a5f' },
  { id: 'c', hex: '#f7b500' },
];

describe('toCss', () => {
  it('produces :root with --color-N variables', () => {
    const out = toCss(sample);
    expect(out).toContain(':root {');
    expect(out).toContain('--color-1: #3b3bff;');
    expect(out).toContain('--color-2: #ff5a5f;');
    expect(out).toContain('--color-3: #f7b500;');
  });

  it('handles empty palette', () => {
    expect(toCss([])).toContain('empty palette');
  });

  it('handles invalid input', () => {
    expect(toCss(null)).toContain('empty palette');
  });
});

describe('toJson', () => {
  it('produces valid JSON', () => {
    const out = toJson(sample);
    const parsed = JSON.parse(out);
    expect(parsed.palette).toHaveLength(3);
  });

  it('includes name and hex', () => {
    const parsed = JSON.parse(toJson(sample));
    expect(parsed.palette[0]).toHaveProperty('name');
    expect(parsed.palette[0]).toHaveProperty('hex');
    expect(parsed.palette[0].hex).toBe('#3b3bff');
  });

  it('handles empty palette', () => {
    const parsed = JSON.parse(toJson([]));
    expect(parsed.palette).toEqual([]);
  });
});

describe('toTailwind', () => {
  it('produces a module.exports block', () => {
    const out = toTailwind(sample);
    expect(out).toContain('module.exports');
    expect(out).toContain('colors:');
    expect(out).toContain("'#3b3bff'");
  });

  it('uses slugified color names as keys', () => {
    const out = toTailwind(sample);
    // #3b3bff is named "Blue" -> key should be 'blue'
    expect(out).toMatch(/'blue':\s*'#3b3bff'/);
  });

  it('handles duplicate names by appending -2', () => {
    const dupes = [
      { id: 'a', hex: '#3b3bff' },
      { id: 'b', hex: '#3b3bff' }, // same color
    ];
    const out = toTailwind(dupes);
    // Should have 'blue' and 'blue-2'
    expect(out).toMatch(/'blue':/);
    expect(out).toMatch(/'blue-2':/);
  });

  it('handles empty palette', () => {
    expect(toTailwind([])).toContain('colors: {}');
  });
});

describe('EXPORTERS map', () => {
  it('has css, json, tailwind keys', () => {
    expect(Object.keys(EXPORTERS)).toEqual(['css', 'json', 'tailwind']);
  });

  it('all values are functions', () => {
    for (const fn of Object.values(EXPORTERS)) {
      expect(typeof fn).toBe('function');
    }
  });
});