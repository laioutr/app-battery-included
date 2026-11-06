import { describe, expect, it } from 'vitest';

import { biLocaleOf } from '../../src/runtime/server/lib/locale';

describe('biLocaleOf', () => {
  it('completes a bare language with the market’s country', () => {
    expect(biLocaleOf(undefined, { code: 'de', regionCode: '' }, { regionCodes: ['DE'] })).toBe('de-DE');
  });

  it('keeps a language that names its region', () => {
    expect(biLocaleOf(undefined, { code: 'de-CH', regionCode: 'CH' }, { regionCodes: ['DE'] })).toBe('de-CH');
  });

  it('prefers the locale set in the settings', () => {
    expect(biLocaleOf(' de-DE ', { code: 'en', regionCode: '' }, { regionCodes: ['GB'] })).toBe('de-DE');
  });

  it('ignores an empty setting', () => {
    expect(biLocaleOf('  ', { code: 'de', regionCode: '' }, { regionCodes: ['AT'] })).toBe('de-AT');
  });

  it('skips a subdivision and uses the first country', () => {
    expect(biLocaleOf(undefined, { code: 'de', regionCode: '' }, { regionCodes: ['DE-BY', 'de'] })).toBe('de-DE');
  });

  it('sends the language alone when the market names no country', () => {
    expect(biLocaleOf(undefined, { code: 'de', regionCode: '' }, { regionCodes: [] })).toBe('de');
    expect(biLocaleOf(undefined, { code: 'de' }, {})).toBe('de');
  });
});
