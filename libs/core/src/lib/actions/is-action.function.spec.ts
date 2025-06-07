import { isAction } from './is-action.function';

describe('isAction', () => {
  it('should return true for an object with type and payload properties', () => {
    const action = { type: 'TEST_ACTION', payload: 'test_payload' };
    expect(isAction(action)).toBe(true);
  });

  it('should return false for an object without type property', () => {
    const action = { payload: 'test_payload' };
    expect(isAction(action)).toBe(false);
  });

  it('should return false for an object without payload property', () => {
    const action = { type: 'TEST_ACTION' };
    expect(isAction(action)).toBe(false);
  });

  it('should return false for a non-object value', () => {
    expect(isAction(null)).toBe(false);
    expect(isAction(undefined)).toBe(false);
    expect(isAction(42)).toBe(false);
    expect(isAction('string')).toBe(false);
    expect(isAction([])).toBe(false);
  });
});