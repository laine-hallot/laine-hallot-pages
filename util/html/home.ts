import fs, { readdirSync } from 'fs';
import { resolve } from 'node:path';
import { Edge } from 'edge.js';
import { installEdgeGlobals } from '../install-edge-globals.ts';

export const buildHomePage = async () => {
  console.log('Home page');
  const edge = new Edge({ cache: false });
  edge.mount('components', resolve('src/views/components'));
  edge.mount('pages', resolve('src/views/pages'));
  edge.mount('templates', resolve('src/views/templates'));

  installEdgeGlobals(edge);

  if ('pages' in edge.loader.mounted) {
    const files = readdirSync(edge.loader.mounted.pages, {
      withFileTypes: true,
      recursive: false,
    });
    await Promise.all(
      files
        .filter((page) => page.isFile() && /\.edge$/.test(page.name))
        .map(async (page) => {
          const nameNoExtension = page.name.match(/(.*).edge$/)![1];
          console.log(`- Building ${nameNoExtension}.edge`);

          const html = await edge.render(`pages::${nameNoExtension}`);
          fs.writeFileSync(resolve(`_site/${nameNoExtension}.html`), html);
        }),
    );
  }
};
