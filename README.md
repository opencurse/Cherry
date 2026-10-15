# Cherry Blossom Animation

**A photorealistic cherry blossom falling effect built with Three.js and transparent petal texture cutouts. The effect uses layered depth, variable wind, fluttering motion and responsive performance tuning to match the supplied reference style without blocking interaction.**

- **16 distinct transparent petal textures with irregular botanical forms**
- **Curved 3D petal meshes with individual tumbling motion and drift**
- **Wind simulation with gusts, air resistance and varying terminal velocity**
- **Cinematic depth layering for foreground, midground, and background petals**
- **Reduced-motion and hidden-tab behavior safeguards**
- **Mobile-friendly rendering with DPR caps and responsive particle density**

## Project layout

- **`src/index.vue` – Vue view and canvas lifecycle**
- **`src/main.ts` – application bootstrap**
- **`src/petalSimulation.ts` – petal rendering and animation updates**
- **`src/windPhysics.ts` – wind and gust simulation model**
- **`src/styles.scss` – full-viewport styling and pointer-event constraints**
- **`vite.config.ts` – Vue build and generated HTML entry**

Vite serves the HTML entry during development and generates `dist/index.html` for deployment; no source HTML file is needed.

## Asset generation

**The petal textures are generated as SVG cutouts under `public/textures/petals/`. Each texture is a transparent petal with natural gradients, veining and soft edge shading. The project uses 16 variations to avoid repetition and to produce a more botanical, photoreal look.**

**If you want to regenerate the petals, run the script used during setup or create additional SVG variations in the same directory following the same naming convention:**

## Notes

- **The canvas is fixed full-screen and uses `pointer-events: none` so it does not block UI elements.**
- **Rendering pauses when the tab is hidden and reduces motion when `prefers-reduced-motion` is enabled.**
- **The project uses a capped device pixel ratio and adaptive petal counts to stay smooth on mobile devices.**
