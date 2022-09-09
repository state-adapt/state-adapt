import { inject } from '@angular/core';
import { AdaptCommon } from '@state-adapt/rxjs';

export const adapt: AdaptCommon['init'] = <T extends any[]>(...args: T) => {
  const adaptDep = inject(AdaptCommon);
  return (adaptDep.init as any)(...args);
};
