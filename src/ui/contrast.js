// ---------------------------------------------------------
// Contrast checker UI.
// Populates dropdowns from state, renders WCAG results.
// All math lives in lib/contrast.js.
// ---------------------------------------------------------

import { getPalette, subscribe } from '../state.js';
import { wcagReport } from '../lib/contrast.js';

const selectA = document.getElementById('contrast-a');
const selectB = document.getElementById('contrast-b');
const resultEl = document.getElementById('contrast-result');

// Persist selection across re-renders.
let selectedA = null;
let selectedB = null;

export function initContrast() {
  subscribe(handlePaletteChange);

  selectA.addEventListener('change', (e) => {
    selectedA = e.target.value;
    renderResult();
  });
  selectB.addEventListener('change', (e) => {
    selectedB = e.target.value;
    renderResult();
  });

  handlePaletteChange(getPalette());
}

/**
 * Called whenever the palette changes.
 * Rebuilds both dropdowns and re-renders the result.
 */
function handlePaletteChange(palette) {
  // Pick defaults on first run or when selection disappears.
  if (!selectedA && palette[0]) selectedA = palette[0].id;
  if (!selectedB && palette[1]) selectedB = palette[1].id;
  else if (!selectedB && palette[0]) selectedB = palette[0].id;

  populateSelect(selectA, palette, selectedA);
  populateSelect(selectB, palette, selectedB);

  // If selection no longer exists in the palette, reset it.
  if (!palette.some((s) => s.id === selectedA)) {
    selectedA = palette[0]?.id ?? null;
  }
  if (!palette.some((s) => s.id === selectedB)) {
    selectedB = palette[0]?.id ?? null;
  }

  selectA.value = selectedA ?? '';
  selectB.value = selectedB ?? '';

  renderResult();
}

function populateSelect(select, palette, currentValue) {
  select.innerHTML = '';

  if (palette.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No colors yet';
    opt.disabled = true;
    opt.selected = true;
    select.appendChild(opt);
    return;
  }

  for (const swatch of palette) {
    const opt = document.createElement('option');
    opt.value = swatch.id;
    opt.textContent = swatch.hex;
    select.appendChild(opt);
  }

  if (currentValue && palette.some((s) => s.id === currentValue)) {
    select.value = currentValue;
  }
}

function renderResult() {
  const palette = getPalette();
  const a = palette.find((s) => s.id === selectedA);
  const b = palette.find((s) => s.id === selectedB);

  if (!a || !b) {
    renderEmptyState();
    return;
  }

  const report = wcagReport(a.hex, b.hex);
  if (!report) {
    renderEmptyState();
    return;
  }

  renderReport(report, a.hex, b.hex);
}

function renderEmptyState() {
  resultEl.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'contrast-result__placeholder';
  p.textContent = 'Select two colors to check contrast.';
  resultEl.appendChild(p);
}

function renderReport(report, hexA, hexB) {
  resultEl.innerHTML = '';

  // Live preview of the two colors together.
  const preview = document.createElement('div');
  preview.className = 'contrast-result__preview';
  preview.style.background = hexA;
  preview.style.color = hexB;
  preview.setAttribute('aria-hidden', 'true');

  const normalText = document.createElement('p');
  normalText.className = 'contrast-result__sample';
  normalText.textContent = 'Normal text sample';

  const largeText = document.createElement('p');
  largeText.className = 'contrast-result__sample contrast-result__sample--large';
  largeText.textContent = 'Large text sample';

  preview.appendChild(normalText);
  preview.appendChild(largeText);

  // Ratio line.
  const ratioEl = document.createElement('p');
  ratioEl.className = 'contrast-result__ratio';
  ratioEl.innerHTML = `Contrast ratio: <strong>${report.formatted}:1</strong>`;

  // Pass/fail badges.
  const badges = document.createElement('div');
  badges.className = 'contrast-result__badges';

  badges.appendChild(makeBadge('AA Normal', report.aaNormal));
  badges.appendChild(makeBadge('AA Large', report.aaLarge));
  badges.appendChild(makeBadge('AAA Normal', report.aaaNormal));
  badges.appendChild(makeBadge('AAA Large', report.aaaLarge));

  resultEl.appendChild(preview);
  resultEl.appendChild(ratioEl);
  resultEl.appendChild(badges);
}

function makeBadge(label, isPass) {
  const el = document.createElement('span');
  el.className = `badge ${isPass ? 'badge--pass' : 'badge--fail'}`;
  el.textContent = `${isPass ? '✓' : '✕'} ${label}`;
  return el;
}