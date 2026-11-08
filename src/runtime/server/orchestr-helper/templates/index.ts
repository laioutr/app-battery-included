import { ProductsByCategoryIdQuery } from '@laioutr-core/canonical-types/ecommerce';
import type BatteryIncludedSDK from '../../client/sdk';
import type { Facet } from '../../client/types/facets';
import type { RemoteQueryTemplateWithInput } from '@laioutr-core/core-types/orchestr';

/** How many category presets Studio is offered for one term. */
export const CATEGORY_TEMPLATE_LIMIT = 50;

export interface CategoryOption {
  id: string;
  name: string;
}

/**
 * The categories of BI's category-tree facet, in BI's order. The facet on the field the listing filters
 * by holds the id as its value. Without it, another facet of the same tree (`…categoryTree.name`) is
 * read, which carries the id in `data.id`.
 */
export const categoriesOfFacets = (facets: Facet[], categoryIdField: string): CategoryOption[] => {
  const tree = categoryIdField.slice(0, categoryIdField.lastIndexOf('.') + 1);
  const idFacet = facets.find((facet) => facet.field_name === categoryIdField);
  const treeFacets = tree ? facets.filter((facet) => facet.field_name.startsWith(tree)) : [];
  const sources = idFacet ? [idFacet] : treeFacets;

  const categories = new Map<string, CategoryOption>();
  for (const facet of sources) {
    for (const count of facet.counts) {
      const id = facet === idFacet ? count.value : count.data?.id;
      if (!id || categories.has(id)) continue;
      categories.set(id, { id, name: count.data?.name ?? count.value });
    }
  }
  return [...categories.values()];
};

/**
 * Presets for `ProductsByCategoryIdQuery`: the categories whose name contains the term (any case) or
 * whose id is the term. A name that occurs twice in the list (`Sofas` under two parents) is labelled
 * with its id, since the flat facet has no path to tell them apart.
 */
export const categoryTemplatesOf = (
  categories: CategoryOption[],
  term: string | undefined,
  limit = CATEGORY_TEMPLATE_LIMIT
): RemoteQueryTemplateWithInput[] => {
  const needle = term?.trim().toLocaleLowerCase() ?? '';
  const matches =
    needle ?
      categories.filter((category) => category.name.toLocaleLowerCase().includes(needle) || category.id.toLocaleLowerCase() === needle)
    : categories;
  const shown = matches.slice(0, limit);

  const nameCounts = new Map<string, number>();
  for (const { name } of shown) nameCounts.set(name, (nameCounts.get(name) ?? 0) + 1);

  return shown.map(({ id, name }) => ({
    input: { categoryId: id },
    label: (nameCounts.get(name) ?? 0) > 1 ? `${name} (${id})` : name,
  }));
};

/**
 * Runs one browse for BI's facets and offers its categories as presets. Studio asks while the editor
 * types, so a failing BI answer costs the presets and nothing else.
 */
export const provideCategoryTemplates = async ({
  context,
  term,
}: {
  context: { batteryIncludedClient: BatteryIncludedSDK; fields: { categoryId: string } };
  term?: string;
}): Promise<RemoteQueryTemplateWithInput[]> => {
  try {
    const response = await context.batteryIncludedClient.browse({ page: 1, per_page: 1 });
    const categories = categoriesOfFacets(response.facet_counts ?? [], context.fields.categoryId);

    if (categories.length === 0) {
      console.warn(
        `[app-battery-included] no presets for ${ProductsByCategoryIdQuery}: BI's answer has no facet for ${context.fields.categoryId}`
      );
    }

    return categoryTemplatesOf(categories, term);
  } catch (error) {
    console.warn(`[app-battery-included] no presets for ${ProductsByCategoryIdQuery}: loading BI's categories failed`, error);
    return [];
  }
};

/** One preset for `ProductSearchQuery`: a search for the typed term. No term, no preset. */
export const searchTemplatesOf = (term: string | undefined): RemoteQueryTemplateWithInput[] => {
  const query = term?.trim();
  return query ? [{ input: { query }, label: `Search: ${query}` }] : [];
};
