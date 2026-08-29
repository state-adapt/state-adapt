import { CommandRecognizer } from './types';
import { identifierCall, initializedBy, methodCall } from './utils';

export const reduxRecognizer: CommandRecognizer = {
  name: 'redux',
  recognize(call, context) {
    const method = methodCall(call);
    if (method?.name === 'dispatch')
      return { api: 'Redux.dispatch', resource: method.receiver };
    const fn = identifierCall(call);
    return fn === 'dispatch' &&
      initializedBy(call.expression, call, context, ['useDispatch'])
      ? { api: 'Redux.dispatch', resource: call.expression }
      : undefined;
  },
};
