import { concat, Observable, of } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { getAction } from '../get-action.function';
import { getCatchHttpError } from './get-catch-http-error.function';

// For TypeScript 4.7 (Angular 14) this will be unnecessary as `typeof functionName<Generic>`
// will be supported. See https://stackoverflow.com/a/64840774/4906280
export interface GetHttpActions<Res, Body, Err> {
  (http$: Observable<Res>, getResponse: (res: Res) => [boolean, Body, Err]): Observable<
    | {
        type: 'request$';
        payload: void;
      }
    | {
        type: 'success$';
        payload: Body;
      }
    | {
        type: 'error$';
        payload: Err;
      }
    | {
        type: 'error$';
        payload: string;
      }
  >;
}

export function getHttpActions<Res, Body, Err>(
  ...[http$, getResponse]: Parameters<GetHttpActions<Res, Body, Err>>
): ReturnType<GetHttpActions<Res, Body, Err>> {
  return concat(
    of(getAction('request$')),
    http$.pipe(
      map(res => {
        const [succeeded, body, err] = getResponse(res);
        return succeeded ? getAction(`success$`, body) : getAction(`error$`, err);
      }),
      getCatchHttpError('error$'),
      share(),
    ),
  );
}
