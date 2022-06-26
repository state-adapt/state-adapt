import { inject } from '@angular/core';
import { AdaptCommon } from '@state-adapt/core';

export const watch: AdaptCommon['watch'] = <T extends any[]>(...args: T) => {
  const adaptDep = inject(AdaptCommon);
  return (adaptDep.watch as any)(...args);
};
