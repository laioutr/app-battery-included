import { defineOrchestr, useRuntimeConfig } from '#imports';
import { name } from '../../../../package.json';
import batteryIncludedClientFactory from '../client';
import { DEFAULT_SORTINGS } from '../orchestr-helper/sorting';

export const defineBatteryIncluded = defineOrchestr
  .meta({
    app: name,
  })
  .extendRequest(({ clientEnv }) => {
    const config = useRuntimeConfig()['@laioutr/app-battery-included'];
    const sortings = config.sortings ?? DEFAULT_SORTINGS;
    const facetOptions = { swatchFacets: config.swatchFacets ?? [] };

    // BI indexes by ISO 639 language ("de"), the request carries a BCP 47 tag ("de-CH").
    const batteryIncludedClient = batteryIncludedClientFactory({ locale: clientEnv.language.code.split('-')[0]! });

    return { context: { sortings, facetOptions, batteryIncludedClient } };
  });

export const defineBatteryIncludedAction = defineBatteryIncluded.actionHandler;
export const defineBatteryIncludedQuery = defineBatteryIncluded.queryHandler;
export const defineBatteryIncludedLink = defineBatteryIncluded.linkHandler;
export const defineBatteryIncludedComponentResolver = defineBatteryIncluded.componentResolver;
