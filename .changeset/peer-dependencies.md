---
'@laioutr/app-battery-included': minor
---

The Laioutr core packages are peer dependencies now (`>=` the versions this release builds against), so a project resolves one copy of them. `@laioutr-app/shopify` is no longer a dependency: it is only used by the playground, and the module no longer installs it during `nuxt prepare`.

**Breaking:** install `@laioutr-core/canonical-types`, `core-types`, `frontend-core`, `kit` and `orchestr` in your project if it does not have them yet. A Laioutr storefront already has them.
