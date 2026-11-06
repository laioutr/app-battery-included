/**
 * The locale Battery Included matches documents by. BI indexes a shop under language and region ("de-DE") and finds
 * nothing for the bare language ("de"), while a Laioutr language is often only that. So:
 *
 * - a locale set in the app's settings wins;
 * - a language that names its region ("de-CH") is sent as it is;
 * - otherwise the market's region completes it ("de" in a market for DE becomes "de-DE");
 * - without a region the language goes alone.
 */
export const biLocaleOf = (
  configured: string | undefined,
  language: { code: string; regionCode?: string },
  market: { regionCodes?: string[] }
): string => {
  const set = configured?.trim();
  if (set) return set;
  if (language.regionCode) return language.code;
  // ISO 3166-2 subdivisions ("DE-BY") name no country BI could index by.
  const region = (market.regionCodes ?? []).find((code) => /^[A-Za-z]{2}$/.test(code));
  return region ? `${language.code}-${region.toUpperCase()}` : language.code;
};
