import { inject } from '@angular/core';
import { AdaptCommon } from '@state-adapt/rxjs';
import { AdaptNgxs } from './adapt-ngxs.service';

export const adaptNgxs: AdaptCommon['init'] = <T extends any[]>(...args: T) => {
  const adaptDep = inject(AdaptNgxs); // Needs it from NgRx store
  return (adaptDep.init as any)(...args);
};
