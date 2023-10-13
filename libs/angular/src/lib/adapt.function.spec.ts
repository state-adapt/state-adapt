import { Injectable } from '@angular/core';
import { createAdapter, joinAdapters } from '@state-adapt/core';
import {
  EntityState,
  createEntityAdapter,
  createEntityState,
} from '@state-adapt/core/adapters';
import { adapt } from './adapt.function';
import { joinStores } from '@state-adapt/rxjs';
import { Observable } from 'rxjs';

export enum ProductionProcess {
  Peeled = 'peeled',
  Unpeeled = 'unpeeled',
}

export interface Fruit {
  id: string;
  name: string;
  weight: number;
  productionProcess?: ProductionProcess;
}

// Banana

export interface Banana extends Fruit {
  curvature?: number;
}

export interface BananaStateModel {
  bananas: EntityState<Banana, 'id'>;
}

export const bananasInitialState: BananaStateModel = {
  bananas: createEntityState<Banana>(),
};

const bananaAdapter = createAdapter<Banana>()({
  setName: (banana, name: string) => ({
    ...banana,
    name,
  }),
  setWeight: (banana, weight: number) => ({
    ...banana,
    weight,
  }),
  setCurvature: (banana, curvature: number) => ({
    ...banana,
    curvature,
  }),
});

const bananasEntityAdapter = createEntityAdapter<Banana>()(bananaAdapter);

export const bananasAdapter = joinAdapters<BananaStateModel>()({
  bananas: bananasEntityAdapter,
})({
  allBananasValid: state => state.bananasAll.every(banana => !!banana.curvature),
  allProcessesDefined: state =>
    state.bananasAll.every(banana => !!banana.productionProcess) &&
    state.bananasAll.length > 0,
})();

// Apple

export interface Apple extends Fruit {
  rounding?: number;
}

export interface PeeledApple extends Apple {
  color?: string;
}

export const isPeeledApple = (apple: Apples): apple is PeeledApple => {
  return apple.productionProcess === ProductionProcess.Peeled;
};

export interface UnpeeledApple extends Apple {
  amountOfBadSpots?: number;
}

export const isUnpeeledApple = (apple: Apples): apple is UnpeeledApple => {
  return apple.productionProcess === ProductionProcess.Unpeeled;
};

export type Apples = Apple | PeeledApple | UnpeeledApple;

export interface AppleStateModel {
  apples: EntityState<Apples, 'id'>;
}

export const applesInitialState: AppleStateModel = {
  apples: createEntityState<Apples>(),
};

const appleAdapter = createAdapter<Apples>()({
  setName: (apple, name: string) => ({
    ...apple,
    name,
  }),
  setWeight: (apple, weight: number) => ({
    ...apple,
    weight,
  }),
  setProductionProcess: (apple, productionProcess: ProductionProcess) => ({
    ...apple,
    productionProcess,
  }),
});

const applesEntityAdapter = createEntityAdapter<Apples>()(appleAdapter);

export const applesAdapter = joinAdapters<AppleStateModel>()({
  apples: applesEntityAdapter,
})({
  unpeeledAples: (state): PeeledApple[] =>
    state.applesAll.filter(apple => isUnpeeledApple(apple)),
  peeledApples: (state): UnpeeledApple[] =>
    state.applesAll.filter(apple => isPeeledApple(apple)),
  allProcessesDefined: state =>
    state.applesAll.every(apple => !!apple.productionProcess) &&
    state.applesAll.length > 0,
})({
  allUnpeeledApplesProcessed: state =>
    state.unpeeledAples.every(unpeeledApple => !!unpeeledApple.color),
  allGPeeledApplesProcessed: state =>
    state.peeledApples.every(peeledApple => !!peeledApple.amountOfBadSpots),
})({
  allApplesProcessed: state =>
    state.allUnpeeledApplesProcessed && state.allGPeeledApplesProcessed,
})({
  allApplesProcessed2: state => state.allApplesProcessed,
})({
  allApplesProcessed3: state => state.allApplesProcessed,
})({
  allApplesProcessed4: state => state.allApplesProcessed,
})({
  allApplesProcessed5: state => state.allApplesProcessed,
})({
  allApplesProcessed6: state => state.allApplesProcessed,
})({
  allApplesProcessed7: state => state.allApplesProcessed,
})({
  allApplesProcessed8: state => state.allApplesProcessed,
})({
  allApplesProcessed9: state => state.allApplesProcessed,
})({
  allApplesProcessed10: state => state.allApplesProcessed,
})();

// Combined Store

@Injectable({ providedIn: 'root' })
export class SmoothieStore {
  private appleStore = adapt(applesInitialState, applesAdapter);
  private bananaStore = adapt(bananasInitialState, bananasAdapter);

  public store = joinStores({
    appleStore: this.appleStore,
    bananaStore: this.bananaStore,
  })({
    allFruit: state => [...state.appleStoreApplesAll, ...state.bananaStoreBananasAll],
  })({
    allProductionProcessesDefined: state =>
      state.appleStoreAllProcessesDefined && state.bananaStoreAllProcessesDefined,
  })({
    allProductionProcessesDefined2: state => state.allProductionProcessesDefined,
  })({
    allProductionProcessesDefined3: state => state.allProductionProcessesDefined2,
  })({
    allProductionProcessesDefined4: state => state.allProductionProcessesDefined2,
  })({
    allProductionProcessesDefined5: state => state.allProductionProcessesDefined2,
  })({
    allProductionProcessesDefined6: state => state.allProductionProcessesDefined2,
  })({
    allProductionProcessesDefined7: state => state.allProductionProcessesDefined2,
  })({
    allProductionProcessesDefined8: state => state.allProductionProcessesDefined2,
  })({
    allProductionProcessesDefined9: state => state.allProductionProcessesDefined2,
  })({
    allProductionProcessesDefined10: state => state.allProductionProcessesDefined2,
  })();

  b = this.store.allProductionProcessesDefined10$;

  // @ts-expect-error, should be Observable<boolean>
  a = expectType<Observable<boolean>>()(this.store.allProductionProcessesDefined10$)
    .result;
}

describe('adapt Angular wrapper function', () => {
  it('should compile', () => {
    expect(true).toBeTruthy();
  });
});
