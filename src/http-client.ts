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
    return this.doPost<T>(url, body, false);
  }

  private async doPost<T>(
    url: string,
    body: Record<string, unknown>,
    isRetry: boolean,
  ): Promise<T> {
    const token = await this.tokenManager.getToken();
    const authHeader = this.makeBearerAuth(token);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const responseBody = (await response.json().catch(() => ({}))) as Record<string, unknown>;

    if (!response.ok) {
      const errorCode = (responseBody.code as string) ?? null;
      const endpoint = url.split('/').pop() ?? url;

      if (!isRetry && this.tokenManager.shouldRefresh(response.status, errorCode)) {
        await this.tokenManager.invalidateAndRefresh();
        return this.doPost<T>(url, body, true);
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
}
