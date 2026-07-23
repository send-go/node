import { HttpClient } from './http-client';
import type { FriendtalkParams, SendgoConfig, SendgoResponse } from './types';

/**
 * 카카오 친구톡 전송 서비스.
 *
 * @example
 * await sendgo.friendtalk.send({
 *   content: '안녕하세요! 이번 주 특가 상품을 확인하세요.',
 *   contacts: [{ contact: '01012345678' }],
 * });
 */
export class FriendtalkService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: Required<SendgoConfig>,
  ) {}

  /**
   * 친구톡을 전송합니다.
   * @param params 친구톡 전송 파라미터
   */
  async send(params: FriendtalkParams): Promise<SendgoResponse> {
    const body: Record<string, unknown> = {
      at: params.at ?? null,
      scheduleType: params.scheduleType ?? 'DIRECTLY',
      messageType: params.messageType ?? 'FT',
      content: params.content,
      buttons: params.buttons ?? [],
      image: null,
      imageUrl: params.imageUrl ?? null,
      imageLink: params.imageLink ?? null,
      adFlag: params.adFlag ?? 'Y',
      wide: params.wide ?? 'N',
      adult: params.adult ?? 'N',
      header: params.header ?? null,
      replaceSms: params.replaceSms ?? 'N',
      smsSubject: params.replaceSms === 'Y' ? (params.smsSubject ?? null) : null,
      smsContent: params.replaceSms === 'Y' ? (params.smsContent ?? null) : null,
      contacts: params.contacts,
      kakaoSenderKey: this.config.kakaoSenderKey,
      senderKey: this.config.smsSenderKey,
    };

    const result = await this.http.post(this.http.buildUrl('friends'), body);
    return { success: true, data: result };
  }
}
