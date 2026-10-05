// ---------------------------------------------------------
// CVD preview UI.
// Renders the current palette under the selected CVD type.
// Tabs are already in index.html; we handle selection and
// re-render on palette change.
// ---------------------------------------------------------

import { getPalette, subscribe } from '../state.js';
import { simulateColor, CVD_TYPES } from '../lib/cvd.js';

const tabsContainer = document.querySelector('.cvd-tabs');
const previewEl = document.getElementById('cvd-preview');

let currentType = 'normal';

export function initCvd() {
  // Wire up the tabs
  const tabs = tabsContainer.querySelectorAll('.cvd-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      currentType = tab.dataset.cvd;
      setActiveTab(tab);
      render(getPalette());
    });
  });

  // Re-render whenever the palette changes
  subscribe(render);

  // Initial render
  render(getPalette());
}

/**
 * Toggle .is-active + aria-selected on the correct tab.
 */
function setActiveTab(activeTab) {
  const tabs = tabsContainer.querySelectorAll('.cvd-tab');
  tabs.forEach((tab) => {
    const isActive = tab === activeTab;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
}

/**
 * Render the palette under the current CVD type.
 * Shows one swatch per palette color, with the color name and
 * the simulated hex as a tooltip.
 */
function render(palette) {
  previewEl.innerHTML = '';

  if (palette.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'cvd-preview__empty';
    empty.textContent = 'Add colors to see how they look.';
    previewEl.appendChild(empty);
    return;
  }

  for (const swatch of palette) {
    const simulated = simulateColor(swatch.hex, currentType) ?? swatch.hex;

    const chip = document.createElement('div');
    chip.className = 'cvd-chip';
    chip.style.background = simulated;
    chip.setAttribute(
      'title',
      currentType === 'normal'
        ? swatch.hex
        : `${swatch.hex} → ${simulated}`
    );

    // Inner label showing the hex
    const label = document.createElement('span');
    label.className = 'cvd-chip__label';
    label.textContent = swatch.hex;
    label.setAttribute('aria-hidden', 'true');
    chip.appendChild(label);

    previewEl.appendChild(chip);
  }
}