# Helpers

## original

Gets the original object from the draft or a portion of the draft

```typescript
produce({ n: 1, sub: { n:1 } }, (draft) => {
    draft.n++;
    draft.sub.n++;
    original(draft).n  === 1; // true
    original(draft.sub).n  === 1; // true
})
```

## target

Gets the shallow cloned object if any modification happened at this level of the draft, or the original object otherwise.

```typescript
produce({ n: 1 }, (draft) => {
    target(draft) === original(draft) // true
    draft.n++;
    target(draft) === original(draft) // false
    original(draft).n === 1 // true
    target(draft).n === 2 // true
})
```

## data

Gets the data associated with the passed portion of the draft; it is unlikely that you need this.

```typescript
produce({ n: 1 }, (draft) => {
    target(draft) === data(draft).shallow // false
    draft.n++;
    target(draft) === data(draft).shallow // true
})
```

## freeze

See the <a href="./freezing.html#freezing">freezing page</a>

## unfreeze

See the <a href="./freezing.html#unfreezing">freezing page</a>

## convertPatchesToStandard

Structura generates patches that are not compliant to standard JSON Patches, however with this helper we can easily convert them to the standard format

Note that by default the path of the newly generated patches will be an array, and this is the same behaviour as Immer. If you want instead a slash-separated string path like in the JSON Patch RFC, the second argument should be set to false.

```typescript
const state = { sub: { n: 1 } };

const [_, patches] = produceWithPatches({ sub: { n: 1 } }, (draft) => {
    draft.sub.n++;
})

// the example would also work with reverse patches

const json_patches_arr_path = convertPatchesToStandard(patches) // [{ op: "replace", path: ["sub", "n"], value: 2 }]

const json_patches_str_path = convertPatchesToStandard(patches, false) // [{ op: "replace", path: "/sub/n", value: 2 }]

// those generated patches can be fed into applyPatches

applyPatches(state, json_patches_arr_path).sub.n === 2 // true
applyPatches(state, json_patches_str_path).sub.n === 2 // true
```