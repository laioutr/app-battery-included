import type { AvailableSorting } from '#orchestr/types';

/**
 * A sorting the app offers. `key` is what the storefront sends (the `sort` URL param), `field` and
 * `order` are what BI sorts by. A sorting without `field` is BI's relevance order: no `sort` is sent.
 */
export interface BatteryIncludedSorting {
  key: string;
  label: string;
  field?: string;
  order?: 'asc' | 'desc';
}

/** The field names are the ones of BI's Shopware export. Override `sortings` for other indexes. */
export const DEFAULT_SORTINGS: BatteryIncludedSorting[] = [
  { key: 'relevance', label: 'Relevance' },
  { key: 'price-asc', label: 'Price (low to high)', field: '_product.price', order: 'asc' },
  { key: 'price-desc', label: 'Price (high to low)', field: '_product.price', order: 'desc' },
  { key: 'topseller', label: 'Top sellers', field: '_history.salesCount', order: 'desc' },
  { key: 'newest', label: 'Newest', field: '_common.releaseDate', order: 'desc' },
];

/** Keys offered before 2.0, still accepted so existing links keep their order. */
const LEGACY_KEYS: Record<string, string> = { 'price:asc': 'price-asc', 'price:desc': 'price-desc' };

/** A BI sort expression as BI takes it, `<field>:<asc|desc>`, e.g. `_product.price:asc`. */
const BI_SORT_EXPRESSION = /^[\w.]+:(?:asc|desc)$/;

export const toAvailableSortings = (sortings: BatteryIncludedSorting[]): AvailableSorting[] =>
  sortings.map(({ key, label }) => ({ key, label }));

/**
 * Translates the storefront's sort key into BI's `sort` param.
 *
 * Returns the key the result is sorted by (`undefined` for BI's default) and the `sort` value to
 * send. A key the app does not offer falls back to BI's default order instead of failing the listing;
 * a raw BI expression (`_product.price:asc`) is passed through, so a storefront can sort by a field
 * the app does not list.
 */
export const resolveSorting = (
  key: string | undefined,
  sortings: BatteryIncludedSorting[]
): { sorting: string | undefined; sort: string | undefined } => {
  if (!key) return { sorting: undefined, sort: undefined };

  const sorting = sortings.find((s) => s.key === (LEGACY_KEYS[key] ?? key));
  if (sorting) return { sorting: sorting.key, sort: sorting.field ? `${sorting.field}:${sorting.order ?? 'asc'}` : undefined };

  if (BI_SORT_EXPRESSION.test(key)) return { sorting: key, sort: key };

  return { sorting: undefined, sort: undefined };
};
