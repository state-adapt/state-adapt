# @state-adapt/rxjs

The RxJS layer for defining stores, sources, and related state-management utilities.

## Getting Started

<!-- #region getting-started -->

```sh
npm install rxjs @state-adapt/rxjs
```

<!-- #endregion getting-started -->

<!-- #region standalone-setup -->

To use StateAdapt without a dedicated framework integration, create a file named
`state-adapt.ts`:

```ts
import { configureStateAdapt } from '@state-adapt/rxjs';

export const { adapt, watch } = configureStateAdapt();
```

The default configuration connects to Redux DevTools when the browser extension
is available. See [`configureStateAdapt`](https://state-adapt.github.io/api/rxjs/index/configureStateAdapt)
for customization options.

<!-- #endregion standalone-setup -->

Install [`@state-adapt/core`](https://www.npmjs.com/package/@state-adapt/core) at
the same version as `@state-adapt/rxjs` if it is not already in your project.
