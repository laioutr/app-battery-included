---
'@laioutr/app-battery-included': minor
---

Suggest maps the kinds BI returns today:

- Category suggestions from `facet._product_i18n.categoryTree.name` link to the `Category` by the id BI attaches; `facet._product_i18n.categories` (and the older `facet._product.categories`) link to the search page. Before, only `facet._product.categories` was read, so category suggestions were empty on current indexes.
- Product suggestions link to the `Product` instead of searching for its name, with a cover where the index has an image. The new `SuggestedSearchProductsLink` returns the suggested products as `Product` ids, so the commerce app resolves price and image.
- Content pages (`_content_i18n`) become `page` entries and BI promotions `promotion` entries, both linking to their URL.
- Highlights link to the search page with their term (before, with an empty term).
