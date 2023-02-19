# When to use

## Use Sructura over Immer in those cases:
- performance is important to you and immutable states are becoming a bottleneck in your application
- the state you have to deal with is possibly very huge and complex
- in serverless functions or in the cloud, because you'd want to cut used resources as much as possible
- circular and multiple references may be present in your state
- you prefer not being limited in the return type of the producer
- modifying the draft and return a portion of it in the same producer is needed
- you don't want to think about enabling/disabling features you may or may not need
- forking the library to adapt it to your use case, because the code is small and easy enough to reason about

## Disadvantages compared to Immer:
- less mature, less stable (Structura is still in alpha)
- test coverage is still not 100%
- docs could be better
- does not support IE and pre ES6 browsers and will never do
- does not yet support ~~some proxy traps and~~ some data structures that Immer supports, but this is very likely to change in the future
- generated patches are not compliant to any RFC, but ~~in the future this may change or there could be a converter~~ there is already a converter included in the library; besides applyPatches also accept standard JSON Patches
