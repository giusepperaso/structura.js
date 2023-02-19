<h1 align="center">Structura.js</h1>

<p align="center">
<img id="structura" alt="structura" width="420" src="https://github.com/GiuseppeRaso/structura.js/raw/master/docs/public/structural-sharing-1.jfif">
</p>

<h2 style="display:none;" align="center">You can find complete docs at <a href="https://giusepperaso.github.io/structura.js/">https://giusepperaso.github.io/structura.js/</a></h2>

**Structura.js** is a very fast and lightweight Typescript library which allows to create immutable states with a mutable syntax. It is based on the idea of [structural sharing](https://blog.klipse.tech/javascript/2021/02/26/structural-sharing-in-javascript.html#what-is-structural-sharing).

The library is very similar to [Immer.js](https://immerjs.github.io/immer/), but it has some advantages over it:

- up to ~22x more performant, even faster than [Immutable](https://github.com/immutable-js/immutable-js) most of the time
- freezes the object only at compile time by leveraging Typescript, while other libraries freeze the object at runtime with Object.freeze, which may be slow expecially for nested objects
- circular and multiple references are supported
- can return and modify the draft at the same time
- flexibility in the return type of the producer
- no need to toggle on/off features (with some [exceptions](https://giusepperaso.github.io/structura.js/settings.html))
- does support transpositions and moves of portions of the draft

The library is actually in alpha state. It is probably already usable (many complex scenarios are already covered by tests), but  the APIs and the types could change in the future.

## BREAKING CHANGES

- v.0.8.0-alpha: patches use 'op' instead of 'action' as key for the operation; they can also be passed in the JSON format
- v.0.6.0-alpha: revert back to accept primitives, just don't draft them; also accept the in operator
- ~~v.0.5.0-alpha: don't accept primitive types at runtime~~
- ~~v.0.4.0-alpha: primitive types are not accepted anymore in the produce function~~