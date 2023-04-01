# Why Structura?

Until now, if you wanted to work with immutable states in javascript, you had 3 main options, each with its pros and drawbacks:

### 1) *doing it manually*

this syntax is verbose, hard to write and difficult to read, expecially for complex states, so the result is that we may easily incur in difficult-to-catch bugs; if not used properly it may even lead to performance penalties

```javascript
const state = {
    sub: {
        prop1: 1
    }
}

// this is fast and native, but it may become hard to read and mantain
// very quickly if we have to do complex operations in the future
const newState = {
    sub: {
        ...state.sub,
        prop2: 2
    }
}

console.log(newState);
```

### 2) using Immutable

Immutable locks you in with its proprietary syntax which is hard to learn for beginners and forces lock in; the base performance is good, but it is usually much worse in real scenarios if you have to do conversions from or to plain javascript objects 

```javascript
const state = {
    sub: {
        prop1: 1
    }
}

// this is very slow
const newState = fromJS(state) 

// this is fast, but uses a proprietary syntax
newState.set(['sub','prop2'], 2); 

// this is very slow
console.log(newState.toJS()); 
```

### 3) using Immer.js

Immer.js has the best readability of the three, infact it uses a mutable syntax which is very easy to understand, even for beginners; unfortunately it may also be very slow, orders of magnitude slower than the previous solutions

```javascript
const state = {
    sub: {
        prop1: 1
    }
}

// this is easy to read and write, but unfortunately it has usually worse
// performance than the previous methods
const newState = produce(state, (draft) => {
    draft.sub.prop2 = 2
})
```

## *Structura.js* to the rescue

Structura aims to be a library with a syntax identical (more or less) to Immer but with a much higher performance ([up to ~10x, even faster than Immutable in some cases](./benchmarks.md)), and also with a lower size

```javascript
const state = {
    sub: {
        prop1: 1
    }
}

// this example, despite being indistinguishable from the immer one,
// is ~10x more performant!
const newState = produce(state, (draft) => {
    draft.sub.prop2 = 2
})
```
## There are other advantages

One of them is that the object is [frozen at compile-time instead that at runtime](./freezing.md)

Besides, Structura is good at handling [edge cases that other libraries struggle in](./edge-cases.md)
