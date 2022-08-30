# TODO

## PERFORMANCE

- getOwnPropertySymbols adds some overhead on copy: we could disable it with a flag if necessary. Is it worth?

- store type somewhere for fast lookup

## TESTING

What happens if I get an object without setting anything, then i set it in another row, then I set again from the first row? Should work because it uses a map


## TYPES

- Possibly implement those types
    - TypedArray
    - DataView?
    - File?
    - Blob?
    - FileList?
    - DomException?

- Immutable gets readedd multiple times, and mutable should remove immutable instead than adding itself

## METHODS

- Possibly implement those proxy traps
    - defineProperty
    - setPrototypeOF
    - preventExtensions
    - apply?

- object methods should not trigger proxy creation, but should be returned as is

## REFERENCES

- If one object is referenced multiple times across the state, and we alter it, only the parent object through which the object is accessed/modified gets shallowly copied
To solve this, we should cycle through the whole state to find all occurrences of the object, but it is too costly
This is vaguely similar to https://github.com/immerjs/immer/issues/374

## EXTENSIBILITY

Allow switching implementations

## IMMER-LIKE

- allow patches 

- object freeze the whole object

- api could be more similar to immer

# ERROR HANDLING

error handling of not supported types, at runtime or better static via typescript

