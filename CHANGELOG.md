# @laioutr/app-battery-included

## 1.4.0

### Minor Changes

- 560a7e2: New query `battery-included/product/by-ids` (`BatteryIncludedProductsByIdsQuery`, input `{ ids }`, up to 100): the products BI indexes under those ids, in the order given unless the visitor sorts. BI indexes the variants its listings show, so a product page that holds the parent product reaches BI's links, such as `BatteryIncludedRecommendedProducts`, by passing its default variant's id here; BI knows no parent ids.

## 1.3.0

### Minor Changes

- 96d2484: **Products of a BI preset.** The new query `battery-included/product/by-preset` (`BatteryIncludedProductsByPresetQuery`, exported from `@laioutr/app-battery-included/runtime`) lists the products of a preset set up in Battery Included, such as new arrivals or best sellers for a slider. Its input is `{ presetId }`, it asks for 20 products by default and answers with Product ids, BI's facets, the configured sortings and pagination like the other listings; without a sorting, BI's own order for the preset applies. Studio offers the typed id as a preset (`Preset: <id>`), since BI's API cannot list presets by name.

  **Recommended products as products.** The new link `battery-included/product/recommended-products` (`BatteryIncludedRecommendedProducts`, exported from the runtime entry) links a `Product` to the products BI recommends for it, as `Product` entities the commerce app resolves with name, price and image. It lists all relations in BI's order, each product once, without the product itself, 20 by default. A product whose BI call fails gets no recommendations and the others are unaffected.

  `battery-included/product/recommendations` is deprecated: its `ProductRecommendation` targets carry only the relation, so a slider cannot show the products. It keeps working unchanged; move to `BatteryIncludedRecommendedProducts`.

  **Studio presets for search and category listings.** For `ProductsByCategoryIdQuery` the picker lists the categories of BI's category-tree facet that match the typed name (or id), up to 50, and stores the picked category's id; for `ProductSearchQuery` it offers a search for the typed term. Before, with BI serving these tokens, the picker had nothing to offer for them. A category appears only when the collection's facet config includes the category tree. When BI fails or has no such facet, the picker stays empty and the server logs a warning; queries are unaffected.

  Studio now also shows the app as **Battery Included** with its logo wherever it names the app serving a query, served from `/app-battery-included/battery-included-logo.png`.

## 1.2.1

### Patch Changes

- 713e9f8: Search finds products on storefronts whose language has no region. Battery Included indexes a collection under language and region (`de-DE`) and found nothing for the bare `de` a Laioutr language usually is; the app now completes it with the market's country. A new **Locale** setting (module option `locale`) names the locale outright when the collection was indexed under another one.

## 1.2.0

### Minor Changes

- 21028be: BI's merchandising extensions are exposed through two new query tokens, since canonical product queries have no slot for them:

  - `battery-included/listing/teasers` (`BatteryIncludedListingTeasersQuery`, input `{ categoryId?, streamId?, query? }`) answers `BatteryIncludedTeaser` entities with `position` (1-based index on the current page), `format` and its `rows`/`columns`, `link`, a desktop/mobile `image`, `code` and `itemType`.
  - `battery-included/search/redirect` (`BatteryIncludedSearchRedirectQuery`, input `{ query }`) answers the `url` BI sends a search term to, or "not found".

  The product queries also put BI's raw `extensions` into the `browseExtensionsToken` passthrough for project handlers.

- d9b74f9: Filters are sent the way BI reads them: a multi-select as `f[<field>][]` (one entry per value) instead of repeated `f[<field>]`.

  Facets map more of what BI returns: price, manufacturer and category fields get Orchestr's well-known names (`price`, `brand`, `category`); category-tree values are labelled by the name BI attaches; a facet is presented as swatches when its field is listed in the new `swatchFacets` module option or BI attaches a colour or image to its values. Orchestr filters have no tree, so a category hierarchy is flattened in BI's order.

- 47ef678: Category listings from BI: `ProductsByCategoryIdQuery` filters `_product_i18n.categoryTree.id` by the Shopware category id, and the app's own `battery-included/product/by-stream-id` query (`BatteryIncludedProductsByStreamIdQuery`) filters `_product.streamIds` by a product-stream id. Both answer with BI's facets, sortings and pagination like search, and are cached for 5 minutes. The fields are configurable with the `fields` module option.

  `ProductsByCategoryIdQuery` and `ProductSearchQuery` have `order: 2`, so with `@laioutr/app-shopware` installed (which implements both without an order) BI serves them regardless of install order. The README explains how a listing page binds a category id when its route carries a slug.

- 588b5a2: Listings offer the sortings relevance (`relevance`), price ascending and descending (`price-asc`, `price-desc`), top sellers (`topseller`, `_history.salesCount` descending) and newest (`newest`, `_common.releaseDate` descending). The keys are translated to BI's `<field>:<asc|desc>` sort; before, the key was sent to BI as is. Configure your own list with the `sortings` module option. The earlier keys `price:asc` and `price:desc` still work, a raw BI expression such as `_product.stock:desc` is passed through, and an unknown key falls back to BI's relevance order.
- c735fbb: The Laioutr core packages are peer dependencies now (`>=` the versions this release builds against), so a project resolves one copy of them. `@laioutr-app/shopify` is no longer a dependency: it is only used by the playground, and the module no longer installs it during `nuxt prepare`.

  **Breaking:** install `@laioutr-core/canonical-types`, `core-types`, `frontend-core`, `kit` and `orchestr` in your project if it does not have them yet. A Laioutr storefront already has them.

- 74d2d08: Requests to Battery Included are more robust:

  - A non-2xx answer throws `BatteryIncludedApiError` (with `status`, `endpoint` and a short `body`) instead of being parsed as data. `isBatteryIncludedApiError` is exported from `@laioutr/app-battery-included/runtime`.
  - Product search and suggest are cached for 5 minutes (Orchestr defaults: first page, unfiltered requests). Identical BI requests in flight at the same time share one call.
  - The BI locale is read from `clientEnv.language.code` instead of the deprecated `clientEnv.locale`.
  - Recommendations are cached per product for 5 minutes and answer their relation inline. A product whose BI call fails gets no recommendations instead of failing the others, and that fallback is not cached. The recommendation resolver no longer throws when the passthrough is empty.

- aa1f268: The app's settings can be set per environment in the Cockpit, under Configuration → Battery Included: the collection and its API key, with a Test button that checks both against Battery Included, the listing sortings, swatch filters and filter fields, and the API address. Values set in the Cockpit reach the module as its options, so nothing changes for a project that sets them in `nuxt.config.ts`.
- 22be59b: Suggest maps the kinds BI returns today:

  - Category suggestions from `facet._product_i18n.categoryTree.name` link to the `Category` by the id BI attaches; `facet._product_i18n.categories` (and the older `facet._product.categories`) link to the search page. Before, only `facet._product.categories` was read, so category suggestions were empty on current indexes.
  - Product suggestions link to the `Product` instead of searching for its name, with a cover where the index has an image. The new `SuggestedSearchProductsLink` returns the suggested products as `Product` ids, so the commerce app resolves price and image.
  - Content pages (`_content_i18n`) become `page` entries and BI promotions `promotion` entries, both linking to their URL.
  - Highlights link to the search page with their term (before, with an empty term).

### Patch Changes

- 0f42d75: Search, listings and recommendations work against a live BI collection.

  - **Results:** BI is asked with the full language tag (`de-DE`); the bare language (`de`) matched no documents.
  - **Products:** hits and recommendations are handed to the commerce app by its own product id (`_product.id`), not BI's product number, so the products resolve.
  - **Recommendations:** a product's BI id is looked up first, in one request for all products on the page.
  - **Price ranges:** a range with one open end filters again; BI applies a range only when both ends are sent.
  - **Links:** teaser, promotion, content-page and redirect URLs from BI are kept only when they are a path on the storefront or an http(s) URL. An extension without data is skipped instead of failing the answer.

## 1.1.0

### Minor Changes

- d400829: The app is open source and published to npmjs.org as `@laioutr/app-battery-included`, under the MIT licence.

  **Breaking:** the package and its configuration key are renamed. Install the new package and move its options:

  ```ts
  // before
  modules: ['@laioutr-app/battery-included'],
  '@laioutr-app/battery-included': { collection, apiKey },

  // after
  modules: ['@laioutr/app-battery-included'],
  '@laioutr/app-battery-included': { collection, apiKey },
  ```

## 1.0.125

### Patch Changes

- Updated dependencies [21ff503]
  - @laioutr-core/core-types@0.80.0
  - @laioutr-core/frontend-core@0.80.0
  - @laioutr-core/canonical-types@0.40.1
  - @laioutr-core/kit@0.80.0
  - @laioutr-app/shopify@0.52.1

## 1.0.124

### Patch Changes

- Updated dependencies [281e0e3]
- Updated dependencies [c710895]
- Updated dependencies [281e0e3]
- Updated dependencies [97fb84e]
- Updated dependencies [f7e3bca]
- Updated dependencies [281e0e3]
  - @laioutr-app/shopify@0.52.0
  - @laioutr-core/canonical-types@0.40.0
  - @laioutr-core/frontend-core@0.79.0
  - @laioutr-core/core-types@0.79.0
  - @laioutr-core/kit@0.79.0

## 1.0.123

### Patch Changes

- Updated dependencies [7b2bfed]
  - @laioutr-core/canonical-types@0.39.11
  - @laioutr-app/shopify@0.51.1
  - @laioutr-core/frontend-core@0.78.0

## 1.0.122

### Patch Changes

- Updated dependencies [5831220]
  - @laioutr-app/shopify@0.51.0

## 1.0.121

### Patch Changes

- Updated dependencies [c4f3719]
  - @laioutr-core/frontend-core@0.78.0
  - @laioutr-core/core-types@0.78.0
  - @laioutr-app/shopify@0.50.1
  - @laioutr-core/canonical-types@0.39.10
  - @laioutr-core/kit@0.78.0

## 1.0.120

### Patch Changes

- Updated dependencies [24a1694]
- Updated dependencies [99c017f]
  - @laioutr-core/core-types@0.77.1
  - @laioutr-core/frontend-core@0.77.1
  - @laioutr-app/shopify@0.50.0
  - @laioutr-core/canonical-types@0.39.9
  - @laioutr-core/kit@0.77.1

## 1.0.119

### Patch Changes

- @laioutr-core/frontend-core@0.77.0
- @laioutr-app/shopify@0.49.1
- @laioutr-core/kit@0.77.0
- @laioutr-core/core-types@0.77.0
- @laioutr-core/canonical-types@0.39.8

## 1.0.118

### Patch Changes

- Updated dependencies [b7953c7]
  - @laioutr-app/shopify@0.49.0

## 1.0.117

### Patch Changes

- Updated dependencies [97a89f6]
- Updated dependencies [32661f8]
  - @laioutr-app/shopify@0.48.4
  - @laioutr-core/frontend-core@0.76.0
  - @laioutr-core/kit@0.76.0
  - @laioutr-core/core-types@0.76.0
  - @laioutr-core/canonical-types@0.39.7

## 1.0.116

### Patch Changes

- Updated dependencies [08e40bd]
- Updated dependencies [eb3cec9]
  - @laioutr-core/frontend-core@0.75.3
  - @laioutr-app/shopify@0.48.3
  - @laioutr-core/kit@0.75.3
  - @laioutr-core/core-types@0.75.3
  - @laioutr-core/canonical-types@0.39.6

## 1.0.115

### Patch Changes

- @laioutr-core/frontend-core@0.75.2
- @laioutr-app/shopify@0.48.2
- @laioutr-core/kit@0.75.2
- @laioutr-core/core-types@0.75.2
- @laioutr-core/canonical-types@0.39.5

## 1.0.114

### Patch Changes

- Updated dependencies [464da48]
  - @laioutr-core/frontend-core@0.75.1
  - @laioutr-app/shopify@0.48.1
  - @laioutr-core/kit@0.75.1
  - @laioutr-core/core-types@0.75.1
  - @laioutr-core/canonical-types@0.39.4

## 1.0.113

### Patch Changes

- Updated dependencies [c2908dd]
- Updated dependencies [c2908dd]
  - @laioutr-core/frontend-core@0.75.0
  - @laioutr-app/shopify@0.48.0
  - @laioutr-core/kit@0.75.0
  - @laioutr-core/core-types@0.75.0
  - @laioutr-core/canonical-types@0.39.3

## 1.0.112

### Patch Changes

- Updated dependencies [51d37d2]
  - @laioutr-app/shopify@0.47.0

## 1.0.111

### Patch Changes

- Updated dependencies [650db29]
- Updated dependencies [80fe8a4]
  - @laioutr-app/shopify@0.46.0
  - @laioutr-core/core-types@0.74.0
  - @laioutr-core/frontend-core@0.74.0
  - @laioutr-core/canonical-types@0.39.2
  - @laioutr-core/kit@0.74.0

## 1.0.110

### Patch Changes

- Updated dependencies [b807ab4]
- Updated dependencies [b80963c]
  - @laioutr-core/frontend-core@0.73.0
  - @laioutr-core/core-types@0.73.0
  - @laioutr-app/shopify@0.45.2
  - @laioutr-core/canonical-types@0.39.1
  - @laioutr-core/kit@0.73.0

## 1.0.109

### Patch Changes

- Updated dependencies [64da40b]
- Updated dependencies [d91ad19]
  - @laioutr-core/canonical-types@0.39.0
  - @laioutr-core/core-types@0.72.0
  - @laioutr-core/frontend-core@0.72.0
  - @laioutr-app/shopify@0.45.1
  - @laioutr-core/kit@0.72.0

## 1.0.108

### Patch Changes

- Updated dependencies [ae9f223]
- Updated dependencies [a9b4f76]
- Updated dependencies [a9b4f76]
  - @laioutr-core/frontend-core@0.71.0
  - @laioutr-app/shopify@0.45.0
  - @laioutr-core/core-types@0.71.0
  - @laioutr-core/canonical-types@0.38.5
  - @laioutr-core/kit@0.71.0

## 1.0.107

### Patch Changes

- Updated dependencies [5ece9fc]
  - @laioutr-app/shopify@0.44.0

## 1.0.106

### Patch Changes

- Updated dependencies [2a11190]
  - @laioutr-core/core-types@0.70.0
  - @laioutr-core/frontend-core@0.70.0
  - @laioutr-core/canonical-types@0.38.4
  - @laioutr-core/kit@0.70.0
  - @laioutr-app/shopify@0.43.3

## 1.0.105

### Patch Changes

- Updated dependencies [e326afc]
- Updated dependencies [e326afc]
  - @laioutr-core/core-types@0.69.0
  - @laioutr-core/frontend-core@0.69.0
  - @laioutr-core/canonical-types@0.38.3
  - @laioutr-core/kit@0.69.0
  - @laioutr-app/shopify@0.43.2

## 1.0.104

### Patch Changes

- Updated dependencies [725d57a]
  - @laioutr-core/frontend-core@0.68.2
  - @laioutr-app/shopify@0.43.1
  - @laioutr-core/kit@0.68.2
  - @laioutr-core/core-types@0.68.2
  - @laioutr-core/canonical-types@0.38.2

## 1.0.103

### Patch Changes

- Updated dependencies [968bd03]
- Updated dependencies [43314a8]
  - @laioutr-core/frontend-core@0.68.1
  - @laioutr-app/shopify@0.43.0
  - @laioutr-core/kit@0.68.1
  - @laioutr-core/core-types@0.68.1
  - @laioutr-core/canonical-types@0.38.1

## 1.0.102

### Patch Changes

- Updated dependencies [4cbba0f]
- Updated dependencies [dbf4314]
- Updated dependencies [dbf4314]
  - @laioutr-core/canonical-types@0.38.0
  - @laioutr-app/shopify@0.42.0
  - @laioutr-core/frontend-core@0.68.0
  - @laioutr-core/kit@0.68.0
  - @laioutr-core/core-types@0.68.0

## 1.0.101

### Patch Changes

- Updated dependencies [7365750]
- Updated dependencies [e54ce26]
- Updated dependencies [0f6c1b9]
  - @laioutr-core/frontend-core@0.67.1
  - @laioutr-core/core-types@0.67.1
  - @laioutr-app/shopify@0.41.1
  - @laioutr-core/canonical-types@0.37.4
  - @laioutr-core/kit@0.67.1

## 1.0.100

### Patch Changes

- Updated dependencies [e150500]
- Updated dependencies [e150500]
  - @laioutr-app/shopify@0.41.0
  - @laioutr-core/core-types@0.67.0
  - @laioutr-core/frontend-core@0.67.0
  - @laioutr-core/canonical-types@0.37.3
  - @laioutr-core/kit@0.67.0

## 1.0.99

### Patch Changes

- Updated dependencies [be93228]
  - @laioutr-app/shopify@0.40.4
  - @laioutr-core/frontend-core@0.66.2
  - @laioutr-core/kit@0.66.2
  - @laioutr-core/core-types@0.66.2
  - @laioutr-core/canonical-types@0.37.2

## 1.0.98

### Patch Changes

- Updated dependencies [906e58e]
- Updated dependencies [f60fb3b]
  - @laioutr-core/frontend-core@0.66.1
  - @laioutr-core/core-types@0.66.1
  - @laioutr-app/shopify@0.40.3
  - @laioutr-core/canonical-types@0.37.1
  - @laioutr-core/kit@0.66.1

## 1.0.97

### Patch Changes

- Updated dependencies [8279c47]
- Updated dependencies [628ae97]
- Updated dependencies [1fc98d3]
- Updated dependencies [17643d0]
- Updated dependencies [74c566d]
- Updated dependencies [74c566d]
- Updated dependencies [9d89120]
- Updated dependencies [59b50e2]
- Updated dependencies [8279c47]
  - @laioutr-core/frontend-core@0.66.0
  - @laioutr-core/core-types@0.66.0
  - @laioutr-app/shopify@0.40.2
  - @laioutr-core/canonical-types@0.37.0
  - @laioutr-core/kit@0.66.0

## 1.0.96

### Patch Changes

- Updated dependencies [e7280a0]
- Updated dependencies [4dba39c]
- Updated dependencies [b0ae5f0]
- Updated dependencies [f93f959]
  - @laioutr-core/core-types@0.65.0
  - @laioutr-core/frontend-core@0.65.0
  - @laioutr-core/canonical-types@0.36.2
  - @laioutr-core/kit@0.65.0
  - @laioutr-app/shopify@0.40.1

## 1.0.95

### Patch Changes

- Updated dependencies [35f5797]
- Updated dependencies [5d61e69]
- Updated dependencies [b12ddf7]
- Updated dependencies [35f5797]
  - @laioutr-core/core-types@0.64.0
  - @laioutr-core/frontend-core@0.64.0
  - @laioutr-app/shopify@0.40.0
  - @laioutr-core/canonical-types@0.36.1
  - @laioutr-core/kit@0.64.0

## 1.0.94

### Patch Changes

- Updated dependencies [9627f72]
  - @laioutr-app/shopify@0.39.2

## 1.0.93

### Patch Changes

- Updated dependencies [9580981]
- Updated dependencies [9c51365]
- Updated dependencies [d77d467]
- Updated dependencies [85ade69]
- Updated dependencies [c960e94]
- Updated dependencies [38807a6]
- Updated dependencies [9580981]
- Updated dependencies [1997e11]
- Updated dependencies [823e696]
  - @laioutr-core/canonical-types@0.36.0
  - @laioutr-core/core-types@0.63.0
  - @laioutr-core/kit@0.63.0
  - @laioutr-core/frontend-core@0.63.0
  - @laioutr-app/shopify@0.39.1

## 1.0.92

### Patch Changes

- Updated dependencies [dbbf506]
- Updated dependencies [c2eb7d7]
- Updated dependencies [dbbf506]
  - @laioutr-core/canonical-types@0.35.0
  - @laioutr-app/shopify@0.39.0
  - @laioutr-core/frontend-core@0.62.0

## 1.0.91

### Patch Changes

- Updated dependencies [c40aa7f]
- Updated dependencies [5992399]
- Updated dependencies [bb720de]
- Updated dependencies [48a923b]
- Updated dependencies [3123ca2]
- Updated dependencies [48a923b]
- Updated dependencies [0905caa]
- Updated dependencies [2cf8cf5]
- Updated dependencies [1546305]
  - @laioutr-core/frontend-core@0.62.0
  - @laioutr-core/core-types@0.62.0
  - @laioutr-app/shopify@0.38.0
  - @laioutr-core/canonical-types@0.34.9
  - @laioutr-core/kit@0.62.0

## 1.0.90

### Patch Changes

- @laioutr-core/frontend-core@0.61.0
- @laioutr-app/shopify@0.37.1
- @laioutr-core/kit@0.61.0
- @laioutr-core/core-types@0.61.0
- @laioutr-core/canonical-types@0.34.8

## 1.0.89

### Patch Changes

- Updated dependencies [b8b2db1]
- Updated dependencies [485e484]
- Updated dependencies [f8b9fe7]
- Updated dependencies [2fe8b7c]
- Updated dependencies [e9cccf5]
  - @laioutr-core/core-types@0.60.0
  - @laioutr-core/frontend-core@0.60.0
  - @laioutr-app/shopify@0.37.0
  - @laioutr-core/canonical-types@0.34.7
  - @laioutr-core/kit@0.60.0

## 1.0.88

### Patch Changes

- Updated dependencies [d709769]
  - @laioutr-app/shopify@0.36.7

## 1.0.87

### Patch Changes

- Updated dependencies [3035bce]
- Updated dependencies [be4bc93]
  - @laioutr-core/frontend-core@0.59.0
  - @laioutr-app/shopify@0.36.6
  - @laioutr-core/kit@0.59.0
  - @laioutr-core/core-types@0.59.0
  - @laioutr-core/canonical-types@0.34.6

## 1.0.86

### Patch Changes

- Updated dependencies [9b3fa89]
- Updated dependencies [04a59a0]
- Updated dependencies [04a59a0]
- Updated dependencies [04a59a0]
  - @laioutr-core/frontend-core@0.58.1
  - @laioutr-app/shopify@0.36.5
  - @laioutr-core/kit@0.58.1
  - @laioutr-core/core-types@0.58.1
  - @laioutr-core/canonical-types@0.34.5

## 1.0.85

### Patch Changes

- Updated dependencies [9c872eb]
  - @laioutr-core/frontend-core@0.58.0
  - @laioutr-core/core-types@0.58.0
  - @laioutr-app/shopify@0.36.4
  - @laioutr-core/canonical-types@0.34.4
  - @laioutr-core/kit@0.58.0

## 1.0.84

### Patch Changes

- Updated dependencies [101181b]
- Updated dependencies [c4ce99d]
  - @laioutr-app/shopify@0.36.3

## 1.0.83

### Patch Changes

- Updated dependencies [00ed928]
- Updated dependencies [52f7864]
- Updated dependencies [dad25c9]
  - @laioutr-core/frontend-core@0.57.2
  - @laioutr-app/shopify@0.36.2
  - @laioutr-core/kit@0.57.2
  - @laioutr-core/core-types@0.57.2
  - @laioutr-core/canonical-types@0.34.3

## 1.0.82

### Patch Changes

- Updated dependencies [ca6eb64]
- Updated dependencies [ccc9cb7]
  - @laioutr-core/frontend-core@0.57.1
  - @laioutr-app/shopify@0.36.1
  - @laioutr-core/kit@0.57.1
  - @laioutr-core/core-types@0.57.1
  - @laioutr-core/canonical-types@0.34.2

## 1.0.81

### Patch Changes

- Updated dependencies [ff4ba48]
- Updated dependencies [8f743f6]
  - @laioutr-app/shopify@0.36.0
  - @laioutr-core/frontend-core@0.57.0
  - @laioutr-core/kit@0.57.0
  - @laioutr-core/core-types@0.57.0
  - @laioutr-core/canonical-types@0.34.1

## 1.0.80

### Patch Changes

- Updated dependencies [63fbaf0]
  - @laioutr-app/shopify@0.35.3

## 1.0.79

### Patch Changes

- Updated dependencies [aaca3ea]
  - @laioutr-core/canonical-types@0.34.0
  - @laioutr-core/frontend-core@0.56.0
  - @laioutr-app/shopify@0.35.2
  - @laioutr-core/kit@0.56.0
  - @laioutr-core/core-types@0.56.0

## 1.0.78

### Patch Changes

- Updated dependencies [7bd4115]
  - @laioutr-core/core-types@0.55.0
  - @laioutr-core/frontend-core@0.55.0
  - @laioutr-core/canonical-types@0.33.4
  - @laioutr-core/kit@0.55.0
  - @laioutr-app/shopify@0.35.1

## 1.0.77

### Patch Changes

- Updated dependencies [c795763]
  - @laioutr-app/shopify@0.35.0
  - @laioutr-core/frontend-core@0.54.0
  - @laioutr-core/kit@0.54.0
  - @laioutr-core/core-types@0.54.0
  - @laioutr-core/canonical-types@0.33.3

## 1.0.76

### Patch Changes

- Updated dependencies [845ea29]
- Updated dependencies [dffd5e9]
- Updated dependencies [7fe708c]
  - @laioutr-core/frontend-core@0.53.0
  - @laioutr-core/core-types@0.53.0
  - @laioutr-app/shopify@0.34.0
  - @laioutr-core/canonical-types@0.33.2
  - @laioutr-core/kit@0.53.0

## 1.0.75

### Patch Changes

- Updated dependencies [094b65d]
  - @laioutr-app/shopify@0.33.1
  - @laioutr-core/frontend-core@0.52.0
  - @laioutr-core/kit@0.52.0
  - @laioutr-core/core-types@0.52.0
  - @laioutr-core/canonical-types@0.33.1

## 1.0.74

### Patch Changes

- Updated dependencies [881aabd]
- Updated dependencies [9900baf]
- Updated dependencies [7bb8596]
  - @laioutr-core/canonical-types@0.33.0
  - @laioutr-app/shopify@0.33.0
  - @laioutr-core/core-types@0.51.0
  - @laioutr-core/frontend-core@0.51.0
  - @laioutr-core/kit@0.51.0

## 1.0.73

### Patch Changes

- Updated dependencies [fed43ff]
- Updated dependencies [4182c7a]
- Updated dependencies [7ac3e6b]
  - @laioutr-core/core-types@0.50.0
  - @laioutr-core/frontend-core@0.50.0
  - @laioutr-app/shopify@0.32.0
  - @laioutr-core/canonical-types@0.32.6
  - @laioutr-core/kit@0.50.0

## 1.0.72

### Patch Changes

- Updated dependencies [a280ad7]
  - @laioutr-app/shopify@0.31.2
  - @laioutr-core/frontend-core@0.49.1
  - @laioutr-core/kit@0.49.1
  - @laioutr-core/core-types@0.49.1
  - @laioutr-core/canonical-types@0.32.5

## 1.0.71

### Patch Changes

- Updated dependencies [3a32624]
- Updated dependencies [bf53b0a]
- Updated dependencies [a96d1a9]
- Updated dependencies [9d7df20]
- Updated dependencies [4661cbd]
  - @laioutr-core/frontend-core@0.49.0
  - @laioutr-core/core-types@0.49.0
  - @laioutr-app/shopify@0.31.1
  - @laioutr-core/canonical-types@0.32.4
  - @laioutr-core/kit@0.49.0

## 1.0.70

### Patch Changes

- Updated dependencies [53f1dba]
- Updated dependencies [e3ab81c]
- Updated dependencies [987bf36]
- Updated dependencies [a9f1ccb]
  - @laioutr-app/shopify@0.31.0
  - @laioutr-core/frontend-core@0.48.0
  - @laioutr-core/kit@0.48.0
  - @laioutr-core/core-types@0.48.0
  - @laioutr-core/canonical-types@0.32.3

## 1.0.69

### Patch Changes

- Updated dependencies [e59c993]
- Updated dependencies [24a65ac]
- Updated dependencies [f9b9bdf]
  - @laioutr-core/frontend-core@0.47.2
  - @laioutr-app/shopify@0.30.4
  - @laioutr-core/kit@0.47.2
  - @laioutr-core/core-types@0.47.2
  - @laioutr-core/canonical-types@0.32.2

## 1.0.68

### Patch Changes

- Updated dependencies [5e02f3f]
  - @laioutr-app/shopify@0.30.3

## 1.0.67

### Patch Changes

- Updated dependencies [c26d3f3]
  - @laioutr-core/frontend-core@0.47.1
  - @laioutr-app/shopify@0.30.2
  - @laioutr-core/kit@0.47.1
  - @laioutr-core/core-types@0.47.1
  - @laioutr-core/canonical-types@0.32.1

## 1.0.66

### Patch Changes

- Updated dependencies [63151fe]
- Updated dependencies [7de8517]
- Updated dependencies [b4ec745]
- Updated dependencies [b4ec745]
- Updated dependencies [b2e6c0d]
- Updated dependencies [128646e]
  - @laioutr-core/frontend-core@0.47.0
  - @laioutr-core/canonical-types@0.32.0
  - @laioutr-app/shopify@0.30.1
  - @laioutr-core/kit@0.47.0
  - @laioutr-core/core-types@0.47.0

## 1.0.65

### Patch Changes

- Updated dependencies [25a288d]
- Updated dependencies [ead9ba8]
- Updated dependencies [25a288d]
  - @laioutr-core/canonical-types@0.31.1
  - @laioutr-core/frontend-core@0.46.0
  - @laioutr-app/shopify@0.30.0
  - @laioutr-core/kit@0.46.0
  - @laioutr-core/core-types@0.46.0

## 1.0.64

### Patch Changes

- Updated dependencies [38ad562]
- Updated dependencies [8a416dc]
- Updated dependencies [8a416dc]
- Updated dependencies [4f099f1]
- Updated dependencies [54e0e27]
  - @laioutr-core/frontend-core@0.45.0
  - @laioutr-core/canonical-types@0.31.0
  - @laioutr-app/shopify@0.29.0
  - @laioutr-core/kit@0.45.0
  - @laioutr-core/core-types@0.45.0

## 1.0.63

### Patch Changes

- @laioutr-core/frontend-core@0.44.1
- @laioutr-app/shopify@0.28.3
- @laioutr-core/kit@0.44.1
- @laioutr-core/core-types@0.44.1
- @laioutr-core/canonical-types@0.30.3

## 1.0.62

### Patch Changes

- Updated dependencies [560452e]
- Updated dependencies [ac99c73]
- Updated dependencies [560452e]
  - @laioutr-core/frontend-core@0.44.0
  - @laioutr-app/shopify@0.28.2
  - @laioutr-core/kit@0.44.0
  - @laioutr-core/core-types@0.44.0
  - @laioutr-core/canonical-types@0.30.2

## 1.0.61

### Patch Changes

- Updated dependencies [dd88fe4]
- Updated dependencies [81229e8]
  - @laioutr-core/frontend-core@0.43.1
  - @laioutr-core/core-types@0.43.1
  - @laioutr-app/shopify@0.28.1
  - @laioutr-core/canonical-types@0.30.1
  - @laioutr-core/kit@0.43.1

## 1.0.60

### Patch Changes

- Updated dependencies [d636a84]
- Updated dependencies [c2abf1c]
- Updated dependencies [fb1ca35]
- Updated dependencies [fb1ca35]
- Updated dependencies [168802d]
- Updated dependencies [7488dea]
- Updated dependencies [8a77fe4]
- Updated dependencies [59be3dd]
- Updated dependencies [74d09a0]
- Updated dependencies [586dda2]
- Updated dependencies [5c00bee]
- Updated dependencies [10875dc]
  - @laioutr-core/frontend-core@0.43.0
  - @laioutr-core/canonical-types@0.30.0
  - @laioutr-app/shopify@0.28.0
  - @laioutr-core/kit@0.43.0
  - @laioutr-core/core-types@0.43.0

## 1.0.59

### Patch Changes

- Updated dependencies [f6c0623]
- Updated dependencies [2b39300]
- Updated dependencies [b61dd68]
- Updated dependencies [8ba1d03]
- Updated dependencies [1f43f69]
- Updated dependencies [1f43f69]
- Updated dependencies [2cfab7c]
- Updated dependencies [661ed11]
  - @laioutr-core/core-types@0.42.0
  - @laioutr-core/canonical-types@0.29.0
  - @laioutr-core/frontend-core@0.42.0
  - @laioutr-app/shopify@0.27.2
  - @laioutr-core/kit@0.42.0

## 1.0.58

### Patch Changes

- Updated dependencies [7daad43]
- Updated dependencies [b11be48]
  - @laioutr-app/shopify@0.27.1
  - @laioutr-core/frontend-core@0.41.1
  - @laioutr-core/kit@0.41.1
  - @laioutr-core/core-types@0.41.1
  - @laioutr-core/canonical-types@0.28.1

## 1.0.57

### Patch Changes

- Updated dependencies [912971b]
- Updated dependencies [762edaf]
- Updated dependencies [b707bfe]
- Updated dependencies [194eb07]
- Updated dependencies [bcc8e2c]
- Updated dependencies [ccce490]
- Updated dependencies [9656072]
- Updated dependencies [7cbe71a]
- Updated dependencies [4848a5a]
- Updated dependencies [2a3661d]
  - @laioutr-core/frontend-core@0.41.0
  - @laioutr-core/core-types@0.41.0
  - @laioutr-core/canonical-types@0.28.0
  - @laioutr-app/shopify@0.27.0
  - @laioutr-core/kit@0.41.0

## 1.0.56

### Patch Changes

- Updated dependencies [5b7590a]
  - @laioutr-core/frontend-core@0.40.3
  - @laioutr-app/shopify@0.26.3
  - @laioutr-core/kit@0.40.3
  - @laioutr-core/core-types@0.40.3
  - @laioutr-core/canonical-types@0.27.4

## 1.0.55

### Patch Changes

- Updated dependencies [59d2b99]
  - @laioutr-core/frontend-core@0.40.2
  - @laioutr-app/shopify@0.26.2
  - @laioutr-core/kit@0.40.2
  - @laioutr-core/core-types@0.40.2
  - @laioutr-core/canonical-types@0.27.3

## 1.0.54

### Patch Changes

- Updated dependencies [dfed458]
  - @laioutr-core/frontend-core@0.40.1
  - @laioutr-app/shopify@0.26.1
  - @laioutr-core/kit@0.40.1
  - @laioutr-core/core-types@0.40.1
  - @laioutr-core/canonical-types@0.27.2

## 1.0.53

### Patch Changes

- Updated dependencies [3ce84a4]
- Updated dependencies [6307c1b]
- Updated dependencies [a18e839]
- Updated dependencies [d7d80d4]
  - @laioutr-core/frontend-core@0.40.0
  - @laioutr-app/shopify@0.26.0
  - @laioutr-core/kit@0.40.0
  - @laioutr-core/core-types@0.40.0
  - @laioutr-core/canonical-types@0.27.1

## 1.0.52

### Patch Changes

- Updated dependencies [f644aab]
- Updated dependencies [3332842]
- Updated dependencies [4098213]
  - @laioutr-core/canonical-types@0.27.0
  - @laioutr-core/core-types@0.39.0
  - @laioutr-app/shopify@0.25.4
  - @laioutr-core/frontend-core@0.39.0
  - @laioutr-core/kit@0.39.0

## 1.0.51

### Patch Changes

- Updated dependencies [c686645]
  - @laioutr-core/frontend-core@0.38.3
  - @laioutr-app/shopify@0.25.3
  - @laioutr-core/kit@0.38.3
  - @laioutr-core/core-types@0.38.3
  - @laioutr-core/canonical-types@0.26.7

## 1.0.50

### Patch Changes

- Updated dependencies [317068a]
  - @laioutr-app/shopify@0.25.2

## 1.0.49

### Patch Changes

- Updated dependencies [4486a1d]
  - @laioutr-app/shopify@0.25.1

## 1.0.48

### Patch Changes

- Updated dependencies [5a507db]
  - @laioutr-core/canonical-types@0.26.6
  - @laioutr-app/shopify@0.25.0

## 1.0.47

### Patch Changes

- Updated dependencies [1bb8d76]
  - @laioutr-app/shopify@0.24.0

## 1.0.46

### Patch Changes

- Updated dependencies [00bd203]
  - @laioutr-app/shopify@0.23.0

## 1.0.45

### Patch Changes

- Updated dependencies [452faef]
  - @laioutr-core/frontend-core@0.38.2
  - @laioutr-app/shopify@0.22.2
  - @laioutr-core/kit@0.38.2
  - @laioutr-core/core-types@0.38.2
  - @laioutr-core/canonical-types@0.26.5

## 1.0.44

### Patch Changes

- Updated dependencies [eaa8098]
- Updated dependencies [84c4dae]
  - @laioutr-core/core-types@0.38.1
  - @laioutr-app/shopify@0.22.1
  - @laioutr-core/canonical-types@0.26.4
  - @laioutr-core/frontend-core@0.38.1
  - @laioutr-core/kit@0.38.1

## 1.0.43

### Patch Changes

- Updated dependencies [d63ddd6]
- Updated dependencies [d63ddd6]
- Updated dependencies [d63ddd6]
- Updated dependencies [f788876]
  - @laioutr-app/shopify@0.22.0
  - @laioutr-core/frontend-core@0.38.0
  - @laioutr-core/core-types@0.38.0
  - @laioutr-core/canonical-types@0.26.3
  - @laioutr-core/kit@0.38.0

## 1.0.42

### Patch Changes

- Updated dependencies [c0287c9]
  - @laioutr-app/shopify@0.21.1

## 1.0.41

### Patch Changes

- Updated dependencies [60ea122]
- Updated dependencies [cd2e51e]
- Updated dependencies [7c096fe]
- Updated dependencies [5e4342b]
  - @laioutr-core/frontend-core@0.37.1
  - @laioutr-app/shopify@0.21.0
  - @laioutr-core/kit@0.37.1
  - @laioutr-core/core-types@0.37.1
  - @laioutr-core/canonical-types@0.26.2

## 1.0.40

### Patch Changes

- Updated dependencies [72137a7]
- Updated dependencies [72137a7]
  - @laioutr-core/frontend-core@0.37.0
  - @laioutr-core/core-types@0.37.0
  - @laioutr-app/shopify@0.20.1
  - @laioutr-core/canonical-types@0.26.1
  - @laioutr-core/kit@0.37.0

## 1.0.39

### Patch Changes

- Updated dependencies [26c6a9d]
- Updated dependencies [2cccf3d]
- Updated dependencies [a0df5b7]
- Updated dependencies [26c6a9d]
- Updated dependencies [125d5de]
- Updated dependencies [5cd1a99]
- Updated dependencies [e57e670]
- Updated dependencies [66af5c0]
- Updated dependencies [3416d47]
- Updated dependencies [ca2aa8a]
- Updated dependencies [3db8a45]
- Updated dependencies [fe1007a]
- Updated dependencies [948df8c]
- Updated dependencies [317d1d0]
- Updated dependencies [32f2aa8]
- Updated dependencies [6e3f5a5]
  - @laioutr-core/canonical-types@0.26.0
  - @laioutr-core/core-types@0.36.0
  - @laioutr-app/shopify@0.20.0
  - @laioutr-core/frontend-core@0.36.0
  - @laioutr-core/kit@0.36.0

## 1.0.38

### Patch Changes

- Updated dependencies [3df5972]
  - @laioutr-core/frontend-core@0.35.1
  - @laioutr-app/shopify@0.19.1
  - @laioutr-core/kit@0.35.1
  - @laioutr-core/core-types@0.35.1
  - @laioutr-core/canonical-types@0.25.3

## 1.0.37

### Patch Changes

- Updated dependencies [9afa72b]
- Updated dependencies [e072c7a]
- Updated dependencies [e57a0d9]
  - @laioutr-core/core-types@0.35.0
  - @laioutr-core/frontend-core@0.35.0
  - @laioutr-app/shopify@0.19.0
  - @laioutr-core/canonical-types@0.25.2
  - @laioutr-core/kit@0.35.0

## 1.0.36

### Patch Changes

- Updated dependencies [1ca1228]
- Updated dependencies [b33b105]
- Updated dependencies [fed75c6]
- Updated dependencies [b33b105]
  - @laioutr-core/frontend-core@0.34.0
  - @laioutr-app/shopify@0.18.33
  - @laioutr-core/core-types@0.34.0
  - @laioutr-core/canonical-types@0.25.1
  - @laioutr-core/kit@0.34.0

## 1.0.35

### Patch Changes

- Updated dependencies [5f65b04]
  - @laioutr-core/canonical-types@0.25.0
  - @laioutr-app/shopify@0.18.32

## 1.0.34

### Patch Changes

- Updated dependencies [2a71470]
  - @laioutr-core/core-types@0.33.1
  - @laioutr-core/canonical-types@0.24.1
  - @laioutr-core/frontend-core@0.33.1
  - @laioutr-core/kit@0.33.1
  - @laioutr-app/shopify@0.18.31

## 1.0.33

### Patch Changes

- Updated dependencies [200c297]
- Updated dependencies [7479fda]
- Updated dependencies [28b3020]
  - @laioutr-core/frontend-core@0.33.0
  - @laioutr-core/core-types@0.33.0
  - @laioutr-core/canonical-types@0.24.0
  - @laioutr-app/shopify@0.18.30
  - @laioutr-core/kit@0.33.0

## 1.0.32

### Patch Changes

- Updated dependencies [8a8ecc3]
  - @laioutr-core/frontend-core@0.32.1
  - @laioutr-app/shopify@0.18.29
  - @laioutr-core/kit@0.32.1
  - @laioutr-core/core-types@0.32.1
  - @laioutr-core/canonical-types@0.23.3

## 1.0.31

### Patch Changes

- Updated dependencies [fd07707]
- Updated dependencies [1a62ae9]
  - @laioutr-core/core-types@0.32.0
  - @laioutr-core/frontend-core@0.32.0
  - @laioutr-core/canonical-types@0.23.2
  - @laioutr-core/kit@0.32.0
  - @laioutr-app/shopify@0.18.28

## 1.0.30

### Patch Changes

- Updated dependencies [ac2311e]
- Updated dependencies [20b5724]
  - @laioutr-core/frontend-core@0.31.1
  - @laioutr-core/core-types@0.31.1
  - @laioutr-app/shopify@0.18.27
  - @laioutr-core/canonical-types@0.23.1
  - @laioutr-core/kit@0.31.1

## 1.0.29

### Patch Changes

- Updated dependencies [477d67e]
- Updated dependencies [b95eb4c]
- Updated dependencies [5b8c5a2]
- Updated dependencies [247d008]
- Updated dependencies [41a065b]
- Updated dependencies [f2b9f56]
  - @laioutr-core/canonical-types@0.23.0
  - @laioutr-core/core-types@0.31.0
  - @laioutr-core/frontend-core@0.31.0
  - @laioutr-app/shopify@0.18.26
  - @laioutr-core/kit@0.31.0

## 1.0.28

### Patch Changes

- Updated dependencies [dc8610b]
- Updated dependencies [dc8610b]
- Updated dependencies [a82dbb0]
- Updated dependencies [cbce272]
  - @laioutr-core/core-types@0.30.3
  - @laioutr-core/frontend-core@0.30.3
  - @laioutr-core/canonical-types@0.22.25
  - @laioutr-core/kit@0.30.3
  - @laioutr-app/shopify@0.18.25

## 1.0.27

### Patch Changes

- Updated dependencies [0262d90]
  - @laioutr-core/frontend-core@0.30.2
  - @laioutr-app/shopify@0.18.24
  - @laioutr-core/kit@0.30.2
  - @laioutr-core/core-types@0.30.2
  - @laioutr-core/canonical-types@0.22.24

## 1.0.26

### Patch Changes

- Updated dependencies [705ad15]
- Updated dependencies [705ad15]
- Updated dependencies [e388d8e]
- Updated dependencies [0861f3e]
  - @laioutr-core/core-types@0.30.1
  - @laioutr-app/shopify@0.18.23
  - @laioutr-core/frontend-core@0.30.1
  - @laioutr-core/canonical-types@0.22.23
  - @laioutr-core/kit@0.30.1

## 1.0.25

### Patch Changes

- Updated dependencies [a1f6b28]
  - @laioutr-core/core-types@0.30.0
  - @laioutr-core/canonical-types@0.22.22
  - @laioutr-core/frontend-core@0.30.0
  - @laioutr-core/kit@0.30.0
  - @laioutr-app/shopify@0.18.22

## 1.0.24

### Patch Changes

- Updated dependencies [76b6dab]
- Updated dependencies [75c1157]
- Updated dependencies [0e55b6d]
- Updated dependencies [74d7205]
  - @laioutr-core/frontend-core@0.29.0
  - @laioutr-core/core-types@0.29.0
  - @laioutr-app/shopify@0.18.21
  - @laioutr-core/canonical-types@0.22.21
  - @laioutr-core/kit@0.29.0

## 1.0.23

### Patch Changes

- Updated dependencies [29789e9]
  - @laioutr-core/core-types@0.28.15
  - @laioutr-core/canonical-types@0.22.20
  - @laioutr-core/frontend-core@0.28.15
  - @laioutr-core/kit@0.28.15
  - @laioutr-app/shopify@0.18.20

## 1.0.22

### Patch Changes

- Updated dependencies [a568e16]
- Updated dependencies [0efa2c3]
- Updated dependencies [6e7f199]
  - @laioutr-core/core-types@0.28.14
  - @laioutr-core/frontend-core@0.28.14
  - @laioutr-core/canonical-types@0.22.19
  - @laioutr-core/kit@0.28.14
  - @laioutr-app/shopify@0.18.19

## 1.0.21

### Patch Changes

- Updated dependencies [5913b0a]
  - @laioutr-core/frontend-core@0.28.13
  - @laioutr-app/shopify@0.18.18
  - @laioutr-core/kit@0.28.13
  - @laioutr-core/core-types@0.28.13
  - @laioutr-core/canonical-types@0.22.18

## 1.0.20

### Patch Changes

- Updated dependencies [f85aef5]
  - @laioutr-core/frontend-core@0.28.12
  - @laioutr-app/shopify@0.18.17
  - @laioutr-core/kit@0.28.12
  - @laioutr-core/core-types@0.28.12
  - @laioutr-core/canonical-types@0.22.17

## 1.0.19

### Patch Changes

- @laioutr-core/frontend-core@0.28.11
- @laioutr-app/shopify@0.18.16
- @laioutr-core/kit@0.28.11
- @laioutr-core/core-types@0.28.11
- @laioutr-core/canonical-types@0.22.16

## 1.0.18

### Patch Changes

- Updated dependencies [ba4abcf]
  - @laioutr-core/frontend-core@0.28.10
  - @laioutr-app/shopify@0.18.15
  - @laioutr-core/kit@0.28.10
  - @laioutr-core/core-types@0.28.10
  - @laioutr-core/canonical-types@0.22.15

## 1.0.17

### Patch Changes

- Updated dependencies [9a519a4]
- Updated dependencies [63fc621]
- Updated dependencies [c9eeae7]
  - @laioutr-core/frontend-core@0.28.9
  - @laioutr-core/kit@0.28.9
  - @laioutr-core/core-types@0.28.9
  - @laioutr-app/shopify@0.18.14
  - @laioutr-core/canonical-types@0.22.14

## 1.0.16

### Patch Changes

- Updated dependencies [ebb8a6b]
  - @laioutr-core/frontend-core@0.28.8
  - @laioutr-app/shopify@0.18.13
  - @laioutr-core/kit@0.28.8
  - @laioutr-core/core-types@0.28.8
  - @laioutr-core/canonical-types@0.22.13

## 1.0.15

### Patch Changes

- Updated dependencies [a2afddf]
  - @laioutr-core/core-types@0.28.7
  - @laioutr-core/canonical-types@0.22.12
  - @laioutr-core/frontend-core@0.28.7
  - @laioutr-core/kit@0.28.7
  - @laioutr-app/shopify@0.18.12

## 1.0.14

### Patch Changes

- Updated dependencies [c669612]
  - @laioutr-core/frontend-core@0.28.6
  - @laioutr-app/shopify@0.18.11
  - @laioutr-core/kit@0.28.6
  - @laioutr-core/core-types@0.28.6
  - @laioutr-core/canonical-types@0.22.11

## 1.0.13

### Patch Changes

- Updated dependencies [27744dc]
  - @laioutr-core/frontend-core@0.28.5
  - @laioutr-app/shopify@0.18.10
  - @laioutr-core/kit@0.28.5
  - @laioutr-core/core-types@0.28.5
  - @laioutr-core/canonical-types@0.22.10

## 1.0.12

### Patch Changes

- Updated dependencies [65ebb2a]
  - @laioutr-core/frontend-core@0.28.4
  - @laioutr-app/shopify@0.18.9
  - @laioutr-core/kit@0.28.4
  - @laioutr-core/core-types@0.28.4
  - @laioutr-core/canonical-types@0.22.9

## 1.0.11

### Patch Changes

- Updated dependencies [6166bee]
  - @laioutr-core/frontend-core@0.28.3
  - @laioutr-app/shopify@0.18.8
  - @laioutr-core/kit@0.28.3
  - @laioutr-core/core-types@0.28.3
  - @laioutr-core/canonical-types@0.22.8

## 1.0.10

### Patch Changes

- Updated dependencies [76cb39d]
  - @laioutr-core/core-types@0.28.2
  - @laioutr-core/canonical-types@0.22.7
  - @laioutr-core/frontend-core@0.28.2
  - @laioutr-core/kit@0.28.2
  - @laioutr-app/shopify@0.18.7

## 1.0.9

### Patch Changes

- Updated dependencies [6b80e5f]
  - @laioutr-core/frontend-core@0.28.1
  - @laioutr-app/shopify@0.18.6
  - @laioutr-core/kit@0.28.1
  - @laioutr-core/core-types@0.28.1
  - @laioutr-core/canonical-types@0.22.6

## 1.0.8

### Patch Changes

- Updated dependencies [ed35457]
- Updated dependencies [15d9c2e]
- Updated dependencies [c0ffa0a]
- Updated dependencies [a8d22eb]
- Updated dependencies [da3e855]
- Updated dependencies [15d9c2e]
- Updated dependencies [dbbc4c1]
  - @laioutr-core/frontend-core@0.28.0
  - @laioutr-core/core-types@0.28.0
  - @laioutr-app/shopify@0.18.5
  - @laioutr-core/canonical-types@0.22.5
  - @laioutr-core/kit@0.28.0

## 1.0.7

### Patch Changes

- Updated dependencies [0e5e45d]
  - @laioutr-core/frontend-core@0.27.2
  - @laioutr-app/shopify@0.18.4
  - @laioutr-core/kit@0.27.2
  - @laioutr-core/core-types@0.27.2
  - @laioutr-core/canonical-types@0.22.4

## 1.0.6

### Patch Changes

- Updated dependencies [5299273]
  - @laioutr-core/frontend-core@0.27.1
  - @laioutr-app/shopify@0.18.3
  - @laioutr-core/kit@0.27.1
  - @laioutr-core/core-types@0.27.1
  - @laioutr-core/canonical-types@0.22.3

## 1.0.5

### Patch Changes

- Updated dependencies
  - @laioutr-core/core-types@0.27.0
  - @laioutr-core/frontend-core@0.27.0
  - @laioutr-core/canonical-types@0.22.2
  - @laioutr-core/kit@0.27.0
  - @laioutr-app/shopify@0.18.2

## 1.0.4

### Patch Changes

- Updated dependencies [795d87b]
  - @laioutr-core/frontend-core@0.26.1
  - @laioutr-app/shopify@0.18.1
  - @laioutr-core/kit@0.26.1
  - @laioutr-core/core-types@0.26.1
  - @laioutr-core/canonical-types@0.22.1

## 1.0.3

### Patch Changes

- Updated dependencies [5724722]
- Updated dependencies [5724722]
- Updated dependencies [5724722]
- Updated dependencies [572f4da]
- Updated dependencies [5724722]
- Updated dependencies [5724722]
- Updated dependencies [5724722]
  - @laioutr-core/core-types@0.26.0
  - @laioutr-core/canonical-types@0.22.0
  - @laioutr-core/frontend-core@0.26.0
  - @laioutr-app/shopify@0.18.0
  - @laioutr-core/kit@0.26.0

## 1.0.2

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @laioutr-core/core-types@0.25.0
  - @laioutr-core/canonical-types@0.21.0
  - @laioutr-core/frontend-core@0.25.0
  - @laioutr-core/kit@0.25.0
  - @laioutr-app/shopify@0.17.6

## 1.0.1

### Patch Changes

- Updated dependencies [4b5cbab]
  - @laioutr-core/canonical-types@0.20.0
  - @laioutr-core/core-types@0.24.0
  - @laioutr-app/shopify@0.17.5
  - @laioutr-core/frontend-core@0.24.0
  - @laioutr-core/kit@0.24.0
