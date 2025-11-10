import { join } from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

import { Edge } from 'edge.js';

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildHtml = async () => {
  console.log('Building Edge Templates...');

  const edge = new Edge({ cache: false });
  edge.mount(resolve('src/views'));

  edge.global('NODE_ENV', process.env.NODE_ENV || 'development');

  const html = await edge.render('index');
  fs.writeFileSync(resolve('_site/index.html'), html);
  console.log('Done');
};

const buildCss = () => {
  console.log('Building CSS...');

  const output = execSync(
    'npx postcss -o ./_site/styles.css ./src/styles/*.css',
  );

  console.log('Done');
};

const buildAssets = async () => {
  console.log('Copying assets');
  await fs.promises
    .cp(resolve('./assets'), resolve('./_site/assets'), { recursive: true })
    .catch((err) => {
      if (err !== null) {
        console.error(err);
      }
    });
  console.log('Done');
};

const buildJS = async () => {
  console.log('Copying js files');
  await fs.promises.cp(resolve('./src/scripts/'), resolve('./_site/'), {
    recursive: true,
  });
  console.log('Done');
};

export { buildHtml, buildCss, buildAssets, buildJS };
