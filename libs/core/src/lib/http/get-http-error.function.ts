import { of } from 'rxjs';
import { getAction } from '../get-action.function';

export function getHttpError<Type extends string>(type: Type) {
  return (err: string) => of(getAction(type, err));
}
