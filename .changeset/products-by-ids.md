---
'@laioutr/app-battery-included': minor
---

New query `battery-included/product/by-ids` (`BatteryIncludedProductsByIdsQuery`, input `{ ids }`, up to 100): the products BI indexes under those ids, in the order given unless the visitor sorts. BI indexes the variants its listings show, so a product page that holds the parent product reaches BI's links, such as `BatteryIncludedRecommendedProducts`, by passing its default variant's id here; BI knows no parent ids.
