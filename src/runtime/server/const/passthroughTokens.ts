import { createPassthroughToken } from '#imports';
import type { BrowseExtension, RecommendationsResponse } from '../client/sdk/types';
import type { SuggestionEntry } from '../orchestr-helper/suggest';

export const suggestionResultsFragmentToken = createPassthroughToken<{
  id: string;
  suggestions: SuggestionEntry[];
  /** Ids of the suggested products, for `SuggestedSearchProductsLink`. */
  productIds?: string[];
}>('@laioutr/app-battery-included/suggestionResults');

export const recommendationsToken = createPassthroughToken<RecommendationsResponse>('@laioutr/app-battery-included/recommendations');

/**
 * BI's extensions (merchandising teasers, search redirects, other kinds) of the last product browse in
 * this request, as BI sent them. For project handlers that need an extension this app does not map.
 */
export const browseExtensionsToken = createPassthroughToken<BrowseExtension[]>('@laioutr/app-battery-included/browseExtensions');
