import { Component } from '@angular/core';
import { AsyncAdapterFactoryService } from './async-generic';

import {IUser} from './users/user';

@Component({
  selector: 'state-adapt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'ng-sa-async-state-demo';

  userAdapter1 = this.userAsyncAdapterFactoryService.createEntityAsyncAdapter(
    'userState1'
  );

  userAdapter2 = this.userAsyncAdapterFactoryService.createEntityAsyncAdapter(
    'userState2'
  );

  user1$ = this.userAdapter1.store.getEntity();
  loading1$ = this.userAdapter1.store.getLoading();

  user2$ = this.userAdapter2.store.getEntity();
  loading2$ = this.userAdapter2.store.getLoading();

  button1Click(): void {
    const user: IUser = {
      uid: '',
      displayName: 'Jane Doo',
      email: 'user1@provider1.com',
      photoURL: '',
      providerId: '',
      phoneNumber: '',
      claims: {},
    };

    this.userAdapter1.request$.next();

    setTimeout(() => {
      this.userAdapter1.receive$.next(user);
    }, 3000);
  }

  button2Click(): void {
    const user: IUser = {
      uid: '',
      displayName: 'John Snow',
      email: 'user2@provider2.com',
      photoURL: '',
      providerId: '',
      phoneNumber: '',
      claims: {},
    };

    this.userAdapter2.request$.next();

    setTimeout(() => {
      this.userAdapter2.receive$.next(user);
    }, 3000);
  }

  constructor(private userAsyncAdapterFactoryService: AsyncAdapterFactoryService<IUser>) {
  }
}
