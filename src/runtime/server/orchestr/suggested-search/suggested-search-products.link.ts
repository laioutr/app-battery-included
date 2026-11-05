import { SuggestedSearchProductsLink } from '@laioutr-core/canonical-types/suggested-search';
import { suggestionResultsFragmentToken } from '../../const/passthroughTokens';
import { defineBatteryIncludedLink } from '../../middleware/defineIncludedBattery';

/**
 * The products BI suggests, as `Product` entities. The commerce app resolves them, so a flyout gets
 * image, price and URL from the same source as the product tiles.
 */
export default defineBatteryIncludedLink({
  implements: SuggestedSearchProductsLink,
  order: 2,
  run: async ({ passthrough, entityIds }) => {
    const results = passthrough.get(suggestionResultsFragmentToken);
    const sourceId = entityIds.at(0) ?? results?.id;

    return { links: sourceId ? [{ sourceId, targetIds: results?.productIds ?? [] }] : [] };
  },
});
