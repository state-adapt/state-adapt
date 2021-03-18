export function getAction<Type extends string, Payload>(
  type: Type,
  payload?: Payload,
) {
  return { type, payload };
}
