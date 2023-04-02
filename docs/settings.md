# Settings

There are very few settings in Structura because almost everything is active by default

## Enable standard patches

Patches in Structura use a proprietary format. If you want instead to use standard json patches, you must active the corresponding setting.

Alternatively you can use the <a href="./helpers.html#convertpatchestostandard">converting helper</a> to convert non-standard patches that were already created to standard json patches.

Look at the <a href="./patches.html">'patches' page</a> to know more.

```typescript
import { enableStandardPatches } from "structurajs";

enableStandardPatches(true); 
```

To revert the setting:

```typescript
enableStandardPatches(false); 
```

## Enable auto freeze

Freezing at runtime is not active by default, and it should be enabled explicitly. However it is probably unnecessary with Strcutura <a href="./freezing.html">because it allows freezing at compile time</a>.

```typescript
import { enableAutoFreeze } from "structurajs";

enableAutoFreeze(true); 
```

To revert the setting:

```typescript
enableAutoFreeze(false); 
```

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

## Change more settings at once

If you have to set multiple settings at once, it may be more convenient to directly manipulate the Settings object:

```typescript
import { Settings } from "structurajs";

Object.assign(Settings, {
    autoFreeze: true,
    standardPatches: true,
    strictCopy: true
})
```
