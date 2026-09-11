import { SendgoError } from './errors';
import { TokenManager } from './token-manager';
import type { MultipartFile, SendgoConfig } from './types';

/**
 * `Blob` 과 `{ value, filename }` 을 모두 받는다. 파일명을 지정하지 않으면
 * 일부 서버가 첨부를 텍스트 필드로 읽어 검증에서 떨어진다.
 */
function appendFile(form: FormData, key: string, file: MultipartFile): void {
  if (typeof file === 'object' && file !== null && 'value' in file) {
    form.append(key, file.value, file.filename);
    return;
  }

  form.append(key, file as Blob);
}

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

  async put<T = Record<string, unknown>>(
    url: string,
    body: Record<string, unknown>,
  ): Promise<T> {
    return this.request<T>('PUT', url, body, false);
  }

  async patch<T = Record<string, unknown>>(
    url: string,
    body: Record<string, unknown>,
  ): Promise<T> {
    return this.request<T>('PATCH', url, body, false);
  }

  /**
   * `request()` drives the verb, so DELETE only needs to skip the body.
   */
  async delete<T = Record<string, unknown>>(url: string): Promise<T> {
    return this.request<T>('DELETE', url, undefined, false);
  }

  /**
   * multipart/form-data POST — 서류·이미지 첨부가 있는 관리 API 전용.
   *
   * 발신번호 등록과 이미지 템플릿은 JSON 으로 보낼 수 없다. multipart 에는
   * 배열도 불리언도 없으므로, 배열은 JSON 문자열로 눌러 보낸다 — 서버가
   * 그렇게 받아 읽는다.
   *
   * 파일 값은 `Blob`/`File` 을 받는다. Node 20+ 에서는
   * `new Blob([await readFile(path)])` 로 만들면 된다.
   */
  async postMultipart<T = Record<string, unknown>>(
    url: string,
    fields: Record<string, unknown> = {},
    files: Record<string, MultipartFile | MultipartFile[] | undefined> = {},
  ): Promise<T> {
    return this.multipartRequest<T>(url, fields, files, false);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
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

  private async multipartRequest<T>(
    url: string,
    fields: Record<string, unknown>,
    files: Record<string, MultipartFile | MultipartFile[] | undefined>,
    isRetry: boolean,
  ): Promise<T> {
    const token = await this.tokenManager.getToken();
    const form = new FormData();

    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined || value === null) continue;

      if (Array.isArray(value) || (typeof value === 'object' && !(value instanceof Blob))) {
        form.append(key, JSON.stringify(value));
      } else if (typeof value === 'boolean') {
        form.append(key, value ? '1' : '0');
      } else {
        form.append(key, String(value));
      }
    }

    for (const [key, file] of Object.entries(files)) {
      if (file === undefined || file === null) continue;

      // 같은 필드에 여러 파일을 붙일 때는 서버가 attachments[0], attachments[1]
      // 형태를 기대한다.
      if (Array.isArray(file)) {
        file.forEach((entry, index) => appendFile(form, `${key}[${index}]`, entry));
      } else {
        appendFile(form, key, file);
      }
    }

    // Content-Type 은 설정하지 않는다 — fetch 가 boundary 를 붙여 만든다.
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: this.makeBearerAuth(token), Accept: 'application/json' },
      body: form,
    });

    const responseBody = (await response.json().catch(() => ({}))) as Record<string, unknown>;

    if (!response.ok) {
      const errorCode = (responseBody.code as string) ?? null;
      const endpoint = url.split('/').pop() ?? url;

      if (!isRetry && this.tokenManager.shouldRefresh(response.status, errorCode)) {
        await this.tokenManager.invalidateAndRefresh();
        return this.multipartRequest<T>(url, fields, files, true);
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
