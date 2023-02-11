import { configureStateAdapt } from '@state-adapt/rxjs';
import React from 'react';

export const defaultStateAdapt = configureStateAdapt();
export const AdaptContext = React.createContext(defaultStateAdapt);
