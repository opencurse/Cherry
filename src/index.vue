<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { PetalSimulation } from './petalSimulation';

const canvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  if (!canvas.value) return;

  const simulation = new PetalSimulation(canvas.value);
  window.__petalSimulation = simulation;
  void simulation.init();
});
</script>

<template>
  <canvas id="scene" ref="canvas"></canvas>
</template>