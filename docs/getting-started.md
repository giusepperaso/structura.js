# Getting Started

## via NPM

First, install the library via npm:

```bash
npm i structurajs
```

## alternative: via a cdn

or, if you prefer, via a cdn with a script tag:

```html
<script src="https://cdn.jsdelivr.net/npm/structurajs@0.3.4/dist/umd.min.js"></script>
```

## Example

Now you can write something like this:

```typescript
import { produce } from "structurajs"

const ciao = { ciao: "mondo", test: { test: 1 } }

const hello = produce(ciao, (draft) => {
    delete draft.ciao;
    draft.hello = "world";
})

console.assert(ciao !== hello, "the two objects are different");
console.assert(ciao.test === hello.test, "the two objects are the same");
```
