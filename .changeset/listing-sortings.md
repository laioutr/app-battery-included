---
'@laioutr/app-battery-included': minor
---

Listings offer the sortings relevance (`relevance`), price ascending and descending (`price-asc`, `price-desc`), top sellers (`topseller`, `_history.salesCount` descending) and newest (`newest`, `_common.releaseDate` descending). The keys are translated to BI's `<field>:<asc|desc>` sort; before, the key was sent to BI as is. Configure your own list with the `sortings` module option. The earlier keys `price:asc` and `price:desc` still work, a raw BI expression such as `_product.stock:desc` is passed through, and an unknown key falls back to BI's relevance order.
