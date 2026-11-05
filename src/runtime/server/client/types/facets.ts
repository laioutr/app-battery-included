export interface CountItem {
  count: number;
  value: string;
  /**
   * Extra data BI attaches to a value, e.g. `{ id, name }` on category-tree values. Not in every
   * index; read defensively.
   */
  data?: {
    id?: string;
    name?: string;
    /** A colour (CSS value) or image URL for a swatch facet, where the index provides one. */
    swatch?: string;
    color?: string;
    image?: string;
  };
}

export interface BaseFacet {
  counts: Array<CountItem>;
  type: 'range' | 'select';
  field_name: string;
  stats: { total_values: number };
  field_label: string;
  field_unit?: string;
}

export interface SelectFacet extends BaseFacet {
  type: 'select';
}

export interface RangeFacet extends BaseFacet {
  type: 'range';
  stats: {
    min: number;
    max: number;
    total_values: number;
  };
}

export type Facet = SelectFacet | RangeFacet;
