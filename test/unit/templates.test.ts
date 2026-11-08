import { afterEach, describe, expect, it, vi } from 'vitest';
import type BatteryIncludedSDK from '../../src/runtime/server/client/sdk';
import type { BrowseResponse } from '../../src/runtime/server/client/sdk/types';
import type { CountItem, Facet } from '../../src/runtime/server/client/types/facets';
import { BatteryIncludedApiError } from '../../src/runtime/server/client/sdk/errors';
import {
  categoriesOfFacets,
  categoryTemplatesOf,
  provideCategoryTemplates,
  searchTemplatesOf,
} from '../../src/runtime/server/orchestr-helper/templates';

const CATEGORY_FIELD = '_product_i18n.categoryTree.id';

const select = (field_name: string, counts: CountItem[]): Facet => ({
  type: 'select',
  field_name,
  field_label: field_name,
  counts,
  stats: { total_values: counts.length },
});

const categoryFacet = select(CATEGORY_FIELD, [
  { value: 'c1', count: 40, data: { id: 'c1', name: 'Wohnzimmer' } },
  { value: 'c2', count: 12, data: { id: 'c2', name: 'Sofas' } },
  { value: 'c3', count: 8, data: { id: 'c3', name: 'Ecksofas' } },
  { value: 'c4', count: 5, data: { id: 'c4', name: 'Sofas' } },
]);

const response = (facets: Facet[]): BrowseResponse => ({ found: 65, out_of: 65, page: 1, hits: [], facet_counts: facets });

const contextWith = (browse: BatteryIncludedSDK['browse']) => ({
  batteryIncludedClient: { browse } as unknown as BatteryIncludedSDK,
  fields: { categoryId: CATEGORY_FIELD },
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('categoriesOfFacets', () => {
  it('reads ids from the values of the facet the listing filters by, names from data', () => {
    expect(categoriesOfFacets([select('brand', [{ value: 'A', count: 1 }]), categoryFacet], CATEGORY_FIELD)).toEqual([
      { id: 'c1', name: 'Wohnzimmer' },
      { id: 'c2', name: 'Sofas' },
      { id: 'c3', name: 'Ecksofas' },
      { id: 'c4', name: 'Sofas' },
    ]);
  });

  it('falls back to the name facet of the same tree, taking the id from data and skipping values without one', () => {
    const nameFacet = select('_product_i18n.categoryTree.name', [
      { value: 'Sofas', count: 12, data: { id: 'c2', name: 'Sofas' } },
      { value: 'Ohne Id', count: 3 },
    ]);

    expect(categoriesOfFacets([nameFacet], CATEGORY_FIELD)).toEqual([{ id: 'c2', name: 'Sofas' }]);
  });

  it('labels a value without a name by its value', () => {
    expect(categoriesOfFacets([select(CATEGORY_FIELD, [{ value: 'c9', count: 1 }])], CATEGORY_FIELD)).toEqual([{ id: 'c9', name: 'c9' }]);
  });

  it('finds nothing without a facet of the tree', () => {
    expect(categoriesOfFacets([select('brand', [{ value: 'A', count: 1, data: { id: 'x' } }])], CATEGORY_FIELD)).toEqual([]);
  });
});

describe('categoryTemplatesOf', () => {
  const categories = categoriesOfFacets([categoryFacet], CATEGORY_FIELD);

  it('offers every category without a term, telling equal names apart by id', () => {
    expect(categoryTemplatesOf(categories, undefined)).toEqual([
      { input: { categoryId: 'c1' }, label: 'Wohnzimmer' },
      { input: { categoryId: 'c2' }, label: 'Sofas (c2)' },
      { input: { categoryId: 'c3' }, label: 'Ecksofas' },
      { input: { categoryId: 'c4' }, label: 'Sofas (c4)' },
    ]);
  });

  it('matches the term in the name in any case, or the id exactly', () => {
    expect(categoryTemplatesOf(categories, ' SOFA ').map((template) => template.input.categoryId)).toEqual(['c2', 'c3', 'c4']);
    expect(categoryTemplatesOf(categories, 'c1')).toEqual([{ input: { categoryId: 'c1' }, label: 'Wohnzimmer' }]);
  });

  it('caps the list', () => {
    expect(categoryTemplatesOf(categories, '', 2)).toHaveLength(2);
  });
});

describe('provideCategoryTemplates', () => {
  it('asks BI for one browse and maps its category facet', async () => {
    const browse = vi.fn(async () => response([categoryFacet]));

    const templates = await provideCategoryTemplates({ context: contextWith(browse), term: 'eck' });

    expect(browse).toHaveBeenCalledTimes(1);
    expect(browse).toHaveBeenCalledWith({ page: 1, per_page: 1 });
    expect(templates).toEqual([{ input: { categoryId: 'c3' }, label: 'Ecksofas' }]);
  });

  it('answers no presets and warns, naming the token, when BI fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const browse = vi.fn(async () => {
      throw new BatteryIncludedApiError(503, '/documents/browse', 'unavailable');
    });

    await expect(provideCategoryTemplates({ context: contextWith(browse), term: 'sofa' })).resolves.toEqual([]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('ecommerce/product/by-category-id'), expect.any(BatteryIncludedApiError));
  });

  it('warns when BI answers without a category facet', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const browse = vi.fn(async () => response([]));

    await expect(provideCategoryTemplates({ context: contextWith(browse) })).resolves.toEqual([]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining(CATEGORY_FIELD));
  });
});

describe('searchTemplatesOf', () => {
  it('offers the trimmed term as a search', () => {
    expect(searchTemplatesOf('  Ecksofa ')).toEqual([{ input: { query: 'Ecksofa' }, label: 'Search: Ecksofa' }]);
  });

  it('offers nothing without a term', () => {
    expect(searchTemplatesOf(undefined)).toEqual([]);
    expect(searchTemplatesOf('   ')).toEqual([]);
  });
});
