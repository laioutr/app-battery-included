import type { SearchParams } from '../../client/sdk/types';
import { TeaserBase } from '../../lib/entity/teaser';
import { BatteryIncludedListingTeasersQuery } from '../../lib/tokens/listing-teasers.query';
import { defineBatteryIncludedQuery } from '../../middleware/defineIncludedBattery';
import { browseProducts } from '../../orchestr-helper/browse';
import { mapTeasers } from '../../orchestr-helper/extensions';

/**
 * The teasers BI attaches to a listing or search page. It runs the same browse as the product query
 * with the same input, filter, sorting and pagination, so a page that loads both at once costs one
 * BI call (identical requests in flight share one fetch), and a cached one costs none.
 */
export default defineBatteryIncludedQuery({
  implements: BatteryIncludedListingTeasersQuery,
  provides: [TeaserBase],
  cache: { ttl: '5m' },
  run: async ({ context, input, pagination, filter, sorting, $entity }) => {
    const scope: SearchParams = {
      ...(input.categoryId ? { [`f[${context.fields.categoryId}][]`]: [input.categoryId] } : {}),
      ...(input.streamId ? { [`f[${context.fields.streamId}][]`]: [input.streamId] } : {}),
    };

    const { response } = await browseProducts({ context, query: input.query, scope, pagination, filter, sorting });

    const entities = mapTeasers(response.extensions).map(({ id, ...teaser }) => $entity({ id, base: () => teaser }));

    return { entities, total: entities.length };
  },
});
