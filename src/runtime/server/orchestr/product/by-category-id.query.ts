import { ProductsByCategoryIdQuery } from '@laioutr-core/canonical-types/ecommerce';
import { browseExtensionsToken } from '../../const/passthroughTokens';
import { defineBatteryIncludedQuery } from '../../middleware/defineIncludedBattery';
import { browseProducts } from '../../orchestr-helper/browse';

/**
 * A category listing from BI: the products whose category tree contains the category (by default
 * `_product_i18n.categoryTree.id`, the Shopware category id in BI's Shopware export), with BI's
 * facets, sortings and merchandising.
 */
export default defineBatteryIncludedQuery({
  implements: ProductsByCategoryIdQuery,
  // app-shopware implements the same token without an order; above it, BI wins regardless of install order.
  order: 2,
  cache: { ttl: '5m' },
  run: async ({ context, input, pagination, filter, sorting, passthrough }) => {
    const { result, response } = await browseProducts({
      context,
      scope: { [`f[${context.fields.categoryId}][]`]: [input.categoryId] },
      pagination,
      filter,
      sorting,
    });

    passthrough.set(browseExtensionsToken, response.extensions ?? []);

    return result;
  },
});
