import { describe, expect, it } from 'vitest';
import { DEFAULT_SORTINGS, resolveSorting, toAvailableSortings } from '../../src/runtime/server/orchestr-helper/sorting';

describe('resolveSorting', () => {
  it.each([
    ['price-asc', '_product.price:asc'],
    ['price-desc', '_product.price:desc'],
    ['topseller', '_history.salesCount:desc'],
    ['newest', '_common.releaseDate:desc'],
  ])('translates %s to the BI sort %s', (key, sort) => {
    expect(resolveSorting(key, DEFAULT_SORTINGS)).toEqual({ sorting: key, sort });
  });

  it('sends no sort for relevance or no key', () => {
    expect(resolveSorting('relevance', DEFAULT_SORTINGS)).toEqual({ sorting: 'relevance', sort: undefined });
    expect(resolveSorting(undefined, DEFAULT_SORTINGS)).toEqual({ sorting: undefined, sort: undefined });
  });

  it('accepts the keys of earlier releases', () => {
    expect(resolveSorting('price:desc', DEFAULT_SORTINGS)).toEqual({ sorting: 'price-desc', sort: '_product.price:desc' });
  });

  it('passes a raw BI sort expression through', () => {
    expect(resolveSorting('_product.stock:desc', DEFAULT_SORTINGS)).toEqual({
      sorting: '_product.stock:desc',
      sort: '_product.stock:desc',
    });
  });

  it('falls back to BI order for an unknown key', () => {
    expect(resolveSorting('cheapest', DEFAULT_SORTINGS)).toEqual({ sorting: undefined, sort: undefined });
  });

  it('uses configured sortings and defaults their order to ascending', () => {
    expect(resolveSorting('name', [{ key: 'name', label: 'Name', field: '_product_i18n.name' }])).toEqual({
      sorting: 'name',
      sort: '_product_i18n.name:asc',
    });
  });
});

describe('toAvailableSortings', () => {
  it('offers relevance, price both ways, top sellers and newest', () => {
    expect(toAvailableSortings(DEFAULT_SORTINGS).map((s) => s.key)).toEqual([
      'relevance',
      'price-asc',
      'price-desc',
      'topseller',
      'newest',
    ]);
  });
});
