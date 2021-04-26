import { Injectable } from '@angular/core';
import { MiniStore, Selectors } from '@state-adapt/core';
import { AdaptCommon } from '@state-adapt/core';
import { createSideMenuStore, sideMenuActions } from './side-menu-store';

@Injectable({
  providedIn: 'root',
})
export class SideMenuStoreService {
  constructor(private adapt: AdaptCommon<any>) {
    this.store = createSideMenuStore(this.adapt);
  }

  store: MiniStore<
    boolean,
    Selectors<boolean> & { getState: (state: unknown) => boolean }
  >;

  private toggle$ = sideMenuActions.toggle$;
  private set$ = sideMenuActions.set$;

  toggle(): void {
    this.toggle$.next();
  }

  set(value: boolean): void {
    this.set$.next(value);
  }

  get state() {
    return this.store.getState();
  }
}
