import { SuggestedSearchSearchQuery } from '@laioutr-core/canonical-types/suggested-search';
import { suggestionResultsFragmentToken } from '../../const/passthroughTokens';
import { defineBatteryIncludedQuery } from '../../middleware/defineIncludedBattery';
import { mapHighlights, mapSuggestResponse } from '../../orchestr-helper/suggest';

export default defineBatteryIncludedQuery({
  implements: SuggestedSearchSearchQuery,
  order: 2,
  // The entries link and resolver `require` the passthrough, so a cache hit must restore it.
  cache: { ttl: '5m', includePassthrough: true },
  run: async ({ context, input, passthrough }) => {
    const { batteryIncludedClient } = context;

    const { query } = input;

    const id = `search-suggest:${query ?? ''}`;

    if (!query) {
      const highlights = await batteryIncludedClient.highlights();

      passthrough.set(suggestionResultsFragmentToken, { id, suggestions: mapHighlights(highlights), productIds: [] });

      return { id };
    }

    const { entries, productIds } = mapSuggestResponse(await batteryIncludedClient.suggest({ query }));

    passthrough.set(suggestionResultsFragmentToken, { id, suggestions: entries, productIds });

    return { id };
  },
});
