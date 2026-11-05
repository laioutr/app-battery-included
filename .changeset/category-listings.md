---
'@laioutr/app-battery-included': minor
---

Category listings from BI: `ProductsByCategoryIdQuery` filters `_product_i18n.categoryTree.id` by the Shopware category id, and the app's own `battery-included/product/by-stream-id` query (`BatteryIncludedProductsByStreamIdQuery`) filters `_product.streamIds` by a product-stream id. Both answer with BI's facets, sortings and pagination like search, and are cached for 5 minutes. The fields are configurable with the `fields` module option.

`ProductsByCategoryIdQuery` and `ProductSearchQuery` have `order: 2`, so with `@laioutr/app-shopware` installed (which implements both without an order) BI serves them regardless of install order. The README explains how a listing page binds a category id when its route carries a slug.
