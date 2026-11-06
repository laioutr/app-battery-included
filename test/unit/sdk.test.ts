import { afterEach, describe, expect, it, vi } from 'vitest';
import BatteryIncludedSDK, { buildSearchParams } from '../../src/runtime/server/client/sdk';
import { BatteryIncludedApiError, isBatteryIncludedApiError } from '../../src/runtime/server/client/sdk/errors';

const sdk = () => new BatteryIncludedSDK({ baseURL: 'https://bi.test', collection: 'shop', apiKey: 'key', locale: 'de' });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('buildSearchParams', () => {
  it('sets the locale, repeats array values and leaves out empty values', () => {
    const params = buildSearchParams('de', { q: 'sofa', page: 2, 'f[brand][]': ['a', 'b'], sort: undefined, preset: null });

    expect(params.toString()).toBe('v%5Blocale%5D=de&q=sofa&page=2&f%5Bbrand%5D%5B%5D=a&f%5Bbrand%5D%5B%5D=b');
  });
});

describe('BatteryIncludedSDK', () => {
  it('throws a typed error with status and endpoint on a non-2xx answer', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('collection not found', { status: 404 }))
    );

    const error = await sdk()
      .suggest({ query: 'sofa' })
      .catch((error_: unknown) => error_);

    expect(error).toBeInstanceOf(BatteryIncludedApiError);
    expect(isBatteryIncludedApiError(error)).toBe(true);
    expect(error).toMatchObject({ status: 404, endpoint: '/documents/suggest', body: 'collection not found' });
  });

  it('returns the parsed body on a 2xx answer', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ searches: ['sofa'] }))
    );

    await expect(sdk().highlights()).resolves.toEqual({ searches: ['sofa'] });
  });

  it('shares one fetch between identical GET requests in flight', async () => {
    const fetchMock = vi.fn(async () => Response.json([]));
    vi.stubGlobal('fetch', fetchMock);

    await Promise.all([sdk().recommend({ id: '1' }), sdk().recommend({ id: '1' }), sdk().recommend({ id: '2' })]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('looks up BI ids for commerce product ids in one browse', async () => {
    const fetchMock = vi.fn(async (_url: string) =>
      Response.json({ hits: [{ document: { id: '31196400', _product: { id: 'sw-1' } } }], found: 1, facet_counts: [], out_of: 1, page: 1 })
    );
    vi.stubGlobal('fetch', fetchMock);

    const ids = await sdk().documentIdsOf(['sw-1', 'sw-2']);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0]![0]);
    expect(url.pathname).toBe('/api/v1/collections/shop/documents/browse');
    expect(url.searchParams.getAll('f[_product.id][]')).toEqual(['sw-1', 'sw-2']);
    expect(url.searchParams.get('per_page')).toBe('2');
    expect([...ids]).toEqual([['sw-1', '31196400']]);
  });

  it('asks nothing for no products', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect((await sdk().documentIdsOf([])).size).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
