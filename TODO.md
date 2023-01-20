# TODO

## PERFORMANCE
- appended: WeakSet => could be used to determine if the element was external to the tree, so we could avoid cloning it
- remove some closures, expecially the proxy traps, the addLink and actionLink
- getOwnPropertySymbols adds some overhead on copy: we could disable it with a flag if necessary. Is it worth?
- store type somewhere for fast lookup
- typeof v is taken two times, the second time for checking if it's a function; solve this

## FEATURE
- possibility to convert patches in standard RFC JSON format
- possibly implement those types: TypedArray, DataView(?), File(?), Blob(?), FileList(?), DomException(?)
- possibly implement those proxy traps: defineProperty, setPrototypeOF, preventExtensions, ownKeys, apply(?)
- allow switching implementations

## TYPES
- applyPatches should have a conditional return type

--------------------------------------------------------------------------------------------------------------

# SOLVED

## SOLVED BUGS
- if I have multiple link to a child for the same parent, the append action is only done once

## SOLVED FEATURES
- added patches


