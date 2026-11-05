import { ProductSearchQuery } from '@laioutr-core/canonical-types/ecommerce';
import { defineBatteryIncludedQuery } from '../../middleware/defineIncludedBattery';
import { mapBatteryIncludedFacetsToAvailableFilters, mapSelectedFiltersToBatteryIncludedFilters } from '../../orchestr-helper/facets';
import { resolveSorting, toAvailableSortings } from '../../orchestr-helper/sorting';

export default defineBatteryIncludedQuery({
  implements: ProductSearchQuery,
  cache: { ttl: '5m' },
  run: async ({ context, input, pagination, filter, sorting }) => {
    const { query } = input;

    const { batteryIncludedClient, sortings } = context;

    const filters = filter ? mapSelectedFiltersToBatteryIncludedFilters(filter) : {};
    const { sorting: appliedSorting, sort } = resolveSorting(sorting, sortings);

    const data = await batteryIncludedClient.browse({
      query,
      page: pagination.page,
      per_page: pagination.limit,
      filters,
      sort,
    });

    const availableFilters = mapBatteryIncludedFacetsToAvailableFilters(data.facet_counts);

    return {
      ids: data.hits.map((hit) => hit.document.id),
      total: data.found,
      availableFilters,
      availableSortings: toAvailableSortings(sortings),
      sorting: appliedSorting,
    };
  },
});
