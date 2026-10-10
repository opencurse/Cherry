import './styles.css';
import { PetalSimulation } from './petalSimulation.js';

const canvas = document.querySelector('#scene');
const simulation = new PetalSimulation(canvas);
window.__petalSimulation = simulation;

simulation.init();
