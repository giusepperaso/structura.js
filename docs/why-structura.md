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

Immutable locks you in with its proprietary syntax which is hard to learn for beginners and difficult to abandon if you have to; the base performance is good, but it is usually much worse in real scenarios if you have to do conversions from or to plain javascript objects 

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

Structura aims to be a library with a syntax identical (more or less) to Immer but with a much higher performance (~24x, even faster than Immutable in most cases), and also with a lower size

```javascript
const state = {
    sub: {
        prop1: 1
    }
}

// this example, despite being indistinguishable from the immer one,
// is ~24x more performant!
const newState = produce(state, (draft) => {
    draft.sub.prop2 = 2
})
```

## Freezing at compile time instead than at runtime

Another advantage is that with Immer, if you want to freeze an object you have to do it at runtime with a nested Object.freeze, which may be very costly for deeply nested objects (the library does it for you but the performance hit is still there).

Instead, with Structura the freezing is done at compile time via Typescript by adding a nested readonly flag to the produced state. So the cost of freezing in this case is zero.

```typescript
// freezing this way is unecessary, unless you want to be sure
// that also the initial state is frozen
const state = [1, 2, 3] as Freeze<number[]>

// state.push(4) would fail

// newState gets automatically frozen
const newState = produce(state, (draft) => {
    draft.push(4)
})

// newState.push(5) would fail
```

## Returning and modifying in the same producer

## Circular references are handled automatically

## Multiple references to the same object

## Transpositions
