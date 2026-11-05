import type { AvailableFilter, AvailableFilterListValue, QueryWireRequestFilter, WellKnownFilterName } from '#orchestr/types';
import type { SearchParams } from '../../client/sdk/types';
import type { CountItem, Facet } from '../../client/types/facets';
import type { Swatch } from '@laioutr-core/core-types/common';

export interface FacetMappingOptions {
  /** BI field names whose values are shown as swatches, e.g. `_product_i18n.properties.Farbe`. */
  swatchFacets?: string[];
}

/** Well-known names for the fields of BI's Shopware export, so a storefront can place or style them. */
const WELL_KNOWN_FIELDS: Array<[test: (field: string) => boolean, name: WellKnownFilterName]> = [
  [(field) => field === '_product.price', 'price'],
  [(field) => field === '_product_i18n.manufacturer', 'brand'],
  [(field) => field === '_product_i18n.categories' || field.startsWith('_product_i18n.categoryTree'), 'category'],
];

const wellKnownNameOf = (field: string) => WELL_KNOWN_FIELDS.find(([test]) => test(field))?.[1];

const IMAGE_URL = /^(?:https?:)?\/\/|\.(?:png|jpe?g|webp|avif|svg)(?:\?|$)/i;

/** A swatch from what BI attaches to a value: an image URL or a CSS colour. */
const swatchOf = (count: CountItem): Swatch | undefined => {
  const image = count.data?.image ?? (count.data?.swatch && IMAGE_URL.test(count.data.swatch) ? count.data.swatch : undefined);
  if (image) return ['image', { type: 'image', alt: count.value, sources: [{ provider: 'raw', src: image }] }];

  const color = count.data?.color ?? count.data?.swatch;
  if (color) return ['color', color];

  return undefined;
};

const listValueOf = (count: CountItem): AvailableFilterListValue => {
  const swatch = swatchOf(count);
  // The id is sent back to BI as the filter value, so it stays the facet value; category-tree values
  // carry a readable name in `data`.
  return { id: count.value, label: count.data?.name ?? count.value, count: count.count, ...(swatch ? { swatch } : {}) };
};

/**
 * Maps BI's `facet_counts` to Orchestr filters. The filter id is BI's `field_name`, so it can be sent
 * back unchanged.
 *
 * - `select` becomes a `list`. It is presented as swatches when its field is listed in
 *   `swatchFacets` or BI attaches a colour or image to its values; values without one fall back to
 *   their label.
 * - Category-tree facets (`_product_i18n.categoryTree.*`) are lists with the well-known name
 *   `category`. Orchestr filters have no tree, so the hierarchy is flattened in the order BI returns.
 * - `range` becomes a `range` from BI's `stats`.
 * - Facet types the app does not know are left out.
 */
export const mapBatteryIncludedFacetsToAvailableFilters = (
  facets: Array<Facet>,
  options: FacetMappingOptions = {}
): Array<AvailableFilter> => {
  const filters: Array<AvailableFilter> = [];
  const swatchFacets = new Set(options.swatchFacets ?? []);

  for (const facet of facets) {
    const wellKnownName = wellKnownNameOf(facet.field_name);
    const base = { id: facet.field_name, label: facet.field_label || facet.field_name, ...(wellKnownName ? { wellKnownName } : {}) };

    if (facet.type === 'select') {
      const values = facet.counts.map(listValueOf);
      const isSwatch = swatchFacets.has(facet.field_name) || values.some((value) => value.swatch);

      filters.push({ ...base, type: 'list', presentation: isSwatch ? 'swatch' : 'text', values });
    } else if (facet.type === 'range') {
      filters.push({ ...base, type: 'range', min: facet.stats.min, max: facet.stats.max });
    }
  }

  return filters;
};

/**
 * Returns the search params for BI's browse API: lists as `f[<field>][]` (one entry per value), ranges
 * as `f[<field>][from]` / `f[<field>][till]` with an open end left out, booleans as a one-value list.
 */
export const mapSelectedFiltersToBatteryIncludedFilters = (filters: QueryWireRequestFilter): SearchParams => {
  const batteryIncludedFilters: SearchParams = {};

  for (const [field, value] of Object.entries(filters)) {
    if (Array.isArray(value)) {
      if (value.length > 0) batteryIncludedFilters[`f[${field}][]`] = value;
    } else if (typeof value === 'boolean') {
      batteryIncludedFilters[`f[${field}][]`] = [String(value)];
    } else {
      if (value.min !== undefined) batteryIncludedFilters[`f[${field}][from]`] = value.min;
      if (value.max !== undefined) batteryIncludedFilters[`f[${field}][till]`] = value.max;
    }
  }

  return batteryIncludedFilters;
};
