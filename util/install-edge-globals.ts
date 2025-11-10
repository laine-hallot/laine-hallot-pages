import { Edge } from 'edge.js';
import { relative, resolve, dirname } from 'node:path';

export const installEdgeGlobals = (edge: Edge) => {
  edge.global('NODE_ENV', process.env.NODE_ENV || 'development');

  edge.global(
    'asRelativeOutputUri',
    /**
     * Transform a file path that was originally written relative to the output root (e.g. `./_site/`) into a relative path
     * starting from the template file where `asRelativeOutputUri` was called to the location specified by `uriPath`.
     * This is useful when you can't rely on absolute paths in your URIs like when writing code that should work on a local server and GH pages.
     *
     * **NOTE**: this your build process must mirror the directory structure of your page templates for this to work
     *
     * @example
     * Given the directory structure:
     * ```sh
     * _site/ # Build output directory
     * | dist.js
     * | welcome.html
     * | user/
     * | | settings.html
     * src/
     * | views/
     * | | welcome.edge
     * | | user/
     * | | | settings.edge
     *
     * ```
     * The expected behavior is:
     * ```js
     * // src/views/welcome.edge
     * asRelativeOutputUri('./dist.js') // returns `./dist.js`
     * ```
     * ```js
     * // src/views/user/settings.edge
     * asRelativeOutputUri('./dist.js') // returns `../dist.js`
     * ```
     * @param uriPath
     * @returns
     */
    function (uri: string): string {
      const outputBase = resolve('_site/');
      const pageDepth = dirname(
        relative(edge.loader.mounted['pages'], this.$caller.filename),
      );

      const finalUri = relative(
        resolve(`./_site/${pageDepth}`),
        resolve(outputBase, uri),
      );

      return finalUri;
    },
  );
};
