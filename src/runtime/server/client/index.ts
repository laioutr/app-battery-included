import BatteryIncludedSDK from './sdk';
import { useRuntimeConfig } from '#imports';

export default function batteryIncludedClientFactory({ locale }: { locale: string }) {
  const { baseURL, collection, apiKey } = useRuntimeConfig()['@laioutr/app-battery-included'];

  return new BatteryIncludedSDK({ baseURL: baseURL!, collection, apiKey, locale });
}
