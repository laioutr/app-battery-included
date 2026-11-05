import type { RecommendationsResponse } from '../../client/sdk/types';
import { recommendationsToken } from '../../const/passthroughTokens';
import { RecommendationBase } from '../../lib/entity/recommendation';
import { BatteryIncludedProductRecommendations } from '../../lib/tokens/recommendations.link';
import { defineBatteryIncludedLink } from '../../middleware/defineIncludedBattery';

/**
 * Source ids whose last BI call failed. Their empty answer is a fallback, so the cache must not keep
 * it for the whole TTL. The link cache writes right after the handler ran, in the same process.
 */
const failedSourceIds = new Set<string>();

export default defineBatteryIncludedLink({
  implements: BatteryIncludedProductRecommendations,
  // The relation is answered inline, so a cached link needs no passthrough to restore.
  provides: [RecommendationBase],
  // BI answers one source id per request, so each product's answer is cached instead of batched.
  cache: {
    ttl: '5m',
    // The link cache stores one entry per source id; refuse the ones that only hold a fallback.
    validate: (entry) => (entry.value?.links ?? []).every((link) => !failedSourceIds.has(link.sourceId)),
  },
  run: async ({ entityIds, context, passthrough, $entity }) => {
    const { batteryIncludedClient } = context;

    const sourceIds = [...new Set(entityIds)];

    const responses = await Promise.all(
      sourceIds.map(async (id): Promise<readonly [string, RecommendationsResponse]> => {
        try {
          const res = await batteryIncludedClient.recommend({ id });
          failedSourceIds.delete(id);
          return [id, res];
        } catch (error) {
          // One failing product must not take the recommendations of the others down with it.
          console.warn(`[app-battery-included] recommendations for ${id} failed`, error);
          failedSourceIds.add(id);
          return [id, []];
        }
      })
    );

    // Kept for the component resolver, e.g. when the recommendation entities are re-requested.
    passthrough.set(
      recommendationsToken,
      responses.flatMap(([, res]) => res)
    );

    const byId = new Map(responses);

    return {
      links: sourceIds.map((id) => ({
        sourceId: id,
        entities: (byId.get(id) ?? []).map((res) => $entity({ id: res.document.id, base: () => ({ relation: res.type }) })),
      })),
    };
  },
});
