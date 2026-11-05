import { z } from 'zod/v4';
import { Link, MediaImage } from '@laioutr-core/core-types/common';
import { defineEntityComponentToken } from '@laioutr-core/core-types/orchestr';

/** A BI merchandising teaser for a product grid. */
export const TeaserBase = defineEntityComponentToken('base', {
  entityType: 'BatteryIncludedTeaser',
  schema: z.object({
    name: z.string(),
    /** 1-based index of the product on the current page the teaser is shown before. */
    position: z.number(),
    /** BI's size as `<rows>x<columns>`, e.g. `1x2`, as sent. */
    format: z.string().optional(),
    /** Grid rows the teaser spans, from `format`; 1 without one. */
    rows: z.number(),
    /** Grid columns the teaser spans, from `format`; 1 without one. */
    columns: z.number(),
    link: Link.optional(),
    /** Desktop and mobile sources where BI has both. */
    image: MediaImage.optional(),
    code: z.string().optional(),
    itemType: z.string().optional(),
  }),
});
