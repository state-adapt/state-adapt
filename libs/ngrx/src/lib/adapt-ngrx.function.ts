import { inject } from '@angular/core';
import { AdaptCommon } from '@state-adapt/rxjs';
import { AdaptNgrx } from './adapt-ngrx.service';

export const adaptNgrx: AdaptCommon['init'] = <T extends any[]>(...args: T) => {
  const adaptDep = inject(AdaptNgrx); // Needs it from NgRx store
  return (adaptDep.init as any)(...args);
};
