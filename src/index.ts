import { TemplateFolderService } from './template-folder';
import { AlimtalkService } from './alimtalk';
import { BrandMessageService } from './brand-message';
import { BrandTemplateService } from './brand-template';
import { FriendtalkService } from './friendtalk';
import { KakaoImageService } from './kakao-image';
import { KakaoSenderService } from './kakao-sender';
import { MessageTemplateService } from './message-template';
import { NoticeTemplateService } from './notice-template';
import { RejectedNumberService } from './rejected-number';
import { SenderRegistrationService } from './sender-registration';
import { ShortUrlService } from './short-url';
import { SmsService } from './sms';
import { WebhookService } from './webhook';
import { HttpClient } from './http-client';
import { TokenManager } from './token-manager';
import type { SendgoConfig } from './types';

export type { SendgoConfig, Contact, AlimtalkParams, FriendtalkParams, SmsParams, SendgoResponse } from './types';
export type { BrandMessageParams, BrandMessageListParams, BrandMessageTargeting } from './types';
export type { ShortUrlParams, ShortUrlListParams, ShortUrlStatsParams } from './types';
export type { ScheduleType, SmsMessageType, CampaignType, FriendtalkMessageType } from './types';
export type {
  MultipartFile,
  KakaoSenderCreateParams,
  BrandMessageTargetType,
  NoticeTemplateParams,
  NoticeTemplateListParams,
  NoticeTemplateMessageType,
  NoticeTemplateEmphasizeType,
  NoticeTemplateInspectionStatus,
  NoticeMessagePurpose,
  NoticeLegalBasis,
  NoticeBenefitOrigin,
  NoticeExpiryType,
  BrandTemplateParams,
  BrandTemplateListParams,
  SenderNumberType,
  ApiRegistrableSenderNumberType,
  SenderRegistrationParams,
  SenderRegistrationFiles,
  MessageTemplateParams,
  MessageTemplateListParams,
  IdentityDocumentSenderNumberType,
  WebhookEvent,
  WebhookSubscriptionParams,
  KakaoImageSingleType,
  KakaoImageMultiType,
  RejectedNumberListParams,
} from './types';
export { BrandMessageService } from './brand-message';
export { ShortUrlService } from './short-url';
export { KakaoSenderService } from './kakao-sender';
export { NoticeTemplateService } from './notice-template';
export { BrandTemplateService } from './brand-template';
export { SenderRegistrationService } from './sender-registration';
export { MessageTemplateService } from './message-template';
export { KakaoImageService } from './kakao-image';
export { RejectedNumberService } from './rejected-number';
export { WebhookService, WEBHOOK_EVENTS } from './webhook';
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
  /**
   * 카카오 친구톡 전송.
   *
   * @deprecated 친구톡은 2025-12-31 종료. `brandMessage` 를 사용하세요.
   */
  readonly friendtalk: FriendtalkService;
  /** 카카오 브랜드메시지 — 친구톡의 후속 채널. v2 전용. */
  readonly brandMessage: BrandMessageService;
  /** 짧은 URL — 링크 단축과 클릭 반응 분석. v2 전용. */
  readonly shortUrl: ShortUrlService;
  /** SMS / LMS / MMS 전송 */
  readonly sms: SmsService;

  // -------------------------------------------------------- 관리 API (v2 전용)
  // 콘솔에서만 되던 등록·심사를 코드로 옮긴 것들. 발송과 달리 대부분 즉시
  // 완료되지 않는다 — 등록 성공은 "접수됨"이지 "사용 가능"이 아니다.

  /** 카카오 발신프로필(채널) 등록·동기화. v2 전용, 기업 계정 전용. */
  readonly kakaoSenders: KakaoSenderService;
  /** 템플릿 공용 폴더. v2 전용, 기업 계정 전용. */
  readonly templateFolders: TemplateFolderService;
  /** 알림톡 템플릿 등록·수정·검수 요청. v2 전용, 기업 계정 전용. */
  readonly noticeTemplates: NoticeTemplateService;
  /** 브랜드메시지(구 친구톡) 템플릿 관리. v2 전용, 기업 계정 전용. */
  readonly brandTemplates: BrandTemplateService;
  /** 발신번호 등록·심사 접수. v2 전용. */
  readonly senderRegistration: SenderRegistrationService;
  /** 문자 상용구 템플릿. v2 전용. */
  readonly messageTemplates: MessageTemplateService;
  /** 카카오 이미지 업로드 — 브랜드메시지 템플릿용 URL 발급. v2 전용, 기업 계정 전용. */
  readonly kakaoImages: KakaoImageService;
  /** 수신거부(080) 번호 조회. v2 전용. */
  readonly rejectedNumbers: RejectedNumberService;
  /** 이벤트 웹훅 구독 — 등록·심사 결과를 밀어 받는다. v2 전용. */
  readonly webhook: WebhookService;

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

    this.kakaoSenders = new KakaoSenderService(http, fullConfig);
    this.templateFolders = new TemplateFolderService(http);
    this.noticeTemplates = new NoticeTemplateService(http, fullConfig);
    this.brandTemplates = new BrandTemplateService(http, fullConfig);
    this.senderRegistration = new SenderRegistrationService(http, fullConfig);
    this.messageTemplates = new MessageTemplateService(http, fullConfig);
    this.kakaoImages = new KakaoImageService(http, fullConfig);
    this.rejectedNumbers = new RejectedNumberService(http, fullConfig);
    this.webhook = new WebhookService(http, fullConfig);
  }
}

export default Sendgo;

export { AccountClient } from './account';
export type { AccountConfig, AccountResponse, ApiKeyCreateParams, AllowedIpParams } from './account';

export { TemplateFolderService } from './template-folder';
export type { TemplateFolderType, TemplateFolderListParams, TemplateFolderCreateParams, TemplateFolderAssignParams } from './types';
