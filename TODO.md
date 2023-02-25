# TODO LIST

## TODO

- [ ] (🟧BUGS) json patches don't support "" as key if the path is a string ( to solve this, use a placeholder like ___empty___)
- [ ] (⬜FEAT) maybe use proxy revocable? maybe not necessary because they are already garbage collected
- [ ] (⬜FEAT) "nothing" as return, so you can return undefined
- [ ] (🟩TEST) each test should possibly also run on strict copy
- [ ] (🟩TEST) better % test coverage (mostly some helpers are not unit tested)
- [ ] (⬛CODE) organize the code better in multiple files and add comments
- [ ] (🟫BENC) add benchmarks for patches
- [ ] (⬜FEAT) maybe implement those types? TypedArray, DataView, File, Blob, FileList, DomException
- [ ] (⬜FEAT) maybe implement those proxy traps? defineProperty, setPrototypeOF, preventExtensions, apply

## IN PROGRESS

- [95%] (⬜FEAT) full compatibility with [this rfc of redux toolkit](https://github.com/reduxjs/redux-toolkit/pull/3074)
- [10%] (🟧BUGS) patches don't work with circular references
- [95%] (🟩TEST) generate and try patches in every test

## SOLVED

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

- ~~[ ] (🟨PERF) appended: WeakSet could be used to see if an element was external to the tree, so we could avoid cloning it~~
- ~~[ ] (🟨PERF) remove some closures, expecially the proxy traps, the addLink and actionLink~~
- ~~[ ] (🟨PERF) getOwnPropertySymbols adds some overhead on copy: we could disable it with a flag if necessary. Is it worth?~~
- ~~[ ] (🟨PERF) store type somewhere for fast lookup~~
- ~~[ ] (🟨PERF) typeof v is taken two times, the second time for checking if it's a function. Is it worth solving?~~
- ~~[ ] (⬜FEAT) allow switching implementations~~


