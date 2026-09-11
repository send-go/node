import type { HttpClient } from './http-client';
import type {
  SendgoConfig,
  SendgoResponse,
  SenderNumberType,
  SenderRegistrationFiles,
  SenderRegistrationParams,
} from './types';

/**
 * 발신번호(문자) 등록 · 심사 접수.
 *
 * v2 전용. 카카오와 달리 **개인 계정 애플리케이션도** 쓸 수 있다.
 *
 * 등록하면 곧바로 쓸 수 있는 게 아니라 `PENDING` 으로 **접수**되고, 운영자
 * 승인 후 `SUCCESS` 가 된다.
 *
 * 콘솔은 휴대폰 계열(`personal_mobile`, `team_representative_mobile`,
 * `team_emp_mobile`)에 PASS 본인인증을 요구한다. API 에는 그 화면이 없으므로
 * **신분증 사본(`identityDocument`)을 받아 sendgo 운영자가 직접 확인**한다 —
 * 모든 유형을 API 로 접수할 수 있다.
 *
 * 이 경로로 접수된 건은 응답의 `identityVerificationMethod` 가 `document` 이고
 * **자동 승인되지 않는다.**
 */
export class SenderRegistrationService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: Required<SendgoConfig>,
  ) {}

  /** 목록 조회. 심사 상태(`status`)를 여기서 확인한다. */
  async list(): Promise<SendgoResponse> {
    return this.http.get(this.url());
  }

  /** 상세 조회. */
  async show(senderKey: string): Promise<SendgoResponse> {
    return this.http.get(this.url(senderKey));
  }

  /**
   * 계정 종류에 맞는 발신번호 유형과 유형별 필수 서류.
   *
   * 유형별 `identityVerification`(`none`/`document`)과 필요한 서류 목록을 준다.
   */
  async numberTypes(): Promise<SendgoResponse> {
    return this.http.get(this.url('number-types'));
  }

  /**
   * 등록 전 형식·중복 확인.
   *
   * 응답의 `duplicationReasonRequired` 가 true 면 `create()` 에
   * `duplicationReason` 을 함께 넣어야 한다.
   */
  async validate(phoneE164: string, senderNumberType: SenderNumberType): Promise<SendgoResponse> {
    return this.http.post(this.url('validate'), { phoneE164, senderNumberType });
  }

  /** 등록 신청. 서류가 붙으므로 multipart 로 나간다. */
  async create(
    params: SenderRegistrationParams,
    files: SenderRegistrationFiles,
  ): Promise<SendgoResponse> {
    return this.http.postMultipart(this.url(), { ...params }, { ...files });
  }

  /** 별칭 변경 / 기본 발신 지정. 번호와 심사 상태는 바꿀 수 없다. */
  async update(
    senderKey: string,
    params: { senderAlias: string; primaryType?: 'PRIMARY' | 'SECONDARY' },
  ): Promise<SendgoResponse> {
    return this.http.patch(this.url(senderKey), { ...params });
  }

  /** 삭제. 기본 발신번호를 지우면 남은 번호 중 하나가 기본으로 승계된다. */
  async delete(senderKey: string): Promise<SendgoResponse> {
    return this.http.delete(this.url(senderKey));
  }

  private url(segment?: string): string {
    return this.http.buildResourceUrl('senders', segment ? encodeURIComponent(segment) : '');
  }
}
