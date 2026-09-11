import type { HttpClient } from './http-client';
import type {
  BrandTemplateListParams,
  BrandTemplateParams,
  SendgoConfig,
  SendgoResponse,
} from './types';

/**
 * 브랜드메시지(구 친구톡) 템플릿 관리.
 *
 * v2 전용이며 **기업(Team) 소유 애플리케이션**만 사용할 수 있다.
 *
 * 알림톡 템플릿과 달리 **검수 요청 단계가 없다.** 등록하면 카카오가 바로
 * 상태를 돌려주고 그 값이 `status` 로 나온다.
 *
 * `templateType` 은 친구톡 표기(FT/FI/FW/FL/FC/FM/FP/FA)를 그대로 쓴다 —
 * 서버가 chatBubbleType 으로 변환한다.
 */
export class BrandTemplateService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: Required<SendgoConfig>,
  ) {}

  /** 목록 조회. */
  async list(params: BrandTemplateListParams = {}): Promise<SendgoResponse> {
    return this.http.get(this.url(), { ...params });
  }

  /** 상세 조회. sendgo 코드(KFT-...)와 카카오 브랜드 템플릿 코드 둘 다 받는다. */
  async show(templateCode: string): Promise<SendgoResponse> {
    return this.http.get(this.url(templateCode));
  }

  /** 템플릿 등록. */
  async create(params: BrandTemplateParams): Promise<SendgoResponse> {
    return this.http.post(this.url(), { ...params });
  }

  /** 템플릿 수정. 발신프로필은 바꿀 수 없다. */
  async update(templateCode: string, params: BrandTemplateParams): Promise<SendgoResponse> {
    return this.http.put(this.url(templateCode), { ...params });
  }

  /** 템플릿 삭제. 알림톡과 달리 카카오 쪽에서도 실제로 삭제된다. */
  async delete(templateCode: string): Promise<SendgoResponse> {
    return this.http.delete(this.url(templateCode));
  }

  /**
   * 동기화. 카카오 쪽에서 이미 삭제됐으면 로컬에서도 제거하고
   * `data.deleted: true` 를 반환한다.
   */
  async sync(templateCode: string): Promise<SendgoResponse> {
    return this.http.post(
      this.http.buildResourceUrl('brand-templates', `${encodeURIComponent(templateCode)}/sync`),
      {},
    );
  }

  /** 발신프로필 단위 가져오기 — 카카오 쪽에 이미 있는 템플릿을 들여온다. */
  async import(kakaoSenderKey: string): Promise<SendgoResponse> {
    return this.http.post(this.url('import'), { kakaoSenderKey });
  }

  private url(segment?: string): string {
    return this.http.buildResourceUrl(
      'brand-templates',
      segment ? encodeURIComponent(segment) : '',
    );
  }
}
