---
'@laioutr/app-battery-included': minor
---

Filters are sent the way BI reads them: a multi-select as `f[<field>][]` (one entry per value) instead of repeated `f[<field>]`, and a range with an open end leaves that end out instead of sending `Number.MIN_SAFE_INTEGER` / `MAX_SAFE_INTEGER`.

Facets map more of what BI returns: price, manufacturer and category fields get Orchestr's well-known names (`price`, `brand`, `category`); category-tree values are labelled by the name BI attaches; a facet is presented as swatches when its field is listed in the new `swatchFacets` module option or BI attaches a colour or image to its values. Orchestr filters have no tree, so a category hierarchy is flattened in BI's order.
