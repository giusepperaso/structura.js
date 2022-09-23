# Getting Started

First, install the library via NPM:

```bash
npm i structurajs
```

or, if you prefer, via a CDN with a script tag:

```html
<script src="https://unpkg.com/structurajs"></script>
```

Now you can write something like this:

```typescript
import { produce } from "structura"

const ciao = { ciao: "mondo", test: { test: 1 } }

const hello = produce(ciao, (draft) => {
    delete draft.ciao;
    draft.hello = "world";
})

console.assert(ciao !== hello, "the two objects are different");
console.assert(ciao.test === hello.test, "the two objects are the same");
```
