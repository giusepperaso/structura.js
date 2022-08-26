# STRUCTURA.js

A library for structural sharing

## ADVANTAGES OVER IMMER.JS

- xx more performant
- can return and modify the draft at the same time
- circular and multiple references are officially supported
- extensible for other use cases

## ADVANTAGES OVER IMMUTABLE
- simpler syntax

(a table to show the differences would be better)

## TYPESCRIPT GOTCHAS

You can return a different type from a producer freely, as the return type is inferred.
If you don't want this, you should explicity define generic parameters.

## LIMITATIONS

- If you manipulate an element in a set, the element is deleted and then readded, so the insertion order of elements will not be mantained into the shallowly cloned set (unless the element itself was already the last one inserted)