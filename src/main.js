import './style.css';
import { seedPalette } from './state.js';
import { initPalette } from './ui/palette.js';
import { initContrast } from './ui/contrast.js';
import { initCvd } from './ui/cvd.js';

seedPalette();
initPalette();
initContrast();
initCvd();

console.log('Accessible Palette — all features ready');