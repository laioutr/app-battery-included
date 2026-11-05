import { ProductSearchQuery } from '@laioutr-core/canonical-types/ecommerce';
import { defineBatteryIncludedQuery } from '../../middleware/defineIncludedBattery';
import { browseProducts } from '../../orchestr-helper/browse';

export default defineBatteryIncludedQuery({
  implements: ProductSearchQuery,
  // app-shopware implements the same token without an order; above it, BI wins regardless of install order.
  order: 2,
  cache: { ttl: '5m' },
  run: async ({ context, input, pagination, filter, sorting }) => {
    const { result } = await browseProducts({ context, query: input.query, pagination, filter, sorting });

    return result;
  },
});
