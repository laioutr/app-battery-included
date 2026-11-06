import type { Product } from '../client/types/product';

/** The id the commerce app knows a BI document's product by; BI's own `id` is the product number. */
export const productIdOf = (document: Pick<Product, 'id' | '_product'>): string => document._product?.id ?? document.id;
