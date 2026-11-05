import { BatteryIncludedProductsByStreamIdQuery } from '../../lib/tokens/by-stream-id.query';
import { defineBatteryIncludedQuery } from '../../middleware/defineIncludedBattery';
import { browseProducts } from '../../orchestr-helper/browse';

/** The products of a Shopware product stream (by default `_product.streamIds`), with BI's facets and sortings. */
export default defineBatteryIncludedQuery({
  implements: BatteryIncludedProductsByStreamIdQuery,
  cache: { ttl: '5m' },
  run: async ({ context, input, pagination, filter, sorting }) => {
    const { result } = await browseProducts({
      context,
      scope: { [`f[${context.fields.streamId}][]`]: [input.streamId] },
      pagination,
      filter,
      sorting,
    });

    return result;
  },
});
