---
'@laioutr/app-battery-included': minor
---

Studio offers Battery Included presets when an editor configures a product query. For `ProductsByCategoryIdQuery` the picker lists the categories of BI's category-tree facet that match the typed name (or id), up to 50, and stores the picked category's id; for `ProductSearchQuery` it offers a search for the typed term. Before, with BI serving these tokens, the picker had nothing to offer for them.

Studio now also shows the app as **Battery Included** with its logo wherever it names the app serving a query, served from `/app-battery-included/battery-included-logo.png`.

A category appears only when the collection's facet config includes the category tree. When BI fails or has no such facet, the picker stays empty and the server logs a warning; queries are unaffected.
