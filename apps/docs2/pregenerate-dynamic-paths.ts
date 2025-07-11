import { writeFileSync } from 'fs';
import angularConfig from './docs/api/angular/index/symbol.paths';
import coreConfig from './docs/api/core/src/symbol.paths';
import reactConfig from './docs/api/react/index/symbol.paths';
import rxjsConfig from './docs/api/rxjs/index/symbol.paths';
import { join } from 'path';

function createMdFromContent(dir: string, paths: ReturnType<typeof angularConfig.paths>) {
  const fullDir = join((import.meta as any).dirname, dir);
  paths.forEach(path => {
    console.log('path.def.path', path.def.path);
    console.log('content', path.content);
    const symbol = path.params.symbol;
    const filename = `${symbol}.md`;
    writeFileSync(`${fullDir}/${filename}`, path.content, 'utf-8');
  });
}

createMdFromContent('./docs/api/angular/index', angularConfig.paths());
createMdFromContent('./docs/api/core/src', coreConfig.paths());
createMdFromContent('./docs/api/react/index', reactConfig.paths());
createMdFromContent('./docs/api/rxjs/index', rxjsConfig.paths());
