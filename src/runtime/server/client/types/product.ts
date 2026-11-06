export interface Product {
  /** BI's own id: the product number, not the id the commerce app knows the product by. */
  id: string;
  _product?: { id?: string };
  name: string;
  description: string;
}
