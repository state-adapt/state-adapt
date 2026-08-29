import { CommandRecognizer } from './types';
import { initializedBy, methodCall } from './utils';

const methods = new Set(['complete', 'error', 'next']);

export const rxjsRecognizer: CommandRecognizer = {
  name: 'rxjs',
  recognize(call, context) {
    const method = methodCall(call);
    if (!method || !methods.has(method.name)) return undefined;
    const likelySubject =
      initializedBy(method.receiver, call, context, [
        'Subject',
        'BehaviorSubject',
        'ReplaySubject',
        'AsyncSubject',
      ]) || method.receiver.getText(context.sourceFile).endsWith('Subject');
    return likelySubject
      ? { api: `RxJS.Subject.${method.name}`, resource: method.receiver }
      : undefined;
  },
};
