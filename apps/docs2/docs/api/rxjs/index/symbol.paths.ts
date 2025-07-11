import { readFileSync } from 'fs';
import { join } from 'path';
import { sections } from './sections';

/*
This used to use VitePress's dynamic routes, but the search functionality does not support them,
so I just added a script following the typedoc script that will look here for the paths to import
from after the default typedoc output directory is written to.
*/
export default {
  sections: () => sections,
  paths: () =>
    sections
      .flatMap(section => section.items)
      .map(item => ({
        ...item,
        content: readFileSync(join((import.meta as any).dirname, item.def.path), 'utf-8'),
      })),
};
