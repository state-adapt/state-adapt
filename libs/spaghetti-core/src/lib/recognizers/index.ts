export * from './types';
export { domRecognizer } from './dom';
export { javascriptRecognizer } from './javascript';
export { frameworkApiNames, frameworkRecognizer } from './framework';
export { patternRecognizer } from './utils';

import { domRecognizer } from './dom';
import { frameworkRecognizer } from './framework';
import { javascriptRecognizer } from './javascript';
import { CommandRecognizer } from './types';

export const builtInRecognizers: readonly CommandRecognizer[] = [
  javascriptRecognizer,
  domRecognizer,
  frameworkRecognizer,
];
