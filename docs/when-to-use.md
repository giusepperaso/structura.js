# When to use

## Use Sructura over Immer in those cases:
- performance is important to you and immutable states are becoming a bottleneck in your application
- potentially you have to deal with huge or complex objects
- server side or serverless functions, because you'd want to cut used resources as much as possible
- circular and multiple references may be present in your state
- avoiding being limited in the return type of the producer
- modifying the draft and return a portion of it in the same producer
- you don't want to think about enabling/disabling features
- forking the library to adapt it to your use case, because the code is small and easy enough to reason about

## Disadvantages compared to Immer:
- less mature, less stable (Structura is still in alpha)
- still not fully covered by tests
- docs are not great yet
- does not support browsers pre ES6 and will never do
- does not yet support some proxy traps and some data structures that Immer supports, but this is very likely to change in the future
- generated patches are not compliant to any RFC, but in the future this may change or there could be a converter
