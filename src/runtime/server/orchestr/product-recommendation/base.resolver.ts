import { recommendationsToken } from '../../const/passthroughTokens';
import { RecommendationBase } from '../../lib/entity/recommendation';
import { defineBatteryIncludedComponentResolver } from '../../middleware/defineIncludedBattery';

export default defineBatteryIncludedComponentResolver({
  entityType: 'ProductRecommendation',
  label: 'Battery-Included Product Recommendation Resolver',
  provides: [RecommendationBase],
  resolve: async ({ passthrough, $entity }) => {
    if (!passthrough.has(recommendationsToken)) throw new Error('Recommendations responses must be saved to passthrough store.');

    const recommendations = passthrough.get(recommendationsToken) ?? [];

    const entities = recommendations.map((res) =>
      $entity({
        id: res.document.id,

        base: () => ({
          relation: res.type,
        }),
      })
    );

    return { entities };
  },
});
