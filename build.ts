import {
  buildHtml,
  buildCss,
  buildAssets,
  buildJS,
} from './util/build-tools.ts';

export const run = async () => {
  await buildAssets();
  buildCss();
  await buildHtml();
  await buildJS();
};
