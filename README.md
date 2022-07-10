# STRUCTURA.js

A library for structural sharing

## LIMITATIONS

- If you manipulate an element in a set, the element is deleted and then readded, so the insertion order of elements may not mantained into the shallowly cloned set (unless if the element was the last one)