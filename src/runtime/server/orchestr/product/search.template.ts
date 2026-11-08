import { ProductSearchQuery } from '@laioutr-core/canonical-types/ecommerce';
import { defineBatteryIncludedQueryTemplateProvider } from '../../middleware/defineIncludedBattery';
import { searchTemplatesOf } from '../../orchestr-helper/templates';

/** A Studio preset for a product search: the term the editor typed. */
export default defineBatteryIncludedQueryTemplateProvider({
  for: ProductSearchQuery,
  run: ({ input }) => searchTemplatesOf(input.term),
});
