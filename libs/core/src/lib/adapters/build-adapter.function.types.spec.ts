import { buildAdapter } from './build-adapter.function';
import { createAdapter } from './create-adapter.function';

const baseBooleanAdapter = createAdapter<boolean>()({});

const adapter = buildAdapter<boolean>()(baseBooleanAdapter)({
  newProp: s => (s.state ? 'asdf' : 'fdsa'),
})({
  newProp2: s => s.newProp.split('')[0],
})();

describe('buildAdapter', () => {
  it('should test types', () => {
    function checkTypes() {
      // @ts-expect-error: newProp does not return a number
      const newProp: number = adapter.selectors.newProp(true);
    }
  });
});
