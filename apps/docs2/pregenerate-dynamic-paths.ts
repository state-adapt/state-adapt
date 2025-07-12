import { writeFileSync } from 'fs';
import angularConfig from './docs/api/angular/index/symbol.paths';
import coreConfig from './docs/api/core/src/symbol.paths';
import reactConfig from './docs/api/react/index/symbol.paths';
import rxjsConfig from './docs/api/rxjs/index/symbol.paths';
import { join } from 'path';

function getFrontmatter(url: string) {
  return `---
definedIn: ${url}
---

`;
}

function createMdFromContent(dir: string, paths: ReturnType<typeof angularConfig.paths>) {
  const fullDir = join((import.meta as any).dirname, dir);
  paths.forEach(path => {
    const symbol = path.params.symbol;
    const filename = `${symbol}.md`;

    // Find url from text that says `Defined in: [libs/rxjs/etc...](url)
    const urlMatch = path.content.match(/Defined in: \[.*?\]\((.*?)\)/);
    const url = urlMatch ? urlMatch[1] : '';
    const frontmatter = getFrontmatter(url);

    writeFileSync(`${fullDir}/${filename}`, frontmatter + path.content, 'utf-8');
  });
}

createMdFromContent('./docs/api/angular/index', angularConfig.paths());
createMdFromContent('./docs/api/core/src', coreConfig.paths());
createMdFromContent('./docs/api/react/index', reactConfig.paths());
createMdFromContent('./docs/api/rxjs/index', rxjsConfig.paths());
