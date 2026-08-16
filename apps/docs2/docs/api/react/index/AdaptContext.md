---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/react/src/lib/adapt.context.ts#L52
---

# Variable: AdaptContext

> `const` **AdaptContext**: `Context`\<\{ `adapt`: `any`; `watch`: `any`; \}\>

Defined in: [react/src/lib/adapt.context.ts:52](https://github.com/state-adapt/state-adapt/blob/main/libs/react/src/lib/adapt.context.ts#L52)

Supplies a custom StateAdapt configuration to StateAdapt's React hooks.

The context already contains [defaultStateAdapt](defaultStateAdapt.md), so applications only
need to render a provider when they want to customize the configuration.

## Example

```tsx
import { AdaptContext } from '@state-adapt/react';
import { configureStateAdapt } from '@state-adapt/rxjs';

const stateAdapt = configureStateAdapt({ showSelectors: false });

root.render(
  <AdaptContext.Provider value={stateAdapt}>
    <App />
  </AdaptContext.Provider>,
);
```
