export * from './types';
export { angularRecognizer } from './angular';
export { domRecognizer } from './dom';
export { javascriptRecognizer } from './javascript';
export { reactRecognizer } from './react';
export { reduxRecognizer } from './redux';
export { rxjsRecognizer } from './rxjs';
export { stateAdaptRecognizer } from './state-adapt';
export { patternRecognizer } from './utils';

import { angularRecognizer } from './angular';
import { domRecognizer } from './dom';
import { javascriptRecognizer } from './javascript';
import { reactRecognizer } from './react';
import { reduxRecognizer } from './redux';
import { rxjsRecognizer } from './rxjs';
import { stateAdaptRecognizer } from './state-adapt';
import { CommandRecognizer } from './types';

export const builtInRecognizers: readonly CommandRecognizer[] = [
  javascriptRecognizer,
  domRecognizer,
  stateAdaptRecognizer,
  reactRecognizer,
  angularRecognizer,
  rxjsRecognizer,
  reduxRecognizer,
];
