import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Action } from '../actions/action.interface';
import { prefixAction } from '../actions/prefix-action.function';

export function prefixSource<
  Type extends string = string,
  Prefix extends string = string,
>(prefix: Prefix) {
  return <T>(
    obs$: Observable<Action<T, Type>>,
  ): Observable<Action<T, `${Prefix} ${Type}`>> =>
    obs$.pipe(map(action => prefixAction<Prefix, Type, T>(prefix, action)));
}
