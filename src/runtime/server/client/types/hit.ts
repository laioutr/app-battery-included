import { Product } from './product';

export type Highlight = {
  matched_tokens: Array<string>;
  snippet: string;
};

export interface Hit {
  document: Product;
  highlight: Record<string, Highlight>;
}
