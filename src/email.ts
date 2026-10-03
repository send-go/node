import { TokenManager } from './token-manager';
import { SendgoError } from './errors';
import type { SendgoConfig } from './types';

/** 이메일 발송 본문. 첨부 content는 base64이며 to는 단일 주소입니다. */
export interface EmailSendParams extends Record<string, unknown> {
  from: string; to: string; subject: string; purpose: 'transactional' | 'marketing';
  text?: string; html?: string; reply_to?: string;
  idempotency_key: string;
  sender_name?: string; sender_address?: string; sender_contact?: string;
  attachments?: { name: string; type: string; content: string }[];
  send_ttl_seconds?: number; message_id?: string;
}
export type EmailResponse = Record<string, unknown> | unknown[] | null;
export type EmailQuery = Record<string, string | number | boolean | undefined>;

/** 서버 전용 이메일 API. 응답의 객체·배열·204를 그대로 보존합니다. */
export class EmailService {
  private constructor(private baseUrl: string, private tokenManager?: TokenManager,
    private credential?: string, private apiVersion = 'v2') {}

  static fromConfig(config: Required<SendgoConfig>, tokenManager: TokenManager): EmailService {
    return new EmailService(config.baseUrl, tokenManager, undefined, config.apiVersion);
  }
  /** 이메일 전용 credential ID/password. 앱 accessKey/secretKey와 다릅니다. */
  static withCredentials(id: string, password: string, baseUrl = 'https://sendgo.io'): EmailService {
    return new EmailService(baseUrl, undefined, Buffer.from(`${id}:${password}`).toString('base64'));
  }
  private async request(method: string, path: string, body?: Record<string, unknown>, query: EmailQuery = {}, raw = false, retry = false): Promise<any> {
    if (this.apiVersion !== 'v2') throw new Error('이메일 API는 apiVersion: v2가 필요합니다.');
    const prefix = this.credential === undefined ? 'email' : 'email-service';
    const params = new URLSearchParams();
    for (const [k,v] of Object.entries(query)) if (v !== undefined) params.append(k, String(v));
    const url = `${this.baseUrl.replace(/\/$/, '')}/api/v2/${prefix}/${path}${params.toString() ? '?' + params.toString() : ''}`;
    const auth = this.credential === undefined ? `Bearer ${await this.tokenManager!.getToken()}` : `Basic ${this.credential}`;
    const response = await fetch(url, { method, redirect: 'error', signal: AbortSignal.timeout(60000),
      headers: { Authorization: auth, Accept: 'application/json', ...(body ? {'Content-Type': 'application/json'} : {}) },
      body: body === undefined ? undefined : JSON.stringify(body) });
    const bytes = Buffer.from(await response.arrayBuffer());
    if (response.ok && raw) return bytes;
    let data: any = null;
    if (bytes.length) { try { data = JSON.parse(bytes.toString('utf8')); } catch { if (response.ok) throw new Error('이메일 JSON 응답 형식 오류'); } }
    if (!response.ok) {
      const error = data && !Array.isArray(data) && typeof data === 'object' ? data : {};
      if (!retry && this.credential === undefined && response.status === 401 && this.tokenManager!.shouldRefresh(response.status, error.code ?? null)) {
        await this.tokenManager!.invalidateAndRefresh();
        return this.request(method, path, body, query, raw, true);
      }
      throw SendgoError.fromResponse(response.status, error, path, 'v2');
    }
    return data;
  }
  /** GET /email/account */
  account(query: EmailQuery = {}): Promise<EmailResponse> {
    return this.request('GET', `account`, undefined, query, false);
  }
  /** POST /email/request */
  requestAccess(body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `request`, { ...body }, {}, false);
  }
  /** POST /email/credentials */
  createCredential(body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `credentials`, { ...body }, {}, false);
  }
  /** GET /email/credentials */
  credentials(query: EmailQuery = {}): Promise<EmailResponse> {
    return this.request('GET', `credentials`, undefined, query, false);
  }
  /** DELETE /email/credentials/{id} */
  revokeCredential(id: string): Promise<EmailResponse> {
    return this.request('DELETE', `credentials/${encodeURIComponent(id)}`, undefined, {}, false);
  }
  /** GET /email/domains */
  domains(query: EmailQuery = {}): Promise<EmailResponse> {
    return this.request('GET', `domains`, undefined, query, false);
  }
  /** POST /email/domains */
  registerDomain(body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `domains`, { ...body }, {}, false);
  }
  /** POST /email/domains/{id}/verify */
  verifyDomain(id: string, body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `domains/${encodeURIComponent(id)}/verify`, { ...body }, {}, false);
  }
  /** GET /email/senders */
  senders(query: EmailQuery = {}): Promise<EmailResponse> {
    return this.request('GET', `senders`, undefined, query, false);
  }
  /** POST /email/senders */
  requestSender(body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `senders`, { ...body }, {}, false);
  }
  /** POST /email/senders/{id}/verify */
  verifySender(id: string, body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `senders/${encodeURIComponent(id)}/verify`, { ...body }, {}, false);
  }
  /** POST /email/recipients/verification */
  requestRecipientVerification(body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `recipients/verification`, { ...body }, {}, false);
  }
  /** POST /email/recipients/check */
  checkRecipients(body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `recipients/check`, { ...body }, {}, false);
  }
  /** GET /email/address-book */
  addressBook(query: EmailQuery = {}): Promise<EmailResponse> {
    return this.request('GET', `address-book`, undefined, query, false);
  }
  /** GET /email/sender-profiles */
  senderProfiles(query: EmailQuery = {}): Promise<EmailResponse> {
    return this.request('GET', `sender-profiles`, undefined, query, false);
  }
  /** POST /email/sender-profiles */
  createSenderProfile(body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `sender-profiles`, { ...body }, {}, false);
  }
  /** PATCH /email/sender-profiles/{id} */
  updateSenderProfile(id: string, body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('PATCH', `sender-profiles/${encodeURIComponent(id)}`, { ...body }, {}, false);
  }
  /** DELETE /email/sender-profiles/{id} */
  deleteSenderProfile(id: string): Promise<EmailResponse> {
    return this.request('DELETE', `sender-profiles/${encodeURIComponent(id)}`, undefined, {}, false);
  }
  /** POST /email/address-book/import */
  importAddressBook(body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `address-book/import`, { ...body }, {}, false);
  }
  /** POST /email/address-book/preferences */
  updateAddressBookPreferences(body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `address-book/preferences`, { ...body }, {}, false);
  }
  /** POST /email/send */
  send(body: EmailSendParams): Promise<EmailResponse> {
    return this.request('POST', `send`, { ...body }, {}, false);
  }
  /** POST /email/quote */
  quote(body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `quote`, { ...body }, {}, false);
  }
  /** GET /email/messages */
  messages(query: EmailQuery = {}): Promise<EmailResponse> {
    return this.request('GET', `messages`, undefined, query, false);
  }
  /** GET /email/messages/{id} */
  message(id: string, query: EmailQuery = {}): Promise<EmailResponse> {
    return this.request('GET', `messages/${encodeURIComponent(id)}`, undefined, query, false);
  }
  /** POST /email/messages/{id}/cancel */
  cancelMessage(id: string, body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `messages/${encodeURIComponent(id)}/cancel`, { ...body }, {}, false);
  }
  /** GET /email/inboxes */
  inboxes(query: EmailQuery = {}): Promise<EmailResponse> {
    return this.request('GET', `inboxes`, undefined, query, false);
  }
  /** POST /email/inboxes */
  createInbox(body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `inboxes`, { ...body }, {}, false);
  }
  /** PATCH /email/inboxes/{id} */
  updateInbox(id: string, body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('PATCH', `inboxes/${encodeURIComponent(id)}`, { ...body }, {}, false);
  }
  /** GET /email/inboxes/{id}/messages */
  inboxMessages(id: string, query: EmailQuery = {}): Promise<EmailResponse> {
    return this.request('GET', `inboxes/${encodeURIComponent(id)}/messages`, undefined, query, false);
  }
  /** GET /email/inboxes/{id}/messages/{messageId} */
  inboxMessage(id: string, messageId: string, query: EmailQuery = {}): Promise<EmailResponse> {
    return this.request('GET', `inboxes/${encodeURIComponent(id)}/messages/${encodeURIComponent(messageId)}`, undefined, query, false);
  }
  /** GET /email/inboxes/{id}/messages/{messageId}/raw */
  rawMessage(id: string, messageId: string, query: EmailQuery = {}): Promise<Buffer> {
    return this.request('GET', `inboxes/${encodeURIComponent(id)}/messages/${encodeURIComponent(messageId)}/raw`, undefined, query, true);
  }
  /** DELETE /email/inboxes/{id}/messages/{messageId} */
  deleteInboxMessage(id: string, messageId: string): Promise<EmailResponse> {
    return this.request('DELETE', `inboxes/${encodeURIComponent(id)}/messages/${encodeURIComponent(messageId)}`, undefined, {}, false);
  }
  /** GET /email/templates */
  templates(query: EmailQuery = {}): Promise<EmailResponse> {
    return this.request('GET', `templates`, undefined, query, false);
  }
  /** GET /email/templates/{id} */
  template(id: string, query: EmailQuery = {}): Promise<EmailResponse> {
    return this.request('GET', `templates/${encodeURIComponent(id)}`, undefined, query, false);
  }
  /** POST /email/templates */
  createTemplate(body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `templates`, { ...body }, {}, false);
  }
  /** PATCH /email/templates/{id} */
  updateTemplate(id: string, body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('PATCH', `templates/${encodeURIComponent(id)}`, { ...body }, {}, false);
  }
  /** DELETE /email/templates/{id} */
  deleteTemplate(id: string): Promise<EmailResponse> {
    return this.request('DELETE', `templates/${encodeURIComponent(id)}`, undefined, {}, false);
  }
  /** GET /email/contacts */
  contacts(query: EmailQuery = {}): Promise<EmailResponse> {
    return this.request('GET', `contacts`, undefined, query, false);
  }
  /** POST /email/contacts */
  saveContact(body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `contacts`, { ...body }, {}, false);
  }
  /** POST /email/contacts/import */
  importContacts(body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `contacts/import`, { ...body }, {}, false);
  }
  /** POST /email/contacts/{id}/unsubscribe */
  unsubscribeContact(id: string, body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `contacts/${encodeURIComponent(id)}/unsubscribe`, { ...body }, {}, false);
  }
  /** GET /email/campaigns */
  campaigns(query: EmailQuery = {}): Promise<EmailResponse> {
    return this.request('GET', `campaigns`, undefined, query, false);
  }
  /** POST /email/campaigns */
  createCampaign(body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `campaigns`, { ...body }, {}, false);
  }
  /** GET /email/campaigns/{id} */
  campaign(id: string, query: EmailQuery = {}): Promise<EmailResponse> {
    return this.request('GET', `campaigns/${encodeURIComponent(id)}`, undefined, query, false);
  }
  /** POST /email/campaigns/{id}/quote */
  quoteCampaign(id: string, body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `campaigns/${encodeURIComponent(id)}/quote`, { ...body }, {}, false);
  }
  /** POST /email/campaigns/{id}/send */
  sendCampaign(id: string, body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `campaigns/${encodeURIComponent(id)}/send`, { ...body }, {}, false);
  }
  /** POST /email/campaigns/{id}/cancel */
  cancelCampaign(id: string, body: Record<string, unknown> = {}): Promise<EmailResponse> {
    return this.request('POST', `campaigns/${encodeURIComponent(id)}/cancel`, { ...body }, {}, false);
  }
  /** GET /email/auth */
  auth(query: EmailQuery = {}): Promise<EmailResponse> {
    return this.request('GET', `auth`, undefined, query, false);
  }
}
