import { browseExtensionsToken } from '../../const/passthroughTokens';
import { BatteryIncludedProductsByPresetQuery } from '../../lib/tokens/by-preset.query';
import { defineBatteryIncludedQuery } from '../../middleware/defineIncludedBattery';
import { browseProducts } from '../../orchestr-helper/browse';

/** The products of a BI preset (`browse?preset=<id>`), with BI's facets and sortings. */
export default defineBatteryIncludedQuery({
  implements: BatteryIncludedProductsByPresetQuery,
  cache: { ttl: '5m' },
  run: async ({ context, input, pagination, filter, sorting, passthrough }) => {
    const { result, response } = await browseProducts({ context, preset: input.presetId, pagination, filter, sorting });

    passthrough.set(browseExtensionsToken, response.extensions ?? []);

    return result;
  },
});
