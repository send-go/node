import { AlimtalkService } from './alimtalk';
import { BrandMessageService } from './brand-message';
import { FriendtalkService } from './friendtalk';
import { ShortUrlService } from './short-url';
import { SmsService } from './sms';
import { HttpClient } from './http-client';
import { TokenManager } from './token-manager';
import type { SendgoConfig } from './types';

export type { SendgoConfig, Contact, AlimtalkParams, FriendtalkParams, SmsParams, SendgoResponse } from './types';
export type { BrandMessageParams, BrandMessageListParams, BrandMessageTargeting } from './types';
export type { ShortUrlParams, ShortUrlListParams, ShortUrlStatsParams } from './types';
export type { ScheduleType, SmsMessageType, CampaignType, FriendtalkMessageType } from './types';
export { BrandMessageService } from './brand-message';
export { ShortUrlService } from './short-url';
export { SendgoError } from './errors';

const DEFAULTS = {
  apiVersion: 'v1' as const,
  baseUrl: 'https://sendgo.io',
  smsSenderKey: '',
  kakaoSenderKey: '',
};

/**
 * Sendgo SDK 메인 클라이언트.
 *
 * @example
 * import Sendgo from '@sendgo/node';
 *
 * const sendgo = new Sendgo({
 *   accessKey: process.env.SENDGO_ACCESS_KEY!,
 *   secretKey: process.env.SENDGO_SECRET_KEY!,
 *   kakaoSenderKey: process.env.SENDGO_KAKAO_KEY,
 *   smsSenderKey: process.env.SENDGO_SMS_KEY,
 *   apiVersion: 'v2',
 * });
 *
 * await sendgo.alimtalk.send({
 *   templateCode: 'ORDER_CONFIRM_001',
 *   contacts: [{ contact: '01012345678', var1: 'ORD-001' }],
 * });
 */
export class Sendgo {
  /** 카카오 알림톡 전송 */
  readonly alimtalk: AlimtalkService;
  /** 카카오 친구톡 전송 */
  readonly friendtalk: FriendtalkService;
  /** 카카오 브랜드메시지 — 친구톡의 후속 채널. v2 전용. */
  readonly brandMessage: BrandMessageService;
  /** 짧은 URL — 링크 단축과 클릭 반응 분석. v2 전용. */
  readonly shortUrl: ShortUrlService;
  /** SMS / LMS / MMS 전송 */
  readonly sms: SmsService;

  constructor(config: SendgoConfig) {
    if (!config.accessKey || !config.secretKey) {
      throw new Error('Sendgo: accessKey와 secretKey는 필수입니다.');
    }

    const fullConfig = { ...DEFAULTS, ...config } as Required<SendgoConfig>;
    const tokenManager = new TokenManager(fullConfig);
    const http = new HttpClient(fullConfig, tokenManager);

    this.alimtalk = new AlimtalkService(http, fullConfig);
    this.friendtalk = new FriendtalkService(http, fullConfig);
    this.brandMessage = new BrandMessageService(http, fullConfig);
    this.shortUrl = new ShortUrlService(http, fullConfig);
    this.sms = new SmsService(http, fullConfig);
  }
}

export default Sendgo;
