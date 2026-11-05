import { defineOrchestr } from '#imports';
import { name } from '../../../../package.json';
import batteryIncludedClientFactory from '../client';

export const defineBatteryIncluded = defineOrchestr
  .meta({
    app: name,
  })
  .extendRequest(({ clientEnv }) => {
    const availableSortings = [
      { key: 'price:asc', label: 'Price (asc)' },
      { key: 'price:desc', label: 'Price (desc)' },
    ];

    // BI indexes by ISO 639 language ("de"), the request carries a BCP 47 tag ("de-CH").
    const batteryIncludedClient = batteryIncludedClientFactory({ locale: clientEnv.language.code.split('-')[0]! });

    return { context: { availableSortings, batteryIncludedClient } };
  });

export const defineBatteryIncludedAction = defineBatteryIncluded.actionHandler;
export const defineBatteryIncludedQuery = defineBatteryIncluded.queryHandler;
export const defineBatteryIncludedLink = defineBatteryIncluded.linkHandler;
export const defineBatteryIncludedComponentResolver = defineBatteryIncluded.componentResolver;
