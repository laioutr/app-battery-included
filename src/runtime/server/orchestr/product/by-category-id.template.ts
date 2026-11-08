import { ProductsByCategoryIdQuery } from '@laioutr-core/canonical-types/ecommerce';
import { defineBatteryIncludedQueryTemplateProvider } from '../../middleware/defineIncludedBattery';
import { provideCategoryTemplates } from '../../orchestr-helper/templates';

/** Studio presets for a category listing: the categories of BI's category-tree facet that match the typed term. */
export default defineBatteryIncludedQueryTemplateProvider({
  for: ProductsByCategoryIdQuery,
  run: ({ input, context }) => provideCategoryTemplates({ context, term: input.term }),
});
