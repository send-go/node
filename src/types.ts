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
  /** API 기본 URL (기본값: 'https://api.sendgo.io') */
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

/** 친구톡 전송 파라미터 */
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
