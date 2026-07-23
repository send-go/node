import { AlimtalkService } from './alimtalk';
import { FriendtalkService } from './friendtalk';
import { SmsService } from './sms';
import { HttpClient } from './http-client';
import { TokenManager } from './token-manager';
import type { SendgoConfig } from './types';

export type { SendgoConfig, Contact, AlimtalkParams, FriendtalkParams, SmsParams, SendgoResponse } from './types';
export type { ScheduleType, SmsMessageType, CampaignType, FriendtalkMessageType } from './types';
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
    this.sms = new SmsService(http, fullConfig);
  }
}

export default Sendgo;
