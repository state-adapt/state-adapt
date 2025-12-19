// ChatGPT

export function mdAngularTemplatesPlugin() {
  const ANGULAR_COMPONENT_REGEX = /@Component\s*\(/;
  const ANGULAR_TEMPLATE_REGEX = /(\[[^=\s>\]]+\]\s*=|\([^=\s>\)]+\)\s*=|\{\{[^\}]+\}\})/; // [prop]= or (event)= or {{anything}}

  // ```ts[...optional stuff]\n...code...\n```
  const TS_FENCE_REGEX = /```(ts|typescript)([^\n]*)?\n([\s\S]*?)```/g;
  const HTML_FENCE_REGEX = /```html([^\n]*)?\n([\s\S]*?)```/g;

  return {
    name: 'markdown-angular-ts-fence',
    enforce: 'pre' as const,

    transform(code: string, id: string) {
      // Only touch markdown files
      if (!id.endsWith('.md')) return null;

      let changed = false;

      const transformedForTs = code.replace(
        TS_FENCE_REGEX,
        (fullMatch, language: string, info = '', body = '') => {
          if (!ANGULAR_COMPONENT_REGEX.test(body)) {
            return fullMatch;
          }

          changed = true;
          // Preserve any extra info/attributes after the language
          return `\`\`\`angular-ts${info}\n${body}\`\`\``;
        },
      );

      // Second pass: HTML => angular-html
      const transformed = transformedForTs.replace(
        HTML_FENCE_REGEX,
        (fullMatch, info = '', body = '') => {
          // Very simple Angular template heuristic:
          // any [prop]= or (event)= style attribute
          if (!ANGULAR_TEMPLATE_REGEX.test(body)) {
            return fullMatch;
          }

          changed = true;
          return `\`\`\`angular-html${info}\n${body}\`\`\``;
        },
      );

      if (!changed) return null;
      return {
        code: transformed,
        map: null,
      };
    },
  };
}
