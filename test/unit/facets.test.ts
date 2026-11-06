import { describe, expect, it } from 'vitest';
import type { Facet } from '../../src/runtime/server/client/types/facets';
import {
  mapBatteryIncludedFacetsToAvailableFilters,
  mapSelectedFiltersToBatteryIncludedFilters,
} from '../../src/runtime/server/orchestr-helper/facets';

const select = (field_name: string, counts: Facet['counts'], field_label = 'Label'): Facet => ({
  type: 'select',
  field_name,
  field_label,
  counts,
  stats: { total_values: counts.length },
});

describe('mapSelectedFiltersToBatteryIncludedFilters', () => {
  it('sends list values as f[field][]', () => {
    expect(mapSelectedFiltersToBatteryIncludedFilters({ '_product_i18n.manufacturer': ['Rolf Benz', 'Hülsta'] })).toEqual({
      'f[_product_i18n.manufacturer][]': ['Rolf Benz', 'Hülsta'],
    });
  });

  it('leaves out an empty list', () => {
    expect(mapSelectedFiltersToBatteryIncludedFilters({ brand: [] })).toEqual({});
  });

  it('sends an open range end as the widest safe integer, since BI needs both ends', () => {
    expect(mapSelectedFiltersToBatteryIncludedFilters({ '_product.price': { min: 100 } })).toEqual({
      'f[_product.price][from]': 100,
      'f[_product.price][till]': Number.MAX_SAFE_INTEGER,
    });
    expect(mapSelectedFiltersToBatteryIncludedFilters({ '_product.price': { max: 500 } })).toEqual({
      'f[_product.price][from]': Number.MIN_SAFE_INTEGER,
      'f[_product.price][till]': 500,
    });
    expect(mapSelectedFiltersToBatteryIncludedFilters({ '_product.price': {} })).toEqual({});
    expect(mapSelectedFiltersToBatteryIncludedFilters({ '_product.price': { min: 0, max: 500 } })).toEqual({
      'f[_product.price][from]': 0,
      'f[_product.price][till]': 500,
    });
  });

  it('sends a boolean as a one-value list', () => {
    expect(mapSelectedFiltersToBatteryIncludedFilters({ '_product.shippingFree': true })).toEqual({
      'f[_product.shippingFree][]': ['true'],
    });
  });
});

describe('mapBatteryIncludedFacetsToAvailableFilters', () => {
  it('maps a select facet to a text list with the BI field as id', () => {
    const [filter] = mapBatteryIncludedFacetsToAvailableFilters([
      select('_product_i18n.manufacturer', [{ value: 'Hülsta', count: 3 }], 'Hersteller'),
    ]);

    expect(filter).toEqual({
      id: '_product_i18n.manufacturer',
      label: 'Hersteller',
      wellKnownName: 'brand',
      type: 'list',
      presentation: 'text',
      values: [{ id: 'Hülsta', label: 'Hülsta', count: 3 }],
    });
  });

  it('maps a range facet from its stats', () => {
    const [filter] = mapBatteryIncludedFacetsToAvailableFilters([
      { type: 'range', field_name: '_product.price', field_label: 'Preis', counts: [], stats: { min: 10, max: 900, total_values: 40 } },
    ]);

    expect(filter).toEqual({ id: '_product.price', label: 'Preis', wellKnownName: 'price', type: 'range', min: 10, max: 900 });
  });

  it('marks category-tree facets as category and labels values by their name', () => {
    const [filter] = mapBatteryIncludedFacetsToAvailableFilters([
      select('_product_i18n.categoryTree.id', [{ value: 'c1', count: 4, data: { id: 'c1', name: 'Sofas' } }]),
    ]);

    expect(filter).toMatchObject({ wellKnownName: 'category', values: [{ id: 'c1', label: 'Sofas', count: 4 }] });
  });

  it('presents configured fields as swatches', () => {
    const [filter] = mapBatteryIncludedFacetsToAvailableFilters([select('_product_i18n.properties.Farbe', [{ value: 'Rot', count: 1 }])], {
      swatchFacets: ['_product_i18n.properties.Farbe'],
    });

    expect(filter).toMatchObject({ presentation: 'swatch', values: [{ id: 'Rot', label: 'Rot' }] });
  });

  it('builds swatches from colours or images BI attaches', () => {
    const [filter] = mapBatteryIncludedFacetsToAvailableFilters([
      select('color', [
        { value: 'Rot', count: 1, data: { color: '#c00' } },
        { value: 'Bunt', count: 1, data: { swatch: 'https://cdn.test/bunt.png' } },
      ]),
    ]);

    expect(filter).toMatchObject({
      presentation: 'swatch',
      values: [
        { id: 'Rot', swatch: ['color', '#c00'] },
        { id: 'Bunt', swatch: ['image', { type: 'image', sources: [{ provider: 'raw', src: 'https://cdn.test/bunt.png' }] }] },
      ],
    });
  });

  it('leaves out facet types it does not know', () => {
    expect(mapBatteryIncludedFacetsToAvailableFilters([{ ...select('x', []), type: 'hierarchy' } as unknown as Facet])).toEqual([]);
  });
});
