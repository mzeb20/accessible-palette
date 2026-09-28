import './style.css';
import { seedPalette } from './state.js';
import { initPalette } from './ui/palette.js';
import { initContrast } from './ui/contrast.js';

seedPalette();
initPalette();
initContrast();

console.log('Accessible Palette — contrast checker ready');