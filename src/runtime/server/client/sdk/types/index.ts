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
    source?: string;
  }>;
};

/** A product hit. Which fields it carries depends on the index; read defensively. */
export type ProductSuggestHit = {
  highlighted: {
    type?: string;
    _product?: {
      id?: string;
      /** Older indexes carry the name here instead of on `_product_i18n`. */
      name?: string;
      image?: string;
      cover?: string;
      price?: number;
      mappedFields?: {
        adobeMediaURL?: string;
        seoUrls?: Array<{ isCanonical: boolean; seoPathInfo: string }>;
      };
    };
    _product_i18n?: { name?: string };
    _content_i18n?: undefined;
  };
};

/** A content hit (a CMS page indexed as `ContentDataType`). */
export type ContentSuggestHit = {
  highlighted: {
    type?: string;
    _content_i18n: { name: string; url?: string };
  };
};

export type DocumentSuggestItem = {
  kind: 'document';
  found: number;
  hits: Array<ProductSuggestHit | ContentSuggestHit>;
};

export type FacetCategoryTreeSuggestItem = {
  kind: 'facet._product_i18n.categoryTree.name';
  found: number;
  field_name?: string;
  hits: Array<{ highlighted: string; value: string; count: number; data?: { id?: string; name?: string } }>;
};

export type FacetCategoriesSuggestItem = {
  /** `facet._product.categories` is the kind of older indexes. */
  kind: 'facet._product_i18n.categories' | 'facet._product.categories';
  found: number;
  field_name?: string;
  hits: Array<{ highlighted: string; value: string; count: number }>;
};

export type PromotionsSuggestItem = {
  kind: 'promotions';
  found: number;
  hits: Array<{ name: string; url: string; image?: { alt?: string; desktop?: string; mobile?: string } }>;
};

export type SuggestItem =
  QueryCompletionSuggestItem | DocumentSuggestItem | FacetCategoryTreeSuggestItem | FacetCategoriesSuggestItem | PromotionsSuggestItem;

export type SuggestResponse = Array<SuggestItem>;

export type RecommendationsResponse = Array<{
  document: { id: string };
  type: 'also' | 'together' | 'related';
}>;

export interface HighlightsResponse {
  searches: unknown[];
  querySuggestions?: string[];
}
