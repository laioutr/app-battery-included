---
'@laioutr/app-battery-included': patch
---

Search, listings and recommendations work against a live BI collection.

- **Results:** BI is asked with the full language tag (`de-DE`); the bare language (`de`) matched no documents.
- **Products:** hits and recommendations are handed to the commerce app by its own product id (`_product.id`), not BI's product number, so the products resolve.
- **Recommendations:** a product's BI id is looked up first, in one request for all products on the page.
- **Price ranges:** a range with one open end filters again; BI applies a range only when both ends are sent.
- **Links:** teaser, promotion, content-page and redirect URLs from BI are kept only when they are a path on the storefront or an http(s) URL. An extension without data is skipped instead of failing the answer.
