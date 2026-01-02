import type { Image, Paragraph, Text } from 'mdast';
import fs, { readdirSync } from 'fs';
import path from 'node:path';
import { resolve } from 'path';
import { Edge } from 'edge.js';
import { edgeMarkdown, Markdown } from 'edge-markdown';
import { toMarkdown } from 'mdast-util-to-markdown';
import { visit } from 'unist-util-visit';

import { installEdgeGlobals } from '../install-edge-globals.ts';

type MarkdownOptions = Exclude<
  Parameters<Markdown['parse']>[number],
  undefined
>;

type RendererHook = Required<MarkdownOptions>['hooks'][number];

type MdMetaData = { title: string; image: { src: string; alt: string } };

const useMarkdownMetaData = (): {
  fileInfo: Record<string, MdMetaData>;
  extractMarkdownMetaData: RendererHook;
} => {
  const fileInfo: Record<string, MdMetaData> = {};

  return {
    fileInfo,
    extractMarkdownMetaData: (node, file) => {
      if (file.basename !== undefined) {
        if (
          node.tagName === 'h1' &&
          fileInfo[file.basename]?.title === undefined
        ) {
          // assumes structure is <h1><a></a>Title</h1>
          fileInfo[file.basename] = {
            ...(fileInfo[file.basename] ?? {}),
            title: (
              node.children[1] as Extract<
                (typeof node.children)[1],
                { type: 'text' }
              >
            ).value,
          };
        } else if (
          node.tagName === 'img' &&
          fileInfo[file.basename]?.image === undefined
        ) {
          fileInfo[file.basename] = {
            ...(fileInfo[file.basename] ?? {}),
            image: {
              src: node.properties.src as string,
              alt: node.properties.alt as string,
            },
          };
        }
      }
    },
  };
};

const OBSIDIAN_LINK_REGEX = /\!\[\[(?<fileName>.*)]]/g;

/** this is a predicate since specifiying the node type in the visitor was giving an error */
const isTextNode = (node: any): node is Text => true;

export const buildBlogPages = async () => {
  console.log('Blog pages');
  const edgeMd = new Edge({ cache: false });
  edgeMd.mount('pages', resolve('src/views/pages'));
  edgeMd.mount('components', resolve('src/views/components'));
  edgeMd.mount('templates', resolve('src/views/templates'));

  installEdgeGlobals(edgeMd);

  const { fileInfo, extractMarkdownMetaData } = useMarkdownMetaData();

  edgeMd.use(
    edgeMarkdown({
      prefix: 'markdown',
      highlight: true,
      hooks: [extractMarkdownMetaData],
      allowHTML: true,
      remarkPlugins: [
        () => (tree) => {
          visit(tree, 'text', (node: any) => {
            if (isTextNode(node)) {
              const matches = Array.from(
                (node.value as String).matchAll(OBSIDIAN_LINK_REGEX),
              );
              const match = matches[0];
              if (match !== undefined) {
                const fileName = match.groups['fileName'];
                // @ts-expect-error -- lazy
                node.type = 'paragraph';
                // @ts-expect-error -- lazy
                node.children = [
                  {
                    type: 'text',
                    value: node.value.slice(
                      0,
                      match.index > 2 ? match.index - 2 : match.index,
                    ),
                  },
                  {
                    type: 'image',
                    url: path.join('/assets/', fileName),
                  },
                  {
                    type: 'text',
                    value: node.value.slice(match.index + fileName.length + 5),
                  },
                ];
                delete node.value;
              }
            }
          });
        },
      ],
      rhypePlugins: [
        () => (tree) => {
          //console.log(tree.children);
          visit(tree, 'element', (node) => {
            if (node.tagName === 'img') {
              node.properties.class = 'block';
              console.log(node);
            }
          });
        },
      ],
    }),
  );

  fs.mkdirSync('_site/blog/articles', { recursive: true });
  if ('pages' in edgeMd.loader.mounted) {
    const postsRoot = `${edgeMd.loader.mounted.pages}/blog/articles`;
    const files = readdirSync(postsRoot, {
      withFileTypes: true,
      recursive: false,
    });
    const articles = await Promise.all(
      files
        .filter((page) => page.isFile() && /\.md$/.test(page.name))
        .map(async (page) => {
          const nameNoExtension = page.name.match(/(.*).md$/)![1];
          console.log(`- Building ${nameNoExtension}.md`);

          edgeMd.registerTemplate(`pages::blog/articles/${nameNoExtension}`, {
            template: `
            @let(doc = await $markdown.render({
              prefix: 'markdown',
              highlight: true,
              file: '${postsRoot}/${page.name}',
              toc: {
                enabled: true,
                maxDepth: 2,
              },
            }))
            @component('templates::blog-article', { title: "${nameNoExtension}", doc })
              @slot('article')
                {{{ doc.content }}}
              @endslot
            @end
          `,
          });
          edgeMd.tags;
          const html = await edgeMd.render(
            `pages::blog/articles/${nameNoExtension}`,
          );
          fs.writeFileSync(
            resolve(`_site/blog/articles/${nameNoExtension}.html`),
            html,
          );

          return {
            name: page.name,
            path: `/${path.relative(
              '/_site/',
              `/_site/blog/articles/${nameNoExtension}.html`,
            )}`,
          };
        }),
    );
    console.log('Blog index');
    const postList = await edgeMd.render('pages::blog/index', {
      articles: articles.map((article) => ({
        ...article,
        ...(fileInfo[article.name] ?? {}),
      })),
    });

    fs.writeFileSync(resolve('_site/blog/index.html'), postList);
  }
};
