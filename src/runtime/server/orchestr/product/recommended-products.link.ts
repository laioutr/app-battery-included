import { BatteryIncludedRecommendedProducts } from '../../lib/tokens/recommended-products.link';
import { defineBatteryIncludedLink } from '../../middleware/defineIncludedBattery';
import { createRecommendationLookup, recommendedProductIdsOf } from '../../orchestr-helper/recommendations';

const lookup = createRecommendationLookup();

/**
 * The products BI recommends for a product, of every relation, as `Product` ids. The commerce app
 * resolves them, so a slider gets name, price and image from the same source as other product tiles.
 */
export default defineBatteryIncludedLink({
  implements: BatteryIncludedRecommendedProducts,
  // BI answers one source id per request, so each product's answer is cached instead of batched.
  cache: {
    ttl: '5m',
    // The link cache stores one entry per source id; refuse the ones that only hold a fallback.
    validate: lookup.validate,
  },
  run: async ({ entityIds, context, pagination }) => {
    const sourceIds = [...new Set(entityIds)];
    const recommendations = await lookup.recommendationsOf(context.batteryIncludedClient, sourceIds);
    const { offset, limit } = pagination;

    return {
      links: sourceIds.map((sourceId) => {
        const targetIds = recommendedProductIdsOf(sourceId, recommendations.get(sourceId) ?? []);
        return { sourceId, targetIds: targetIds.slice(offset, offset + limit), entityTotal: targetIds.length };
      }),
    };
  },
});
