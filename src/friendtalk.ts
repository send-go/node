import { HttpClient } from './http-client';
import type { FriendtalkParams, SendgoConfig, SendgoResponse } from './types';

/**
 * 카카오 친구톡 전송 서비스.
 *
 * @deprecated 친구톡은 카카오 정책에 따라 2025-12-31 종료되었습니다.
 * 2026-01-01 부터 친구톡 발송 요청은 카카오 측에서 브랜드메시지(자유형)로 자동 대체
 * 발송되므로, 이 서비스를 호출해도 실제로 나가는 것은 브랜드메시지입니다.
 * 신규 연동은 `sendgo.brandMessage` 를 사용하세요. 다만 자유 본문 타입(FT/FI/FW)을
 * 개별 수신자에게 보내는 경로는 아직 이 서비스뿐입니다 — 브랜드메시지 API 는 그
 * 조합에 `NOT_A_BRAND_MESSAGE` 를 반환합니다.
 * 메시지 타입은 1:1 대응됩니다 — FT→BT, FI→BI, FW→BW, FL→BL, FC→BC, FM→BM, FP→BP, FA→BA.
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
   *
   * @deprecated 2025-12-31 종료. `sendgo.brandMessage.send()` 를 사용하세요.
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
