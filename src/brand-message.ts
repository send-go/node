import { HttpClient } from './http-client';
import type {
  BrandMessageListParams,
  BrandMessageParams,
  SendgoConfig,
  SendgoResponse,
} from './types';

/**
 * 카카오 브랜드메시지 전송 서비스.
 *
 * 브랜드메시지는 친구톡의 후속 채널로, 메시지 타입이 친구톡과 1:1 대응됩니다
 * (FT→BT, FI→BI, FW→BW, FL→BL, FC→BC, FM→BM, FP→BP, FA→BA).
 * `messageType` 에는 친구톡 코드를 그대로 넘기고, 변환은 서버가 처리합니다.
 *
 * 친구톡과 달리 채널 친구가 아닌 수신자에게도 보낼 수 있고(targeting='N'),
 * 수신 동의한 전체 채널 친구에게 동보 발송할 수 있습니다(targeting='F').
 *
 * @example
 * // 단건 발송 — 채널 친구 대상
 * await sendgo.brandMessage.send({
 *   targeting: 'M',
 *   messageType: 'FL',
 *   friendTemplateUuid: '9cd5460b-6458-4edc-9b11-c26d3013c340',
 *   contacts: [{ contact: '01012345678', var1: '29,000원' }],
 * });
 *
 * // 동보 발송 — 수신 동의한 전체 채널 친구 (contacts 불필요)
 * await sendgo.brandMessage.broadcast({
 *   messageType: 'FW',
 *   friendTemplateUuid: '9cd5460b-6458-4edc-9b11-c26d3013c340',
 * });
 */
export class BrandMessageService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: Required<SendgoConfig>,
  ) {}

  /**
   * 브랜드메시지를 전송합니다.
   *
   * `targeting` 이 'M' | 'N' | 'I' 이면 `contacts` 가 필요하고 응답 `data` 에
   * 발송 건수(`sentCount`)가 담깁니다. 'F' 는 동보 발송이라 `contacts` 없이
   * 접수 여부(`accepted`)만 반환됩니다 — 그 경우 broadcast() 가 더 명확합니다.
   *
   * @param params 브랜드메시지 전송 파라미터
   */
  async send(params: BrandMessageParams): Promise<SendgoResponse> {
    const body: Record<string, unknown> = {
      at: params.at ?? null,
      scheduleType: params.scheduleType ?? 'DIRECTLY',
      targeting: params.targeting ?? 'M',
      messageType: params.messageType ?? 'FT',
      friendTemplateUuid: params.friendTemplateUuid,
      content: params.content ?? null,
      buttons: params.buttons ?? [],
      imageUrl: params.imageUrl ?? null,
      imageLink: params.imageLink ?? null,
      adFlag: params.adFlag ?? 'Y',
      adult: params.adult ?? 'N',
      pushAlarm: params.pushAlarm ?? 'Y',
      header: params.header ?? null,
      coupon: params.coupon ?? null,
      item: params.item ?? null,
      commerce: params.commerce ?? null,
      list: params.list ?? null,
      head: params.head ?? null,
      tail: params.tail ?? null,
      video: params.video ?? null,
      additionalContent: params.additionalContent ?? null,
      friendGroupKey: params.friendGroupKey ?? null,
      replaceSms: params.replaceSms ?? 'N',
      smsSubject: params.replaceSms === 'Y' ? (params.smsSubject ?? null) : null,
      smsContent: params.replaceSms === 'Y' ? (params.smsContent ?? null) : null,
      rejectServiceId: params.rejectServiceId ?? null,
      webhooks: params.webhooks ?? [],
      kakaoSenderKey: this.config.kakaoSenderKey,
      senderKey: this.config.smsSenderKey,
    };

    // A broadcast has no recipient list — sending an empty `contacts` would be
    // rejected as an invalid request, so the key is omitted entirely.
    if (body.targeting !== 'F') {
      body.contacts = params.contacts ?? [];
    }

    const result = await this.http.post(this.http.buildUrl('brand-messages'), body);
    return { success: true, data: result };
  }

  /**
   * 동보 발송 — 수신 동의한 전체 채널 친구 (targeting='F').
   *
   * 수신자 목록은 카카오 측에서 확장하므로 `contacts` 를 넘기지 않습니다.
   * 결과는 campaigns() / campaign() 으로 확인합니다.
   */
  async broadcast(
    params: Omit<BrandMessageParams, 'targeting' | 'contacts'>,
  ): Promise<SendgoResponse> {
    return this.send({ ...params, targeting: 'F' });
  }

  /** 브랜드메시지 캠페인 목록을 조회합니다. */
  async campaigns(params: BrandMessageListParams = {}): Promise<SendgoResponse> {
    const result = await this.http.get(this.http.buildResourceUrl('brand-messages'), {
      from: params.from,
      to: params.to,
      count: params.count,
    });

    return { success: true, data: result };
  }

  /**
   * 브랜드메시지 캠페인 상세를 조회합니다.
   *
   * @param campaignId 발송 응답의 `campaignId` (UUID)
   */
  async campaign(campaignId: string): Promise<SendgoResponse> {
    const result = await this.http.get(
      this.http.buildResourceUrl('brand-messages', campaignId),
    );

    return { success: true, data: result };
  }
}
