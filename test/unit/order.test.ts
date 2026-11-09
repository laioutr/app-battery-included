import { describe, expect, it } from 'vitest';
import { inRequestedOrder } from '../../src/runtime/server/orchestr-helper/browse/order';

describe('inRequestedOrder', () => {
  it('puts the found ids in the order they were asked for', () => {
    expect(inRequestedOrder(['c', 'a', 'b'], ['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
  });

  it('leaves out nothing and keeps ids that were not asked for at the end, in their order', () => {
    expect(inRequestedOrder(['x', 'b', 'y', 'a'], ['a', 'b'])).toEqual(['a', 'b', 'x', 'y']);
  });

  it('ignores asked-for ids BI did not find', () => {
    expect(inRequestedOrder(['b'], ['a', 'b'])).toEqual(['b']);
  });
});
