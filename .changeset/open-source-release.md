---
'@laioutr/app-battery-included': minor
---

The app is open source and published to npmjs.org as `@laioutr/app-battery-included`, under the MIT licence.

**Breaking:** the package and its configuration key are renamed. Install the new package and move its options:

```ts
// before
modules: ['@laioutr-app/battery-included'],
'@laioutr-app/battery-included': { collection, apiKey },

// after
modules: ['@laioutr/app-battery-included'],
'@laioutr/app-battery-included': { collection, apiKey },
```
