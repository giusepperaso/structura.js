# Returning undefined

Sometimes you may want to return undefined from a producer

This is possible, but you will have to return a constant named NOTHING instead

```typescript
import { NOTHING, produce } from "structurajs"

const myObj = {}
const newState = produce(myObj, (draft) => {
    return NOTHING
})
console.log(newState === undefined) // true
console.log(newState === NOTHING) // false! NOTHING is an empty object
```

