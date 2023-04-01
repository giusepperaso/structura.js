# TODO LIST

## TODO

- [ ] (⬛CODE) try a better solution instead than no-op patch
- [ ] (⬛CODE) correct the nomenclature and behaviour of the helpers
    - [ ] original should always return the original object even if it's not the target of the proxy
    - [ ] target should return the target of the proxy
    - [ ] clone should return the shallow copy of the object
- [ ] (⬛CODE) enum also for op of json patches
- [ ] (🟦TYPE) better types for json patches
- [ ] (🟪DOCS) documentate new settings and remove docs for old helpers, write breaking changes
- [ ] (⬜FEAT) json patches don't support "" as key if the path is a string ( to solve this, use a placeholder like ___empty___)
- [ ] (⬜FEAT) maybe use proxy revocable? maybe not necessary because they are already garbage collected
- [ ] (⬜FEAT) "NOTHING" as return, so you can return undefined
- [ ] (⬛CODE) add more comments in code
- [ ] (⬛CODE) split the logic in multiple reusable functions
- [ ] (⬛CODE) organize the code better in multiple files
- [ ] (⬛CODE) give better names to variables and types
- [ ] (🟫BENC) add benchmarks for patches

## IN PROGRESS

## SOLVED

- [x] (🟨PERF) store type in the currData
- [x] (⬜FEAT) full compatibility with [this rfc of redux toolkit](https://github.com/reduxjs/redux-toolkit/pull/3074)
- [x] (🟧BUGS) test fails with both standard patches and auto freeze enabled
- [x] (🟧BUGS) frozen sets caused infinite loops
- [x] (🟩TEST) each test should possibly also run on strict copy and/or auto freeze
- [x] (🟧BUGS) patches don't work with circular references
- [x] (🟩TEST) generate and try patches in every test
- [x] (🟨PERF) dummy objects in freeze should be reused as shallow targets
- [x] (🟨PERF) use object like { [Symbol()]: target } as proxy target
- [x] (🟧BUGS) reverse patches may create inconsistencies in sets
- [x] (🟪DOCS) documentate helpers like original and target
- [x] (⬜FEAT) possibility to convert patches in standard RFC JSON format
- [x] (⬜FEAT) added support for the "in" operator and ownKeys trap
- [x] (🟦TYPE) Passing a frozen object should never require explicit casting
- [x] (🟦TYPE) produceWithPatches didn't allow a return type different from the draft
- [x] (🟧BUGS) patches could delete an element wrongly with maps
- [x] (🟧BUGS) assign the descriptor value during strict copy, because the descriptor could be a getter or setter
- [x] (🟦TYPE) patches should not be callable for primitive types
- [x] (🟩TEST) add test for symbols in strict mode 
- [x] (🟧BUGS) symbols were not copied on strict copy
- [x] (🟫BENC) add benchmarks for different setups
- [x] (⬜FEAT) added patches
- [x] (🟧BUGS) if I have multiple link to a child for the same parent, the append action is only done once

## DISCARDED

- ~~[ ] (⬜FEAT) maybe implement those types? TypedArray, DataView, File, Blob, FileList, DomException~~
- ~~[ ] (⬜FEAT) maybe implement those proxy traps? defineProperty, setPrototypeOF, preventExtensions, apply~~
- ~~[ ] (⬜FEAT) support async producers~~
- ~~[ ] (🟨PERF) appended: WeakSet could be used to see if an element was external to the tree, so we could avoid cloning it~~
- ~~[ ] (🟨PERF) remove some closures, expecially the proxy traps, the addLink and actionLink~~
- ~~[ ] (🟨PERF) getOwnPropertySymbols adds some overhead on copy: we could disable it with a flag if necessary. Is it worth?~~
- ~~[ ] (🟨PERF) typeof v is taken two times, the second time for checking if it's a function. Is it worth solving?~~
- ~~[ ] (⬜FEAT) allow switching implementations~~


