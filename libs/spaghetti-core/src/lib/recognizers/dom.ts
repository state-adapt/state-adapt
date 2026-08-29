import * as ts from 'typescript';

import { CommandRecognizer } from './types';
import { methodCall } from './utils';

const mutations = new Set([
  'after',
  'append',
  'appendChild',
  'before',
  'insertAdjacentElement',
  'insertAdjacentHTML',
  'insertAdjacentText',
  'prepend',
  'remove',
  'removeAttribute',
  'removeChild',
  'replaceChild',
  'replaceChildren',
  'replaceWith',
  'setAttribute',
  'toggleAttribute',
]);
const tokenMutations = new Set(['add', 'remove', 'replace', 'toggle']);

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
