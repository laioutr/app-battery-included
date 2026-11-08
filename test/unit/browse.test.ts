import { describe, expect, it, vi } from 'vitest';
import type BatteryIncludedSDK from '../../src/runtime/server/client/sdk';
import type { BrowseResponse } from '../../src/runtime/server/client/sdk/types';
import { browseProducts } from '../../src/runtime/server/orchestr-helper/browse';
import { DEFAULT_SORTINGS } from '../../src/runtime/server/orchestr-helper/sorting';

const response: BrowseResponse = {
  found: 2,
  out_of: 10,
  page: 1,
  hits: [
    { document: { id: 'p1', name: 'Sofa', description: '' }, highlight: {} },
    { document: { id: 'p2', name: 'Sessel', description: '' }, highlight: {} },
  ],
  facet_counts: [
    { type: 'select', field_name: 'brand', field_label: 'Marke', counts: [{ value: 'A', count: 2 }], stats: { total_values: 1 } },
  ],
};

const setup = () => {
  const browse = vi.fn(async () => response);
  const context = {
    batteryIncludedClient: { browse } as unknown as BatteryIncludedSDK,
    sortings: DEFAULT_SORTINGS,
    facetOptions: {},
  };
  return { browse, context };
};

describe('browseProducts', () => {
  it('scopes a listing, translates filters and sorting, and maps the answer', async () => {
    const { browse, context } = setup();

    const { result } = await browseProducts({
      context,
      scope: { 'f[_product_i18n.categoryTree.id][]': ['cat-1'] },
      pagination: { page: 2, limit: 20 },
      filter: { brand: ['A'], '_product_i18n.categoryTree.id': ['other'] },
      sorting: 'topseller',
    });

    expect(browse).toHaveBeenCalledWith({
      query: undefined,
      preset: undefined,
      page: 2,
      per_page: 20,
      filters: { 'f[brand][]': ['A'], 'f[_product_i18n.categoryTree.id][]': ['cat-1'] },
      sort: '_history.salesCount:desc',
    });
    expect(result).toMatchObject({ ids: ['p1', 'p2'], total: 2, sorting: 'topseller', availableFilters: [{ id: 'brand', type: 'list' }] });
    expect(result.availableSortings?.map((s) => s.key)).toContain('newest');
  });

  it('passes the search term', async () => {
    const { browse, context } = setup();

    await browseProducts({ context, query: 'sofa', pagination: { page: 1, limit: 48 } });

    expect(browse).toHaveBeenCalledWith(expect.objectContaining({ query: 'sofa', filters: {}, sort: undefined }));
  });

  it('passes a preset id, leaving the order to BI without a sorting', async () => {
    const { browse, context } = setup();

    const { result } = await browseProducts({ context, preset: 'new-arrivals', pagination: { page: 1, limit: 20 }, filter: { brand: ['A'] } });

    expect(browse).toHaveBeenCalledWith({
      query: undefined,
      preset: 'new-arrivals',
      page: 1,
      per_page: 20,
      filters: { 'f[brand][]': ['A'] },
      sort: undefined,
    });
    expect(result).toMatchObject({ ids: ['p1', 'p2'], total: 2 });
  });
});
