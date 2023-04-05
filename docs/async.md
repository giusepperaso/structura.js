# Async Producers

You can have async producers, but you will have to import call asyncProduce instead of produce

```typescript
import { asyncProduce } from "structurajs"

const myObj = { t: 1 }
const waitForIt = asyncProduce(myObj, async (draft) => {
    await new Promise((r) => setTimeout(r, 1000))
    return { t: 2 }
})
waitForIt.then((result) => {
    console.log(result) // { t: 2 }
})
```

You can also/instead import those async helpers depending on the situation:
- asyncSafeProduce: same as produce but only accepts async producers and the return type must be of the same type of the initial object
- asyncProduceWithPatches: same as produceWithPatches but only accepts async producers
- asyncSafeProduceWithPatches: same as as produceWithPatches but only accepts async producers and the return type must be of the same type of the initial object

