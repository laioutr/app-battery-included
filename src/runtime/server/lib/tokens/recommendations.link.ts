import { defineLinkToken } from '@laioutr-core/core-types/orchestr';

export const BatteryIncludedProductRecommendations = defineLinkToken('battery-included/product/recommendations', {
  label: 'Battery-Included Product Recommendations',
  source: 'Product',
  target: 'ProductRecommendation',
  type: 'multi',
});
