import fs from 'fs';
import { execSync } from 'child_process';
import { resolve } from 'path';

import { buildHomePage } from './html/home.ts';
import { buildBlogPages } from './html/blog.ts';

const buildHtml = async () => {
  console.log('Building Edge Templates...');
  await Promise.all([buildHomePage(), buildBlogPages()]);

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
