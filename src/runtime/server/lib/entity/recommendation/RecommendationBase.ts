import { z } from 'zod/v4';
import { defineEntityComponentToken } from '@laioutr-core/core-types/orchestr';

export const RecommendationBase = defineEntityComponentToken('base', {
  entityType: 'ProductRecommendation',
  schema: z.object({
    relation: z.enum(['also', 'together', 'related']), // -> "Also buy" | "Frequently bought together" | "Related product"
  }),
});
