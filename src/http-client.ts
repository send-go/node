import { SendgoError } from './errors';
import { TokenManager } from './token-manager';
import type { SendgoConfig } from './types';

/**
 * Sendgo API HTTP 클라이언트.
 * Bearer 토큰 자동 첨부 및 401/403 시 토큰 갱신 후 1회 재시도.
 */
export class HttpClient {
  constructor(
    private readonly config: Required<SendgoConfig>,
    private readonly tokenManager: TokenManager,
  ) {}

  async post<T = Record<string, unknown>>(
    url: string,
    body: Record<string, unknown>,
  ): Promise<T> {
    return this.request<T>('POST', url, body, false);
  }

  /** GET with an optional query string — used by the campaign lookup endpoints. */
  async get<T = Record<string, unknown>>(
    url: string,
    query: Record<string, string | number | undefined> = {},
  ): Promise<T> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) params.append(key, String(value));
    }
    const search = params.toString();

    return this.request<T>('GET', search ? `${url}?${search}` : url, undefined, false);
  }

  /**
   * `request()` drives the verb, so DELETE only needs to skip the body.
   */
  async delete<T = Record<string, unknown>>(url: string): Promise<T> {
    return this.request<T>('DELETE', url, undefined, false);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'DELETE',
    url: string,
    body: Record<string, unknown> | undefined,
    isRetry: boolean,
  ): Promise<T> {
    const token = await this.tokenManager.getToken();
    const authHeader = this.makeBearerAuth(token);

    const headers: Record<string, string> = { Authorization: authHeader };
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    const response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const responseBody = (await response.json().catch(() => ({}))) as Record<string, unknown>;

    if (!response.ok) {
      const errorCode = (responseBody.code as string) ?? null;
      const endpoint = url.split('/').pop() ?? url;

      if (!isRetry && this.tokenManager.shouldRefresh(response.status, errorCode)) {
        await this.tokenManager.invalidateAndRefresh();
        return this.request<T>(method, url, body, true);
      }

      throw SendgoError.fromResponse(response.status, responseBody, endpoint, this.config.apiVersion);
    }

    return responseBody as T;
  }

  private makeBearerAuth(token: string): string {
    if (this.config.apiVersion === 'v2') {
      return `Bearer ${token}`;
    }
    // v1: Bearer base64(token)
    return `Bearer ${Buffer.from(token).toString('base64')}`;
  }

  buildUrl(resource: string): string {
    return `${this.config.baseUrl}/api/${this.config.apiVersion}/${resource}/send`;
  }

  /** Resource URL without the `/send` suffix, for list and detail lookups. */
  buildResourceUrl(resource: string, path = ''): string {
    const base = `${this.config.baseUrl}/api/${this.config.apiVersion}/${resource}`;
    return path ? `${base}/${path}` : base;
  }
}
