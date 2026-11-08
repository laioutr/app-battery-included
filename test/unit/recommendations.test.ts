import { afterEach, describe, expect, it, vi } from 'vitest';
import type BatteryIncludedSDK from '../../src/runtime/server/client/sdk';
import type { RecommendationsResponse } from '../../src/runtime/server/client/sdk/types';
import { BatteryIncludedApiError } from '../../src/runtime/server/client/sdk/errors';
import { createRecommendationLookup, recommendedProductIdsOf } from '../../src/runtime/server/orchestr-helper/recommendations';

const rec = (productId: string, type: RecommendationsResponse[number]['type']): RecommendationsResponse[number] => ({
  document: { id: `bi-${productId}`, _product: { id: productId } },
  type,
});

const clientWith = ({
  documentIdsOf = async (ids: string[]) => new Map(ids.map((id) => [id, `bi-${id}`])),
  recommend = async (): Promise<RecommendationsResponse> => [],
}: {
  documentIdsOf?: (ids: string[]) => Promise<Map<string, string>>;
  recommend?: (args: { id: string }) => Promise<RecommendationsResponse>;
}) => {
  const lookupMock = vi.fn(documentIdsOf);
  const recommendMock = vi.fn(recommend);
  return {
    client: { documentIdsOf: lookupMock, recommend: recommendMock } as unknown as BatteryIncludedSDK,
    documentIdsOf: lookupMock,
    recommend: recommendMock,
  };
};

const entryFor = (...sourceIds: string[]) => ({ value: { links: sourceIds.map((sourceId) => ({ sourceId, targetIds: [] })) } });

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createRecommendationLookup', () => {
  it('looks up BI ids in one request and asks BI once per indexed product', async () => {
    const { client, documentIdsOf, recommend } = clientWith({
      documentIdsOf: async () => new Map([['sw-1', 'bi-1']]),
      recommend: async () => [rec('sw-2', 'also')],
    });

    const result = await createRecommendationLookup().recommendationsOf(client, ['sw-1', 'sw-9']);

    expect(documentIdsOf).toHaveBeenCalledTimes(1);
    expect(documentIdsOf).toHaveBeenCalledWith(['sw-1', 'sw-9']);
    expect(recommend).toHaveBeenCalledTimes(1);
    expect(recommend).toHaveBeenCalledWith({ id: 'bi-1' });
    expect([...result]).toEqual([
      ['sw-1', [rec('sw-2', 'also')]],
      ['sw-9', []],
    ]);
  });

  it('costs a failing product its recommendations only, and keeps its fallback out of the cache until it succeeds', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let failing = true;
    const { client } = clientWith({
      recommend: async ({ id }) => {
        if (id === 'bi-sw-1' && failing) throw new BatteryIncludedApiError(503, '/documents/recommendations', 'unavailable');
        return [rec('sw-3', 'related')];
      },
    });
    const lookup = createRecommendationLookup();

    const result = await lookup.recommendationsOf(client, ['sw-1', 'sw-2']);

    expect(result.get('sw-1')).toEqual([]);
    expect(result.get('sw-2')).toEqual([rec('sw-3', 'related')]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('sw-1'), expect.any(BatteryIncludedApiError));
    expect(lookup.validate(entryFor('sw-1'))).toBe(false);
    expect(lookup.validate(entryFor('sw-2'))).toBe(true);

    failing = false;
    await lookup.recommendationsOf(client, ['sw-1']);

    expect(lookup.validate(entryFor('sw-1'))).toBe(true);
  });

  it('answers no recommendations and refuses the cache for every product when the id lookup fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { client, recommend } = clientWith({
      documentIdsOf: async () => {
        throw new BatteryIncludedApiError(500, '/documents/browse', 'boom');
      },
    });
    const lookup = createRecommendationLookup();

    const result = await lookup.recommendationsOf(client, ['sw-1', 'sw-2']);

    expect([...result]).toEqual([
      ['sw-1', []],
      ['sw-2', []],
    ]);
    expect(recommend).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(lookup.validate(entryFor('sw-1', 'sw-2'))).toBe(false);
  });

  it('caches the empty answer of a product BI does not index', async () => {
    const { client } = clientWith({ documentIdsOf: async () => new Map() });
    const lookup = createRecommendationLookup();

    await lookup.recommendationsOf(client, ['sw-1']);

    expect(lookup.validate(entryFor('sw-1'))).toBe(true);
  });

  it('keeps the failures of one lookup apart from another', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { client } = clientWith({
      recommend: async () => {
        throw new BatteryIncludedApiError(503, '/documents/recommendations', '');
      },
    });
    const failed = createRecommendationLookup();
    const other = createRecommendationLookup();

    await failed.recommendationsOf(client, ['sw-1']);

    expect(failed.validate(entryFor('sw-1'))).toBe(false);
    expect(other.validate(entryFor('sw-1'))).toBe(true);
  });
});

describe('recommendedProductIdsOf', () => {
  it('keeps BI order, lists a product once at its first place, and leaves out the product itself', () => {
    const recommendations = [rec('sw-2', 'together'), rec('sw-1', 'also'), rec('sw-3', 'also'), rec('sw-2', 'related')];

    expect(recommendedProductIdsOf('sw-1', recommendations)).toEqual(['sw-2', 'sw-3']);
  });

  it('leaves out a document without a commerce product id', () => {
    expect(recommendedProductIdsOf('sw-1', [{ document: { id: '31196400' }, type: 'related' }, rec('sw-2', 'also')])).toEqual(['sw-2']);
  });
});
