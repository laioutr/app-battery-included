/**
 * A URL from BI that a storefront may render as a link or navigate to: a path on the storefront's own
 * origin (`/sofas`) or an http(s) URL. Anything else — `javascript:`, `data:`, a protocol-relative
 * `//host` — answers `undefined`, so content edited in BI cannot run script or leave by a crafted scheme.
 */
export const linkTargetOf = (url: unknown): string | undefined => {
  if (typeof url !== 'string') return undefined;
  const target = url.trim();
  if (target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/\\')) return target;
  try {
    const { protocol } = new URL(target);
    return protocol === 'https:' || protocol === 'http:' ? target : undefined;
  } catch {
    return undefined;
  }
};
