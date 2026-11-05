import { ProductSearchQuery } from '@laioutr-core/canonical-types/ecommerce';
import { defineBatteryIncludedQuery } from '../../middleware/defineIncludedBattery';
import { mapBatteryIncludedFacetsToAvailableFilters, mapSelectedFiltersToBatteryIncludedFilters } from '../../orchestr-helper/facets';

export default defineBatteryIncludedQuery(ProductSearchQuery, async ({ context, input, pagination, filter, sorting }) => {
  const { query } = input;

  const { batteryIncludedClient, availableSortings } = context;

  const filters = filter ? mapSelectedFiltersToBatteryIncludedFilters(filter) : {};

  const data = await batteryIncludedClient.browse({
    query,
    page: pagination.page,
    per_page: pagination.limit,
    filters,
    sort: sorting,
  });

  const availableFilters = mapBatteryIncludedFacetsToAvailableFilters(data.facet_counts);

  return {
    ids: data.hits.map((hit) => hit.document.id),
    total: data.found,
    availableFilters,
    availableSortings,
    sorting,
  };
});
