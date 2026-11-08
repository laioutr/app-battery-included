import type { QueryHandlerResponseMulti, QueryWireRequestFilter } from '#orchestr/types';
import type BatteryIncludedSDK from '../../client/sdk';
import type { BrowseResponse, SearchParams } from '../../client/sdk/types';
import { productIdOf } from '../../lib/productId';
import {
  type FacetMappingOptions,
  mapBatteryIncludedFacetsToAvailableFilters,
  mapSelectedFiltersToBatteryIncludedFilters,
} from '../facets';
import { type BatteryIncludedSorting, resolveSorting, toAvailableSortings } from '../sorting';

export interface BrowseProductsArgs {
  context: { batteryIncludedClient: BatteryIncludedSDK; sortings: BatteryIncludedSorting[]; facetOptions: FacetMappingOptions };
  /** The search term. Left out for a listing, which BI then answers in its listing order. */
  query?: string;
  /** A BI preset id: the listing is the product selection set up under it in BI. */
  preset?: string;
  /**
   * Filters the listing is scoped to, as BI search params (e.g. the category). They win over a
   * filter the visitor applied to the same field.
   */
  scope?: SearchParams;
  pagination: { page: number; limit: number };
  filter?: QueryWireRequestFilter;
  sorting?: string;
}

/**
 * Runs a BI browse for a product query: the visitor's filters and sorting translated to BI, the
 * facets and sortings mapped back. Shared by search and the listings, so they offer the same facets
 * and sortings. Returns the raw response next to the query result for callers that need more of it.
 */
export const browseProducts = async ({
  context,
  query,
  preset,
  scope = {},
  pagination,
  filter,
  sorting,
}: BrowseProductsArgs): Promise<{ result: QueryHandlerResponseMulti; response: BrowseResponse }> => {
  const { batteryIncludedClient, sortings, facetOptions } = context;

  const { sorting: appliedSorting, sort } = resolveSorting(sorting, sortings);

  const response = await batteryIncludedClient.browse({
    query,
    preset,
    page: pagination.page,
    per_page: pagination.limit,
    filters: { ...(filter ? mapSelectedFiltersToBatteryIncludedFilters(filter) : {}), ...scope },
    sort,
  });

  return {
    response,
    result: {
      ids: response.hits.map((hit) => productIdOf(hit.document)),
      total: response.found,
      availableFilters: mapBatteryIncludedFacetsToAvailableFilters(response.facet_counts, facetOptions),
      availableSortings: toAvailableSortings(sortings),
      sorting: appliedSorting,
    },
  };
};
