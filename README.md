# @laioutr/app-battery-included

> BatteryIncluded integration for laioutr

Search, category listings, suggest and recommendations from [Battery Included](https://batteryincluded.ai). BI answers with product ids; the commerce app of the project (e.g. `@laioutr/app-shopware`) resolves them to products.

## Usage

In your nuxt.config.ts:

```ts
defineNuxtConfig({
  /* [...] */
  modules: ['@laioutr/app-battery-included'],
  '@laioutr/app-battery-included': {
    collection: 'my-collection',
    apiKey: process.env.BATTERY_INCLUDED_API_KEY,
  },
  /* [...] */
});
```

### Options

| Option         | Default                                                                           | Meaning                                                                                      |
| -------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `baseURL`      | `https://api.batteryincluded.io`                                                  | BI API host                                                                                  |
| `collection`   | –                                                                                 | BI collection                                                                                |
| `apiKey`       | –                                                                                 | Sent as `X-BI-API-KEY`                                                                       |
| `sortings`     | relevance, price both ways, top sellers, newest (see below)                       | The sortings listings offer, in this order. Replaces the defaults.                           |
| `swatchFacets` | `[]`                                                                              | BI field names whose filter values are shown as swatches                                     |
| `fields`       | `{ categoryId: '_product_i18n.categoryTree.id', streamId: '_product.streamIds' }` | BI fields the category and stream listings filter by. The defaults fit BI's Shopware export. |

## Queries

| Token                                                    | Input            | BI request                                        | `order` |
| -------------------------------------------------------- | ---------------- | ------------------------------------------------- | ------- |
| `ProductSearchQuery` (canonical)                         | `{ query }`      | `browse?q=<query>`                                | 2       |
| `ProductsByCategoryIdQuery` (canonical)                  | `{ categoryId }` | `browse?f[_product_i18n.categoryTree.id][]=<id>`  | 2       |
| `battery-included/product/by-stream-id` (this app's own) | `{ streamId }`   | `browse?f[_product.streamIds][]=<id>`             | –       |
| `battery-included/product/by-preset` (this app's own)    | `{ presetId }`   | `browse?preset=<id>`                              | –       |
| `SuggestedSearchSearchQuery` (canonical)                 | `{ query? }`     | `suggest?q=<query>`, `highlights` without a query | 2       |

All of them answer with BI's facets as filters and the configured sortings, and are cached for 5 minutes (first page, unfiltered). The preset query asks for 20 products by default, the others for 48.

`app-shopware` implements `ProductSearchQuery` and `ProductsByCategoryIdQuery` too, without an `order`. Orchestr serves a token from the handler with the highest `order`, so with both apps installed, search and category listings come from BI regardless of the install order. A single query can still be pinned to another app in Studio (the query's provider override).

The stream and preset tokens are exported as `BatteryIncludedProductsByStreamIdQuery` and `BatteryIncludedProductsByPresetQuery` from `@laioutr/app-battery-included/runtime`; canonical types have no stream or preset query.

### Presets

A preset is a product selection set up in BI under an id (e.g. `3f2a9c1e-7b4d-4e8a-9c2f-1a2b3c4d5e6f` or `cart-campaign`), such as new arrivals or best sellers for a slider. The preset query sends the id as `preset` and adds the visitor's filters and sorting like any listing; without a sorting it sends no `sort`, so the order is the one BI answers the preset with. Like the other listings, it puts BI's `extensions` into `browseExtensionsToken`.

### Binding a listing page

BI filters by category **id**; it does not know category slugs. How a page gets the id depends on the page:

- **A page or section for one category** (e.g. a landing page with a product grid): add a `ProductsByCategoryIdQuery` (or the stream query) in Studio and set `categoryId` to the Shopware category id. This fits setups where the section picks the category or stream.
- **The dynamic product listing page** (`ProductListingPage`, route `/categories/:slug+`): its products query is `ProductsByCategorySlugQuery` with the slug from the route. Studio input rules are evaluated against `route` and `clientEnv` only, so they cannot pass the id that the page's `CategoryBySlugQuery` resolves on to `ProductsByCategoryIdQuery`. Either carry the id in the URL (a page path with an id param, bound as `categoryId: { var: 'route.params.id' }`; not tried with `ProductListingPage`'s own path constraints), or keep `ProductsByCategorySlugQuery` and register a project handler for it with an `order` above 2 that resolves the slug to the id (e.g. through the commerce app's category lookup) and runs the same BI browse. This app does not implement `ProductsByCategorySlugQuery`.

## Studio presets

When an editor configures a query in Studio, the picker offers presets from the app that serves the token. With this app serving search and category listings (`order: 2`), they come from Battery Included, shown with its name and logo:

| Token                                | Presets for the typed term                                                                                                                                                                                                                                                                                  |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ProductsByCategoryIdQuery`          | The categories of BI's category-tree facet (the `fields.categoryId` facet, else another `_product_i18n.categoryTree.*` facet whose values carry an id) whose name contains the term in any case, or whose id is the term; at most 50, labelled by name, with the id added when two categories share a name. |
| `ProductSearchQuery`                 | One preset searching for the term. None while the field is empty.                                                                                                                                                                                                                                           |
| `battery-included/product/by-preset` | One preset with the typed term as the preset id, labelled `Preset: <id>`. None while the field is empty.                                                                                                                                                                                                    |

The categories come from one browse of the collection, so a category appears only when BI returns it in that facet: the collection's facet config must include the category tree, and a category without products is not listed. When BI fails or has no such facet, the picker shows no presets and the server logs a warning naming the token; the query itself is unaffected. The stream query has no presets, because BI's index carries stream ids without names. The preset query cannot list BI's presets by name: BI's published API has no endpoint for them (its OpenAPI document covers the portal API, which has none either and takes a portal login rather than the collection's API key). The editor copies the preset id from BI and types it in.

## Sorting

| Key          | BI `sort`                  |
| ------------ | -------------------------- |
| `relevance`  | – (BI's relevance order)   |
| `price-asc`  | `_product.price:asc`       |
| `price-desc` | `_product.price:desc`      |
| `topseller`  | `_history.salesCount:desc` |
| `newest`     | `_common.releaseDate:desc` |

Configure others with `sortings: [{ key, label, field?, order? }]`; a sorting without `field` is relevance. The keys `price:asc` / `price:desc` of earlier releases still work, a raw BI expression (`_product.stock:desc`) is passed through, and an unknown key falls back to relevance.

## Filters

The filter id is BI's `field_name`. Lists are sent as `f[<field>][]`, ranges as `f[<field>][from]` / `f[<field>][till]` (an open end is left out). Price, manufacturer and category facets carry the well-known names `price`, `brand` and `category`. A facet is presented as swatches when it is listed in `swatchFacets` or BI attaches a colour or image to its values; values without one show their label, so the storefront can map names to colours. Orchestr filters have no tree: a category hierarchy is flattened in the order BI returns it, labelled by the category name BI attaches.

## Suggest

`SuggestedSearchSearchQuery` maps BI's suggest kinds to `SuggestedSearchEntry` entities (`base`: `type`, `title`, `link`, `cover`):

| BI kind                                                               | Entry `type`       | Link                                                      |
| --------------------------------------------------------------------- | ------------------ | --------------------------------------------------------- |
| `query-completion`                                                    | `query-suggestion` | search page with the term                                 |
| `document` with `_product`                                            | `product`          | reference to the `Product` (cover from the index's image) |
| `document` with `_content_i18n` (content pages)                       | `page`             | the page's URL                                            |
| `facet._product_i18n.categoryTree.name`                               | `category`         | reference to the `Category` by the id BI attaches         |
| `facet._product_i18n.categories`, `facet._product.categories` (no id) | `category`         | search page with the name                                 |
| `promotions`                                                          | `promotion`        | the promotion's URL, cover from its desktop/mobile images |

`SuggestedSearchProductsLink` returns the suggested products as `Product` ids, so the commerce app resolves image, price and URL for a product row. Without a query, the query answers BI's highlights (top searches). A reference needs a slug: it is the canonical SEO path where the index carries one (`_product.mappedFields.seoUrls`), otherwise `<name>-<id>`, app-shopware's fallback slug format. Content pages and promotions are kept because `page` and `url` links can represent them; a storefront that does not want them filters by `type`.

## Recommendations

| Token                                                                                  | Source → target                      | Answers                                                                                                 |
| -------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `battery-included/product/recommended-products` (`BatteryIncludedRecommendedProducts`) | `Product` → `Product`, 20 by default | The recommended products as `Product` ids, so the commerce app resolves name, price, image and URL      |
| `battery-included/product/recommendations` (deprecated)                                | `Product` → `ProductRecommendation`  | `ProductRecommendation` entities whose `base` holds only the `relation` (`also`, `together`, `related`) |

`BatteryIncludedRecommendedProducts` is exported from `@laioutr/app-battery-included/runtime`. It lists the products of all three relations in BI's order, each product once at its first place and without the source product, and pages through them with the link's offset and limit. BI recommends by its own document id, so the app looks up the BI ids of all source products in one browse, then asks BI once per product. A product BI does not index has no recommendations; a product whose BI call fails gets none and logs a warning, without affecting the others, and that empty answer is not cached. Answers are cached for 5 minutes per product (first page).

The link has no input, so it cannot be narrowed to one relation. The deprecated `battery-included/product/recommendations` link stays as it was for existing projects.

## Merchandising teasers and search redirects

BI attaches `extensions` to a browse answer. Canonical types have no slot for them on a product query, so the app answers them through its own query tokens (exported from `@laioutr/app-battery-included/runtime`):

| Token                                                                     | Input                                | Answers                                                                                                                        |
| ------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `battery-included/listing/teasers` (`BatteryIncludedListingTeasersQuery`) | `{ categoryId?, streamId?, query? }` | `BatteryIncludedTeaser` entities, `base`: `name`, `position`, `format`, `rows`, `columns`, `link`, `image`, `code`, `itemType` |
| `battery-included/search/redirect` (`BatteryIncludedSearchRedirectQuery`) | `{ query }`                          | one `BatteryIncludedRedirect` entity, `base`: `url`; "not found" for a term without a redirect                                 |

- **Teasers**: bind the teaser query next to the listing's product query with the same input, filter, sorting and pagination, since BI places teasers per page. `position` is the 1-based index of the product on the current page the teaser is shown before; `format` is BI's `<rows>x<columns>`, also given as `rows` and `columns`; `image` has the desktop and mobile sources BI sends. Loaded together with the product query, both share one BI call (identical requests in flight share one fetch).
- **Redirects**: on the search page, load the redirect query with the search term and navigate to `url` when it answers. It runs the search's first-page browse (48 per page), so it shares BI's answer with a default search.
- **Other kinds**: the product queries put BI's raw `extensions` into the passthrough token `browseExtensionsToken` for project handlers in the same request. It is only set when the query ran, not when it was served from the cache.

## Errors

A non-2xx answer from BI throws `BatteryIncludedApiError` with `status`, `endpoint` and a short `body`; `isBatteryIncludedApiError` is exported from `@laioutr/app-battery-included/runtime`. Recommendations degrade instead: a product whose BI call fails gets none.
