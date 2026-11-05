import { SuggestedSearchEntriesLink } from '@laioutr-core/canonical-types/suggested-search';
import { suggestionResultsFragmentToken } from '../../const/passthroughTokens';
import { defineBatteryIncludedLink } from '../../middleware/defineIncludedBattery';

export default defineBatteryIncludedLink({
  implements: SuggestedSearchEntriesLink,
  order: 2,
  run: async ({ passthrough, entityIds }) => {
    const results = passthrough.require(suggestionResultsFragmentToken);

    return {
      links: [
        {
          sourceId: entityIds.at(0) ?? results.id,
          targetIds: results.suggestions.map((res) => res.id),
        },
      ],
    };
  },
});
