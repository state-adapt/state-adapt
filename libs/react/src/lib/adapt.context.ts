import React from 'react';
import { defaultStateAdapt } from './default-state-adapt.const';

/**
 * Supplies a custom StateAdapt configuration to StateAdapt's React hooks.
 *
 * The context already contains {@link defaultStateAdapt}, so applications only
 * need to render a provider when they want to customize the configuration.
 * Create that configuration with {@link createStateAdapt} and provide the
 * same instance you import `adapt` and `watch` from.
 */
// The types may be too complicated, because even value={defaultStateAdapt} doesn't work without typing it explicitly:
export const AdaptContext = React.createContext<{ adapt: any; watch: any }>(
  defaultStateAdapt,
);
