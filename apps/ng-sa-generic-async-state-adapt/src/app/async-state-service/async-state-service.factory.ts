import { Injectable } from '@angular/core';
import { AdaptCommon } from '@state-adapt/core';
import { UserAsyncStateService } from './user-async-state.service';

@Injectable({ providedIn: 'root' })
export class AsyncStateServiceFactory {
  constructor(private adapt: AdaptCommon<any>) {}

  createUserService(featureName: string): UserAsyncStateService {
    return new UserAsyncStateService(featureName, this.adapt);
  }
}
