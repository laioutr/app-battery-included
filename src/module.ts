/* eslint-disable import-x/export, @typescript-eslint/no-empty-object-type */
import { createResolver, defineNuxtModule, installModule } from '@nuxt/kit';
import { defu } from 'defu';
import { registerLaioutrApp } from '@laioutr-core/kit';
import type { BatteryIncludedSorting } from './runtime/server/orchestr-helper/sorting';
import type { NuxtModule } from '@nuxt/schema';
import { name, version } from '../package.json';

/**
 * The options the module adds to the nuxt.config.ts.
 */
export interface ModuleOptions {
  baseURL?: string;
  collection: string;
  apiKey: string;
  /**
   * The sortings listings offer, in this order. Replaces the defaults: relevance, price ascending and
   * descending, top sellers (`_history.salesCount`) and newest (`_common.releaseDate`).
   */
  sortings?: BatteryIncludedSorting[];
  /**
   * BI field names whose filter values are shown as swatches, e.g. `_product_i18n.properties.Farbe`.
   * A facet whose values carry a colour or image from BI is a swatch facet without being listed.
   */
  swatchFacets?: string[];
  /** BI fields the listings filter by. Defaults fit BI's Shopware export. */
  fields?: {
    /** @default '_product_i18n.categoryTree.id' */
    categoryId?: string;
    /** @default '_product.streamIds' */
    streamId?: string;
  };
}

/**
 * The config the module adds to nuxt.runtimeConfig.public['@laioutr/app-battery-included']
 */
export interface RuntimeConfigModulePublic {}

/**
 * The config the module adds to nuxt.runtimeConfig['@laioutr/app-battery-included']
 */
export interface RuntimeConfigModulePrivate extends ModuleOptions {}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: name,
  },
  defaults: {
    baseURL: 'https://api.batteryincluded.io',
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);
    const resolveRuntimeModule = (path: string) => resolve('./runtime', path);

    nuxt.options.build.transpile.push(resolve('./runtime'));

    // Runtime configuration for this module
    nuxt.options.runtimeConfig[name] = defu(nuxt.options.runtimeConfig[name] as Partial<ModuleOptions> | undefined, options);

    await registerLaioutrApp({
      name,
      version,
      orchestrDirs: [resolveRuntimeModule('server/orchestr')],
    });

    // Install peer-dependency modules only on prepare-step. Needs to be added in the playground as well.
    // No commerce app is installed here: the host project brings the one that resolves the product ids.
    if (nuxt.options._prepare) {
      const modulesToInstall = ['@laioutr-core/frontend-core', '@nuxt/image'];

      for (const module of modulesToInstall) await installModule(module);
    }

    // Shared
    // Imports and other stuff which is shared between client and server

    // Client
    // Add plugins, composables, etc.

    // Server
    // Add server-only imports, etc.
  },
});

export default module;

export * from './globalExtensions';
