import { Adapt } from '@state-adapt/rxjs';
import { useContext, useState } from 'react';
import { AdaptContext } from './adapt.context';

export const useAdapt: Adapt['init'] = <T extends any[]>(...args: T) => {
  const adapt = useContext(AdaptContext);
  const [store] = useState(() => (adapt.init as any)(...args));
  return store;
};
