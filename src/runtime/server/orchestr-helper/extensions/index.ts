import type { BrowseExtension, RedirectExtension, TeaserExtension } from '../../client/sdk/types';
import type { MediaImage } from '@laioutr-core/core-types/common';

export interface Teaser {
  id: string;
  name: string;
  position: number;
  format?: string;
  rows: number;
  columns: number;
  link?: { type: 'url'; href: string };
  image?: MediaImage;
  code?: string;
  itemType?: string;
}

const isTeaser = (extension: BrowseExtension): extension is TeaserExtension =>
  extension.type === 'teaser' && typeof (extension.data as { position?: unknown }).position === 'number';

const isRedirect = (extension: BrowseExtension): extension is RedirectExtension =>
  extension.type === 'redirects' && typeof (extension.data as { url?: unknown }).url === 'string';

/** `<rows>x<columns>` to cell spans; a missing or malformed part spans one cell. */
const spanOf = (format: string | undefined) => {
  const [rows, columns] = (format ?? '').split('x').map(Number);
  const span = (value: number | undefined) => (value && Number.isInteger(value) && value > 0 ? value : 1);
  return { rows: span(rows), columns: span(columns) };
};

/** Maps BI's teaser extensions, ordered by position. Other extensions are left out. */
export const mapTeasers = (extensions: BrowseExtension[] = []): Teaser[] =>
  extensions
    .filter(isTeaser)
    .map(({ id, data }) => {
      const alt = data.image?.alt ?? data.name;
      const sources = [
        ...(data.image?.desktop ? [{ provider: 'raw', src: data.image.desktop, responsive: 'desktop' as const }] : []),
        ...(data.image?.mobile ? [{ provider: 'raw', src: data.image.mobile, responsive: 'mobile' as const }] : []),
      ];

      return {
        id,
        name: data.name,
        position: data.position,
        ...spanOf(data.format),
        ...(data.format ? { format: data.format } : {}),
        ...(data.url ? { link: { type: 'url' as const, href: data.url } } : {}),
        ...(sources.length > 0 ? { image: { type: 'image' as const, alt, sources } } : {}),
        ...(data.code ? { code: data.code } : {}),
        ...(data.itemType ? { itemType: data.itemType } : {}),
      };
    })
    .sort((a, b) => a.position - b.position);

/** The first redirect BI attaches, or `undefined`. */
export const findRedirect = (extensions: BrowseExtension[] = []): { url: string } | undefined => {
  const redirect = extensions.find(isRedirect);
  return redirect ? { url: redirect.data.url } : undefined;
};
