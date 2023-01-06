import { inject } from '@angular/core';
import { Adapt } from '@state-adapt/rxjs';
import { AdaptNgrx } from './adapt-ngrx.service';

export const adaptNgrx: Adapt['init'] = <T extends any[]>(...args: T) => {
  const adaptDep = inject(AdaptNgrx); // Needs it from NgRx store
  return (adaptDep.init as any)(...args);
};
