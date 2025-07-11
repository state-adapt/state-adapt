# Function: getAction()

## Call Signature

> **getAction**\<`Type`\>(`type`): [`Action`](Action.md)\<`void`, `Type`\>

Defined in: [src/lib/actions/get-action.function.ts:16](https://github.com/state-adapt/state-adapt/blob/4ff8540684d6d76a52452612f8fa44ffd7c6016a/libs/core/src/lib/actions/get-action.function.ts#L16)

`getAction` is a function that takes in an action [Type](#getactiontype) and optionally Payload and creates an [Action](Action.md) object.

#### Example: Creating an action with a payload

```typescript
import { getAction } from '@state-adapt/core';

const action = getAction('ADD', 1);

// action = { type: 'ADD', payload: 1 }
```

### Type Parameters

#### Type

`Type` *extends* `string`

### Parameters

#### type

`Type`

### Returns

[`Action`](Action.md)\<`void`, `Type`\>

## Call Signature

> **getAction**\<`Type`, `Payload`\>(`type`, `payload`): [`Action`](Action.md)\<`Payload`, `Type`\>

Defined in: [src/lib/actions/get-action.function.ts:17](https://github.com/state-adapt/state-adapt/blob/4ff8540684d6d76a52452612f8fa44ffd7c6016a/libs/core/src/lib/actions/get-action.function.ts#L17)

`getAction` is a function that takes in an action [Type](#getactiontype) and optionally Payload and creates an [Action](Action.md) object.

#### Example: Creating an action with a payload

```typescript
import { getAction } from '@state-adapt/core';

const action = getAction('ADD', 1);

// action = { type: 'ADD', payload: 1 }
```

### Type Parameters

#### Type

`Type` *extends* `string`

#### Payload

`Payload`

### Parameters

#### type

`Type`

#### payload

`Payload`

### Returns

[`Action`](Action.md)\<`Payload`, `Type`\>
