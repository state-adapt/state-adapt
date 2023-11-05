## 2.0.4

- Bugfix(rxjs): Fix SSR bug
- Chore(ngrx/ngxs): Update dependendency versions

## 2.0.3

- Bugfix(core): Allow types to be portable
- Bugfix(react): Loosen types for context
- Bugfix(rxjs,react): When stores are inactive return initialState in state selectors

## 2.0.2

- Bugfix(react): Fix stale build cache issue

## 2.0.1

- Bugfix(rxjs): Support adapter definition in AdaptOptions

## 2.0.0

### Breaking Changes

- [45](https://github.com/state-adapt/state-adapt/issues/45)

### All Changes

- Refactor(core,rxjs): Flatten types for joined adapters and stores
- Refactor(rxjs,react,angular,ngrx,ngxs)!: Simplify StateAdapt.adapt syntax

## 1.2.1

- Bugfix(core/adapters): Fix TS issue with createEntityAdapter alt id

## 1.2.0

- Refactor(core): Clean up types and allow sources factory
- Feature(core): Add experimental adaptInjectable function

## 1.1.0

- Chore(angular): Allow version 16

## 1.0.0

- Feature(react): Add ability to prevent unnecessary renderings with useStore
- Refactor(rxjs)!: Flip the order of arguments for getRequestSources and splitRequestSources

## 0.63.0

- Feature(rxjs): Change joinStores to work with useStore

## 0.62.0

- Refactor(core): Deprecate mapPayloads
- Refactor(rxjs/global-store)!: Create configureStateAdapt for more flexibility
- Refactor(rxjs/http): Deprecate http sources, create simplified request sources
- Feature(rxjs): Create mapEachWithEffect function for efficient side effects from arrays
- Feature(react)!: Create useStore and make useAdapt more natural for React

## 0.61.0

- Feature(core/adapters): Detect default Id type in EntityState
- Refactor(core)!: Move noop and update reactions out of createAdapter
- Refactor(core)!: Rename AdaptCommon class to Adapt
- Bugfix(core): Fix TS prod build issue with entity adapter

## 0.60.0

- Feature: Add @state-adapt/angular-router library
- Feature(angular-router): Add librarySaNavigateComponent
- Bugfix(core): undefined is filtered from selections, so TS needed to reflect that.
- Bugfix(core): Fix buildAdapter type inference
- Refactor(core)!: Remove deprecated buildSelectors function
- Feature(core): Pass selectorsCache into state reactions
- Feature(core/adapters): Add base adapters for each type
- Refactor(core)!: Remove inappropriate update state changes from joinAdapters
- Refactor(core)!: Remove inappropriate update state change from createAdapter
- Feature(core/adapters): Add createEntityAdapter

## 0.59.0 2022-11-09

- Feature(core): Add function to memoize generic selectors

## 0.58.0 2022-11-04

- Chore(rxjs): Add integration TS tests
- Bugfix(core)!: Fix joinAdapters type inference
- - Require string union of properties not given adapters
- Bugfix(core): Fix buildAdapter type inference
- Refactor(core): Rename MiniStore to SmartStore, nest private properties
- Refactor(core)!: Remove deprecated adapt.init overloads
- Refactor(core)!: Remove createSelector function
- - Remove reselect dependency
- Refactor(core)!: Remove deprecated joinSelectors function
- Bugfix(core): Rewrite selectors with new caching mechanism
- - Show selector cache in Redux Devtools
- Refactor(core)!: Remove deprecated join function
- Feature(core): Improve string adapter
- Bugfix(core): Handle void payloads better
- Bugfix(core): Pass child adapter initial state to child state changes

## 0.57.0 2022-10-24

- Bugfix(core): Handle void payloads in joinAdapters

## 0.56.0 2022-10-24

- Bugfix(core): Handle empty selectors in joinAdapters
- Chore(core): Add secondary import for core adapters
- Feat(core): Add some core adapters
- - booleanAdapter
- - stringAdapter
- - numberAdapter

## 0.55.0 2022-10-23

- Fix(core): TS issue with build adapters

## 0.54.0 2022-10-22

- Fix(core): Prod build TS issue

## 0.52.0 2022-09-10, 0.53.0 2022-09-10

- Fix(core): Prod build TS issue

## 0.51.0 2022-09-09

- Refactor!: Seperate out libraries into peer dependencies
- Refactor(NgRx)!: Rename adapt to adaptNgrx
- Refactor(Ngxs)!: Rename adapt to adaptNgxs

## 0.50.0 2022-08-25

- Refactor!: Separate core into rxjs, try enabling single-library imports
- Refactor: Deprecate redundant init overloads
- Chore: Add LICENSE.md
- Chore: Add CONTRIBUTING.md
- Chore: Add CHANGELOG.md
