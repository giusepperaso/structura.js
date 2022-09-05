# STRUCTURA.js

A library for structural sharing

## ADVANTAGES OVER IMMER.JS

- xx more performant
- can return and modify the draft at the same time
- circular and multiple references are supported
- does support traspositions and moves of portions of the draft
- extensible for other use cases (?)
- does not freeze with object freeze, instead it uses typescript

## ADVANTAGES OVER IMMUTABLE
- much better syntax
- faster in many cases

(a table to show the differences would be better)

## TYPESCRIPT GOTCHAS

You can return a different type from a producer freely, as the return type is inferred.
This could be a problem because a different return type might be accidental.
If you don't want this, you should explicity define generic parameters.

## LIMITATIONS

- The order of elements into a set is not guaranteed to remain equal if you modify some of its elements. This is because if you manipulate an element of a set, the element is deleted and then readded.

- Let's say we have a draft A, which contains B. Then we create a new object C. We make C a child of A, and we also make B a child of C. In this case, the resulting object will keep a reference to the proxy.This unfortunately must be resolved manually via target or original.