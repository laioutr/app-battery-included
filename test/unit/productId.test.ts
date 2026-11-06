import { describe, expect, it } from 'vitest';

import { productIdOf } from '../../src/runtime/server/lib/productId';

describe('productIdOf', () => {
  it('answers the commerce id, not BI’s product number', () => {
    expect(productIdOf({ id: '31196400', _product: { id: '5ef52f618fd18e6685629fdb8a865b94' } })).toBe('5ef52f618fd18e6685629fdb8a865b94');
  });

  it('falls back to BI’s id for an index without a commerce id', () => {
    expect(productIdOf({ id: '31196400' })).toBe('31196400');
  });
});
