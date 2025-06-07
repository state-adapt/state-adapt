export function isAction(value: any) {
  // If has both type and payload, treat as Action
  // Otherwise, it doesn't matter if we pass the whole thing as a payload because they payload isn't used.
  // If a plain observable is emitting an object like { type: 'Something' } then it passes through
  // If a plain observable is emitting an object like { type: 'Something', payload: 'Something' } then it expects it to match the payload type
  // return typeof value === 'object' && 'type' in value && 'payload' in value;
  return (
    value !== null && typeof value === 'object' && 'type' in value && 'payload' in value
  );
}
