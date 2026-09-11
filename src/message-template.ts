import type { HttpClient } from './http-client';
import type {
  MessageTemplateListParams,
  MessageTemplateParams,
  SendgoConfig,
  SendgoResponse,
} from './types';

/**
 * 문자(SMS/LMS/MMS) 템플릿 — 자주 쓰는 문구를 저장해 두는 상용구.
 *
 * v2 전용. 카카오 템플릿과 달리 **검수가 없어** 만들면 바로 쓸 수 있고,
 * 기업 계정이 아니어도 된다.
 */
export class MessageTemplateService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: Required<SendgoConfig>,
  ) {}

  /** 목록 조회. */
  async list(params: MessageTemplateListParams = {}): Promise<SendgoResponse> {
    return this.http.get(this.url(), { ...params });
  }

  /** 상세 조회. */
  async show(templateKey: string): Promise<SendgoResponse> {
    return this.http.get(this.url(templateKey));
  }

  /** 등록. LMS·MMS 는 `messageTranSubject` 가 필수다. */
  async create(params: MessageTemplateParams): Promise<SendgoResponse> {
    return this.http.post(this.url(), { ...params });
  }

  /** 수정. */
  async update(templateKey: string, params: MessageTemplateParams): Promise<SendgoResponse> {
    return this.http.put(this.url(templateKey), { ...params });
  }

  /** 삭제 (소프트 삭제 — 목록에서만 사라진다). */
  async delete(templateKey: string): Promise<SendgoResponse> {
    return this.http.delete(this.url(templateKey));
  }

  private url(segment?: string): string {
    return this.http.buildResourceUrl(
      'message-templates',
      segment ? encodeURIComponent(segment) : '',
    );
  }
}
