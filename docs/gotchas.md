# Gotchas

## Lack of strict typing on the return type of the producer

Structura doesn't limit you in the return type of your producers: you can return anything you want.

```typescript
// this is totally valid
produce({}, () => {
    return 1;
})
```

However, this also means that there is more room for errors. This, for example, is accepted:

```typescript
const state = { test: 1 }

// this is accepted, but it's wrong!
// result will be 2 (the number assigned), but we probably wanted an object instead
// (we likely forgot to wrap our function in curly brackets)
const result = produce(state, (draft) => draft.test = 2)
```

If you want to avoid this kind of errors, you have to declare your generic parameters explicitly:

```typescript
const state = { test: 1 }

type T = { test: number }

// ERROR!
// this will not be accepted because we were more explicit with our types
const result = produce<T, T>(state, (draft) => draft.test = 2)
```

Structura also exports a helper function which only allows the same type for the state and the result 

```typescript
const state = { test: 1 }

// ERROR!
// this will not be accepted because safeProduce does not allow it
// with the use of the helper, we don't have to explicity define types
const result = safeProduce(state, (draft) => draft.test = 2)
```

## Potential dangling proxy references if you assign unproxied objects into the draft

If you create a new object "A", then you assign a portion "B" of the draft to it and later you assign "A" back into the draft, you will get stuck with a dangling proxy reference inside the result:

```typescript
const result = produce({ example: { test: 2 } }, (draft) => {
    const newObj = {};
    newObj.sub = draft.example;
    // result.newObj.sub will be a dangling proxy reference!
    // This may lead to unpredictable behaviour, expecially if you try to write later into it
    draft.newObj = newObj; 
})
```

Structura won't cycle through the values of newObj because this would be expensive. Instead, use the "target" helper to unproxy the portion of the draft that you want to append into the new object:

```typescript
const result = produce({ example: { test: 2 } }, (draft) => {
    const newObj = {};
    newObj.sub = target(draft.example);
    // result.newObj.sub is now safe to read/write because it's not a proxy
    draft.newObj = newObj; 
})
```

Note that this only happens if there is an unproxied object "in the middle"; this code for example gives no problem:

```typescript
const result = produce({ example: { test: 2 } }, (draft) => {
    // appending newObj immediately to the draft allows to have the correct behaviour later on
    draft.newObj = {};
    newObj.sub = draft.example;
})
```

## Sets could be unordered

If you do any modification to a child of a set, the new object will be appended at the end of the set, even if the original element wasn't at the end.

However, this is hardly important because the order of the elements in a set is something that you should never rely on.
