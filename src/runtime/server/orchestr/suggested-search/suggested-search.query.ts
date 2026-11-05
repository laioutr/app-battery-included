import { ProductSearchPage } from '@laioutr-core/canonical-types/ecommerce';
import { SuggestedSearchSearchQuery } from '@laioutr-core/canonical-types/suggested-search';
import { suggestionResultsFragmentToken } from '../../const/passthroughTokens';
import { unhtml } from '../../lib/unhtml';
import { defineBatteryIncludedQuery } from '../../middleware/defineIncludedBattery';

export default defineBatteryIncludedQuery({
  implements: SuggestedSearchSearchQuery,
  order: 2,
  run: async ({ context, input, passthrough }) => {
    const { batteryIncludedClient } = context;

    const { query } = input;

    const id = `search-suggest:${query ?? ''}`;

    if (!query) {
      const highlights = await batteryIncludedClient.highlights();

      passthrough.set(suggestionResultsFragmentToken, {
        id,
        suggestions: highlights.searches.map((search, i) => ({
          id: `query_suggestion_${i}`,
          type: 'query-suggestion',
          title: search,
          link: { type: 'pageType', pageType: ProductSearchPage, params: { q: '' } } as const,
        })),
      });

      return { id };
    }

    const suggestions = await batteryIncludedClient.suggest({ query });

    const queryCompletionResults = (suggestions.find((d) => d.kind === 'query-completion')?.hits ?? []).map((item, i) => ({
      id: `query_suggestion_${i}`,
      type: 'query-suggestion',
      title: item.value,
      link: { type: 'pageType', pageType: ProductSearchPage, params: { q: item.value } } as const,
    }));

    const productResults = (suggestions.find((d) => d.kind === 'document')?.hits.filter((hit) => !!hit.highlighted._product) ?? []).map(
      (item, i) => ({
        id: `product_suggestion_${i}`,
        type: 'product',
        title: unhtml(item.highlighted._product.name),
        link: { type: 'pageType', pageType: ProductSearchPage, params: { q: unhtml(item.highlighted._product.name) } } as const,
      })
    );

    const categoryResults = (suggestions.find((d) => d.kind === 'facet._product.categories')?.hits ?? []).map((item, i) => ({
      id: `category_suggestion_${i}`,
      type: 'category',
      title: item.value,
      link: { type: 'pageType', pageType: ProductSearchPage, params: { q: item.value } } as const,
    }));

    passthrough.set(suggestionResultsFragmentToken, {
      id,
      suggestions: [...queryCompletionResults, ...productResults, ...categoryResults],
    });

    return { id };
  },
});
