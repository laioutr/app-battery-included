import { describe, expect, it } from 'vitest';
import type { BrowseExtension } from '../../src/runtime/server/client/sdk/types';
import { findRedirect, mapTeasers } from '../../src/runtime/server/orchestr-helper/extensions';

const teaser = (id: string, data: Partial<Extract<BrowseExtension, { type: 'teaser' }>['data']>): BrowseExtension => ({
  id,
  type: 'teaser',
  data: { name: `Teaser ${id}`, position: 1, ...data },
});

describe('mapTeasers', () => {
  it('maps position, format, link and responsive image, ordered by position', () => {
    const teasers = mapTeasers([
      teaser('t2', { position: 7 }),
      teaser('t1', {
        position: 3,
        format: '2x1',
        url: '/sale',
        code: 'SALE',
        itemType: 'banner',
        image: { alt: 'Sale', desktop: 'https://cdn.test/d.jpg', mobile: 'https://cdn.test/m.jpg' },
      }),
      { id: 'r', type: 'redirects', data: { url: '/elsewhere' } },
    ]);

    expect(teasers).toEqual([
      {
        id: 't1',
        name: 'Teaser t1',
        position: 3,
        format: '2x1',
        rows: 2,
        columns: 1,
        link: { type: 'url', href: '/sale' },
        image: {
          type: 'image',
          alt: 'Sale',
          sources: [
            { provider: 'raw', src: 'https://cdn.test/d.jpg', responsive: 'desktop' },
            { provider: 'raw', src: 'https://cdn.test/m.jpg', responsive: 'mobile' },
          ],
        },
        code: 'SALE',
        itemType: 'banner',
      },
      { id: 't2', name: 'Teaser t2', position: 7, rows: 1, columns: 1 },
    ]);
  });

  it('spans one cell for a missing or malformed format', () => {
    expect(mapTeasers([teaser('t', { format: 'wide' })])[0]).toMatchObject({ format: 'wide', rows: 1, columns: 1 });
  });

  it('answers no teasers without extensions', () => {
    expect(mapTeasers(undefined)).toEqual([]);
  });
});

describe('findRedirect', () => {
  it('finds the redirect extension', () => {
    expect(findRedirect([teaser('t', {}), { id: 'r', type: 'redirects', data: { url: 'https://shop.test/service' } }])).toEqual({
      url: 'https://shop.test/service',
    });
  });

  it('answers undefined without one', () => {
    expect(findRedirect([teaser('t', {})])).toBeUndefined();
    expect(findRedirect()).toBeUndefined();
  });
});
