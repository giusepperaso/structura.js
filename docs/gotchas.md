# Gotchas

## Lack of strict typing on the return type of the producer

Structura doesn't limit you in the return type of your producers: you can return anything you want.

```typescript
// this is totally valid
produce({}, ()=>{
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

## Can't do transpositions on unproxied objects

todo

todo

todo

todo

## Sets could be unordered

If you do any modification to a child of a set, the new object will be appended at the end of the set, even if the original element wasn't at the end.

However, this is hardly important because the order of the elements in a set is something that you should never rely on.