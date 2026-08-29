import * as ts from 'typescript';

import { CommandRecognizer } from './types';
import { methodCall } from './utils';

const mutations = new Set([
  'appendChild',
  'insertAdjacentElement',
  'removeChild',
  'replaceChild',
  'toggleAttribute',
]);
const tokenMutations = new Set(['replace', 'toggle']);

export const domRecognizer: CommandRecognizer = {
  name: 'dom',
  recognize(call) {
    const method = methodCall(call);
    if (!method) return undefined;
    if (mutations.has(method.name))
      return { api: `DOM.${method.name}`, resource: method.receiver };
    if (
      tokenMutations.has(method.name) &&
      ts.isPropertyAccessExpression(method.receiver) &&
      method.receiver.name.text === 'classList'
    )
      return { api: `DOMTokenList.${method.name}`, resource: method.receiver };
    return undefined;
  },
};
