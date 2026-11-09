import { browseExtensionsToken } from '../../const/passthroughTokens';
import { BatteryIncludedProductsByIdsQuery } from '../../lib/tokens/by-ids.query';
import { defineBatteryIncludedQuery } from '../../middleware/defineIncludedBattery';
import { browseProducts } from '../../orchestr-helper/browse';
import { inRequestedOrder } from '../../orchestr-helper/browse/order';

/** The products BI indexes under the given ids, in the order they were asked for; an id BI does not know is left out. */
export default defineBatteryIncludedQuery({
  implements: BatteryIncludedProductsByIdsQuery,
  cache: { ttl: '5m' },
  run: async ({ context, input, pagination, filter, sorting, passthrough }) => {
    const { result, response } = await browseProducts({
      context,
      scope: { 'f[_product.id][]': input.ids },
      pagination,
      filter,
      sorting,
    });

    passthrough.set(browseExtensionsToken, response.extensions ?? []);

    // A visitor's sorting wins; without one, the editor's order is the order of the ids.
    return sorting ? result : { ...result, ids: inRequestedOrder(result.ids, input.ids) };
  },
});
