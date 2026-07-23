import { SendgoError } from './errors';
import type { SendgoConfig } from './types';

const NO_REFRESH_CODES = new Set([
  'INVALID_AUTH_HEADER',
  'INVALID_BASIC_AUTH',
  'INVALID_BASIC_AUTH_PAYLOAD',
  'INVALID_ACCESS_KEY',
  'INVALID_SECRET_KEY',
  'ACCESS_KEY_NOT_APPROVED',
  'TEAM_REQUIRED_FOR_KAKAO',
  'IP_NOT_ALLOWED',
  'INVALID_SENDER_KEY',
  'INVALID_KAKAO_SENDER_KEY',
]);

const TOKEN_TTL_MS = 50 * 60 * 1000; // 50분

/**
 * Sendgo API 토큰을 관리합니다.
 * - 50분 인메모리 캐시
 * - 401/403 응답 시 자동 갱신 (hard-fail 코드 제외)
 */
export class TokenManager {
  private cachedToken: string | null = null;
  private expiresAt: number = 0;
  private fetchingPromise: Promise<string> | null = null;

  constructor(private readonly config: Required<SendgoConfig>) {}

  /** 유효한 토큰을 반환합니다. 필요 시 자동으로 새 토큰을 발급받습니다. */
  async getToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.expiresAt) {
      return this.cachedToken;
    }
    return this.refreshToken();
  }

  /** 캐시된 토큰을 무효화하고 새 토큰을 발급받습니다. */
  async invalidateAndRefresh(): Promise<string> {
    this.cachedToken = null;
    this.expiresAt = 0;
    return this.refreshToken();
  }

  /** 주어진 에러 코드/상태에 대해 토큰 갱신을 시도해야 하는지 판단합니다. */
  shouldRefresh(statusCode: number, errorCode: string | null): boolean {
    if (statusCode !== 401 && statusCode !== 403) return false;
    if (this.config.apiVersion === 'v2' && errorCode && NO_REFRESH_CODES.has(errorCode)) {
      return false;
    }
    return true;
  }

  private refreshToken(): Promise<string> {
    // 동시 요청이 여러 개여도 토큰 발급은 한 번만
    if (!this.fetchingPromise) {
      this.fetchingPromise = this.fetchToken().finally(() => {
        this.fetchingPromise = null;
      });
    }
    return this.fetchingPromise;
  }

  private async fetchToken(): Promise<string> {
    const url = `${this.config.baseUrl}/api/${this.config.apiVersion}/token`;
    const credentials = Buffer.from(
      `${this.config.accessKey}:${this.config.secretKey}`,
    ).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${credentials}`,
      },
    });

    const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;

    if (!response.ok) {
      throw SendgoError.fromResponse(response.status, body, 'token', this.config.apiVersion);
    }

    const data = body.data as Record<string, unknown> | undefined;
    const token = data?.token as string | undefined;

    if (!token) {
      throw new SendgoError({
        message: 'SendGo 토큰 발급 실패: token 필드가 응답에 없습니다.',
        statusCode: response.status,
        errorCode: null,
        endpoint: 'token',
        apiVersion: this.config.apiVersion,
        responseBody: body,
      });
    }

    this.cachedToken = token;
    this.expiresAt = Date.now() + TOKEN_TTL_MS;
    return token;
  }
}
