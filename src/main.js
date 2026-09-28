import './style.css';
import { initPalette } from './ui/palette.js';
import { seedPalette } from './state.js';

seedPalette();
initPalette();

console.log('Accessible Palette — palette editor ready');