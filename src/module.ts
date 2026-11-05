/* eslint-disable import-x/export, @typescript-eslint/no-empty-object-type */
import { createResolver, defineNuxtModule, installModule } from '@nuxt/kit';
import { defu } from 'defu';
import { registerLaioutrApp } from '@laioutr-core/kit';
import type { NuxtModule } from '@nuxt/schema';
import { name, version } from '../package.json';

/**
 * The options the module adds to the nuxt.config.ts.
 */
export interface ModuleOptions {
  baseURL?: string;
  collection: string;
  apiKey: string;
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
