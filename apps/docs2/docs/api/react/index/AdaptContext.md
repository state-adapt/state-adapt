---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/react/src/lib/adapt.context.ts#L13
---

# Variable: AdaptContext

> `const` **AdaptContext**: `Context`\<\{ `adapt`: `any`; `watch`: `any`; \}\>

Defined in: [lib/adapt.context.ts:13](https://github.com/state-adapt/state-adapt/blob/main/libs/react/src/lib/adapt.context.ts#L13)

Supplies a custom StateAdapt configuration to StateAdapt's React hooks.

The context already contains [defaultStateAdapt](defaultStateAdapt.md), so applications only
need to render a provider when they want to customize the configuration.
Create that configuration with [createStateAdapt](createStateAdapt.md) and provide the
same instance you import `adapt` and `watch` from.
