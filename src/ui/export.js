// ---------------------------------------------------------
// Export panel UI. Wires the three buttons to their
// exporters, shows the output, and handles copy.
// ---------------------------------------------------------

import { getPalette, subscribe } from '../state.js';
import { EXPORTERS } from '../lib/export.js';

const outputEl = document.getElementById('export-output');
const buttonsContainer = document.querySelector('.export');

let currentFormat = 'css';

export function initExport() {
  // Wire up buttons
  const buttons = buttonsContainer.querySelectorAll('[data-export]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentFormat = btn.dataset.export;
      render(getPalette());
    });
  });

  // Re-render whenever the palette changes
  subscribe(render);

  // Initial render
  render(getPalette());
}

function render(palette) {
  const exporter = EXPORTERS[currentFormat];
  if (!exporter) return;

  const code = exporter(palette);

  // Clear + rebuild the output area
  outputEl.innerHTML = '';

  const codeEl = document.createElement('code');
  codeEl.textContent = code;
  outputEl.appendChild(codeEl);

  // Copy button (recreated on each render to stay in sync)
  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'export-copy';
  copyBtn.textContent = 'Copy';
  copyBtn.setAttribute('aria-label', `Copy ${currentFormat} output to clipboard`);
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code);
      flashCopied(copyBtn);
    } catch {
      // Fallback: select the text so user can copy manually
      const range = document.createRange();
      range.selectNodeContents(outputEl);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  });
  outputEl.appendChild(copyBtn);

  // Update button active state
  const buttons = buttonsContainer.querySelectorAll('[data-export]');
  buttons.forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.export === currentFormat);
  });
}

/**
 * Show a "Copied!" state on the button for a moment.
 */
function flashCopied(btn) {
  const original = btn.textContent;
  btn.textContent = 'Copied!';
  btn.classList.add('is-copied');
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove('is-copied');
  }, 1200);
}