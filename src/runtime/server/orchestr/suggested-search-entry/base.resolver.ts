import { SuggestedSearchEntryBase } from '@laioutr-core/canonical-types/entity/suggested-search-entry';
import { suggestionResultsFragmentToken } from '../../const/passthroughTokens';
import { defineBatteryIncludedComponentResolver } from '../../middleware/defineIncludedBattery';

export default defineBatteryIncludedComponentResolver({
  label: 'Battery Included Suggested Search Entry Resolver',
  entityType: 'SuggestedSearchEntry',
  provides: [SuggestedSearchEntryBase],
  order: 2,
  resolve: ({ passthrough, $entity }) => {
    const results = passthrough.require(suggestionResultsFragmentToken);

    const entities = results.suggestions.map(({ id, type, title, link }) =>
      $entity({
        id,

        base: () => ({
          type,
          title,
          link,
        }),
      })
    );

    return { entities };
  },
});
