import { HttpClient } from './http-client';
import type { AlimtalkParams, SendgoConfig, SendgoResponse } from './types';

/**
 * 카카오 알림톡 전송 서비스.
 *
 * @example
 * await sendgo.alimtalk.send({
 *   templateCode: 'ORDER_CONFIRM_001',
 *   contacts: [{ contact: '01012345678', var1: 'ORD-001' }],
 * });
 */
export class AlimtalkService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: Required<SendgoConfig>,
  ) {}

  /**
   * 알림톡을 전송합니다.
   * @param params 알림톡 전송 파라미터
   */
  async send(params: AlimtalkParams): Promise<SendgoResponse> {
    const body: Record<string, unknown> = {
      at: params.at ?? null,
      scheduleType: params.scheduleType ?? 'DIRECTLY',
      templateCode: params.templateCode,
      replaceSms: params.replaceSms ?? 'N',
      smsSubject: params.replaceSms === 'Y' ? (params.smsSubject ?? null) : null,
      smsContent: params.replaceSms === 'Y' ? (params.smsContent ?? null) : null,
      contacts: params.contacts,
      kakaoSenderKey: this.config.kakaoSenderKey,
      senderKey: this.config.smsSenderKey,
    };

    const result = await this.http.post(this.http.buildUrl('notices'), body);
    return { success: true, data: result };
  }
}
