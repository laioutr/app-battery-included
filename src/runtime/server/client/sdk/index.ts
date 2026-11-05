import { BrowseResponse, HighlightsResponse, RecommendationsResponse, SearchParams, SuggestResponse, WithDefaultParams } from './types';

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
    const requestSearchParams = new URLSearchParams();

    requestSearchParams.set('v[locale]', this.locale);

    for (const searchParam in searchParams) {
      if (Array.isArray(searchParams[searchParam])) {
        for (const val of searchParams[searchParam]) {
          requestSearchParams.append(searchParam, val);
        }
      } else if (searchParams[searchParam] !== undefined && searchParams[searchParam] !== null) {
        requestSearchParams.set(searchParam, searchParams[searchParam].toString());
      }
    }
    const response = await fetch(`${this.baseURL}/api/v1/collections/${this.collection}${endpoint}?${requestSearchParams.toString()}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-BI-API-KEY': this.apiKey },
      ...(method === 'GET' ? {} : { body: JSON.stringify(payload) }),
    });

    const data = (await response.json()) as T;

    return data;
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
