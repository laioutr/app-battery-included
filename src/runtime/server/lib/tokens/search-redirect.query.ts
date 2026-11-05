import { z } from 'zod/v4';
import { defineQueryToken } from '@laioutr-core/core-types/orchestr';

/** The URL BI sends a search term to, if any. Answers "not found" for a term without a redirect. */
export const BatteryIncludedSearchRedirectQuery = defineQueryToken('battery-included/search/redirect', {
  type: 'single',
  entity: 'BatteryIncludedRedirect',
  label: 'Search redirect (Battery Included)',
  input: z.object({ query: z.string() }),
});
