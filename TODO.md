# TODO

## BUG
- if you create a new object and you assign a portion of the draft to it, it keeps a reference to the proxy

## PERFORMANCE
- getOwnPropertySymbols adds some overhead on copy: we could disable it with a flag if necessary. Is it worth?
- store type somewhere for fast lookup
- typeof v is taken two times, the second time for checking if it's a function; solve this

## FEATURE
- add patches, like immer
- possibly implement those types: TypedArray, DataView(?), File(?), Blob(?), FileList(?), DomException(?)
- possibly implement those proxy traps: defineProperty, setPrototypeOF, preventExtensions, apply(?)
- allow switching implementations

--------------------------------------------------------------------------------------------------------------

# SOLVED

## SOLVED BUGS
- if I have multiple link to a child for the same parent, the append action is only done once


