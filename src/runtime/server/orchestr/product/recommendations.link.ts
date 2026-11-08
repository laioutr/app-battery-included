import { recommendationsToken } from '../../const/passthroughTokens';
import { RecommendationBase } from '../../lib/entity/recommendation';
import { productIdOf } from '../../lib/productId';
import { BatteryIncludedProductRecommendations } from '../../lib/tokens/recommendations.link';
import { defineBatteryIncludedLink } from '../../middleware/defineIncludedBattery';
import { createRecommendationLookup } from '../../orchestr-helper/recommendations';

const lookup = createRecommendationLookup();

export default defineBatteryIncludedLink({
  implements: BatteryIncludedProductRecommendations,
  // The relation is answered inline, so a cached link needs no passthrough to restore.
  provides: [RecommendationBase],
  // BI answers one source id per request, so each product's answer is cached instead of batched.
  cache: {
    ttl: '5m',
    // The link cache stores one entry per source id; refuse the ones that only hold a fallback.
    validate: lookup.validate,
  },
  run: async ({ entityIds, context, passthrough, $entity }) => {
    const sourceIds = [...new Set(entityIds)];
    const recommendations = await lookup.recommendationsOf(context.batteryIncludedClient, sourceIds);

    // Kept for the component resolver, e.g. when the recommendation entities are re-requested.
    passthrough.set(recommendationsToken, [...recommendations.values()].flat());

    return {
      links: sourceIds.map((id) => ({
        sourceId: id,
        entities: (recommendations.get(id) ?? []).map((res) =>
          $entity({ id: productIdOf(res.document), base: () => ({ relation: res.type }) })
        ),
      })),
    };
  },
});
