import { createHmac, timingSafeEqual } from 'node:crypto';
import type { HttpClient } from './http-client';
import type { SendgoConfig, SendgoResponse, WebhookEvent, WebhookSubscriptionParams } from './types';

/**
 * 이벤트 웹훅 구독 — 등록·심사 결과를 밀어 받는다.
 *
 * v2 전용. 심사는 비동기라 폴링 말고는 방법이 없었다. 구독해 두면 상태가
 * 바뀔 때마다 도착한다.
 *
 * @example
 * const created = await sendgo.webhook.subscribe({
 *   url: 'https://reseller.example.com/hooks/sendgo',
 * });
 *
 * // 시크릿은 이 응답에서 한 번만 나온다. 즉시 저장한다.
 * const secret = created.data.secret;
 */
export class WebhookService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: Required<SendgoConfig>,
  ) {}

  /**
   * 현재 구독 설정. 마지막 전송 결과(`lastStatus`)도 함께 온다 — 내
   * 엔드포인트가 실제로 받고 있는지 확인할 수 있어야 한다.
   */
  async show(): Promise<SendgoResponse> {
    return this.http.get(this.url());
  }

  /**
   * 구독 생성·수정.
   *
   * `secret` 을 생략하면 서버가 만들어 **이 응답에서 한 번만** 돌려준다.
   * 이미 시크릿이 있는 상태에서 생략하면 기존 값을 유지한다 — URL 만 바꾸는
   * 호출이 서명 키를 날리지 않는다.
   *
   * `events` 를 생략하면 전체 구독이다.
   */
  async subscribe(params: WebhookSubscriptionParams): Promise<SendgoResponse> {
    return this.http.put(this.url(), { ...params });
  }

  /** 테스트 이벤트 발송. 구독 목록과 무관하게 도착하므로 배선 확인에 쓴다. */
  async test(): Promise<SendgoResponse> {
    return this.http.post(this.http.buildResourceUrl('webhook', 'test'), {});
  }

  /** 구독 해지. */
  async unsubscribe(): Promise<SendgoResponse> {
    return this.http.delete(this.url());
  }

  /**
   * 수신한 웹훅의 서명을 검증한다.
   *
   * **`rawBody` 는 받은 바이트 그대로**여야 한다. 파싱한 뒤 다시 인코딩한
   * 값으로 계산하면 키 순서나 이스케이프 차이로 검증이 깨진다. Express 라면
   * `express.raw({ type: 'application/json' })` 을 JSON 파서보다 먼저 건다.
   */
  static verifySignature(rawBody: string | Buffer, signature: string, secret: string): boolean {
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');

    // 길이가 다르면 timingSafeEqual 이 던진다 — 먼저 막는다.
    if (expected.length !== signature.length) return false;

    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }

  private url(): string {
    return this.http.buildResourceUrl('webhook');
  }
}

/** 구독할 수 있는 이벤트 목록. */
export const WEBHOOK_EVENTS: readonly WebhookEvent[] = [
  'sender.status_changed',
  'notice_template.inspection_status_changed',
  'kakao_sender.status_changed',
  'kakao_sender.brand_message_status_changed',
] as const;
