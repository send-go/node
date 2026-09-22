import { SendgoError } from './errors';
export interface AccountResponse { message: string; data: Record<string, unknown> }

export interface AccountConfig {
  agentToken: string;
  baseUrl?: string;
}
export interface AllowedIpParams { ip: string; description?: string }
export interface ApiKeyCreateParams { name: string; ipAddresses?: AllowedIpParams[] }

/** 계정 설정 API. 서버 전용이며 발송용 accessKey/secretKey와 별도로 인증한다. */
export class AccountClient {
  private readonly baseUrl: string;
  private readonly agentToken: string;

  constructor(config: AccountConfig) {
    if (!config.agentToken?.trim()) throw new Error('Sendgo: agentToken은 필수입니다.');
    if ('window' in globalThis) throw new Error('Sendgo 계정 API는 서버에서만 사용하세요.');
    this.agentToken = config.agentToken;
    this.baseUrl = (config.baseUrl ?? 'https://sendgo.io').replace(/\/+$/, '');
  }

  /** 계정 상태와 다음 단계 조회. */
  me(): Promise<AccountResponse> {
    return this.request('GET', ``);
  }

  /** 조직 목록 조회. */
  organizations(): Promise<AccountResponse> {
    return this.request('GET', `organizations`);
  }

  /** 조직 선택. null은 개인 계정. */
  selectOrganization(organizationId: string | null): Promise<AccountResponse> {
    return this.request('POST', `organizations/select`, { organizationId: organizationId });
  }

  /** 현재 조직의 API 키 목록. */
  apiKeys(): Promise<AccountResponse> {
    return this.request('GET', `api-keys`);
  }

  /** API 키 발급. secretKey는 이 응답에서만 반환. */
  createApiKey(params: ApiKeyCreateParams): Promise<AccountResponse> {
    return this.request('POST', `api-keys`, params);
  }

  /** API 키 상세 조회. */
  apiKey(apiKeyId: string): Promise<AccountResponse> {
    return this.request('GET', `api-keys/${encodeURIComponent(apiKeyId)}`);
  }

  /** API 키 이름 변경. */
  updateApiKey(apiKeyId: string, name: string): Promise<AccountResponse> {
    return this.request('PATCH', `api-keys/${encodeURIComponent(apiKeyId)}`, { name: name });
  }

  /** API 키 폐기. */
  deleteApiKey(apiKeyId: string): Promise<AccountResponse> {
    return this.request('DELETE', `api-keys/${encodeURIComponent(apiKeyId)}`);
  }

  /** 승인된 API 키의 발송용 토큰 발급. */
  issueToken(apiKeyId: string): Promise<AccountResponse> {
    return this.request('POST', `api-keys/${encodeURIComponent(apiKeyId)}/token`, {  });
  }

  /** 허용 IP 목록과 호출자 IP 조회. */
  allowedIps(apiKeyId: string): Promise<AccountResponse> {
    return this.request('GET', `api-keys/${encodeURIComponent(apiKeyId)}/allowed-ips`);
  }

  /** 허용 IP 추가. ip와 선택적 description 사용. */
  addAllowedIp(apiKeyId: string, params: AllowedIpParams): Promise<AccountResponse> {
    return this.request('POST', `api-keys/${encodeURIComponent(apiKeyId)}/allowed-ips`, params);
  }

  /** 허용 IP 삭제. */
  deleteAllowedIp(apiKeyId: string, ipId: string): Promise<AccountResponse> {
    return this.request('DELETE', `api-keys/${encodeURIComponent(apiKeyId)}/allowed-ips/${encodeURIComponent(ipId)}`);
  }

  private async request(method: string, path: string, body?: object): Promise<AccountResponse> {
    const response = await fetch(`${this.baseUrl}/api/v2/account${path ? '/' + path : ''}`, {
      method,
      headers: { Authorization: `Bearer ${this.agentToken}`, Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: 'error',
      signal: AbortSignal.timeout(15000),
    });
    const data = await response.json().catch(() => ({})) as Record<string, unknown>;
    // 에이전트 토큰은 SDK가 갱신할 수 없다. 401/403도 재시도하지 않는다.
    if (!response.ok) throw SendgoError.fromResponse(response.status, data, path || 'account', 'v2');
    return data as unknown as AccountResponse;
  }
}
