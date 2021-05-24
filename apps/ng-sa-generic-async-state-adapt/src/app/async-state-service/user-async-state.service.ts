import { AdaptCommon, Source } from '@state-adapt/core';
import { of, timer } from 'rxjs';
import { catchError, map, mapTo } from 'rxjs/operators';
import { serializeError } from 'serialize-error';
import { AsyncStateAdapter } from '../async-state-adapter';
import { AsyncService } from './async-service';
import { IUser } from '../users/user';

const user1 = {
  uid: '1',
  displayName: 'Jane Doo',
  email: 'user1@provider1.com',
  photoURL: '',
  providerId: '',
  phoneNumber: '',
  claims: {},
};

const user2 = {
  uid: '2',
  displayName: 'John Snow',
  email: 'user2@provider2.com',
  photoURL: '',
  providerId: '',
  phoneNumber: '',
  claims: {},
};

const user3 = {
  uid: '3',
  displayName: 'Homer Simpson',
  email: 'simpsonh@springfield.com',
  photoURL: '',
  providerId: '',
  phoneNumber: '',
  claims: {},
};

export class UserAsyncStateService implements AsyncService<IUser> {
  constructor(private featureName: string, adapt: AdaptCommon<any>) {
    this.adapter = new AsyncStateAdapter<IUser>(
      adapt,
      featureName,
      this.commandSourceList,
    );
  }

  private getByUidCommandSent$ = new Source<string>(
    '[' + this.featureName + '] GetbyUid Command Sent',
  );

  private commandSourceList: Source<any>[] = [this.getByUidCommandSent$];

  adapter: AsyncStateAdapter<IUser>;

  getByUid(_uid: string) {
    let user: IUser | null;
    let status: number;
    let error: Error | null;

    switch (_uid) {
      case '1':
        user = user1;
        status = 200;
        error = null;
        break;
      case '2':
        user = user2;
        status = 200;
        error = null;
        break;
      case '3':
        user = user3;
        status = 200;
        error = null;
        break;
      default:
        user = null;
        status = 404;
        error = new Error('User not found');
    }

    const fetchData = () =>
      timer(500).pipe(
        mapTo({
          body: user,
          status: status,
          error: error,
        }),
      );

    /*const { request$, success$, error$ } = getHttpSources(
      '[API User]',
      fetchData(),
      res => [res.status === 200, res.body, res.error],
    );*/

    this.getByUidCommandSent$.next(_uid);

    fetchData()
      .pipe(
        map(res => {
          if (res.status >= 200 && res.status < 300) {
            this.adapter.commandAccepted$.next();
            if (res.body) {
              this.adapter.entityChanged$.next(res.body);
              return res.body;
            } else {
              return undefined;
            }
          } else {
            throw res.error;
          }
        }),
        catchError((e: Error) => {
          this.adapter.errorThrown$.next(serializeError(e));
          return of(null);
        }),
      )
      .subscribe();
  }
}
