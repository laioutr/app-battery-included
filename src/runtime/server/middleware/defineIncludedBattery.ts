import { defineOrchestr, useRuntimeConfig } from '#imports';
import { name } from '../../../../package.json';
import batteryIncludedClientFactory from '../client';
import { biLocaleOf } from '../lib/locale';
import { DEFAULT_SORTINGS } from '../orchestr-helper/sorting';

export const defineBatteryIncluded = defineOrchestr
  .meta({
    app: name,
    label: 'Battery Included',
    logoUrl: '/app-battery-included/battery-included-logo.png',
  })
  .extendRequest(({ clientEnv }) => {
    const config = useRuntimeConfig()['@laioutr/app-battery-included'];
    const sortings = config.sortings ?? DEFAULT_SORTINGS;
    const facetOptions = { swatchFacets: config.swatchFacets ?? [] };
    const fields = {
      categoryId: config.fields?.categoryId ?? '_product_i18n.categoryTree.id',
      streamId: config.fields?.streamId ?? '_product.streamIds',
    };

    const batteryIncludedClient = batteryIncludedClientFactory({ locale: biLocaleOf(config.locale, clientEnv.language, clientEnv.market) });

    return { context: { sortings, facetOptions, fields, batteryIncludedClient } };
  });

export const defineBatteryIncludedAction = defineBatteryIncluded.actionHandler;
export const defineBatteryIncludedQuery = defineBatteryIncluded.queryHandler;
export const defineBatteryIncludedLink = defineBatteryIncluded.linkHandler;
export const defineBatteryIncludedComponentResolver = defineBatteryIncluded.componentResolver;
export const defineBatteryIncludedQueryTemplateProvider = defineBatteryIncluded.queryTemplateProvider;
