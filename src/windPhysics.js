export function createWindPhysics() {
  const state = { windX: 0, windY: 0, gust: 0, gustStrength: 0 };

  return {
    update(dt, elapsed) {
      const smoothWave = Math.sin(elapsed * 0.14) * 0.28 + Math.sin(elapsed * 0.27 + 1.4) * 0.15;
      const gustWave = Math.sin(elapsed * 1.35 + 2.1) * 0.38 + Math.sin(elapsed * 0.7 + 4.2) * 0.12;
      const crossWave = Math.sin(elapsed * 0.92 + 1.9) * 0.12;

      const targetWindX = smoothWave + crossWave * 0.7;
      const targetWindY = gustWave * 0.22;

      state.windX += (targetWindX - state.windX) * Math.min(1, dt * 1.8);
      state.windY += (targetWindY - state.windY) * Math.min(1, dt * 2.1);
      state.gust = Math.max(0, gustWave + 0.5);
      state.gustStrength = Math.abs(gustWave) * 0.7 + Math.abs(state.windX) * 0.3;

      return state;
    },
  };
}
