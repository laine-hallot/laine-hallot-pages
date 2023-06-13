import { buildHtml, buildCss, buildAssets, buildJS } from './util/build-tools.js';

export const run = async () => {
  await buildAssets();
  buildCss();
  await buildHtml();
  await buildJS();
};
