import { createPassthroughToken } from '#imports';
import { PageTypeToken } from '@laioutr-core/core-types/frontend';
import { RecommendationsResponse } from '../client/sdk/types';

export const suggestionResultsFragmentToken = createPassthroughToken<{
  id: string;
  suggestions: Array<{
    id: string;
    type: string;
    title: string;
    link:
      | { type: 'reference'; reference: { type: string; id: string; slug: string } }
      | { type: 'pageType'; pageType: PageTypeToken; params: Record<string, string> };
  }>;
}>('@laioutr/app-battery-included/suggestionResults');

export const recommendationsToken = createPassthroughToken<RecommendationsResponse>('@laioutr/app-battery-included/recommendations');
