import { getPayload } from './get-payload.function';

describe('getPayload', () => {
  it('should return the payload if the value is an action', () => {
    const action = { type: 'Something', payload: 'Something' };
    expect(getPayload(action)).toBe('Something');
  });

  it('should return the value if the value is not an action', () => {
    const value = 'Something';
    expect(getPayload(value)).toBe('Something');
  });

  it('should return the value if the value is not an action', () => {
    const value = { type: 'Something' };
    expect(getPayload(value)).toEqual({ type: 'Something' });
  });
});
