import { describe, expect, it } from 'vitest';
import type { SuggestResponse } from '../../src/runtime/server/client/sdk/types';
import { mapHighlights, mapSuggestResponse } from '../../src/runtime/server/orchestr-helper/suggest';

const searchLink = (q: string) => ({ type: 'pageType', pageType: 'ecommerce/product-search-page', params: { q } });

describe('mapSuggestResponse', () => {
  it('maps search terms', () => {
    const { entries } = mapSuggestResponse([{ kind: 'query-completion', hits: [{ value: 'sofa', highlighted: '<b>so</b>fa', score: 1 }] }]);

    expect(entries).toEqual([{ id: 'query_suggestion_0', type: 'query-suggestion', title: 'sofa', link: searchLink('sofa') }]);
  });

  it('maps products to Product references with cover and hands their ids to the products link', () => {
    const response: SuggestResponse = [
      {
        kind: 'document',
        found: 1,
        hits: [
          {
            highlighted: {
              type: 'ProductDataType',
              _product: {
                id: 'p1',
                price: 999,
                mappedFields: {
                  adobeMediaURL: 'https://cdn.test/p1.jpg',
                  seoUrls: [{ isCanonical: true, seoPathInfo: '/Sofa-Elba/123/' }],
                },
              },
              _product_i18n: { name: '<mark>Sofa</mark> Elba' },
            },
          },
        ],
      },
    ];

    const { entries, productIds } = mapSuggestResponse(response);

    expect(productIds).toEqual(['p1']);
    expect(entries).toEqual([
      {
        id: 'product_suggestion_p1',
        type: 'product',
        title: 'Sofa Elba',
        link: { type: 'reference', reference: { type: 'Product', id: 'p1', slug: 'Sofa-Elba/123' } },
        cover: { type: 'image', alt: 'Sofa Elba', sources: [{ provider: 'raw', src: 'https://cdn.test/p1.jpg' }] },
      },
    ]);
  });

  it('builds a fallback slug when the index has no SEO path, and reads the older _product.name', () => {
    const { entries } = mapSuggestResponse([
      { kind: 'document', found: 1, hits: [{ highlighted: { _product: { id: 'abc', name: 'Sessel Ölmühle' } } }] },
    ]);

    expect(entries[0]?.link).toEqual({ type: 'reference', reference: { type: 'Product', id: 'abc', slug: 'sessel-olmuhle-abc' } });
  });

  it('maps category-tree suggestions to Category references and name-only categories to search', () => {
    const { entries } = mapSuggestResponse([
      {
        kind: 'facet._product_i18n.categoryTree.name',
        found: 1,
        hits: [{ value: 'Sofas', highlighted: 'Sofas', count: 3, data: { id: 'c1', name: 'Sofas' } }],
      },
      { kind: 'facet._product_i18n.categories', found: 1, hits: [{ value: 'Sessel', highlighted: 'Sessel', count: 2 }] },
    ]);

    expect(entries).toEqual([
      {
        id: 'category_suggestion_c1',
        type: 'category',
        title: 'Sofas',
        link: { type: 'reference', reference: { type: 'Category', id: 'c1', slug: 'sofas-c1' } },
      },
      { id: 'category_suggestion_name_0', type: 'category', title: 'Sessel', link: searchLink('Sessel') },
    ]);
  });

  it('keeps the older facet._product.categories kind', () => {
    const { entries } = mapSuggestResponse([
      { kind: 'facet._product.categories', found: 1, hits: [{ value: 'Tische', highlighted: 'Tische', count: 1 }] },
    ]);

    expect(entries).toMatchObject([{ type: 'category', title: 'Tische' }]);
  });

  it('maps content pages and promotions to url links', () => {
    const { entries, productIds } = mapSuggestResponse([
      {
        kind: 'document',
        found: 1,
        hits: [
          {
            highlighted: {
              type: 'ContentDataType',
              _content_i18n: { name: 'Öffnungs<b>zeiten</b>', url: 'https://shop.test/oeffnungszeiten' },
            },
          },
        ],
      },
      {
        kind: 'promotions',
        found: 1,
        hits: [{ name: 'Sale', url: '/sale', image: { alt: 'Sale', desktop: 'https://cdn.test/d.jpg', mobile: 'https://cdn.test/m.jpg' } }],
      },
    ]);

    expect(productIds).toEqual([]);
    expect(entries).toEqual([
      { id: 'page_suggestion_0', type: 'page', title: 'Öffnungszeiten', link: { type: 'url', href: 'https://shop.test/oeffnungszeiten' } },
      {
        id: 'promotion_suggestion_0',
        type: 'promotion',
        title: 'Sale',
        link: { type: 'url', href: '/sale' },
        cover: {
          type: 'image',
          alt: 'Sale',
          sources: [
            { provider: 'raw', src: 'https://cdn.test/d.jpg', responsive: 'desktop' },
            { provider: 'raw', src: 'https://cdn.test/m.jpg', responsive: 'mobile' },
          ],
        },
      },
    ]);
  });
});

describe('mapHighlights', () => {
  it('links each top search to the search page with its term', () => {
    expect(mapHighlights({ searches: ['sofa', 42, ''] })).toEqual([
      { id: 'query_suggestion_0', type: 'query-suggestion', title: 'sofa', link: searchLink('sofa') },
    ]);
  });
});
