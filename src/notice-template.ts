import type { HttpClient } from './http-client';
import type {
  MultipartFile,
  NoticeTemplateListParams,
  NoticeTemplateParams,
  SendgoConfig,
  SendgoResponse,
} from './types';

/**
 * 알림톡 템플릿 관리 — 등록 · 수정 · 검수 요청.
 *
 * v2 전용이며 **기업(Team) 소유 애플리케이션**만 사용할 수 있다.
 *
 * 템플릿은 만든 즉시 쓸 수 없다. 카카오 검수를 통과해야 한다.
 *
 * ```
 * 등록      inspectionStatus=REG   ← 발송 불가
 * 검수 요청  inspectionStatus=REQ   ← 카카오 심사 중
 * 승인      inspectionStatus=APR   ← 여기부터 발송 가능
 * 반려      inspectionStatus=REJ   ← comments 에 사유
 * ```
 *
 * 검수 결과는 비동기다. 웹훅이 없으므로 `sync()` 로 폴링한다.
 */
export class NoticeTemplateService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: Required<SendgoConfig>,
  ) {}

  /** 목록 조회. */
  async list(params: NoticeTemplateListParams = {}): Promise<SendgoResponse> {
    return this.http.get(this.url(), { ...params });
  }

  /** 상세 조회. 응답의 `data.template.policy` 에 정책 검토 상태가 들어 있다. */
  async show(templateCode: string): Promise<SendgoResponse> {
    return this.http.get(this.url(templateCode));
  }

  /**
   * 템플릿 등록.
   *
   * 정책 필드 일곱 개는 sendgo 자체 게이트다. 카카오 심사와 별개이며
   * 조합이 본문과 어긋나면 `POLICY_VALIDATION_FAILED` 로 거절된다.
   */
  async create(params: NoticeTemplateParams): Promise<SendgoResponse> {
    return this.http.post(this.url(), { ...params });
  }

  /**
   * 이미지 템플릿 등록 (`templateEmphasizeType: 'IMAGE'`).
   *
   * multipart 로 나가므로 `buttons` 같은 배열 필드는 HttpClient 가 JSON
   * 문자열로 직렬화한다 — 호출부는 그냥 배열로 넘기면 된다.
   */
  async createWithImage(
    params: NoticeTemplateParams,
    image: MultipartFile,
  ): Promise<SendgoResponse> {
    return this.http.postMultipart(
      this.url(),
      { ...params, templateEmphasizeType: params.templateEmphasizeType ?? 'IMAGE' },
      { image },
    );
  }

  /**
   * 템플릿 수정.
   *
   * 발신프로필과 템플릿 코드는 바꿀 수 없다. 본문·버튼처럼 카카오에 등록된
   * 내용이 바뀌면 검수 상태가 되돌아가므로 재검수를 요청해야 한다.
   */
  async update(templateCode: string, params: NoticeTemplateParams): Promise<SendgoResponse> {
    return this.http.put(this.url(templateCode), { ...params });
  }

  /**
   * 템플릿 삭제.
   *
   * **카카오는 템플릿 삭제 API 를 제공하지 않는다.** sendgo 목록에서만
   * 지워지고 비즈니스 채널 쪽 템플릿은 남는다. 동기화하면 다시 나타난다.
   */
  async delete(templateCode: string): Promise<SendgoResponse> {
    return this.http.delete(this.url(templateCode));
  }

  /** 카카오에서 검수 상태와 반려 사유를 다시 읽어 온다. */
  async sync(templateCode: string): Promise<SendgoResponse> {
    return this.http.post(this.path(templateCode, 'sync'), {});
  }

  /**
   * 검수 요청.
   *
   * 첨부가 있으면 `comment` 는 필수다. 정책 검토를 통과하지 못한 템플릿은
   * `POLICY_REVIEW_REQUIRED` 로 거절되고 `errors.reasons` 에 사유가 담긴다.
   */
  async requestInspection(
    templateCode: string,
    comment?: string,
    attachments: MultipartFile[] = [],
  ): Promise<SendgoResponse> {
    const url = this.path(templateCode, 'inspection');

    if (attachments.length === 0) {
      return this.http.post(url, comment === undefined ? {} : { comment });
    }

    return this.http.postMultipart(url, { comment }, { attachments });
  }

  /** 검수 요청 취소. 아직 심사 중(REQ)일 때만 통한다. */
  async cancelInspection(templateCode: string): Promise<SendgoResponse> {
    return this.http.delete(this.path(templateCode, 'inspection'));
  }

  /** 승인 취소. 승인(APR)된 템플릿을 되돌린다. 이후에는 발송할 수 없다. */
  async cancelApproval(templateCode: string): Promise<SendgoResponse> {
    return this.http.delete(this.path(templateCode, 'approval'));
  }

  /** 휴면 해제. 오래 안 쓴 템플릿이 dormant 로 잠기면 이걸로 깨운다. */
  async release(templateCode: string): Promise<SendgoResponse> {
    return this.http.post(this.path(templateCode, 'release'), {});
  }

  /** 템플릿 카테고리 코드 조회. */
  async categories(categoryCode?: string): Promise<SendgoResponse> {
    return this.http.get(this.url('categories'), categoryCode ? { categoryCode } : {});
  }

  private url(segment?: string): string {
    return this.http.buildResourceUrl(
      'notice-templates',
      segment ? encodeURIComponent(segment) : '',
    );
  }

  private path(templateCode: string, action: string): string {
    return this.http.buildResourceUrl(
      'notice-templates',
      `${encodeURIComponent(templateCode)}/${action}`,
    );
  }
}
