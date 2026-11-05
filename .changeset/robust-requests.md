---
'@laioutr/app-battery-included': minor
---

Requests to Battery Included are more robust:

- A non-2xx answer throws `BatteryIncludedApiError` (with `status`, `endpoint` and a short `body`) instead of being parsed as data. `isBatteryIncludedApiError` is exported from `@laioutr/app-battery-included/runtime`.
- Product search and suggest are cached for 5 minutes (Orchestr defaults: first page, unfiltered requests). Identical BI requests in flight at the same time share one call.
- The BI locale is read from `clientEnv.language.code` instead of the deprecated `clientEnv.locale`.
- Recommendations are cached per product for 5 minutes and answer their relation inline. A product whose BI call fails gets no recommendations instead of failing the others, and that fallback is not cached. The recommendation resolver no longer throws when the passthrough is empty.
