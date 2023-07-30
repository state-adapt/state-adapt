import { configureStateAdapt } from '../../../../libs/rxjs/src';
import React from 'react';

export const defaultStateAdapt = configureStateAdapt();
export const AdaptContext = React.createContext(defaultStateAdapt);
