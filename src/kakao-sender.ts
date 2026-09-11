import type { HttpClient } from './http-client';
import type {
  BrandMessageTargetType,
  KakaoSenderCreateParams,
  MultipartFile,
  SendgoConfig,
  SendgoResponse,
} from './types';

/**
 * 카카오 발신프로필(채널) 관리 — 등록 · 동기화 · 브랜드메시지 타겟팅 신청.
 *
 * v2 전용이며 **기업(Team) 소유 애플리케이션**만 사용할 수 있다.
 *
 * 채널 등록은 두 단계다. 카카오가 인증번호를 채널 관리자 **휴대폰으로 SMS
 * 발송**하므로 완전 무인 자동화는 불가능하다 — 사람이 문자를 받아
 * `create()` 에 넣어야 한다.
 *
 * @example
 * // 1단계 — 관리자 휴대폰으로 인증번호 발송 (응답에 번호는 없다)
 * await sendgo.kakaoSenders.requestToken('@my-channel', '01012345678');
 *
 * // 2단계 — 사람이 받은 인증번호로 발신프로필 생성
 * const created = await sendgo.kakaoSenders.create({
 *   token: '123456',
 *   yellowId: '@my-channel',
 *   phoneNumber: '01012345678',
 *   categoryCode: '001001',
 * });
 *
 * const kakaoSenderKey = created.data.sender.kakaoSenderKey;
 */
export class KakaoSenderService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: Required<SendgoConfig>,
  ) {}

  /**
   * 1단계 — 채널 인증번호 발송.
   *
   * 응답에 인증번호는 들어있지 않다. 카카오가 `phoneNumber` 로 SMS 를 보낸다.
   */
  async requestToken(yellowId: string, phoneNumber: string): Promise<SendgoResponse> {
    return this.http.post(this.url('token'), { yellowId, phoneNumber });
  }

  /**
   * 2단계 — 발신프로필 등록.
   *
   * 이미 등록된 채널을 다시 등록해도 오류가 아니다. 카카오가 같은 senderKey 를
   * 돌려주고 서버가 기존 행을 갱신한다.
   */
  async create(params: KakaoSenderCreateParams): Promise<SendgoResponse> {
    return this.http.post(this.url(), { ...params });
  }

  /** 목록 조회. */
  async list(): Promise<SendgoResponse> {
    return this.http.get(this.url());
  }

  /** 상세 조회. */
  async show(kakaoSenderKey: string): Promise<SendgoResponse> {
    return this.http.get(this.url(kakaoSenderKey));
  }

  /** 카테고리 조회. 등록 시 `categoryCode` 로 넣을 값이다. */
  async categories(categoryCode?: string): Promise<SendgoResponse> {
    return this.http.get(this.url('categories'), categoryCode ? { categoryCode } : {});
  }

  /**
   * 상태 동기화. 키를 주면 단건, 없으면 팀 전체.
   *
   * 채널이 카카오 쪽에서 차단·휴면되면 발송이 조용히 실패하기 시작한다.
   * 그 사실을 먼저 알 방법은 이 호출뿐이므로 하루 한 번 정도 돌리는 게 좋다.
   */
  async sync(kakaoSenderKey?: string): Promise<SendgoResponse> {
    const path = kakaoSenderKey ? `${encodeURIComponent(kakaoSenderKey)}/sync` : 'sync';
    return this.http.post(this.http.buildResourceUrl('kakao-senders', path), {});
  }

  /**
   * 브랜드메시지 M 신청에 필요한 광고성 정보 수신동의 증적자료 업로드.
   * jpg/png, 5MB 이하.
   */
  async uploadBrandMessageEvidence(
    kakaoSenderKey: string,
    evidence: MultipartFile,
  ): Promise<SendgoResponse> {
    return this.http.postMultipart(
      this.http.buildResourceUrl('kakao-senders', `${encodeURIComponent(kakaoSenderKey)}/brand-message/evidence`),
      {},
      { evidence },
    );
  }

  /**
   * 브랜드메시지 M(마케팅) / N(정보성) 사용 신청.
   *
   * 결과는 즉시 확정되지 않는다. 발신프로필의 `brandMessageStatus` 로 확인한다.
   */
  async applyBrandMessageTargeting(
    kakaoSenderKey: string,
    targetType: BrandMessageTargetType,
  ): Promise<SendgoResponse> {
    return this.http.post(
      this.http.buildResourceUrl('kakao-senders', `${encodeURIComponent(kakaoSenderKey)}/brand-message/apply`),
      { targetType },
    );
  }

  private url(segment?: string): string {
    return this.http.buildResourceUrl(
      'kakao-senders',
      segment ? encodeURIComponent(segment) : '',
    );
  }
}
