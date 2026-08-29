import { CommandRecognizer } from './types';
import { initializedBy, methodCall } from './utils';

const arrayMethods = new Set([
  'copyWithin',
  'fill',
  'pop',
  'push',
  'reverse',
  'shift',
  'sort',
  'splice',
  'unshift',
]);
const mapSetMethods = new Set(['add', 'delete', 'set']);

export const javascriptRecognizer: CommandRecognizer = {
  name: 'javascript',
  recognize(call, context) {
    const method = methodCall(call);
    if (!method) return undefined;
    if (arrayMethods.has(method.name))
      return { api: `Array.${method.name}`, resource: method.receiver };
    if (
      mapSetMethods.has(method.name) &&
      initializedBy(method.receiver, call, context, ['Map', 'Set', 'WeakMap', 'WeakSet'])
    )
      return { api: `Map/Set.${method.name}`, resource: method.receiver };
    return undefined;
  },
};
