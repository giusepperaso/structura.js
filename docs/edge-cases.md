# Edge cases

Structura supports some edge cases that are not well handled by other libraries. But beware that some edge cases are not solvable.

## Returning and modifying in the same producer

With Structura you can return an object in your producer after having modified the draft

```typescript
const newState = produce({ test1: [1], test2: [2] }, (draft) => {
    draft.test1.push(1)
    draft.test2.push(2)
    // this is just an example, but you could return anything
    return [draft.test1, draft.test2]
})
```

## Circular references are handled automatically

If an object references itself in a circular manner, that is handled automatically (in Immer you would need to call Object.freeze manually)

```typescript
const state: any = { test1: [1], test2: [2], test3: null }
state.test3 = state

// this works without going infinite
const newState = produce(state, (draft) => {
    draft.test3.test1.push(1)
})
```

## Multiple references to the same object

If an object is referenced multiple times in the state, the algorithm is applied to all of its traversed parents (HOWEVER it does not detect parents that were not traversed)

```typescript
const array = [1]
const state = { test1: array, test2: array }

// this works well
const newState1 = produce(state, (draft) => {
    draft.test1.push(1)
    draft.test2.push(1)
})

// this also works
const newState2 = produce(state, (draft) => {
    draft.test1;
    draft.test2.push(1)
})

// this does not work well because test2 is never accessed,
// so test2 will remain the same as before
const newState3 = produce(state, (draft) => {
    draft.test1.push(1)
})
```

## Transpositions

You can reassign the key of a sub-object and the result will be what you expect

Besides, this will not work if you assign to an object external from the draft

```typescript
const state = [[1], [2]]

// this works well
const newState1 = produce(state, (draft) => {
    const first = draft[0]
    draft[0] = draft[1]
    draft[1] = first
})

// this also works
const newState2 = produce(state, (draft) => {
    const first = draft[0]
    draft[0] = draft[1]
    draft[1] = first
    first.push(9999)
})

// this does not work well because the new object
// will remain with a proxy attached via its prop!
const newState3 = produce(state, (draft) => {
    const first = draft[0]
    const newObj = { prop: first }
    draft.push(newObj as any)
})
```