# TODO

## NEW STUFF

- Add patches, like immer

## BUGS

NOT HANDLED:
what happens if you create a new object, then you assign a portion of the draft to it and then assign this new object to the draft?
the new object will have the proxy reference!!!
maybe you could use an helper to create new objects
OR you could cycle every new appended object which was not proxied if it contains proxies
OR just say to do like this: newObj.prop = target(obj) OR {...obj} if the reference is not important


## PERFORMANCE

- getOwnPropertySymbols adds some overhead on copy: we could disable it with a flag if necessary. Is it worth?

- store type somewhere for fast lookup

- typeof v is taken two times, the second time for checking if it's a function; solve this

## TESTING

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

