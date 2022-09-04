# TODO

## BUGS

OK TRASPOSITIONS: for example array.reverse() fails to mantain the same reference
solution: use a check if it's a function, in this case return the funcion

TRASPOSITIONS HAND MADE:
if you save an object in a variable and then assign it into the draft, you will get a proxy reference; this also happens if I return a portion of the draft in the producer at the end; to avoid this, at the after the producer we can check all of the objects and see if they were modified or not; if they were not modified, we recurse all of their parents and we assign the original object instead than the proxy
remove dangling proxies.

NOT HANDLED:
what happens if you create a new object, then you assign a portion of the draft to it and then assign this new object to the draft?
the new object will have the proxy reference!!!


## PERFORMANCE

- getOwnPropertySymbols adds some overhead on copy: we could disable it with a flag if necessary. Is it worth?

- store type somewhere for fast lookup

- typeof v is taken two times, the second time for checking if it's a function; solve this

## TESTING

What happens if I get an object without setting anything, then i set it in another row, then I set again from the first row? Should work because it uses a map

What happens in Actions.append if I have multiple links for the same child? Only one gets the treatment? Maybe it should become a map with array as values, where arrays list all the links


## TYPES

- Possibly implement those types
    - TypedArray
    - DataView?
    - File?
    - Blob?
    - FileList?
    - DomException?

## METHODS

- Possibly implement those proxy traps
    - defineProperty
    - setPrototypeOF
    - preventExtensions
    - apply?

## REFERENCES

- If one object is referenced multiple times across the state, and we alter it, only the parent object through which the object is accessed/modified gets shallowly copied
To solve this, we should cycle through the whole state to find all occurrences of the object, but it is too costly
This is vaguely similar to https://github.com/immerjs/immer/issues/374

## EXTENSIBILITY

Allow switching implementations

## IMMER-LIKE

- allow patches 

- object freeze the whole object

- api could be more similar to immer

# ERROR HANDLING

error handling of not supported types, at runtime or better static via typescript

