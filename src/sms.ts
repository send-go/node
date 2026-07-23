import { HttpClient } from './http-client';
import type { SendgoConfig, SendgoResponse, SmsParams } from './types';

/**
 * SMS / LMS / MMS 전송 서비스.
 *
 * @example
 * // SMS
 * await sendgo.sms.sendSms({
 *   content: '인증번호: 123456',
 *   contacts: [{ contact: '01012345678' }],
 * });
 *
 * // LMS
 * await sendgo.sms.sendLms({
 *   subject: '[공지사항]',
 *   content: '긴 내용...',
 *   contacts: [{ contact: '01012345678' }],
 * });
 */
export class SmsService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: Required<SendgoConfig>,
  ) {}

  /** SMS 전송 (90자 이하) */
  async sendSms(params: Omit<SmsParams, 'messageType'>): Promise<SendgoResponse> {
    return this.send({ ...params, messageType: 'SMS' });
  }

  /** LMS 전송 (장문, 2,000자 이하) */
  async sendLms(params: Omit<SmsParams, 'messageType'>): Promise<SendgoResponse> {
    return this.send({ ...params, messageType: 'LMS' });
  }

  /** MMS 전송 (멀티미디어) */
  async sendMms(params: Omit<SmsParams, 'messageType'>): Promise<SendgoResponse> {
    return this.send({ ...params, messageType: 'MMS' });
  }

  /** 메시지 유형을 직접 지정하여 전송 */
  async send(params: SmsParams): Promise<SendgoResponse> {
    const body: Record<string, unknown> = {
      campaignType: params.campaignType ?? 'MESSAGE',
      messageType: params.messageType ?? 'SMS',
      scheduleType: params.scheduleType ?? 'DIRECTLY',
      at: params.at ?? null,
      subject: params.subject ?? null,
      content: params.content,
      files: params.files ?? [],
      contacts: params.contacts,
      senderKey: this.config.smsSenderKey,
    };

    const result = await this.http.post(this.http.buildUrl('messages'), body);
    return { success: true, data: result };
  }
}
