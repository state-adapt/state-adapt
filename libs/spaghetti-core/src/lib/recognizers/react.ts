import { CommandRecognizer } from './types';
import { identifierCall, initializedBy, methodCall } from './utils';

export const reactRecognizer: CommandRecognizer = {
  name: 'react',
  recognize(call, context) {
    const method = methodCall(call);
    if (method?.name === 'setState')
      return { api: 'React.setState', resource: method.receiver };
    const name = identifierCall(call);
    if (!name) return undefined;
    if (/^set[A-Z_$]/.test(name))
      return { api: 'React.setState', resource: call.expression };
    if (initializedBy(call.expression, call, context, ['useReducer']))
      return { api: 'React.dispatch', resource: call.expression };
    return undefined;
  },
};
