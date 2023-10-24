import { configureStateAdapt } from '@state-adapt/rxjs';
import React from 'react';

export const defaultStateAdapt = configureStateAdapt();
// The types may be too complicated, becuase even value={defaultStateAdapt} doesn't work without typing it explicitly:
export const AdaptContext = React.createContext<{ adapt: any; watch: any }>(
  defaultStateAdapt,
);
