# TODO

## COPY

- getOwnPropertySymbols adds some overhead on copy: we could disable it with a flag if necessary. Is it worth?

## TYPES

- Possibly implement those types
    - TypedArray
    - DataView?
    - File?
    - Blob?
    - FileList?
    - DomException?

## METHODS

- Possibly implement those proxy traps
    - defineProperty
    - setPrototypeOF
    - preventExtensions
    - apply

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

- api should be more similar to immer

