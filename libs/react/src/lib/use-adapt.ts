import { AdaptCommon } from '@state-adapt/core';
import { useContext, useState } from 'react';
import { AdaptContext } from './adapt.context';

export const useAdapt: AdaptCommon['init'] = <T extends any[]>(...args: T) => {
  const adapt = useContext(AdaptContext);
  const [store] = useState(() => (adapt.init as any)(...args));
  return store;
};
