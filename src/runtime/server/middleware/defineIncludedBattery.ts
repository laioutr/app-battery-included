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

    const batteryIncludedClient = batteryIncludedClientFactory({ locale: clientEnv.locale.split('-')[0] });

    return { context: { availableSortings, batteryIncludedClient } };
  });

export const defineBatteryIncludedAction = defineBatteryIncluded.actionHandler;
export const defineBatteryIncludedQuery = defineBatteryIncluded.queryHandler;
export const defineBatteryIncludedLink = defineBatteryIncluded.linkHandler;
export const defineBatteryIncludedComponentResolver = defineBatteryIncluded.componentResolver;
