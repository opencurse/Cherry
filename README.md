# Cherry Blossom Animation

A photorealistic cherry blossom falling effect built with Three.js and transparent petal texture cutouts. The effect uses layered depth, variable wind, fluttering motion and responsive performance tuning to match the supplied reference style without blocking interaction.

## Features

- 16 distinct transparent petal textures with irregular botanical forms
- Curved 3D petal meshes with individual tumbling motion and drift
- Wind simulation with gusts, air resistance, and varying terminal velocity
- Cinematic depth layering for foreground, midground, and background petals
- Reduced-motion and hidden-tab behavior safeguards
- Mobile-friendly rendering with DPR caps and responsive particle density

## Project layout

- `index.html` – app entry point
- `src/main.js` – bootstraps the scene
- `src/petalSimulation.js` – petal scenes, rendering, and animation updates
- `src/windPhysics.js` – wind and gust simulation model
- `src/styles.css` – full-viewport styling and pointer-event constraints
- `public/textures/petals/` – generated petal image assets

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the dev server:

   ```bash
   npm run dev
   ```

3. Open the local Vite URL printed in the terminal, usually:

   http://localhost:3000

## Production build

```bash
npm run build
```

Preview the production bundle:

```bash
npm run preview
```

## Asset generation

The petal textures are generated as SVG cutouts under `public/textures/petals/`. Each texture is a transparent petal with natural gradients, veining, and soft edge shading. The project uses 16 variations to avoid repetition and to produce a more botanical, photoreal look.

If you want to regenerate the petals, run the script used during setup or create additional SVG variations in the same directory following the same naming convention:

```bash
petal-1.svg
petal-2.svg
...
petal-16.svg
```

## Notes

- The canvas is fixed full-screen and uses `pointer-events: none` so it does not block UI elements.
- Rendering pauses when the tab is hidden and reduces motion when `prefers-reduced-motion` is enabled.
- The project uses a capped device pixel ratio and adaptive petal counts to stay smooth on mobile devices.
