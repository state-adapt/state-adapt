export * from './types';
export { domRecognizer } from './dom';
export { javascriptRecognizer } from './javascript';
export { reduxRecognizer } from './redux';
export { patternRecognizer } from './utils';

import { domRecognizer } from './dom';
import { javascriptRecognizer } from './javascript';
import { reduxRecognizer } from './redux';
import { CommandRecognizer } from './types';

export const builtInRecognizers: readonly CommandRecognizer[] = [
  javascriptRecognizer,
  domRecognizer,
  reduxRecognizer,
];
