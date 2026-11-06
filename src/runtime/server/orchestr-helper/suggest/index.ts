import { ProductSearchPage } from '@laioutr-core/canonical-types/ecommerce';
import type { ContentSuggestHit, HighlightsResponse, ProductSuggestHit, SuggestItem, SuggestResponse } from '../../client/sdk/types';
import type { Link, MediaImage } from '@laioutr-core/core-types/common';
import { linkTargetOf } from '../../lib/linkTarget';
import { unhtml } from '../../lib/unhtml';

export interface SuggestionEntry {
  id: string;
  type: string;
  title: string;
  link: Link;
  cover?: MediaImage;
}

export interface Suggestions {
  entries: SuggestionEntry[];
  /** Ids of the suggested products, for `SuggestedSearchProductsLink`. */
  productIds: string[];
}

const searchLink = (q: string): Link => ({ type: 'pageType', pageType: ProductSearchPage, params: { q } });

/** URL-safe slug: lower case, diacritics dropped, runs of other characters as one dash. */
const slugify = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * A reference link needs a slug for the detail route. BI knows the SEO path only where the index
 * carries it; otherwise this builds `<name>-<id>`, the fallback slug format of app-shopware.
 */
const fallbackSlug = (name: string, id: string) => [slugify(name), id].filter(Boolean).join('-');

const seoSlug = (seoUrls: Array<{ isCanonical: boolean; seoPathInfo: string }> | undefined) => {
  const seoUrl = seoUrls?.find((url) => url.isCanonical) ?? seoUrls?.[0];
  return seoUrl?.seoPathInfo.replace(/^\/+|\/+$/g, '') || undefined;
};

const imageOf = (src: string | undefined, alt: string): MediaImage | undefined =>
  src ? { type: 'image', alt, sources: [{ provider: 'raw', src }] } : undefined;

const findKind = <TKind extends SuggestItem['kind']>(suggestions: SuggestResponse, ...kinds: TKind[]) =>
  suggestions.find((item): item is Extract<SuggestItem, { kind: TKind }> => (kinds as string[]).includes(item.kind));

const isContentHit = (hit: ProductSuggestHit | ContentSuggestHit): hit is ContentSuggestHit => !!hit.highlighted._content_i18n;

/**
 * Maps BI's suggest answer to suggested-search entries.
 *
 * - `query-completion`: search terms, linking to the search page.
 * - `document` with `_product`: products as references to the `Product` (with a cover where the index
 *   has an image). Their ids also go to `SuggestedSearchProductsLink`, which resolves the full
 *   product with price through the commerce app. A hit without an id links to the search page.
 * - `document` with `_content_i18n`: content pages as `page` entries linking to their URL.
 * - `facet._product_i18n.categoryTree.name`: categories as references to the `Category` by the id BI
 *   attaches; `facet._product_i18n.categories` (and the older `facet._product.categories`) carry no
 *   id, so they link to the search page.
 * - `promotions`: `promotion` entries with their image and URL.
 */
export const mapSuggestResponse = (suggestions: SuggestResponse): Suggestions => {
  const entries: SuggestionEntry[] = [];
  const productIds: string[] = [];

  for (const [i, hit] of (findKind(suggestions, 'query-completion')?.hits ?? []).entries()) {
    entries.push({ id: `query_suggestion_${i}`, type: 'query-suggestion', title: hit.value, link: searchLink(hit.value) });
  }

  const documents = findKind(suggestions, 'document')?.hits ?? [];

  for (const [i, hit] of documents.entries()) {
    if (isContentHit(hit)) continue;
    const product = hit.highlighted._product;
    const title = unhtml(hit.highlighted._product_i18n?.name ?? product?.name ?? '');
    if (!product || !title) continue;

    const cover = imageOf(product.image ?? product.cover ?? product.mappedFields?.adobeMediaURL, title);

    if (product.id) {
      productIds.push(product.id);
      entries.push({
        id: `product_suggestion_${product.id}`,
        type: 'product',
        title,
        link: {
          type: 'reference',
          reference: { type: 'Product', id: product.id, slug: seoSlug(product.mappedFields?.seoUrls) ?? fallbackSlug(title, product.id) },
        },
        ...(cover ? { cover } : {}),
      });
    } else {
      entries.push({ id: `product_suggestion_${i}`, type: 'product', title, link: searchLink(title), ...(cover ? { cover } : {}) });
    }
  }

  for (const [i, hit] of (findKind(suggestions, 'facet._product_i18n.categoryTree.name')?.hits ?? []).entries()) {
    const title = hit.data?.name ?? hit.value;
    const id = hit.data?.id;
    entries.push({
      id: `category_suggestion_${id ?? i}`,
      type: 'category',
      title,
      link: id ? { type: 'reference', reference: { type: 'Category', id, slug: fallbackSlug(title, id) } } : searchLink(title),
    });
  }

  for (const [i, hit] of (findKind(suggestions, 'facet._product_i18n.categories', 'facet._product.categories')?.hits ?? []).entries()) {
    entries.push({ id: `category_suggestion_name_${i}`, type: 'category', title: hit.value, link: searchLink(hit.value) });
  }

  for (const [i, hit] of documents.entries()) {
    if (!isContentHit(hit)) continue;
    const { name, url } = hit.highlighted._content_i18n;
    const href = linkTargetOf(url);
    if (!href) continue;
    entries.push({ id: `page_suggestion_${i}`, type: 'page', title: unhtml(name), link: { type: 'url', href } });
  }

  for (const [i, hit] of (findKind(suggestions, 'promotions')?.hits ?? []).entries()) {
    const href = linkTargetOf(hit.url);
    // A promotion is a link and nothing else, so one without a usable target is left out.
    if (!href) continue;
    const alt = hit.image?.alt ?? hit.name;
    const sources = [
      ...(hit.image?.desktop ? [{ provider: 'raw', src: hit.image.desktop, responsive: 'desktop' as const }] : []),
      ...(hit.image?.mobile ? [{ provider: 'raw', src: hit.image.mobile, responsive: 'mobile' as const }] : []),
    ];
    entries.push({
      id: `promotion_suggestion_${i}`,
      type: 'promotion',
      title: hit.name,
      link: { type: 'url', href },
      ...(sources.length > 0 ? { cover: { type: 'image', alt, sources } } : {}),
    });
  }

  return { entries, productIds };
};

/** Maps BI's highlights (shown before the visitor typed) to search-term entries. */
export const mapHighlights = (highlights: HighlightsResponse): SuggestionEntry[] =>
  highlights.searches
    .filter((search): search is string => typeof search === 'string' && search.length > 0)
    .map((search, i) => ({ id: `query_suggestion_${i}`, type: 'query-suggestion', title: search, link: searchLink(search) }));
