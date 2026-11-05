import { z } from 'zod/v4';
import { defineQueryToken } from '@laioutr-core/core-types/orchestr';

/**
 * BI's merchandising teasers for a listing or a search: give the same input, filter, sorting and
 * pagination as the product query they belong to, since BI places them per page.
 */
export const BatteryIncludedListingTeasersQuery = defineQueryToken('battery-included/listing/teasers', {
  type: 'multi',
  entity: 'BatteryIncludedTeaser',
  label: 'Listing teasers (Battery Included)',
  input: z.object({
    categoryId: z.string().optional(),
    streamId: z.string().optional(),
    query: z.string().optional(),
  }),
  defaultLimit: 48,
});
