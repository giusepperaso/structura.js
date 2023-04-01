# Freezing at compile time

## Freezing

With libraries like Immer, if you want to freeze an object you have to do it at runtime with a nested Object.freeze, which may be very costly for deeply nested objects (the library does it for you but the performance hit is still there).

Instead, with Structura the freezing is done at compile time via Typescript by adding a nested readonly flag to the produced state. So the performance cost of freezing becomes zero.

```typescript
// freezing this way is unecessary, unless you want to be sure
// that also the initial state is frozen
const state = [1, 2, 3] as Freeze<number[]>

state.push(4) // DOESN'T COMPILE

// newState gets automatically frozen
const newState = produce(state, (draft) => {
    draft.push(4)
})

newState.push(5) // DOESN'T COMPILE
```

You also have the freeze utility, which can work at both runtime and compile time:

```typescript
import { freeze } from "structurajs";

const frozen_at_compile_time = freeze(newState); 

frozen_at_compile_time.push(5) // DOESN'T COMPILE
//@ts-ignore
frozen_at_compile_time.push(5) // it works

const frozen_at_both_run_and_compile_time = freeze(newState, true); 

frozen_at_both_run_and_compile_time.push(5) // DOESN'T COMPILE
//@ts-ignore
frozen_at_compile_time.push(5) // WILL THROW AN EXCEPTION AT RUNTIME
```

Note that freeze also has a third argument called "deep" which will only take effect if both deep and runtime are true.
If active, deep will freeze objecs/sets/maps at any level of nesting.

```typescript
const state = { sub: { n: 1 } };
const frozen = freeze(state, true, true);
(frozen as any).sub.n++;  // WILL THROW AN EXCEPTION AT RUNTIME
```

## Unfreezing

If you want to unfreeze the object, just use the reverse type:

```typescript
const newStateUnfrozen = newState as UnFreeze<number[]> 

newState.push(5) // it works
```

Or if you prefer you can use the unfreeze utility:

```typescript
import { unfreeze } from "structurajs";

unfreeze(newState).push(5); // it works
```

ATTENTION: unfreeze will throw an exception if the object was frozen at runtime with Object.freeze or the freeze utility