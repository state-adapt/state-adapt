import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { MarkdownRenderer } from 'vitepress';

type Tokens = Parameters<MarkdownRenderer['block']['parse']>[3];

// VitePress 1.6 supports line ranges and region markers, but not heading-based
// includes. Use the Markdown parser so headings inside code fences don't count.
export function mdIncludeSection(md: MarkdownRenderer, librariesDir: string) {
  md.core.ruler.before('block', 'include_section', state => {
    if (!state.src.includes('@include-section:')) return;
    const tokens: Tokens = [];
    md.block.parse(state.src, md, state.env, tokens);
    const lines = state.src.split('\n');

    for (const token of tokens.reverse()) {
      if (token.type !== 'html_block' || token.level !== 0 || !token.map) continue;
      const directive =
        /^<!--\s*@include-section:\s*@state-adapt\/([\w-]+)#([^\n]+?)\s*-->$/.exec(
          token.content.trim(),
        );
      if (!directive) continue;

      const [, library, heading] = directive;
      const file = resolve(librariesDir, library, 'README.md');
      const contents = readFileSync(file, 'utf8').replace(/\r\n?/g, '\n');
      const sectionTokens: Tokens = [];
      md.block.parse(contents, md, { ...state.env, path: file }, sectionTokens);

      const headings = sectionTokens.flatMap((token, index) =>
        token.type === 'heading_open' && token.level === 0 && token.map
          ? [
              {
                tag: token.tag,
                range: token.map,
                title: sectionTokens[index + 1]?.content,
              },
            ]
          : [],
      );
      const matches = headings.filter(({ title }) => title === heading.trim());
      if (matches.length !== 1) {
        throw new Error(`Expected exactly one heading "${heading.trim()}" in ${file}`);
      }
      const [match] = matches;
      const next = headings
        .slice(headings.indexOf(match) + 1)
        .find(h => h.tag <= match.tag);
      const section = contents.split('\n').slice(match.range[1], next?.range[0]);

      // VitePress tracks these paths for dev-server invalidation.
      state.env.includes?.push(file);
      const [start, end] = token.map;
      lines.splice(start, end - start, ...section);
    }

    state.src = lines.join('\n');
  });
}
