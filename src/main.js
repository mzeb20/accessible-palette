import './style.css';
import { seedPalette } from './state.js';
import { initPalette } from './ui/palette.js';
import { initContrast } from './ui/contrast.js';
import { initCvd } from './ui/cvd.js';
import { initExport } from './ui/export.js';

seedPalette();
initPalette();
initContrast();
initCvd();
initExport();

console.log('Accessible Palette — ready');