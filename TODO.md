# TODO LIST

## TODO

- [ ] (🟦TYPE) Passing a frozen object should never require explicit casting
- [ ] (🟩TEST) better % test coverage (mostly some helpers are not unit tested)
- [ ] (⬛CODE) organize the code better in multiple files and add comments
- [ ] (🟪DOCS) documentate helpers like original and target
- [ ] (🟫BENC) add benchmarks for patches
- [ ] (🟨PERF) appended: WeakSet could be used to determine if the element was external to the tree, so we could avoid cloning it
- [ ] (🟨PERF) remove some closures, expecially the proxy traps, the addLink and actionLink
- [ ] (🟨PERF) getOwnPropertySymbols adds some overhead on copy: we could disable it with a flag if necessary. Is it worth?
- [ ] (🟨PERF) store type somewhere for fast lookup
- [ ] (🟨PERF) typeof v is taken two times, the second time for checking if it's a function. Is it worth solving?
- [ ] (⬜FEAT) possibility to convert patches in standard RFC JSON format
- [ ] (⬜FEAT) possibly implement those types: TypedArray, DataView(?), File(?), Blob(?), FileList(?), DomException(?)
- [ ] (⬜FEAT) possibly implement those proxy traps: defineProperty, setPrototypeOF, preventExtensions, ownKeys, apply(?)
- [ ] (⬜FEAT) allow switching implementations
- [ ] (🟦TYPE) applyPatches should have a conditional return type

## IN PROGRESS

- [ ] (⬜FEAT) full compatibility with [this rfc of redux toolkit](https://github.com/reduxjs/redux-toolkit/pull/3074)
- [ ] (🟧BUGS) patches don't work with circular references
- [ ] (🟧BUGS) reverse patches may create inconsistencies in sets
- [ ] (🟩TEST) generate and try patches in every test

## SOLVED

- [x] (⬜FEAT) added support for the "in" operator
- [x] (🟦TYPE) produceWithPatches didn't allow a return type different from the draft
- [x] (🟧BUGS) patches could delete an element wrongly with maps
- [x] (🟧BUGS) assign the descriptor value during strict copy, because the descriptor could be a getter or setter
- [x] (🟦TYPE) patches should not be callable for primitive types
- [x] (🟩TEST) add test for symbols in strict mode 
- [x] (🟧BUGS) symbols were not copied on strict copy
- [x] (🟫BENC) add benchmarks for different setups
- [x] (⬜FEAT) added patches
- [x] (🟧BUGS) if I have multiple link to a child for the same parent, the append action is only done once


