import { RedirectBase } from '../../lib/entity/redirect';
import { BatteryIncludedSearchRedirectQuery } from '../../lib/tokens/search-redirect.query';
import { defineBatteryIncludedQuery } from '../../middleware/defineIncludedBattery';
import { browseProducts } from '../../orchestr-helper/browse';
import { findRedirect } from '../../orchestr-helper/extensions';

/** Search results page size of `ProductSearchQuery`, so the browse matches the search's own request. */
const SEARCH_PAGE_SIZE = 48;

/**
 * The URL BI sends a search term to. Runs the search's first-page browse, so with the search query on
 * the same page it shares BI's answer.
 */
export default defineBatteryIncludedQuery({
  implements: BatteryIncludedSearchRedirectQuery,
  provides: [RedirectBase],
  cache: { ttl: '5m' },
  run: async ({ context, input, notFound, $entity }) => {
    const { response } = await browseProducts({ context, query: input.query, pagination: { page: 1, limit: SEARCH_PAGE_SIZE } });

    const redirect = findRedirect(response.extensions);
    if (!redirect) return notFound();

    return { entity: $entity({ id: `redirect:${input.query}`, base: () => redirect }) };
  },
});
