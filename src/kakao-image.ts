import type { HttpClient } from './http-client';
import type {
  KakaoImageMultiType,
  KakaoImageSingleType,
  MultipartFile,
  SendgoConfig,
  SendgoResponse,
} from './types';

/**
 * 카카오 이미지 업로드 — 브랜드메시지 템플릿에 넣을 URL 발급.
 *
 * v2 전용, 기업 계정 전용.
 *
 * 브랜드메시지 템플릿의 `imageUrl` 은 아무 URL 이나 되는 게 아니라 **카카오가
 * 호스팅하는 URL** 이어야 한다. 그 URL 을 얻는 방법이 이 업로드뿐이다.
 *
 * @example
 * const uploaded = await sendgo.kakaoImages.upload('default', {
 *   value: new Blob([await readFile('banner.jpg')]),
 *   filename: 'banner.jpg',
 * });
 *
 * await sendgo.brandTemplates.create({
 *   kakaoSenderKey,
 *   templateName: '여름 세일 안내',
 *   templateType: 'FI',
 *   imageUrl: uploaded.data.imageUrl,
 * });
 */
export class KakaoImageService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: Required<SendgoConfig>,
  ) {}

  /** 업로드 가능한 유형과 제약. */
  async types(): Promise<SendgoResponse> {
    return this.http.get(this.http.buildResourceUrl('kakao-images', 'types'));
  }

  /** 단일 이미지 업로드. jpg/png, 2MB 이하. `data.imageUrl` 을 받는다. */
  async upload(type: KakaoImageSingleType, image: MultipartFile): Promise<SendgoResponse> {
    return this.http.postMultipart(this.url(type), {}, { image });
  }

  /** 다중 이미지 업로드. 유형별 최대 개수가 다르다. */
  async uploadMany(type: KakaoImageMultiType, images: MultipartFile[]): Promise<SendgoResponse> {
    return this.http.postMultipart(this.url(type), {}, { images });
  }

  private url(type: string): string {
    return this.http.buildResourceUrl('kakao-images', encodeURIComponent(type));
  }
}
