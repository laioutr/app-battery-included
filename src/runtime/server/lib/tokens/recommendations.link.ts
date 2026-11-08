import { defineLinkToken } from '@laioutr-core/core-types/orchestr';

/**
 * @deprecated Its `ProductRecommendation` targets carry only the relation, not the product. Use
 * `BatteryIncludedRecommendedProducts`, which links to the recommended `Product` entities.
 */
export const BatteryIncludedProductRecommendations = defineLinkToken('battery-included/product/recommendations', {
  label: 'Battery-Included Product Recommendations',
  source: 'Product',
  target: 'ProductRecommendation',
  type: 'multi',
});
