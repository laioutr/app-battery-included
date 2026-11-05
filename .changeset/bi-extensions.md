---
'@laioutr/app-battery-included': minor
---

BI's merchandising extensions are exposed through two new query tokens, since canonical product queries have no slot for them:

- `battery-included/listing/teasers` (`BatteryIncludedListingTeasersQuery`, input `{ categoryId?, streamId?, query? }`) answers `BatteryIncludedTeaser` entities with `position` (1-based index on the current page), `format` and its `rows`/`columns`, `link`, a desktop/mobile `image`, `code` and `itemType`.
- `battery-included/search/redirect` (`BatteryIncludedSearchRedirectQuery`, input `{ query }`) answers the `url` BI sends a search term to, or "not found".

The product queries also put BI's raw `extensions` into the `browseExtensionsToken` passthrough for project handlers.
