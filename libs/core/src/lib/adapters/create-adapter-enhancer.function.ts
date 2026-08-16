import { Selectors } from '../selectors/selectors.interface';
import { Adapter, ReactionsWithSelectors } from './adapter.type';
import { BuiltAdapter } from './build-adapter.types';
import { Reactions } from './reactions.interface';

export const adapterEnhancer = Symbol('adapterEnhancer');

/**
 * @experimental This feature is not ready for production and may change in minor releases.
 * */
export type AdapterEnhancer<
  Enhance extends (adapter: any) => Adapter<any, any, any> = (
    adapter: any,
  ) => Adapter<any, any, any>,
> = Enhance & {
  readonly [adapterEnhancer]: true;
};

// TODO: Flesh out StateAdapt 5.0 syntax before publishing this
// so this can be immediately used to help migrate

/**
 * @experimental This feature is not ready for production and may change in minor releases.
 * Marks an adapter-to-adapter function so it can be passed to `buildAdapter`.
 *
 * The helper does not alter the function's signature. This lets an enhancer be
 * reusable while `buildAdapter` recognizes it without confusing it with a
 * reaction block. For contextual type inference, expose reusable enhancers as
 * zero-argument factories such as `withStatus()`. An inline enhancer callback
 * is contextually typed with the adapter built so far.
 */
export function createAdapterEnhancer<
  State,
  S extends Selectors<State>,
  R extends Reactions<State>,
  EnhancedS extends Selectors<State>,
  EnhancedR extends ReactionsWithSelectors<State, EnhancedS>,
>(
  enhance: (adapter: BuiltAdapter<State, R, S>) => Adapter<State, EnhancedS, EnhancedR>,
): AdapterEnhancer<
  (adapter: BuiltAdapter<State, R, S>) => Adapter<State, EnhancedS, EnhancedR>
>;
export function createAdapterEnhancer<
  Enhance extends (adapter: any) => Adapter<any, any, any>,
>(enhance: Enhance): AdapterEnhancer<Enhance>;
export function createAdapterEnhancer(
  enhance: (adapter: any) => Adapter<any, any, any>,
): AdapterEnhancer {
  return Object.assign(enhance, { [adapterEnhancer]: true as const });
}

export function isAdapterEnhancer(value: unknown): value is AdapterEnhancer {
  return (
    typeof value === 'function' &&
    (value as Partial<AdapterEnhancer>)[adapterEnhancer] === true
  );
}
