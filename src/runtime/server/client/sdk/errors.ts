/**
 * A non-2xx answer from the Battery Included API.
 *
 * Carries the HTTP status and the endpoint, so a caller can tell a rejected request (4xx, e.g. a
 * wrong API key or collection) from an outage (5xx). The response body is kept short: it is meant for
 * logs, not for display.
 */
export class BatteryIncludedApiError extends Error {
  override readonly name = 'BatteryIncludedApiError';

  constructor(
    readonly status: number,
    readonly endpoint: string,
    readonly body: string
  ) {
    super(`Battery Included ${endpoint} answered ${status}${body ? `: ${body}` : ''}`);
  }
}

/** Matches by name, not `instanceof`: a project may bundle its own copy of this module. */
export const isBatteryIncludedApiError = (value: unknown): value is BatteryIncludedApiError =>
  value instanceof Error && value.name === 'BatteryIncludedApiError' && typeof (value as { status?: unknown }).status === 'number';
