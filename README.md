# STRUCTURA.js

A library for structural sharing

## LIMITATIONS

- If you manipulate an element in a set, the element is deleted and then readded, so the insertion order of elements will not be mantained into the shallowly cloned set (unless the element itself was already the last one inserted)