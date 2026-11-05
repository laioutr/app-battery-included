import { recommendationsToken } from '../../const/passthroughTokens';
import { RecommendationBase } from '../../lib/entity/recommendation';
import { defineBatteryIncludedComponentResolver } from '../../middleware/defineIncludedBattery';

export default defineBatteryIncludedComponentResolver({
  entityType: 'ProductRecommendation',
  label: 'Battery-Included Product Recommendation Resolver',
  provides: [RecommendationBase],
  resolve: async ({ passthrough, entityIds, $entity }) => {
    // The relation is only known from the recommendations link. The link answers `base` inline, so
    // this runs only for an entity requested on its own, e.g. after a cache restore without the
    // passthrough: answer what is known and leave the rest out instead of failing the request.
    const recommendations = passthrough.get(recommendationsToken) ?? [];
    const relationById = new Map(recommendations.map((res) => [res.document.id, res.type]));

    const entities = entityIds.flatMap((id) => {
      const relation = relationById.get(id);
      return relation ? [$entity({ id, base: () => ({ relation }) })] : [];
    });

    return { entities };
  },
});
