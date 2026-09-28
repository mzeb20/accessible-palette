// ---------------------------------------------------------
// Palette UI — renders swatches from state, dispatches
// user actions back to state. No color math here.
// ---------------------------------------------------------

import { isValidColor } from '../lib/color.js';
import {
  getPalette,
  subscribe,
  addSwatch,
  removeSwatch,
  updateSwatch,
} from '../state.js';

const container = document.getElementById('palette');
const addButton = document.getElementById('add-color');

export function initPalette() {
  // Re-render whenever state changes
  subscribe(render);

  // Add button
  addButton.addEventListener('click', () => {
    addSwatch();
  });

  // Initial render
  render(getPalette());
}

function render(palette) {
  container.innerHTML = '';

  if (palette.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'palette__empty';
    empty.textContent = 'No colors yet. Add one to get started.';
    container.appendChild(empty);
    return;
  }

  for (const swatch of palette) {
    container.appendChild(renderSwatch(swatch));
  }
}

function renderSwatch(swatch) {
  const wrapper = document.createElement('div');
  wrapper.className = 'swatch';
  wrapper.setAttribute('role', 'listitem');

  // Color preview (also a native color picker)
  const picker = document.createElement('input');
  picker.type = 'color';
  picker.className = 'swatch__picker';
  picker.value = swatch.hex;
  picker.setAttribute(
    'aria-label',
    `Color picker for ${swatch.hex}`
  );
  picker.addEventListener('input', (e) => {
    updateSwatch(swatch.id, e.target.value);
  });

  // Hex text input
  const hex = document.createElement('input');
  hex.type = 'text';
  hex.className = 'swatch__hex';
  hex.value = swatch.hex;
  hex.spellcheck = false;
  hex.maxLength = 9; // for #aabbccdd
  hex.setAttribute('aria-label', `Hex value for color ${swatch.hex}`);
  hex.addEventListener('change', (e) => {
    const value = e.target.value.trim();
    if (isValidColor(value)) {
      updateSwatch(swatch.id, value.toLowerCase());
    } else {
      // revert to the current state value
      e.target.value = swatch.hex;
      e.target.classList.add('is-invalid');
      setTimeout(() => e.target.classList.remove('is-invalid'), 800);
    }
  });

  // Remove button
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'swatch__remove';
  remove.setAttribute('aria-label', `Remove color ${swatch.hex}`);
  remove.textContent = '×';
  remove.addEventListener('click', () => {
    removeSwatch(swatch.id);
  });

  wrapper.appendChild(picker);
  wrapper.appendChild(hex);
  wrapper.appendChild(remove);
  return wrapper;
}