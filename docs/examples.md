# Examples


## Simple case with an object

```typescript
import { produce } from "structurajs";

const myObj = { count: 1 }

const result = produce(myObj, (draft) => {
    draft++;
})

result.count === 2 // true
myObj.count === 1 // true

```

## Simple case with an array

```typescript
import { produce } from "structurajs";

const myArr = [1]

const result = produce(myArr, (draft) => {
    draft[0]++
})

myArr[0] === 1 // true
result[0] === 2 // true
```

## Simple case with a class instance

```typescript
import { produce } from "structurajs";

class MyClass {
    count = 1;
    increment() {
        this.count++;
    }
}

const myInstance = new myClass

const result = produce(myInstance, (draft) => {
    myInstance.increment();
})

myInstance.count === 1 // true
result.count === 2 // true
```

## Simple case with a Date object

```typescript
import { produce } from "structurajs";

const myDate = new Date

const result = produce(myDate, (draft) => {
    draft.setDate(draft.getDate() + 1); // add a day
})

myDate.getTime() !== result.getTime() // true
```
