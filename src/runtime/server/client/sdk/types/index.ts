import type { Facet } from '../../types/facets';
import type { Hit } from '../../types/hit';

export type SearchParams = Record<string, string | number | null | undefined | string[]>;

export type WithDefaultParams<T> = T & {
  page?: number;
  per_page?: number;
  sort?: string;
  filters?: Record<string, string | number | null | undefined | string[]>;
};

export interface BrowseResponse {
  facet_counts: Array<Facet>;
  found: number;
  hits: Array<Hit>;
  out_of: number;
  page: number;
}

export type QueryCompletionSuggestItem = {
  kind: 'query-completion';
  hits: Array<{
    value: string;
    highlighted: string;
    score: number;
  }>;
};

export type DocumentSuggestItem = {
  kind: 'document';
  found: number;
  hits: Array<{ highlighted: Record<'_product', { name: string }> }>;
};

export type FacetProductCategoriesItem = {
  kind: 'facet._product.categories';
  found: number;
  hits: Array<{ highlighted: string; value: string; count: number }>;
};

export type SuggestResponse = Array<QueryCompletionSuggestItem | DocumentSuggestItem | FacetProductCategoriesItem>;

export type RecommendationsResponse = Array<{
  document: { id: string };
  type: 'also' | 'together' | 'related';
}>;

export interface HighlightsResponse {
  searches: string[];
}
