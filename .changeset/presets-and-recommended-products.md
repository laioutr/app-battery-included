---
'@laioutr/app-battery-included': minor
---

**Products of a BI preset.** The new query `battery-included/product/by-preset` (`BatteryIncludedProductsByPresetQuery`, exported from `@laioutr/app-battery-included/runtime`) lists the products of a preset set up in Battery Included, such as new arrivals or best sellers for a slider. Its input is `{ presetId }`, it asks for 20 products by default and answers with Product ids, BI's facets, the configured sortings and pagination like the other listings; without a sorting, BI's own order for the preset applies. Studio offers the typed id as a preset (`Preset: <id>`), since BI's API cannot list presets by name.

**Recommended products as products.** The new link `battery-included/product/recommended-products` (`BatteryIncludedRecommendedProducts`, exported from the runtime entry) links a `Product` to the products BI recommends for it, as `Product` entities the commerce app resolves with name, price and image. It lists all relations in BI's order, each product once, without the product itself, 20 by default. A product whose BI call fails gets no recommendations and the others are unaffected.

`battery-included/product/recommendations` is deprecated: its `ProductRecommendation` targets carry only the relation, so a slider cannot show the products. It keeps working unchanged; move to `BatteryIncludedRecommendedProducts`.

**Studio presets for search and category listings.** For `ProductsByCategoryIdQuery` the picker lists the categories of BI's category-tree facet that match the typed name (or id), up to 50, and stores the picked category's id; for `ProductSearchQuery` it offers a search for the typed term. Before, with BI serving these tokens, the picker had nothing to offer for them. A category appears only when the collection's facet config includes the category tree. When BI fails or has no such facet, the picker stays empty and the server logs a warning; queries are unaffected.

Studio now also shows the app as **Battery Included** with its logo wherever it names the app serving a query, served from `/app-battery-included/battery-included-logo.png`.
