# Patches

Structura can create a serializable list of patches with all the modifications that were applied in a producer, and can also obtain the inverse modifications to return to the original state. 

Patches and inverse patches are useful for example if you want to send them over a network or to implement undo/redo functionality.

```typescript
type Make = () => Record<string, number>[]
const makeObj: Make = () => [{ A: 1 }];

// first we get the result and the patches
let patches: Patch[] = [];
let inverse: Patch[] = [];
const result = produce(
    makeObj(), 
    (draft) => {
        draft.push({ B: 2 });
    }, 
    (_patches, _inverse) => {
        patches = _patches;
        inverse = _inverse;
    }
);

// if we apply the patches from the same starting point, we get the same result
const newResult = applyPatches(makeObj(), patches);
expect(newResult).toEqual(result);

// then, if we apply the inverse patches, we obtain the original state
const undone = applyPatches(newResult, inverse);
expect(undone).toEqual(makeObj());
```

The same example can be written more concisely by using *produceWithPatches*:

```typescript
type Make = () => Record<string, number>[]
const makeObj: Make = () => [{ A: 1 }];

// first we get the result and the patches
const [result, patches, inverse] = produceWithPatches(makeObj(), (draft) => {
    draft.push({ B: 2 });
});

// if we apply the patches from the same starting point, we get the same result
const newResult = applyPatches(makeObj(), patches);
expect(newResult).toEqual(result);

// then, if we apply the inverse patches, we obtain the original state
const undone = applyPatches(newResult, inverse);
expect(undone).toEqual(makeObj());
```

You can also use the safe version, *safeProduceWithPatches*:

```typescript
type Make = () => Record<string, number>[]
const makeObj: Make = () => [{ A: 1 }];

// the safe version only differs in it not allowing a return type different from the state
const [result, patches, inverse] = safeProduceWithPatches(makeObj(), (draft) => {
    draft.push({ B: 2 });
});

// if we apply the patches from the same starting point, we get the same result
const newResult = applyPatches(makeObj(), patches);
expect(newResult).toEqual(result);

// then, if we apply the inverse patches, we obtain the original state
const undone = applyPatches(newResult, inverse);
expect(undone).toEqual(makeObj());
```
