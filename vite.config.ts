import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import type { OutputChunk } from 'rollup';
import { defineConfig, type Plugin } from 'vite';

function generatedHtmlEntry(): Plugin {
  return {
    name: 'entry',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url?.split('?')[0] !== '/') {
          next();
          return;
        }

        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html');
        response.end(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Photorealistic cherry blossom falling animation built with Three.js" />
    <title>Cherry</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/@vite/client"></script>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`);
      });
    },
    generateBundle(_options, bundle) {
      const entry = Object.values(bundle).find(
        (output): output is OutputChunk => output.type === 'chunk' && output.isEntry && output.name === 'main',
      );
      if (!entry) throw new Error('Could not find the app entry bundle');

      const cssLinks = [...(entry.viteMetadata?.importedCss ?? [])]
        .map((fileName) => `    <link rel="stylesheet" href="./${fileName}" />`)
        .join('\n');
      this.emitFile({
        type: 'asset',
        fileName: 'index.html',
        source: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Photorealistic cherry blossom falling animation built with Three.js" />
    <title>Cherry</title>
${cssLinks}
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./${entry.fileName}"></script>
  </body>
</html>`,
      });
    },
  };
}

export default defineConfig({
  appType: 'custom',
  plugins: [vue(), generatedHtmlEntry()],
  build: {
    rollupOptions: {
      input: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/main.ts'),
    },
  },
});
