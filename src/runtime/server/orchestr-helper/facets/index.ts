import { AvailableFilter, isRangeFilter, QueryWireRequestFilter } from '#orchestr/types';
import { SearchParams } from '../../client/sdk/types';
import { Facet } from '../../client/types/facets';

export const mapBatteryIncludedFacetsToAvailableFilters = (facets: Array<Facet>): Array<AvailableFilter> => {
  const filters: Array<AvailableFilter> = [];

  for (const facet of facets) {
    if (facet.type === 'select') {
      filters.push({
        type: 'list',
        id: facet.field_name,
        label: facet.field_label,
        presentation: 'text',
        values: facet.counts.map((countItem) => ({ id: countItem.value, label: countItem.value, count: countItem.count })),
      });
    } else if (facet.type === 'range') {
      filters.push({
        type: 'range',
        id: facet.field_name,
        label: facet.field_label,
        min: facet.stats.min,
        max: facet.stats.max,
      });
    }
  }

  return filters;
};

// Returns search params to be sent in request for batteryIncluded browse API
export const mapSelectedFiltersToBatteryIncludedFilters = (filters: QueryWireRequestFilter): SearchParams => {
  const batteryIncludedFilters: SearchParams = {};

  for (const filter in filters) {
    if (isRangeFilter(filters[filter])) {
      batteryIncludedFilters[`f[${filter}][from]`] = filters[filter].min ?? Number.MIN_SAFE_INTEGER;
      batteryIncludedFilters[`f[${filter}][till]`] = filters[filter].max ?? Number.MAX_SAFE_INTEGER;
    } else {
      batteryIncludedFilters[`f[${filter}]`] = filters[filter] as string[];
    }
  }

  return batteryIncludedFilters;
};
