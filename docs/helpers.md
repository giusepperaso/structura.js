# Helpers

## isDraft

Returns true if the passed object is the draft or a portion of it

```typescript
const state = { item: { n: 1 } }
produce(state, (draft) => {
    isDraft(state) // false;
    isDraft(draft) // true;
    isDraft(draft.item) // true;
})
```

## isDraftable

Returns true if the passed object can be drafted. It is true for Objects (even instances od classes), Arrays, Maps, Sets, RegExps, Strings, Numbers, Booleans, Dates and Functions.

```typescript
isDraftable({}) // true;
isDraftable([]) // true;
isDraftable(new class {}) // true;
isDraftable(new String("draftable")) // true;
isDraftable("non-draftable") // false;
isDraftable(function() {}) // true;
```

Objects may result non-draftable if theirs [toStringTag symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag) is not included in the list of the supported tags.

You could extend this behaviour by adding an entry inside DraftableTypes:

```typescript
import { DraftableTypes } from "structurajs";

class MyClass {
  get [Symbol.toStringTag]() {
    return 'MyClass';
  }
}

DraftableTypes.push("[object MyClass]");
```

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

## itemData

Gets the data associated with the passed portion of the draft; it is unlikely that you need this.

```typescript
produce({ n: 1 }, (draft) => {
    target(draft) === itemData(draft).shallow // false
    draft.n++;
    target(draft) === itemData(draft).shallow // true
})
```

## allData

Gets a map of all the data associated with the draft; it is unlikely that you need this.

```typescript
produce({ n: 1 }, (draft) => {
    target(draft) === allData(draft).get(original(draft)).shallow // false
    draft.n++;
    target(draft) === allData(draft).get(original(draft)).shallow // true
})
```

## freeze

See the <a href="./freezing.html#freezing">freezing page</a>

## unfreeze

See the <a href="./freezing.html#unfreezing">freezing page</a>

## convertPatchesToStandard

Structura generates patches that are not compliant to standard JSON Patches, however with this helper we can easily convert them to the standard format

Note that by default the path of the newly generated patches will be an array, and this is the same behaviour as Immer. If you want instead a slash-separated string path like in the JSON Patch RFC, the second argument should be set to false.

Alternatively to this helper, you can just <a href="./settings.html#enable-standard-patches">turn a setting on</a> to tell Structura to always use standard patches.

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

## snapshot

Returns a snapshot of the current state, similarly to 'current' in Immer.

Note: basically you are getting a deep clone of the object, so this is very slow and you should use it only for debug purposes.

```typescript
produce({ n: 1 }, (draft) => {
    const saved = snapshot(draft)
    draft.n++;
    console.log(draft.n); // 2
    console.log(saved.n); // 1
})
```