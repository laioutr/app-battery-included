import { z } from 'zod/v4';
import { defineQueryToken } from '@laioutr-core/core-types/orchestr';

/**
 * Products by the ids BI indexes them under (`_product.id`), in the order given. BI indexes the
 * variants a listing shows, so this answers with those ids, which is what BI's links, such as the
 * recommended products, are keyed by.
 */
export const BatteryIncludedProductsByIdsQuery = defineQueryToken('battery-included/product/by-ids', {
  type: 'multi',
  entity: 'Product',
  label: 'Products by id (Battery Included)',
  input: z.object({ ids: z.array(z.string()).min(1).max(100) }),
  defaultLimit: 48,
});
