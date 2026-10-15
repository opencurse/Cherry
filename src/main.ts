import { createApp } from 'vue';
import Index from './index.vue';
import './styles.scss';
import type { PetalSimulation } from './petalSimulation';

declare global {
  interface Window {
    __petalSimulation?: PetalSimulation;
  }
}

createApp(Index).mount('#app');