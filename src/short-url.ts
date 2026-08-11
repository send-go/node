import type { HttpClient } from './http-client';
import type {
  SendgoConfig,
  SendgoResponse,
  ShortUrlListParams,
  ShortUrlParams,
  ShortUrlStatsParams,
} from './types';

/**
 * 짧은 URL — 메시지에 넣는 링크를 줄이고 클릭 반응을 집계한다.
 *
 * v2 전용이다.
 *
 * @example
 * const created = await sendgo.shortUrl.create({
 *   targetUrl: 'https://example.com/promotions/summer-sale',
 *   title: '여름 세일 랜딩',
 * });
 *
 * // created.data.shortUrl 을 문자/알림톡 본문에 넣는다.
 * const stats = await sendgo.shortUrl.stats(created.data.code);
 */
export class ShortUrlService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: Required<SendgoConfig>,
  ) {}

  /**
   * 짧은 URL 을 만든다.
   *
   * 같은 원본 URL 을 다시 줄이면 기존 링크가 그대로 반환된다.
   * 캠페인별로 반응을 분리해 집계하려면 `forceNew: true` 를 쓴다.
   */
  async create(params: ShortUrlParams): Promise<SendgoResponse> {
    // Spread into a plain object: an interface has no index signature, so it is
    // not assignable to Record<string, unknown> directly.
    return this.http.post(this.http.buildResourceUrl('short-urls'), { ...params });
  }

  /** 목록 조회. */
  async list(params: ShortUrlListParams = {}): Promise<SendgoResponse> {
    return this.http.get(this.http.buildResourceUrl('short-urls'), { ...params });
  }

  /** 상세 조회. */
  async show(code: string): Promise<SendgoResponse> {
    return this.http.get(this.http.buildResourceUrl('short-urls', encodeURIComponent(code)));
  }

  /** 반응 통계. 일별 추이와 디바이스/유입경로/국가별 분해를 반환한다. */
  async stats(code: string, params: ShortUrlStatsParams = {}): Promise<SendgoResponse> {
    return this.http.get(
      this.http.buildResourceUrl('short-urls', `${encodeURIComponent(code)}/stats`),
      { ...params },
    );
  }

  /**
   * 리다이렉트를 중지한다. 링크는 삭제되지 않고 누적 통계도 남는다.
   * 이후 그 링크로 들어오면 410 Gone 이 반환된다.
   */
  async deactivate(code: string): Promise<SendgoResponse> {
    return this.http.delete(this.http.buildResourceUrl('short-urls', encodeURIComponent(code)));
  }
}
