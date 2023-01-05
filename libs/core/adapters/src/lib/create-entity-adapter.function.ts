import {
  Selectors,
  ReactionsWithSelectors,
  createAdapter,
  Adapter,
  buildAdapter,
  SelectorsCache,
  BasicAdapterMethods,
  FlatAnyKey,
  createSelectorsCache,
  getMemoizedSelector,
} from '@state-adapt/core';
import { PrefixedAfterVerb } from '@state-adapt/core';

type Index = number | string | symbol;

export interface EntityState<Entity, Id extends Index = string> {
  ids: Id[];
  entities: Record<Id, Entity>;
}

export type EntityAdapterOptions<A extends Adapter<any, any, any>> = {
  adapter: A;
};

export type BooleanSelectorKeys<S extends Selectors<any>> = keyof {
  [K in Extract<keyof S, string>]: S[K] extends (state: any) => boolean ? K : never;
};

function getNewEntitiesCopy<Id extends Index, Entity>() {
  return [[] as Id[], {} as Record<Id, Entity>] as const;
}

export function createEntityState<
  Entity,
  Id extends Index = Entity extends { id: Index } ? Entity['id'] : never,
  State extends EntityState<Entity, Id> = EntityState<Entity, Id>,
>(state: Partial<State> = {}): EntityState<Entity, Id> {
  return { ...state, ids: [] as Id[], entities: {} as Record<Id, Entity> };
}

type EntityStateReactions<
  Entity,
  Id extends Index,
  State extends EntityState<Entity, Id>,
  R extends ReactionsWithSelectors<Entity, any>,
  Filters extends string[],
> = {
  addOne: (state: State, payload: Entity) => State;
  addMany: (state: State, payload: Entity[]) => State;
  setOne: (state: State, payload: Entity) => State;
  setMany: (state: State, payload: Entity[]) => State;
  setAll: (state: State, payload: Entity[]) => State;
  removeOne: (state: State, payload: Id) => State;
  removeMany: (state: State, payload: Id[]) => State;
  removeAll: (state: State) => State;
  updateOne: (state: State, payload: { id: Id; changes: Partial<Entity> }) => State;
  upsertOne: (state: State, payload: Entity) => State;
  upsertMany: (state: State, payload: Entity[]) => State;
} & BasicAdapterMethods<State> & {
    // }; //     : never; //     ? (state: State, payload: Payload, initialState: State) => State //   ) => any //     initialState: any, //     payload: any, //     state: any, //     : PrefixedAfterVerb<K, Prefix>]: R[K] extends ( //     ? never //   [K in Extract<keyof R, string> as K extends IgnoredKeys // > = { //   Payload, //   IgnoredKeys extends string, //   Prefix extends string, //   R extends ReactionsWithSelectors<any, any>, //   State extends EntityState<any, any>, // type EntityReaction< // This repo has a workaround, but it's currently returning a 500 error: https://gcanti.github.io/fp-ts/ // This is called 'higher-kinded types' https://github.com/microsoft/TypeScript/issues/44875 // `Payload` would need to take R[K] as a generic
    [K in Extract<keyof R, string> as K extends typeof ingoredKeys[number]
      ? never
      : PrefixedAfterVerb<
          Exclude<K, 'set' | 'reset'>,
          Filters[number] | 'all'
        >]: R[K] extends (state: any, payload: any, initialState: any) => any
      ? (
          state: State,
          payload: Parameters<R[K]>[1] extends void ? void : Parameters<R[K]>[1],
          initialState: State,
        ) => State
      : never;
  } & {
    [K in Extract<keyof R, string> as K extends typeof ingoredKeys[number]
      ? never
      : PrefixedAfterVerb<K, 'one'>]: R[K] extends (
      state: any,
      payload: any,
      initialState: any,
    ) => any
      ? (
          state: State,
          payload: Parameters<R[K]>[1] extends void ? Id : [Id, Parameters<R[K]>[1]],
          initialState: State,
        ) => State
      : never;
  } & {
    [K in Extract<keyof R, string> as K extends typeof ingoredKeys[number]
      ? never
      : PrefixedAfterVerb<K, 'many'>]: R[K] extends (
      state: any,
      payload: any,
      initialState: any,
    ) => any
      ? (
          state: State,
          payload: Parameters<R[K]>[1] extends void ? Id[] : [Id, Parameters<R[K]>[1]][],
          initialState: State,
        ) => State
      : never;
  };

type EntityStateSelectors<
  Entity,
  Id extends Index,
  State extends EntityState<Entity, Id>,
  Filters extends string[],
  Sorters extends string[],
> = {
  all: (state: State) => Entity[];
  count: (state: State) => number;
  ids: (state: State) => Id[];
  entities: (state: State) => Record<Id, Entity>;
} & {
  [K in Filters[number]]: (state: any) => Entity[];
} & {
  [K in Filters[number] as `${K}Count`]: (state: any) => number;
} & {
  [K in Filters[number] as `allAre${Capitalize<K>}`]: (state: any) => boolean;
} & {
  [K in `${Filters[number] | 'all'}By${Capitalize<Sorters[number]>}`]: (
    state: any,
  ) => Entity[];
};

const ingoredKeys = ['selectors', 'noop', 'set'] as const;

export function createEntityAdapter<
  Entity,
  Id extends Index = Entity extends { id: Index } ? Entity['id'] : never,
  State extends EntityState<Entity, Id> = EntityState<Entity, Id>,
>() {
  return <
    S extends Selectors<Entity>,
    R extends ReactionsWithSelectors<Entity, S>,
    Filters extends BooleanSelectorKeys<S>[] = never[],
    Sorters extends Extract<keyof S, string>[] = never[],
  >(
    adapter: Adapter<Entity, S, R>,
    options?: {
      filters?: Filters;
      sorters?: Sorters;
      useCache?: boolean;
    },
  ): FlatAnyKey<
    EntityStateReactions<Entity, Id, State, R, Filters> & {
      selectors: EntityStateSelectors<Entity, Id, State, Filters, Sorters>;
    }
  > => {
    const fullAdapter = createAdapter<Entity>()(adapter);
    const entitySelectors = fullAdapter.selectors as S & { id: (entity: Entity) => Id };
    entitySelectors.id =
      entitySelectors.id || ((entity: Entity) => (entity as any).id as Id);
    const useCache = options?.useCache ?? false;

    const getEntityCache = (entity: Entity, cache?: SelectorsCache) => {
      if (useCache) {
        const id = entitySelectors.id(entity) as string;
        const namespace = 'entity_' + id;
        const children = cache?.__children;
        return (
          children &&
          (children[namespace] = children[namespace] || createSelectorsCache())
        );
      }
    };
    const destroyEntityCache = (entity: Entity, cache: SelectorsCache | undefined) => {
      if (useCache) {
        delete cache?.__children['entity_' + (entitySelectors.id(entity) as string)];
      }
    };
    const destroyEntityCaches = (cache: SelectorsCache | undefined) => {
      if (useCache) {
        const children = cache?.__children;
        if (children) {
          for (const key in children) {
            if (key.startsWith('entity_')) {
              delete children[key];
            }
          }
        }
      }
    };

    const entityAdapter = buildAdapter<State>()({
      addOne: (state, entity: Entity): State => {
        const id = entitySelectors.id(entity);
        return {
          ...state,
          ids: [...state.ids, id],
          entities: { ...state.entities, [id]: entity },
        };
      },
      addMany: (state, entities: Entity[]): State => {
        const newEntities = { ...state.entities };
        entities.forEach(entity => {
          const id = entitySelectors.id(entity);
          newEntities[id] = entity;
        });
        return {
          ...state,
          ids: [...state.ids, ...entities.map(entity => entitySelectors.id(entity))],
          entities: newEntities,
        };
      },
      setOne: (state, entity: Entity): State => {
        const id = entitySelectors.id(entity);
        const oldEntity = state.entities[id];
        const ids = oldEntity ? state.ids : [...state.ids, id];
        const entities = { ...state.entities, [id]: entity };
        return { ...state, ids, entities };
      },
      setMany: (state, entities: Entity[]): State => {
        const newIds = [] as Id[];
        const newEntities = { ...state.entities };
        entities.forEach(entity => {
          const id = entitySelectors.id(entity);
          if (!state.entities[id]) {
            newIds.push(id);
          }
          newEntities[id] = entity;
        });
        return {
          ...state,
          ids: newIds.length ? [...state.ids, ...newIds] : state.ids,
          entities: newEntities,
        };
      },
      setAll: (state, entities: Entity[], i, cache): State => {
        destroyEntityCaches(cache);
        const [ids, newEntities] = getNewEntitiesCopy<Id, Entity>();
        entities.forEach(entity => {
          const id = entitySelectors.id(entity);
          ids.push(id);
          newEntities[id] = entity;
        });
        return {
          ...state,
          ids,
          entities: newEntities,
        };
      },
      removeOne: (state, id: Id, i, cache): State => {
        const newIds = state.ids.filter(entityId => entityId !== id);
        const newEntities = { ...state.entities };
        delete newEntities[id];
        destroyEntityCache(state.entities[id], cache);
        return {
          ...state,
          ids: newIds,
          entities: newEntities,
        };
      },
      removeMany: (state, ids: Id[], i, cache): State => {
        const newIds = [] as Id[];
        const newEntities = {} as Record<Id, Entity>;
        state.ids.forEach(id => {
          if (!ids.includes(id)) {
            newIds.push(id);
            newEntities[id] = state.entities[id];
          } else {
            destroyEntityCache(state.entities[id], cache);
          }
        });
        return {
          ...state,
          ids: newIds,
          entities: newEntities,
        };
      },
      removeAll: (state, payload: void, i, cache): State => {
        destroyEntityCaches(cache);
        return {
          ...state,
          ids: [],
          entities: {},
        };
      },
      upsertOne: (state, entity: Entity): State => {
        const id = entitySelectors.id(entity);
        const oldEntity = state.entities[id];
        return {
          ...state,
          ids: oldEntity ? state.ids : [...state.ids, id],
          entities: {
            ...state.entities,
            [id]: oldEntity ? { ...oldEntity, ...entity } : entity,
          },
        };
      },
      upsertMany: (state, entities: Entity[]): State => {
        const ids = !entities.length ? state.ids : [...state.ids];
        const newEntities = !entities.length ? state.entities : { ...state.entities };
        entities.forEach(entity => {
          const id = entitySelectors.id(entity);
          const oldEntity = state.entities[id];
          if (!oldEntity) {
            ids.push(id);
            newEntities[id] = entity;
          } else {
            newEntities[id] = { ...oldEntity, ...entity };
          }
        });
        return {
          ...state,
          ids,
          entities: newEntities,
        };
      },
      selectors: {
        entities: state => state.entities,
        ids: state => state.ids,
      },
    })({
      all: s => s.ids.map(id => s.entities[id]),
      count: s => s.ids.length,
    })();

    // // Summary
    // - `${state}One${Change}` // setOneSelected(false)
    // - `${state}All${Change}` // setAllSelected(false)
    // - `${state}${Filter}${Change}` // setSelectedSelected(false)

    // - `oneBy{Sorter}`: NO
    // - `allBy{Sorter}`: Person[]; // allByAge
    // - `${filter}By{Sorter}`: Person[]; // selectedByAge

    // - `count`: number; // count
    // - `${filter}Count`: number; // selectedCount
    // - `allAre${Filter}`: boolean; // allAreSelected
    const reactions = entityAdapter as any;
    const selectors = entityAdapter.selectors as any;

    const createSortSelector = (key: string, parentSelectorKey: string, sorter: string) =>
      getMemoizedSelector(key, (state: any, cache) =>
        [...selectors[parentSelectorKey](state, cache)].sort((a: any, b: any) =>
          (entitySelectors[sorter] as any)(a, getEntityCache(a, cache)) >
          (entitySelectors[sorter] as any)(b, getEntityCache(b, cache))
            ? 1
            : -1,
        ),
      );

    for (const stateChangeName in adapter) {
      if (!ingoredKeys.includes(stateChangeName as any)) {
        const stateChange = adapter[stateChangeName] as Exclude<
          typeof adapter[keyof typeof adapter],
          S
        >;
        let stateChangeVerb = stateChangeName;
        let stateChangeNoun = '';
        for (let i = 0; i < stateChangeName.length; i++) {
          const char = stateChangeName[i];
          if (char === char.toUpperCase()) {
            stateChangeVerb = stateChangeName.slice(0, i);
            stateChangeNoun = stateChangeName.slice(i);
            break;
          }
        }

        // One
        reactions[`${stateChangeVerb}One${stateChangeNoun}`] = (
          state: State,
          [id, payload]: [Id, any],
          initialState: State,
          cache: SelectorsCache,
        ) => {
          const entity = state.entities[id];
          const initialEntity = initialState.entities[id];
          const newEntity = stateChange(
            entity,
            payload,
            initialEntity,
            getEntityCache(entity, cache)!,
          );
          return {
            ...state,
            entities: {
              ...state.entities,
              [id]: newEntity,
            },
          };
        };

        // Many
        reactions[`${stateChangeVerb}Many${stateChangeNoun}`] = (
          state: State,
          updates: [Id, any][],
          initialState: State,
          cache: SelectorsCache,
        ) => {
          const newEntities = { ...state.entities };
          updates.forEach(([id, payload]) => {
            const entity = state.entities[id];
            const initialEntity = initialState.entities[id];
            const newEntity = stateChange(
              entity,
              payload,
              initialEntity,
              getEntityCache(entity, cache)!,
            );
            newEntities[id] = newEntity;
          });
          return {
            ...state,
            entities: newEntities,
          };
        };

        // All
        const ignoredKeys = ['set', 'reset'] as string[]; // 'set', 'reset'
        if (!ignoredKeys.includes(stateChangeName)) {
          reactions[`${stateChangeVerb}All${stateChangeNoun}`] = (
            state: State,
            payload: any,
            initialState: State,
            cache: SelectorsCache,
          ) => {
            const newEntities = { ...state.entities };
            state.ids.forEach(id => {
              const entity = state.entities[id];
              const initialEntity = initialState.entities[id];
              const newEntity = stateChange(
                entity,
                payload,
                initialEntity,
                getEntityCache(entity, cache)!,
              );
              newEntities[id] = newEntity;
            });
            return {
              ...state,
              entities: newEntities,
            };
          };
        }

        // Filters
        let sortersLooped = false;
        const filters = options?.filters || [];
        const sorters = options?.sorters || [];
        filters.forEach(filter => {
          const filterStr = String(filter);
          const Filter = filterStr[0].toUpperCase() + filterStr.slice(1);
          reactions[`${stateChangeVerb}${Filter}${stateChangeNoun}`] = (
            state: State,
            payload: any,
            initialState: State,
            cache: SelectorsCache,
          ) => {
            const newEntities = { ...state.entities };
            state.ids.forEach(id => {
              const entity = state.entities[id];
              const entityCache = getEntityCache(entity, cache);
              if ((entitySelectors[filter] as any)(entity, entityCache)) {
                const initialEntity = initialState.entities[id];
                const newEntity = stateChange(
                  entity,
                  payload,
                  initialEntity,
                  entityCache!,
                );
                newEntities[id] = newEntity;
              }
            });
            return {
              ...state,
              entities: newEntities,
            };
          };

          if (!selectors[filterStr]) {
            selectors[filterStr] = getMemoizedSelector(
              filterStr,
              (state: State, cache) => {
                return selectors.all(state, cache).filter((entity: any) => {
                  const entityCache = getEntityCache(entity, cache);
                  return (entitySelectors[filter] as any)(entity, entityCache);
                });
              },
            );

            const filterStrCount = `${filterStr}Count`;
            selectors[filterStrCount] = getMemoizedSelector(
              filterStrCount,
              (state: State, cache) => selectors[filterStr](state, cache).length,
            );
            const allAreFilter = `allAre${Filter}`;
            selectors[allAreFilter] = getMemoizedSelector(
              allAreFilter,
              (state: State, cache) =>
                selectors[filterStrCount](state, cache) === selectors.count(state, cache),
            );

            sorters.forEach(sorter => {
              const sorterstr = String(sorter);
              if (sorter === filter) return;
              const Sorter = sorterstr[0].toUpperCase() + sorterstr.slice(1);
              const filterStrBySort = `${filterStr}By${Sorter}`;
              selectors[filterStrBySort] = createSortSelector(
                filterStrBySort,
                filterStr,
                sorter,
              );

              const allBySorter = `allBy${Sorter}`;
              if (!selectors[allBySorter]) {
                createSortSelector(allBySorter, 'all', sorter);
              }
            });

            sortersLooped = true;
          }
        });

        // Sorters
        // Might have to loop through sorters for filters, so don't loop again later
        if (!sortersLooped) {
          sortersLooped = true;
          sorters.forEach(sorter => {
            const sorterstr = String(sorter);
            const Sorter = sorterstr[0].toUpperCase() + sorterstr.slice(1);
            const allBySorter = `allBy${Sorter}`;
            selectors[allBySorter] = createSortSelector(allBySorter, 'all', sorter);
          });
        }
      }
    }

    // Might add later, for each selector
    // - `${selector}
    // movies.id$ [1, 4, 5, 8]
    // movies.uiModel$ [whatever, whatever]
    // movies.selected$ [true, false, false, true]
    // All selectors
    // Object.entries(entitySelectors).forEach(([name, selector]: [string, any]) => {
    //   selectors3[name] =
    //     selectors3[name] ||
    //     ((state: State, cache: SelectorsCache) => selector(state.entities, cache));
    // });
    // I could do more, but this is already a lot

    return entityAdapter as any;
  };
}
