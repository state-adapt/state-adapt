export function getAction<Type extends string>(type: Type): { type: Type };

export function getAction<Type extends string, Payload>(
  type: Type,
  payload: Payload,
): { type: Type; payload: Payload };

export function getAction<Type extends string, Payload>(
  type: Type,
  payload?: Payload,
) {
  return { type, payload };
}
