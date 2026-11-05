export interface CountItem {
  count: number;
  value: string;
}

export interface BaseFacet {
  counts: Array<CountItem>;
  type: 'range' | 'select';
  field_name: string;
  stats: { total_values: number };
  field_label: string;
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
