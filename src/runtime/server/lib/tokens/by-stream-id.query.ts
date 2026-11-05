import { z } from 'zod/v4';
import { defineQueryToken } from '@laioutr-core/core-types/orchestr';

/**
 * Products of a product stream. Canonical types have no stream query, so this is the app's own token;
 * it has the same shape as `ProductsByCategoryIdQuery` (Product ids, facets, sortings, pagination).
 */
export const BatteryIncludedProductsByStreamIdQuery = defineQueryToken('battery-included/product/by-stream-id', {
  type: 'multi',
  entity: 'Product',
  label: 'Products by product stream (Battery Included)',
  input: z.object({ streamId: z.string() }),
  defaultLimit: 48,
});
