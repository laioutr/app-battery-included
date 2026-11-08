import type BatteryIncludedSDK from '../../client/sdk';
import type { RecommendationsResponse } from '../../client/sdk/types';

/** A link cache entry, narrowed to what `validate` reads. */
interface LinkCacheEntry {
  value?: { links: ReadonlyArray<{ sourceId: string }> };
}

export interface RecommendationLookup {
  /**
   * BI's recommendations for each source id, in BI's order. A product BI does not index has none, and
   * so has one whose BI call failed, logged with a warning; neither fails the other source ids.
   */
  recommendationsOf: (client: BatteryIncludedSDK, sourceIds: string[]) => Promise<Map<string, RecommendationsResponse>>;
  /** For a link's `cache.validate`: refuses an entry that holds the empty fallback of a failed source id. */
  validate: (entry: LinkCacheEntry) => boolean;
}

/**
 * One per link handler. It remembers which source ids failed on their last call, so the handler's cache
 * does not keep that empty fallback for the whole TTL; the link cache writes right after the handler
 * ran, in the same process.
 */
export const createRecommendationLookup = (): RecommendationLookup => {
  const failedSourceIds = new Set<string>();

  const recommendationsOf = async (client: BatteryIncludedSDK, sourceIds: string[]) => {
    // The source ids are the commerce app's; BI recommends by its own id.
    let documentIds: Map<string, string>;
    try {
      documentIds = await client.documentIdsOf(sourceIds);
    } catch (error) {
      console.warn('[app-battery-included] looking up BI ids for recommendations failed', error);
      for (const id of sourceIds) failedSourceIds.add(id);
      return new Map(sourceIds.map((id) => [id, []]));
    }

    const responses = await Promise.all(
      sourceIds.map(async (id): Promise<readonly [string, RecommendationsResponse]> => {
        const documentId = documentIds.get(id);
        // A product BI does not index has no recommendations; that answer is final, not a failure.
        if (!documentId) {
          failedSourceIds.delete(id);
          return [id, []];
        }
        try {
          const res = await client.recommend({ id: documentId });
          failedSourceIds.delete(id);
          return [id, res];
        } catch (error) {
          // One failing product must not take the recommendations of the others down with it.
          console.warn(`[app-battery-included] recommendations for ${id} failed`, error);
          failedSourceIds.add(id);
          return [id, []];
        }
      })
    );

    return new Map(responses);
  };

  const validate = (entry: LinkCacheEntry) => (entry.value?.links ?? []).every((link) => !failedSourceIds.has(link.sourceId));

  return { recommendationsOf, validate };
};

/**
 * The commerce product ids of a product's recommendations, in BI's order, without the product itself. A
 * product BI recommends under more than one relation appears once, at its first place. A document without a
 * commerce product id is left out, since the commerce app could not resolve BI's own id.
 */
export const recommendedProductIdsOf = (sourceId: string, recommendations: RecommendationsResponse): string[] => {
  const ids = new Set<string>();
  for (const { document } of recommendations) {
    const id = document._product?.id;
    if (id && id !== sourceId) ids.add(id);
  }
  return [...ids];
};
