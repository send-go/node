// ----------------------------------------------------------------
// Sendgo Node.js SDK — 타입 정의
// ----------------------------------------------------------------

/** 발송 유형 */
export type ScheduleType = 'DIRECTLY' | 'SCHEDULED';

/** SMS 메시지 유형 */
export type SmsMessageType = 'SMS' | 'LMS' | 'MMS';

/** SMS 캠페인 유형 */
export type CampaignType = 'MESSAGE' | 'ADVERTISE' | 'ELECTION';

/**
 * 친구톡 메시지 유형
 * FT: 기본 텍스트, FI: 이미지형, FW: 와이드 이미지
 * FL: 리스트형, FM: 이미지+텍스트, FC: 캐러셀, FA: 아이템 리스트, FP: 프리미엄 동영상
 */
export type FriendtalkMessageType = 'FT' | 'FI' | 'FW' | 'FL' | 'FM' | 'FC' | 'FA' | 'FP';

/** 수신자 정보 */
export interface Contact {
  /** 수신자 전화번호 (필수, 예: "01012345678") */
  contact: string;
  /** 수신자 이름 */
  name?: string;
  /** 템플릿 변수 #{var1} */
  var1?: string;
  /** 템플릿 변수 #{var2} */
  var2?: string;
  /** 템플릿 변수 #{var3} */
  var3?: string;
  /** 템플릿 변수 #{var4} */
  var4?: string;
  /** 템플릿 변수 #{var5} */
  var5?: string;
  /** 템플릿 변수 #{var6} */
  var6?: string;
  /** 템플릿 변수 #{var7} */
  var7?: string;
  /** 템플릿 변수 #{var8} */
  var8?: string;
}

/** Sendgo SDK 초기화 설정 */
export interface SendgoConfig {
  /** Sendgo Access Key (필수) */
  accessKey: string;
  /** Sendgo Secret Key (필수) */
  secretKey: string;
  /** SMS 발신자 키 */
  smsSenderKey?: string;
  /** 카카오 발신프로필 키 */
  kakaoSenderKey?: string;
  /** API 버전 (기본값: 'v1') */
  apiVersion?: 'v1' | 'v2';
  /** API 기본 URL (기본값: 'https://sendgo.io') */
  baseUrl?: string;
}

/** 알림톡 전송 파라미터 */
export interface AlimtalkParams {
  /** 승인된 알림톡 템플릿 코드 (필수) */
  templateCode: string;
  /** 수신자 목록 (필수) */
  contacts: Contact[];
  /** 발송 유형 (기본값: 'DIRECTLY') */
  scheduleType?: ScheduleType;
  /** 예약 발송 시각 (예: '2026-04-01 09:00:00') */
  at?: string;
  /** 알림톡 실패 시 SMS 대체 발송 여부 (기본값: 'N') */
  replaceSms?: 'Y' | 'N';
  /** 대체 SMS 제목 (replaceSms='Y'일 때 필수) */
  smsSubject?: string;
  /** 대체 SMS 내용 (replaceSms='Y'일 때 필수) */
  smsContent?: string;
}

/**
 * 친구톡 전송 파라미터.
 *
 * 친구톡 자체는 2025-12-31 종료되었으나, 이 필드 집합은 `BrandMessageParams`
 * 의 베이스로 그대로 쓰이므로 타입은 유지한다 (OpenAPI 의 `allOf` 와 동일).
 */
export interface FriendtalkParams {
  /** 메시지 본문 (필수) */
  content: string;
  /** 수신자 목록 (필수) */
  contacts: Contact[];
  /** 메시지 유형 (기본값: 'FT') */
  messageType?: FriendtalkMessageType;
  /** 발송 유형 (기본값: 'DIRECTLY') */
  scheduleType?: ScheduleType;
  /** 예약 발송 시각 */
  at?: string;
  /** 버튼 목록 */
  buttons?: object[];
  /** 이미지 URL */
  imageUrl?: string;
  /** 이미지 링크 URL */
  imageLink?: string;
  /** 광고성 메시지 여부 (기본값: 'Y') */
  adFlag?: 'Y' | 'N';
  /** 와이드 이미지 여부 (기본값: 'N') */
  wide?: 'Y' | 'N';
  /** 성인 콘텐츠 여부 (기본값: 'N') */
  adult?: 'Y' | 'N';
  /** 헤더 텍스트 */
  header?: string;
  /** SMS 대체 발송 여부 (기본값: 'N') */
  replaceSms?: 'Y' | 'N';
  /** 대체 SMS 제목 */
  smsSubject?: string;
  /** 대체 SMS 내용 */
  smsContent?: string;
}

/** SMS/LMS/MMS 전송 파라미터 */
/** 브랜드메시지 발송 대상. */
export type BrandMessageTargeting =
  /** 친구 + 비친구 */
  | 'M'
  /** 채널 친구가 아닌 수신자 */
  | 'N'
  /** 친구 교집합 */
  | 'I'
  /** 친구만 */
  | 'O'
  /** 수신 동의한 전체 채널 친구 (동보, contacts 불필요) */
  | 'F';

/**
 * 브랜드메시지 전송 파라미터.
 *
 * 친구톡 파라미터를 그대로 쓰면서 `targeting` 과 `friendTemplateUuid` 가 추가됩니다.
 * `messageType` 에는 친구톡 코드(FT/FI/FW/FL/FC/FM/FP/FA)를 그대로 넘기며,
 * 브랜드메시지 코드 변환은 서버가 처리합니다.
 */
export interface BrandMessageParams extends Omit<FriendtalkParams, 'content' | 'contacts'> {
  /** 브랜드 템플릿 UUID (필수) */
  friendTemplateUuid: string;
  /** 발송 대상 (기본값: 'M') */
  targeting?: BrandMessageTargeting;
  /** 수신자 목록. targeting 이 'M' | 'N' | 'I' | 'O' 일 때 필수 */
  contacts?: Contact[];
  /** 메시지 본문 */
  content?: string;
  /** 푸시 알림 여부 (기본값: 'Y') */
  pushAlarm?: 'Y' | 'N';
  /** 동보(targeting='F') 발송 대상 그룹 키 */
  friendGroupKey?: string;
  /** 쿠폰 정보 */
  coupon?: object;
  /** 아이템 리스트 (BL) */
  item?: object;
  /** 커머스 정보 (BM) */
  commerce?: object;
  /** 캐러셀 리스트 (BC / BA) */
  list?: object[];
  /** 캐러셀 헤드 */
  head?: object;
  /** 캐러셀 테일 */
  tail?: object;
  /** 동영상 정보 (BP) */
  video?: object;
  /** 부가 정보 */
  additionalContent?: string;
  /** 수신거부(080) 서비스 ID */
  rejectServiceId?: string;
  /** 결과 수신 웹훅 URL */
  webhooks?: string[];
}

/** 브랜드메시지 캠페인 목록 조회 파라미터. */
export interface BrandMessageListParams {
  /** 조회 시작일 (기본값: 90일 전) */
  from?: string;
  /** 조회 종료일 (기본값: 현재) */
  to?: string;
  /** 페이지당 개수 (기본값: 30) */
  count?: number;
}

/** 친구톡 전송 파라미터 */
export interface SmsParams {
  /** 메시지 본문 (필수) */
  content: string;
  /** 수신자 목록 (필수) */
  contacts: Contact[];
  /** 메시지 유형 (기본값: 'SMS') */
  messageType?: SmsMessageType;
  /** 캠페인 유형 (기본값: 'MESSAGE') */
  campaignType?: CampaignType;
  /** 발송 유형 (기본값: 'DIRECTLY') */
  scheduleType?: ScheduleType;
  /** 예약 발송 시각 */
  at?: string;
  /** 메시지 제목 (LMS/MMS 권장) */
  subject?: string;
  /** 첨부 파일 목록 */
  files?: object[];
}

/** Sendgo API 응답 */
export interface SendgoResponse {
  /** 성공 여부 */
  success: boolean;
  /** 응답 데이터 */
  data?: unknown;
  /** 에러 코드 (실패 시) */
  code?: string;
  /** 에러 메시지 (실패 시) */
  message?: string;
}

/** 짧은 URL 생성 파라미터. */
export interface ShortUrlParams {
  /** 줄일 원본 URL. http/https 만 허용된다. */
  targetUrl: string;
  /** 관리 화면에서 구분하기 위한 이름. */
  title?: string | null;
  /** 이 시각 이후에는 리다이렉트하지 않고 410 Gone 을 반환한다. */
  expiresAt?: string | null;
  /**
   * true 면 같은 URL 이라도 새 코드를 만든다.
   * 캠페인별로 반응을 분리해 집계할 때 사용한다.
   */
  forceNew?: boolean;
}

/** 짧은 URL 목록 조회 파라미터. */
export interface ShortUrlListParams {
  from?: string;
  to?: string;
  count?: number;
}

/** 짧은 URL 통계 조회 파라미터. */
export interface ShortUrlStatsParams {
  from?: string;
  to?: string;
}

// ----------------------------------------------------------------
// 관리 API (v2 전용) — 등록 · 심사
// ----------------------------------------------------------------

/**
 * multipart 로 올릴 파일.
 *
 * `Blob`/`File` 을 그대로 넘기거나, 파일명을 지정해야 하면
 * `{ value, filename }` 형태로 감싼다. 서버 검증이 확장자를 보는
 * 엔드포인트(발신번호 서류, 템플릿 이미지)에서는 파일명이 필요하다.
 */
export type MultipartFile = Blob | { value: Blob; filename: string };

/** 카카오 발신프로필 등록 파라미터 (2단계). */
export interface KakaoSenderCreateParams {
  /** 1단계에서 관리자 휴대폰으로 받은 인증번호. */
  token: string;
  /** 채널 검색용 아이디. `@` 는 있어도 없어도 된다. */
  yellowId: string;
  phoneNumber: string;
  /** `categories()` 로 조회한 코드. */
  categoryCode: string;
}

/** 브랜드메시지 타겟팅 — M 마케팅 / N 정보성. */
export type BrandMessageTargetType = 'M' | 'N';

/** 알림톡 템플릿 메시지 유형. BA 기본형 / EX 부가정보형 / AD 채널추가형 / MI 복합형. */
export type NoticeTemplateMessageType = 'BA' | 'EX' | 'AD' | 'MI';

/** 알림톡 템플릿 강조 유형. */
export type NoticeTemplateEmphasizeType = 'NONE' | 'TEXT' | 'ITEM_LIST' | 'IMAGE';

/** 알림톡 검수 상태. REG 등록 / REQ 심사중 / APR 승인 / REJ 반려. */
export type NoticeTemplateInspectionStatus = 'REG' | 'REQ' | 'APR' | 'REJ';

/** 메시지 목적 — sendgo 정책 게이트. */
export type NoticeMessagePurpose =
  | 'order_delivery'
  | 'reservation_booking'
  | 'payment_billing'
  | 'account_auth'
  | 'service_ops'
  | 'policy_notice'
  | 'benefit_notice'
  | 'customer_support'
  | 'other';

/** 발송 근거 — sendgo 정책 게이트. */
export type NoticeLegalBasis =
  | 'transaction'
  | 'paid_purchase'
  | 'event_entry'
  | 'contract'
  | 'policy_notice';

/** 혜택 발생 경위 — sendgo 정책 게이트. */
export type NoticeBenefitOrigin = 'none' | 'paid' | 'event' | 'contract' | 'promo' | 'free';

/** 소멸 유형 — sendgo 정책 게이트. */
export type NoticeExpiryType = 'none' | 'rights_based' | 'promo';

/**
 * 알림톡 템플릿 등록·수정 파라미터.
 *
 * 뒤쪽 일곱 개는 sendgo 자체 정책 게이트다. 카카오 심사와 별개이며 빠뜨리면
 * `POLICY_VALIDATION_FAILED` 로 거절된다.
 */
export interface NoticeTemplateParams {
  /** 등록 시 폴더 지정 또는 목록 필터(none: 미분류). 수정은 templateFolders.assign 사용. */
  folderUuid?: string;
  kakaoSenderKey: string;
  templateName: string;
  templateContent: string;
  templateMessageType: NoticeTemplateMessageType;
  templateEmphasizeType: NoticeTemplateEmphasizeType;
  /** 6자리 숫자. `categories()` 로 조회한다. */
  categoryCode: string;

  templateTitle?: string | null;
  templateSubtitle?: string | null;
  templateHeader?: string | null;
  templateExtra?: string | null;
  templateItem?: Record<string, unknown> | null;
  templateItemHighlight?: Record<string, unknown> | null;
  templateRepresentLink?: Record<string, unknown> | null;
  buttons?: Array<Record<string, unknown>> | null;
  quickReplies?: Array<Record<string, unknown>> | null;
  securityFlag?: boolean;
  adultFlag?: boolean;

  messagePurpose: NoticeMessagePurpose;
  legalBasis: NoticeLegalBasis;
  benefitOrigin: NoticeBenefitOrigin;
  expiryType: NoticeExpiryType;
  /** `true` 여야 한다. */
  optInReviewConfirmed: boolean;
  /** `true` 여야 한다. */
  ctaClearConfirmed: boolean;
  /** `true` 여야 검수를 요청할 수 있다. */
  policyConfirmed: boolean;
}

/** 알림톡 템플릿 목록 조회 파라미터. */
export interface NoticeTemplateListParams {
  /** 등록 시 폴더 지정 또는 목록 필터(none: 미분류). 수정은 templateFolders.assign 사용. */
  folderUuid?: string;
  kakaoSenderKey?: string;
  inspectionStatus?: NoticeTemplateInspectionStatus | 'BLOCK' | 'DORMANT';
  search?: string;
  count?: number;
}

/**
 * 브랜드메시지 템플릿 등록·수정 파라미터.
 *
 * `templateType` 은 친구톡 표기를 그대로 쓴다 — 서버가 chatBubbleType 으로 변환한다.
 */
export interface BrandTemplateParams {
  /** 등록 시 폴더 지정 또는 목록 필터(none: 미분류). 수정은 templateFolders.assign 사용. */
  folderUuid?: string;
  kakaoSenderKey: string;
  templateName: string;
  templateType: FriendtalkMessageType;
  templateContent?: string | null;
  adult?: boolean;
  header?: string | null;
  additional_content?: string | null;
  imageUrl?: string | null;
  imageLink?: string | null;
  buttons?: Array<Record<string, unknown>> | null;
  coupon?: Record<string, unknown> | null;
  item?: Record<string, unknown> | null;
  commerce?: Record<string, unknown> | null;
  list?: Array<Record<string, unknown>> | null;
  head?: Record<string, unknown> | null;
  tail?: Record<string, unknown> | null;
  video?: Record<string, unknown> | null;
  mainWideItem?: Record<string, unknown> | null;
  subWideItemList?: Array<Record<string, unknown>> | null;
}

/** 브랜드메시지 템플릿 목록 조회 파라미터. */
export interface BrandTemplateListParams {
  /** 등록 시 폴더 지정 또는 목록 필터(none: 미분류). 수정은 templateFolders.assign 사용. */
  folderUuid?: string;
  kakaoSenderKey?: string;
  search?: string;
  count?: number;
}

/**
 * 발신번호 유형. **전부 API 로 접수할 수 있다.**
 *
 * 휴대폰 계열(`personal_mobile`, `team_representative_mobile`,
 * `team_emp_mobile`)은 콘솔의 PASS 본인인증 대신 신분증 사본
 * (`identityDocument`)을 받아 sendgo 운영자가 직접 확인한다.
 */
export type SenderNumberType =
  | 'personal_mobile'
  | 'personal_other'
  | 'team_main'
  | 'team_representative_mobile'
  | 'team_emp_mobile'
  | 'team_other_company';

/**
 * @deprecated 전 유형이 API 로 등록 가능해졌다. `SenderNumberType` 을 쓴다.
 */
export type ApiRegistrableSenderNumberType = SenderNumberType;

/** `identityDocument` 가 필요한 유형. */
export type IdentityDocumentSenderNumberType =
  | 'personal_mobile'
  | 'team_representative_mobile'
  | 'team_emp_mobile';

/** 발신번호 등록 신청 파라미터 (파일은 따로 넘긴다). */
export interface SenderRegistrationParams {
  /** 계정 안에서 중복될 수 없는 관리용 이름. */
  senderAlias: string;
  senderNumberType: SenderNumberType;
  /** 숫자와 하이픈만. 서버가 E.164 로 정규화한다. */
  phoneE164: string;
  /** `validate()` 의 `duplicationReasonRequired` 가 true 면 필수. */
  duplicationReason?: string | null;
  /** `team_other_company` 필수. */
  acceptanceName?: 'acceptance_representative' | 'acceptance_employee' | null;
  /** `team_other_company` 필수. */
  delegationName?: 'delegation_representative' | 'delegation_employee' | null;
  /** `team_other_company` 필수. */
  delegationReason?: string | null;
}

/**
 * 발신번호 등록에 첨부하는 서류.
 *
 * `csuCertificate`(통신서비스 이용증명원)는 항상 필수다. 휴대폰 계열은
 * `identityDocument` 가, `team_other_company` 는 수임·위임 서류가 더 필요하다.
 * 유형별 목록은 `senderRegistration.numberTypes()` 로 확인한다.
 */
export interface SenderRegistrationFiles {
  csuCertificate: MultipartFile;
  /**
   * 명의자 신분증 사본.
   *
   * 휴대폰 계열에 **필수**다 — 콘솔의 PASS 본인인증을 대신해 sendgo 운영자가
   * 직접 확인한다. 이 경로로 접수된 건은 자동 승인되지 않는다.
   */
  identityDocument?: MultipartFile;
  acceptanceIdCard?: MultipartFile;
  delegationIdCard?: MultipartFile;
  delegationBusinessCard?: MultipartFile;
  delegationWarrant?: MultipartFile;
  delegationEmpCertificate?: MultipartFile;
  empCertificate?: MultipartFile;
}

/** 문자 템플릿 등록·수정 파라미터. */
export interface MessageTemplateParams {
  messageTranType: SmsMessageType;
  /** 본문 (2,000자). */
  messageTranMsg: string;
  /** LMS·MMS 는 필수. SMS 에 넣으면 발송 시 버려진다. */
  messageTranSubject?: string | null;
  isFavorite?: boolean;
}

/** 문자 템플릿 목록 조회 파라미터. */
export interface MessageTemplateListParams {
  messageType?: SmsMessageType | 'TOTAL';
  search?: string;
  count?: number;
}

// ----------------------------------------------------------------
// 웹훅 · 이미지 · 수신거부 (v2 전용)
// ----------------------------------------------------------------

/** 구독할 수 있는 웹훅 이벤트. */
export type WebhookEvent =
  | 'sender.status_changed'
  | 'notice_template.inspection_status_changed'
  | 'kakao_sender.status_changed'
  | 'kakao_sender.brand_message_status_changed';

/** 웹훅 구독 생성·수정 파라미터. */
export interface WebhookSubscriptionParams {
  /** 이벤트를 받을 주소. **https 만 허용**한다. */
  url: string;
  /**
   * 서명 키 (16~128자). 생략하면 서버가 만들어 응답에서 한 번만 돌려준다.
   * 이미 있는 상태에서 생략하면 기존 값을 유지한다.
   */
  secret?: string;
  /** 구독할 이벤트. 생략하면 전체 구독. */
  events?: WebhookEvent[];
  enabled?: boolean;
}

/** 파일 하나를 올리고 URL 하나를 받는 이미지 유형. */
export type KakaoImageSingleType =
  | 'alimtalk'
  | 'alimtalk_highlight'
  | 'default'
  | 'wide'
  | 'wide_item_list_first';

/** 파일 여러 개를 올리고 URL 목록을 받는 이미지 유형. */
export type KakaoImageMultiType = 'wide_item_list' | 'carousel_feed' | 'carousel_commerce';

/** 수신거부 번호 목록 조회 파라미터. */
export interface RejectedNumberListParams {
  /** 이 날짜 이후 수신거부된 건만. 증분 동기화에 쓴다. */
  since?: string;
  search?: string;
  count?: number;
}

/** 폴더에 담긴 템플릿 유형. */
export type TemplateFolderType = 'notice' | 'brand';
export interface TemplateFolderListParams {
  templateType?: TemplateFolderType;
  kakaoSenderKey?: string;
}
export interface TemplateFolderCreateParams {
  name: string;
  parentUuid?: string | null;
}
export interface TemplateFolderAssignParams {
  templateType: TemplateFolderType;
  kakaoSenderKey: string;
  templateCodes: string[];
  /** null이면 미분류로 이동. 반드시 필드를 전달합니다. */
  folderUuid: string | null;
}
