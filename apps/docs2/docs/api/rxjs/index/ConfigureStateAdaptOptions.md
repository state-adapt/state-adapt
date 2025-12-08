---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/rxjs/src/lib/global-store/configure-state-adapt.options.ts#L12
---

# Type Alias: ConfigureStateAdaptOptions\<Store\>

> **ConfigureStateAdaptOptions**\<`Store`\> = `object` & \{ `store`: `Store`; \} \| \{ `devtools`: `any`; `preloadedState?`: `any`; \}

Defined in: [libs/rxjs/src/lib/global-store/configure-state-adapt.options.ts:12](https://github.com/state-adapt/state-adapt/blob/main/libs/rxjs/src/lib/global-store/configure-state-adapt.options.ts#L12)

`ConfigureStateAdaptOptions` has 4 possible properties:
- `showSelectors?: boolean` (default: `true`) - determines whether to show StateAdapt selectors in Redux DevTools
- `store`: [Store](#store) - Redux-like store
- `devtools: any` - options for Redux DevTools
- `preloadedState?: any` -  self-explanatory

If `store` is provided, `devtools` and `preloadedState` are ignored.

## Type declaration

### showSelectors?

> `optional` **showSelectors**: `boolean`

## Type Parameters

### Store

`Store` *extends* `GlobalStore`\<`any`, `any`\> = `GlobalStore`\<`any`, `any`\>
