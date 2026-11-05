import { z } from 'zod/v4';
import { defineEntityComponentToken } from '@laioutr-core/core-types/orchestr';

/** A search term BI sends to a fixed URL instead of a result list. */
export const RedirectBase = defineEntityComponentToken('base', {
  entityType: 'BatteryIncludedRedirect',
  schema: z.object({
    /** As BI sends it: absolute, or a path on the shop's host. */
    url: z.string(),
  }),
});
