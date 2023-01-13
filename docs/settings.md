# Settings

There are very few settings in Structura because almost everything is active by default

## Enable strict copy (for non-enumerable properties)

The default algorithm for creating a shallow copy is fast, but ignores non-enumerable properties. This could be a problem with some libraries like vue and mobx which trap the values. In order to solve this problem, just enable strict copy:

```typescript
import { enableStrictCopy } from "structurajs";

enableStrictCopy(true); 
```

To revert the setting:

```typescript
enableStrictCopy(false); 
```
