import { describe, expect, it } from 'vitest';

import { linkTargetOf } from '../../src/runtime/server/lib/linkTarget';
import { findRedirect, mapTeasers } from '../../src/runtime/server/orchestr-helper/extensions';

describe('linkTargetOf', () => {
  it('keeps a path on the storefront and an http(s) URL', () => {
    expect(linkTargetOf('/sofas')).toBe('/sofas');
    expect(linkTargetOf('https://shop.example.com/p/1')).toBe('https://shop.example.com/p/1');
  });

  it('refuses script, data, protocol-relative and anything that is not a string', () => {
    for (const url of ['javascript:alert(1)', ' JavaScript:alert(1)', 'data:text/html,x', '//evil.example', '/\\evil.example', 'mailto:a@b', 42, null]) {
      expect(linkTargetOf(url)).toBeUndefined();
    }
  });
});

describe('BI links in extensions', () => {
  it('skips an extension without data instead of failing the answer', () => {
    const broken = [{ id: 'x', type: 'teaser', data: null }, { id: 'y', type: 'redirects', data: null }] as never;
    expect(mapTeasers(broken)).toEqual([]);
    expect(findRedirect(broken)).toBeUndefined();
  });

  it('drops a teaser link BI sends as script', () => {
    const [teaser] = mapTeasers([{ id: 't', type: 'teaser', data: { name: 'Sale', position: 1, url: 'javascript:alert(1)' } }]);
    expect(teaser!.link).toBeUndefined();
  });

  it('skips a redirect to a crafted scheme and takes the next usable one', () => {
    expect(
      findRedirect([
        { id: 'a', type: 'redirects', data: { url: 'javascript:alert(1)' } },
        { id: 'b', type: 'redirects', data: { url: '/service/lieferung' } },
      ])
    ).toEqual({ url: '/service/lieferung' });
  });
});
