import { readFileSync } from 'fs';
import { join } from 'path';
import { sections } from './sections';

export default {
  sections: () => sections,
  paths: () =>
    sections
      .flatMap(section => section.items)
      .map(item => ({
        ...item,
        content: readFileSync(
          join((import.meta as any).dirname, item.def.path),
          'utf-8',
        ).replaceAll('../../src/', '../src/'),
      })),
};
