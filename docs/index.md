**Structura.js** is a very fast and lightweight library written in Typescript which allows to create immutable states with a mutable syntax. It is based on the idea of structural sharing.

The library is very similar to [Immer.js](https://immerjs.github.io/immer/), but it's much more performant (~24x on average) and it better solves some edge cases like circular references, multiple references to the same object, transpositions etc... It also avoids freezing the object at runtime, but it does only at compile time, which is again a much more performant way to do it.

![Structural Sharing](/structural-sharing.png)