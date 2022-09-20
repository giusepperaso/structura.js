# STRUCTURA.js

**Structura.js** is a very fast and lightweight Typescript library which allows to create immutable states with a mutable syntax. It is based on the idea of structural sharing.

The library is very similar to [Immer.js](https://immerjs.github.io/immer/), but it has some advantages over it:

- 24x more performant, even faster than [Immutable](https://github.com/immutable-js/immutable-js) most of the time
- freezes the object only at compile time by leveraging Typescript, while most libraries freeze the object at runtime with Object.freeze, which may be slow expecially for nested objects
- circular and multiple references are supported
- does support traspositions and moves of portions of the draft
- can return and modify the draft at the same time