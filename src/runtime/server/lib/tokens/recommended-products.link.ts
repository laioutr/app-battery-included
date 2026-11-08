import { defineLinkToken } from '@laioutr-core/core-types/orchestr';

/** The products BI recommends for a product, as `Product` entities the commerce app resolves, in BI's order. */
export const BatteryIncludedRecommendedProducts = defineLinkToken('battery-included/product/recommended-products', {
  label: 'Recommended products (Battery Included)',
  source: 'Product',
  target: 'Product',
  type: 'multi',
  defaultLimit: 20,
});
