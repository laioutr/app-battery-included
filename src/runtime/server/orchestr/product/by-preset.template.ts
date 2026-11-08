import { BatteryIncludedProductsByPresetQuery } from '../../lib/tokens/by-preset.query';
import { defineBatteryIncludedQueryTemplateProvider } from '../../middleware/defineIncludedBattery';
import { presetTemplatesOf } from '../../orchestr-helper/templates';

/** A Studio preset for a BI preset listing: the id the editor typed. */
export default defineBatteryIncludedQueryTemplateProvider({
  for: BatteryIncludedProductsByPresetQuery,
  run: ({ input }) => presetTemplatesOf(input.term),
});
