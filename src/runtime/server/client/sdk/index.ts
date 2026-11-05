import { BatteryIncludedApiError } from './errors';
import type {
  BrowseResponse,
  HighlightsResponse,
  RecommendationsResponse,
  SearchParams,
  SuggestResponse,
  WithDefaultParams,
} from './types';

/** How much of an error body is kept on the thrown error. */
const ERROR_BODY_LIMIT = 500;

/**
 * Builds the query string for a Battery Included request. Arrays are sent as repeated keys, so a
 * key that BI reads as a list must carry its own `[]` suffix (e.g. `f[brand][]`). `null` and
 * `undefined` values are left out.
 */
export const buildSearchParams = (locale: string, searchParams: SearchParams = {}) => {
  const requestSearchParams = new URLSearchParams();

  requestSearchParams.set('v[locale]', locale);

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const val of value) requestSearchParams.append(key, val);
    } else if (value !== undefined && value !== null) {
      requestSearchParams.set(key, value.toString());
    }
  }

  return requestSearchParams;
};

/**
 * Identical GET requests that are in flight at the same time share one fetch, so two handlers of
 * one page that ask the same question (e.g. a listing and its teasers) cost one BI call.
 */
const inFlight = new Map<string, Promise<unknown>>();

class BatteryIncludedSDK {
  private baseURL: string;
  private collection: string;
  private apiKey: string;
  private locale: string;

  constructor({ baseURL, collection, apiKey, locale }: { baseURL: string; collection: string; apiKey: string; locale: string }) {
    this.baseURL = baseURL;
    this.collection = collection;
    this.apiKey = apiKey;
    this.locale = locale;
  }

  private async call<T = null>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    endpoint: string,
    searchParams: SearchParams = {},
    payload: unknown = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api/v1/collections/${this.collection}${endpoint}?${buildSearchParams(this.locale, searchParams).toString()}`;

    const request = async () => {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-BI-API-KEY': this.apiKey },
        ...(method === 'GET' ? {} : { body: JSON.stringify(payload) }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new BatteryIncludedApiError(response.status, endpoint, body.slice(0, ERROR_BODY_LIMIT));
      }

      return (await response.json()) as T;
    };

    if (method !== 'GET') return request();

    const key = `${this.apiKey}\n${url}`;
    const pending = inFlight.get(key);
    if (pending) return pending as Promise<T>;

    const promise = request().finally(() => inFlight.delete(key));
    inFlight.set(key, promise);
    return promise;
  }

  /* Shortcut methods */

  private get = <T = null>(endpoint: string, searchParams: SearchParams) => this.call<T>('GET', endpoint, searchParams);

  private post = <T = null>(endpoint: string, searchParams: SearchParams, payload: unknown) =>
    this.call<T>('POST', endpoint, searchParams, payload);

  private patch = <T = null>(endpoint: string, searchParams: SearchParams, payload: unknown) =>
    this.call<T>('PATCH', endpoint, searchParams, payload);

  private delete = <T = null>(endpoint: string, searchParams: SearchParams, payload: unknown) =>
    this.call<T>('DELETE', endpoint, searchParams, payload);

  /* Endpoints implementation 🚀 */

  async browse({ query, page, per_page, sort, filters = {} }: WithDefaultParams<{ query: string }>) {
    return this.get<BrowseResponse>(`/documents/browse`, { q: query, page, per_page, sort, ...filters });
  }

  async highlights() {
    return this.get<HighlightsResponse>(`/documents/highlights`, {});
  }

  async suggest({ query }: { query: string }) {
    return this.get<SuggestResponse>(`/documents/suggest`, { q: query });
  }

  async recommend({ id }: { id: string }) {
    return this.get<RecommendationsResponse>('/documents/recommendations', { id });
  }
}

export default BatteryIncludedSDK;
