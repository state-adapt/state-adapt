## 0.60.0

- Feature: Add @state-adapt/angular-router library
- Feature(angular-router): Add librarySaNavigateComponent
- Bugfix(core): undefined is filtered from selections, so TS needed to reflect that.
- Bugfix(core): Fix buildAdapter type inference
- Refactor(core)!: Remove deprecated buildSelectors function
- Feature(core): Pass selectorsCache into state reactions
- Feature(core/adapters): Add base adapters for each type

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
