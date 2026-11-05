import { recommendationsToken } from '../../const/passthroughTokens';
import { BatteryIncludedProductRecommendations } from '../../lib/tokens/recommendations.link';
import { defineBatteryIncludedLink } from '../../middleware/defineIncludedBattery';

export default defineBatteryIncludedLink(BatteryIncludedProductRecommendations, async ({ entityIds, context, passthrough }) => {
  const { batteryIncludedClient } = context;

  const responses = await Promise.all(
    entityIds.map(async (id) => {
      const res = await batteryIncludedClient.recommend({ id });
      return [id, res] as const;
    })
  );

  passthrough.set(
    recommendationsToken,
    responses.flatMap((r) => r[1])
  );

  return { links: responses.map(([id, res]) => ({ sourceId: id, targetIds: res.map((r) => r.document.id) })) };
});
