import { createAdapter, MiniStore, Selectors, Source } from '@state-adapt/core';
import { AdaptCommon } from '@state-adapt/core';

export const sideMenuStateAdapter = createAdapter<boolean>()({
  toggle: (state) => !state,
  set: (state, value: boolean) => value,
});

export const sideMenuActions = {
  toggle$: new Source<void>('[SideMenu] Toggle'),
  set$: new Source<boolean>('[SideMenu] Set'),
};

export function createSideMenuStore(
  adapt: AdaptCommon<any>
): MiniStore<
  boolean,
  Selectors<boolean> & { getState: (state: unknown) => boolean }
> {
  return adapt.init(['sideMenu', sideMenuStateAdapter, false], {
    toggle: sideMenuActions.toggle$,
    set: sideMenuActions.set$,
  });
}
