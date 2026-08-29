import { CommandRecognizer } from './types';
import { initializedBy, methodCall } from './utils';

export const angularRecognizer: CommandRecognizer = {
  name: 'angular',
  recognize(call, context) {
    const method = methodCall(call);
    if (
      !method ||
      !['set', 'update'].includes(method.name) ||
      !initializedBy(method.receiver, call, context, ['signal', 'model'])
    )
      return undefined;
    return { api: `AngularSignal.${method.name}`, resource: method.receiver };
  },
};
