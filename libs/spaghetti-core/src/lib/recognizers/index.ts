export * from './types';
export { domRecognizer } from './dom';
export { javascriptRecognizer } from './javascript';
export { patternRecognizer } from './utils';

import { domRecognizer } from './dom';
import { javascriptRecognizer } from './javascript';
import { CommandRecognizer } from './types';

export const builtInRecognizers: readonly CommandRecognizer[] = [
  javascriptRecognizer,
  domRecognizer,
];
