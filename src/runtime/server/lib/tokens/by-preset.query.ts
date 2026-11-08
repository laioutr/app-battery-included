import { z } from 'zod/v4';
import { defineQueryToken } from '@laioutr-core/core-types/orchestr';

/**
 * Products of a BI preset, a product selection set up in BI (e.g. new arrivals, best sellers). The app's
 * own token, since canonical types have no preset query; same shape as the other listings.
 */
export const BatteryIncludedProductsByPresetQuery = defineQueryToken('battery-included/product/by-preset', {
  type: 'multi',
  entity: 'Product',
  label: 'Products by preset (Battery Included)',
  input: z.object({ presetId: z.string() }),
  defaultLimit: 20,
});
