import { CommandRecognizer } from './types';
import { initializedBy, methodCall, rootIdentifier } from './utils';

const methods = new Set(['set', 'update', 'reset']);

export const stateAdaptRecognizer: CommandRecognizer = {
  name: 'state-adapt',
  recognize(call, context) {
    const method = methodCall(call);
    if (!method || !methods.has(method.name)) return undefined;
    const root = rootIdentifier(method.receiver);
    const source = root ? context.importSource(root) : undefined;
    if (
      !source?.startsWith('@state-adapt/') &&
      !initializedBy(method.receiver, call, context, ['adapt', 'createStore'])
    )
      return undefined;
    return { api: `StateAdapt.${method.name}`, resource: method.receiver };
  },
};
