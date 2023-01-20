# TODO LIST

## TODO

- [ ] (🟪DOCS) documentate helpers like original and target
- [ ] (🟫BENC) add benchmarks for patches
- [ ] (🟨PERF) appended: WeakSet => could be used to determine if the element was external to the tree, so we could avoid cloning it
- [ ] (🟨PERF) remove some closures, expecially the proxy traps, the addLink and actionLink
- [ ] (🟨PERF) getOwnPropertySymbols adds some overhead on copy: we could disable it with a flag if necessary. Is it worth?
- [ ] (🟨PERF) store type somewhere for fast lookup
- [ ] (🟨PERF) typeof v is taken two times, the second time for checking if it's a function; solve this
- [ ] (🟩FEAT) possibility to convert patches in standard RFC JSON format
- [ ] (🟩FEAT) possibly implement those types: TypedArray, DataView(?), File(?), Blob(?), FileList(?), DomException(?)
- [ ] (🟩FEAT) possibly implement those proxy traps: defineProperty, setPrototypeOF, preventExtensions, ownKeys, apply(?)
- [ ] (🟩FEAT) allow switching implementations
- [ ] (🟦TYPE) applyPatches should have a conditional return type

## IN PROGRESS

## DONE

- [x] (🟧BUGS) symbols were not copied on strict copy
- [x] (🟫BENC) add benchmarks for different setups
- [x] (🟩FEAT) added patches
- [x] (🟧BUGS) if I have multiple link to a child for the same parent, the append action is only done once


