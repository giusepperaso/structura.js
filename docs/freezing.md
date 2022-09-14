# Freezing at compile time

With libraries like Immer, if you want to freeze an object you have to do it at runtime with a nested Object.freeze, which may be very costly for deeply nested objects (the library does it for you but the performance hit is still there).

Instead, with Structura the freezing is done at compile time via Typescript by adding a nested readonly flag to the produced state. So the performance cost of freezing becomes zero.

```typescript
// freezing this way is unecessary, unless you want to be sure
// that also the initial state is frozen
const state = [1, 2, 3] as Freeze<number[]>

// state.push(4) would fail

// newState gets automatically frozen
const newState = produce(state, (draft) => {
    draft.push(4)
})

// newState.push(5) would fail
```

If you want to unfreeze the object, just use the reverse type:

```typescript
const newStateUnfrozen = newState as UnFreeze<number[]> 

newState.push(5) // it works now
```