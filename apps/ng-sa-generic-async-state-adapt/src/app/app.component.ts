import { Component } from '@angular/core';
import { AsyncStateServiceFactory } from './async-state-service';

@Component({
  selector: 'state-adapt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'ng-sa-generic-async-state-adapt';

  user1Service = this.asyncStateServiceFactory.createUserService('API User 1');
  user2Service = this.asyncStateServiceFactory.createUserService('API User 2');

  user1$ = this.user1Service.adapter.store.getEntity();
  waiting1$ = this.user1Service.adapter.store.getWaiting();
  error1$ = this.user1Service.adapter.store.getError();
  accepted1$ = this.user1Service.adapter.store.getCommandAccepted();

  user2$ = this.user2Service.adapter.store.getEntity();
  waiting2$ = this.user2Service.adapter.store.getWaiting();
  error2$ = this.user2Service.adapter.store.getError();
  accepted2$ = this.user2Service.adapter.store.getCommandAccepted();

  button1Click(): void {
    const randonUid = Math.floor(Math.random() * 4) + 1;
    this.user1Service.getByUid(randonUid.toString());
  }

  button2Click(): void {
    const randonUid = Math.floor(Math.random() * 4) + 1;
    this.user2Service.getByUid(randonUid.toString());
  }

  constructor(private asyncStateServiceFactory: AsyncStateServiceFactory) {}
}
