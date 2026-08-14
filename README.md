# @sendgo/node

> **Node.js / TypeScript에서 카카오 알림톡, 브랜드메시지, SMS를 가장 쉽게 발송하는 SDK**

[![npm version](https://img.shields.io/npm/v/@sendgo/node?logo=npm)](https://www.npmjs.com/package/@sendgo/node)
[![npm downloads](https://img.shields.io/npm/dm/@sendgo/node)](https://www.npmjs.com/package/@sendgo/node)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

`@sendgo/node`는 [Sendgo](https://sendgo.io) 알림 API를 위한 공식 Node.js / TypeScript SDK입니다.
**외부 런타임 의존성 없이** Node.js 내장 `fetch`만을 사용하며, 완전한 TypeScript 타입 정의를 제공합니다.
Next.js, Express, Fastify, NestJS 등 모든 Node.js 프레임워크에서 사용할 수 있습니다.

---

## 목차

- [Sendgo란?](#sendgo란)
- [주요 기능](#주요-기능)
- [지원 메시지 유형](#지원-메시지-유형)
- [설치](#설치)
- [빠른 시작](#빠른-시작)
- [상세 사용법](#상세-사용법)
  - [카카오 알림톡](#카카오-알림톡)
  - [카카오 친구톡](#카카오-친구톡)
  - [SMS / LMS / MMS](#sms--lms--mms)
- [프레임워크 통합](#프레임워크-통합)
  - [Next.js App Router](#nextjs-app-router)
  - [Express.js](#expressjs)
  - [NestJS](#nestjs)
  - [Fastify](#fastify)
- [TypeScript 타입](#typescript-타입)
- [예외 처리](#예외-처리)
- [설정 옵션](#설정-옵션)
- [자주 묻는 질문](#자주-묻는-질문-faq)
- [관련 패키지](#관련-패키지)

---

## Sendgo란?

[Sendgo](https://sendgo.io)는 대한민국 기업과 개발자를 위한 **통합 알림 발송 플랫폼**입니다.

- **카카오 알림톡**: 카카오톡 채널을 통한 정보성 메시지 (주문 확인, 배송 안내, 인증번호, 예약 확인 등)
- **카카오 친구톡**: 카카오톡 채널 친구에게 마케팅/정보성 메시지 (이벤트, 쿠폰, 프로모션)
- **SMS / LMS / MMS**: 전통적인 문자 메시지
- **자동 대체 발송**: 알림톡 전송 실패 시 SMS로 자동 전환

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **Zero 런타임 의존성** | Node.js 18+ 내장 `fetch` 사용, 외부 패키지 불필요 |
| **완전한 TypeScript 지원** | 모든 요청/응답에 타입 정의 제공 |
| **토큰 자동 관리** | 발급·갱신·캐시(50분) 자동 처리 |
| **동시 요청 중복 방지** | 여러 요청이 동시에 들어와도 토큰 발급은 1회만 수행 |
| **401/403 자동 재시도** | 토큰 만료 시 자동 갱신 후 재발송 |
| **다건 동시 발송** | 수신자 배열로 대량 발송 |
| **예약 발송** | 원하는 시각에 예약 발송 |
| **SMS 자동 대체 발송** | 알림톡 실패 시 SMS로 자동 전환 |
| **v1 / v2 API 지원** | 설정 한 줄로 API 버전 전환 |

---

## 지원 메시지 유형

### 카카오 알림톡 (Alimtalk)
- 사전 승인된 템플릿 기반 발송
- 템플릿 변수 `#{var1}` ~ `#{var8}` 지원
- 즉시/예약 발송, SMS 대체 발송

### 카카오 친구톡 (Friendtalk)

> ⚠️ **Deprecated — 친구톡은 카카오 정책에 따라 2025-12-31 종료되었습니다.**
> 2026-01-01 부터 친구톡 발송 요청은 카카오 측에서 **브랜드메시지(자유형)** 로 자동 대체 발송됩니다.
> 호출은 계속 성공하며, 자유 본문 타입(`FT`/`FI`/`FW`)을 개별 수신자에게 보내는 경로는
> 현재 이것뿐이므로 기존 코드를 당장 바꿀 필요는 없습니다.
>
> 다음의 경우에는 **브랜드메시지**를 사용하세요.
> - 템플릿 기반 리치 타입 (`FL`/`FC`/`FM`/`FP`/`FA`)
> - 채널 친구가 **아닌** 수신자 (`targeting` = `N` / `I`)
> - 수신 동의한 전체 채널 친구 동보 (`targeting` = `F`)
>
> 메시지 타입은 1:1 대응되며 변환은 서버가 처리합니다 — `FT`→`BT`, `FI`→`BI`, `FW`→`BW`,
> `FL`→`BL`, `FC`→`BC`, `FM`→`BM`, `FP`→`BP`, `FA`→`BA`.
- 자유 형식 메시지 발송
- 텍스트(FT), 이미지(FI), 와이드이미지(FW), 리스트(FL), 복합(FM), 커머스(FC) 등 8종
- 버튼, 이미지, 링크 첨부

### SMS / LMS / MMS
- SMS: 단문 (90바이트), LMS: 장문 (2,000바이트), MMS: 이미지 첨부
- 일반/광고/선거 캠페인 유형

---

## 설치

```bash
# npm
npm install @sendgo/node

# pnpm
pnpm add @sendgo/node

# yarn
yarn add @sendgo/node

# bun
bun add @sendgo/node
```

**요구사항:** Node.js 18 이상 (내장 `fetch` 필요)

---

## 빠른 시작

### 1단계 — 환경변수 설정

```bash
# .env
SENDGO_ACCESS_KEY=your_access_key
SENDGO_SECRET_KEY=your_secret_key
SENDGO_KAKAO_SENDER_KEY=your_kakao_sender_key
SENDGO_SMS_SENDER_KEY=your_sms_sender_key
SENDGO_API_VERSION=v2
```

> **카카오 발신프로필 키 발급**: [Sendgo 콘솔](https://sendgo.io) → 카카오 발신프로필 → 등록

### 2단계 — 클라이언트 초기화

```typescript
import Sendgo from '@sendgo/node';

const sendgo = new Sendgo({
  accessKey:      process.env.SENDGO_ACCESS_KEY!,
  secretKey:      process.env.SENDGO_SECRET_KEY!,
  kakaoSenderKey: process.env.SENDGO_KAKAO_SENDER_KEY,
  smsSenderKey:   process.env.SENDGO_SMS_SENDER_KEY,
  apiVersion:     'v2',  // 'v1' | 'v2'
});
```

### 3단계 — 알림톡 전송

```typescript
await sendgo.alimtalk.send({
  templateCode: 'ORDER_CONFIRM_001',  // Sendgo 승인 템플릿 코드
  contacts: [
    {
      contact: '01012345678',   // 수신자 전화번호 (필수)
      name:    '홍길동',        // 수신자 이름 (선택)
      var1:    'ORD-20260723-001',  // 템플릿 변수 #{var1}
      var2:    '스프링 부트 가이드', // 템플릿 변수 #{var2}
      var3:    '29,000원',          // 템플릿 변수 #{var3}
    },
  ],
});
```

---

## 상세 사용법

### 카카오 알림톡

#### 단건 발송

```typescript
await sendgo.alimtalk.send({
  templateCode: 'ORDER_CONFIRM_001',
  contacts: [{
    contact: '01012345678',
    name: '홍길동',
    var1: 'ORD-001',       // 주문번호
    var2: '맥북 프로',      // 상품명
    var3: '3,490,000원',   // 결제금액
    var4: '2026-07-25',    // 배송 예정일
  }],
});
```

#### 다건 발송 (대량 발송)

```typescript
await sendgo.alimtalk.send({
  templateCode: 'ORDER_CONFIRM_001',
  contacts: [
    { contact: '01011111111', var1: 'ORD-001' },
    { contact: '01022222222', var1: 'ORD-002' },
    { contact: '01033333333', var1: 'ORD-003' },
  ],
});
```

#### 예약 발송

```typescript
await sendgo.alimtalk.send({
  templateCode: 'PROMO_SUMMER_2026',
  scheduleType: 'SCHEDULED',
  at: '2026-07-28 09:00:00',  // 발송 예약 시각 (Y-m-d H:i:s)
  contacts: [{ contact: '01012345678', var1: '여름 한정 50% 할인' }],
});
```

#### 알림톡 실패 시 SMS 자동 대체 발송

```typescript
await sendgo.alimtalk.send({
  templateCode: 'DELIVERY_START_001',
  replaceSms:  'Y',
  smsSubject:  '[배송 시작 안내]',
  smsContent:  '주문하신 상품이 출고되었습니다.\n송장번호: #{var2}',
  contacts: [{
    contact: '01012345678',
    var1: 'ORD-001',
    var2: '1234567890',  // 송장번호
  }],
});
```

---

### 카카오 친구톡

> ⚠️ **Deprecated — 친구톡은 카카오 정책에 따라 2025-12-31 종료되었습니다.**
> 2026-01-01 부터 친구톡 발송 요청은 카카오 측에서 **브랜드메시지(자유형)** 로 자동 대체 발송됩니다.
> 호출은 계속 성공하며, 자유 본문 타입(`FT`/`FI`/`FW`)을 개별 수신자에게 보내는 경로는
> 현재 이것뿐이므로 기존 코드를 당장 바꿀 필요는 없습니다.
>
> 다음의 경우에는 **브랜드메시지**를 사용하세요.
> - 템플릿 기반 리치 타입 (`FL`/`FC`/`FM`/`FP`/`FA`)
> - 채널 친구가 **아닌** 수신자 (`targeting` = `N` / `I`)
> - 수신 동의한 전체 채널 친구 동보 (`targeting` = `F`)
>
> 메시지 타입은 1:1 대응되며 변환은 서버가 처리합니다 — `FT`→`BT`, `FI`→`BI`, `FW`→`BW`,
> `FL`→`BL`, `FC`→`BC`, `FM`→`BM`, `FP`→`BP`, `FA`→`BA`.

```typescript
// 기본 텍스트
await sendgo.friendtalk.send({
  content: '안녕하세요! 7월 한정 특가 이벤트를 확인해보세요. 최대 50% 할인!',
  contacts: [{ contact: '01012345678' }],
});

// 이미지 + 버튼
await sendgo.friendtalk.send({
  messageType: 'FI',
  content: '이번 주 특가 상품을 확인하세요!',
  imageUrl: 'https://cdn.example.com/banner.jpg',
  imageLink: 'https://example.com/event',
  buttons: [{
    name: '이벤트 보기',
    type: 'WL',
    linkMo: 'https://example.com/event',
    linkPc: 'https://example.com/event',
  }],
  contacts: [{ contact: '01012345678' }],
});
```

---

### SMS / LMS / MMS

```typescript
// SMS — 단문 (90자 이하)
await sendgo.sms.sendSms({
  content: '[Sendgo] 인증번호: 123456 (5분 이내 입력)',
  contacts: [{ contact: '01012345678' }],
});

// LMS — 장문 (제목 포함)
await sendgo.sms.sendLms({
  subject: '[중요] 서비스 점검 안내',
  content: `안녕하세요.
서비스 점검이 예정되어 있습니다.

■ 점검 일시: 2026-07-25 02:00 ~ 06:00
■ 영향 범위: 전체 서비스

이용에 불편을 드려 죄송합니다.`,
  contacts: [{ contact: '01012345678' }],
});

// MMS — 멀티미디어
await sendgo.sms.sendMms({
  subject: '[이벤트] 7월 특가',
  content: '이번 달 특가 상품을 확인하세요!',
  contacts: [{ contact: '01012345678' }],
});
```

---

## 브랜드메시지 사용법

브랜드메시지는 친구톡의 후속 채널입니다. 메시지 타입이 친구톡과 1:1 대응되며
(`FT`→`BT`, `FI`→`BI`, `FW`→`BW`, `FL`→`BL`, `FC`→`BC`, `FM`→`BM`, `FP`→`BP`, `FA`→`BA`),
요청에는 **친구톡 코드를 그대로** 넘기고 변환은 서버가 처리합니다.

친구톡과 달리 다음이 가능합니다.

- 채널 친구가 **아닌** 수신자에게 발송 (`targeting: N`)
- 수신 동의한 **전체 채널 친구 동보** 발송 (`targeting: F`, 수신자 목록 불필요)
- 리스트·캐러셀·커머스·동영상 등 **템플릿 기반 리치 메시지**

> v2 전용입니다. 자유 본문 타입(`FT`/`FI`/`FW`)을 개별 수신자에게 보낼 때는 여전히 친구톡 API 를 쓰세요 — 이 엔드포인트는 그 조합에 `NOT_A_BRAND_MESSAGE` 를 반환합니다. 친구톡 요청은 카카오 측에서 브랜드메시지(자유형)로 대체 발송됩니다.

```typescript
// 단건 발송 — 채널 친구 대상
await sendgo.brandMessage.send({
  targeting: 'M',
  messageType: 'FL',
  friendTemplateUuid: '9cd5460b-6458-4edc-9b11-c26d3013c340',
  contacts: [{ contact: '01012345678', var1: '29,000원' }],
});

// 동보 발송 — 수신 동의한 전체 채널 친구 (contacts 불필요)
await sendgo.brandMessage.broadcast({
  messageType: 'FW',
  friendTemplateUuid: '9cd5460b-6458-4edc-9b11-c26d3013c340',
});

// 캠페인 조회
const list = await sendgo.brandMessage.campaigns({ count: 10 });
const one  = await sendgo.brandMessage.campaign('1f0a6d0e-6b3b-4f0f-9b2f-2f6f6a1b7c11');
```

---

## 프레임워크 통합

### Next.js App Router

```typescript
// app/api/notify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Sendgo from '@sendgo/node';

// 싱글톤 패턴으로 API Route 간 재사용
const sendgo = new Sendgo({
  accessKey:      process.env.SENDGO_ACCESS_KEY!,
  secretKey:      process.env.SENDGO_SECRET_KEY!,
  kakaoSenderKey: process.env.SENDGO_KAKAO_SENDER_KEY,
  apiVersion:     'v2',
});

export async function POST(request: NextRequest) {
  const { phone, orderNumber } = await request.json();

  await sendgo.alimtalk.send({
    templateCode: 'ORDER_CONFIRM_001',
    contacts: [{ contact: phone, var1: orderNumber }],
  });

  return NextResponse.json({ success: true });
}
```

```typescript
// app/actions/notification.ts — Server Actions
'use server';
import Sendgo from '@sendgo/node';

const sendgo = new Sendgo({ /* ... */ });

export async function sendOrderConfirm(phone: string, orderNumber: string) {
  return sendgo.alimtalk.send({
    templateCode: 'ORDER_CONFIRM_001',
    contacts: [{ contact: phone, var1: orderNumber }],
  });
}
```

### Express.js

```typescript
import express from 'express';
import Sendgo from '@sendgo/node';

const app = express();
const sendgo = new Sendgo({
  accessKey: process.env.SENDGO_ACCESS_KEY!,
  secretKey: process.env.SENDGO_SECRET_KEY!,
  kakaoSenderKey: process.env.SENDGO_KAKAO_SENDER_KEY,
});

app.use(express.json());

app.post('/api/notify', async (req, res) => {
  const { phone, orderNumber } = req.body;
  await sendgo.alimtalk.send({
    templateCode: 'ORDER_CONFIRM_001',
    contacts: [{ contact: phone, var1: orderNumber }],
  });
  res.json({ success: true });
});
```

### NestJS

```typescript
// sendgo.module.ts
import { Module, Global } from '@nestjs/common';
import Sendgo from '@sendgo/node';

@Global()
@Module({
  providers: [{
    provide: 'SENDGO_CLIENT',
    useFactory: () => new Sendgo({
      accessKey:      process.env.SENDGO_ACCESS_KEY!,
      secretKey:      process.env.SENDGO_SECRET_KEY!,
      kakaoSenderKey: process.env.SENDGO_KAKAO_SENDER_KEY,
      apiVersion:     'v2',
    }),
  }],
  exports: ['SENDGO_CLIENT'],
})
export class SendgoModule {}

// notification.service.ts
@Injectable()
export class NotificationService {
  constructor(@Inject('SENDGO_CLIENT') private readonly sendgo: Sendgo) {}

  async sendOrderConfirm(phone: string, orderNumber: string) {
    return this.sendgo.alimtalk.send({
      templateCode: 'ORDER_CONFIRM_001',
      contacts: [{ contact: phone, var1: orderNumber }],
    });
  }
}
```

### Fastify

```typescript
import Fastify from 'fastify';
import Sendgo from '@sendgo/node';

const app = Fastify();
const sendgo = new Sendgo({ accessKey: '...', secretKey: '...' });

app.post('/notify', async (request, reply) => {
  const { phone, orderNumber } = request.body as any;
  await sendgo.alimtalk.send({
    templateCode: 'ORDER_CONFIRM_001',
    contacts: [{ contact: phone, var1: orderNumber }],
  });
  return { success: true };
});
```

---

## TypeScript 타입

```typescript
import type {
  SendgoConfig,      // 클라이언트 설정
  Contact,           // 수신자 정보
  AlimtalkParams,    // 알림톡 발송 파라미터
  FriendtalkParams,  // 친구톡 발송 파라미터
  SmsParams,         // SMS 발송 파라미터
  SendgoResponse,    // API 응답
  ScheduleType,      // 'DIRECTLY' | 'SCHEDULED'
  SmsMessageType,    // 'SMS' | 'LMS' | 'MMS'
  FriendtalkMessageType, // 'FT' | 'FI' | 'FW' | ...
} from '@sendgo/node';
```

---

## 예외 처리

```typescript
import { SendgoError } from '@sendgo/node';

try {
  await sendgo.alimtalk.send({ ... });
} catch (error) {
  if (error instanceof SendgoError) {
    console.error({
      statusCode: error.statusCode,   // HTTP 상태 코드
      errorCode:  error.errorCode,    // Sendgo 에러 코드
      message:    error.message,      // 에러 메시지
      endpoint:   error.endpoint,     // 호출된 엔드포인트
    });

    switch (error.errorCode) {
      case 'INVALID_TEMPLATE_CODE': /* 템플릿 코드 확인 */ break;
      case 'PAYMENT_REQUIRED':      /* 크레딧 충전 알림 */ break;
      case 'EMPTY_CONTACTS':        /* 수신자 확인 */      break;
    }
  }
}
```

---

## 설정 옵션

| 옵션 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `accessKey` | `string` | **필수** | — | Sendgo 액세스 키 |
| `secretKey` | `string` | **필수** | — | Sendgo 시크릿 키 |
| `kakaoSenderKey` | `string` | 선택 | — | 카카오 발신프로필 키 |
| `smsSenderKey` | `string` | 선택 | — | SMS 발신자 키 |
| `apiVersion` | `'v1' \| 'v2'` | 선택 | `'v1'` | API 버전 |
| `baseUrl` | `string` | 선택 | `'https://sendgo.io'` | API 기본 URL |

---

## 자주 묻는 질문 (FAQ)

**Q. CommonJS(`require`)를 지원하나요?**
A. 네. `dist/index.js`는 CommonJS 형식으로 빌드되어 `require('@sendgo/node')`로 사용 가능합니다.

**Q. Node.js 16에서 사용할 수 있나요?**
A. 내장 `fetch`가 Node.js 18에서 안정화되었으므로, 18 이상을 권장합니다. Node.js 16에서는 `node-fetch`를 글로벌로 폴리필해야 합니다.

**Q. 토큰은 어떻게 관리되나요?**
A. SDK 내부에서 인메모리로 캐싱(50분)합니다. 서버리스(Lambda, Vercel Functions) 환경에서는 콜드 스타트 시 매번 새 토큰이 발급됩니다.

**Q. 발송 실패 시 자동 재시도가 되나요?**
A. 401/403 응답 시 토큰을 갱신하고 1회 재시도합니다. 그 외 실패는 `SendgoError`로 예외가 발생합니다.

**Q. 알림톡 템플릿은 어디서 만드나요?**
A. [Sendgo 콘솔](https://sendgo.io) → 알림톡 템플릿 → 템플릿 작성 → 카카오 심사 신청

---

## 관련 패키지

| 프레임워크 | 패키지 | GitHub |
|-----------|--------|--------|
| React / Next.js | `@sendgo/react` | [sendgo-react](https://github.com/send-go/react) |
| Vue.js / Nuxt | `@sendgo/vue` | [sendgo-vue](https://github.com/send-go/vue) |
| Spring Boot | `io.sendgo:sendgo-spring` | [spring](https://github.com/send-go/spring) |
| Python | `sendgo-python` | [sendgo-python](https://github.com/send-go/python) |
| 전체 목록 | — | [send-go GitHub 조직](https://github.com/send-go) |

---

## 짧은 URL

짧은 URL 은 메시지 본문의 링크를 줄이고, 그 링크가 실제로 눌렸는지 집계합니다.
문자는 바이트 수가 요금과 직결되므로 링크를 줄이면 그만큼 본문을 더 쓸 수 있습니다.

같은 원본 URL 을 다시 줄이면 **기존 링크가 그대로 반환**됩니다. 캠페인별로 반응을
따로 집계하려면 `forceNew` 로 새 코드를 만드세요.

`deactivate` 는 링크를 삭제하지 않고 리다이렉트만 중지합니다. 이미 발송한 메시지의
링크를 무효화할 때 쓰며, 누적 통계는 남고 이후 접속은 `410 Gone` 이 됩니다.

```typescript
// 짧은 URL 생성 (v2 전용)
const created = await sendgo.shortUrl.create({
  targetUrl: 'https://example.com/promotions/summer-sale',
  title: '여름 세일 랜딩',
});

const { code, shortUrl } = created.data;

// 반응 통계 — 일별 추이 + 디바이스/유입경로/국가별 분해
const stats = await sendgo.shortUrl.stats(code, { from: '2026-08-01' });

await sendgo.shortUrl.list({ count: 10 });
await sendgo.shortUrl.show(code);
await sendgo.shortUrl.deactivate(code);   // 리다이렉트만 중지, 통계는 남는다
```

`stats` 는 일별 추이(`daily`)와 디바이스(`byDevice`)·유입경로(`byReferer`)·국가(`byCountry`)별
분해를 반환합니다. 일별 추이는 사전 집계 표에서 읽으므로 클릭이 많아도 응답 시간이 일정합니다.

## 변경 사항

### 1.2.1 (2026-08-14)

- 레지스트리 목록에 노출되는 패키지 설명에서 친구톡을 브랜드메시지로 교체했습니다.
  npm/PyPI/Packagist/Maven/NuGet/RubyGems 검색 결과에 그대로 찍히는 문자열이라
  종료된 채널을 계속 홍보하고 있었습니다.
- 검색 키워드에 `brand-message` 를 추가했습니다 (`friendtalk` 은 유입 검색어라 유지).

### 1.2.0 (2026-08-14)

- **친구톡 Deprecated 표기** — 친구톡은 카카오 정책에 따라 2025-12-31 종료되었고,
  2026-01-01 부터 발송 요청이 브랜드메시지(자유형)로 자동 대체 발송됩니다.
  관련 API 에 각 언어의 표준 deprecation 표기를 달았습니다.
- 자유 본문 타입(`FT`/`FI`/`FW`)의 개별 발송 경로는 아직 친구톡 API 뿐이라는 점을
  문서에 명시했습니다 — 브랜드메시지 API 는 그 조합에 `NOT_A_BRAND_MESSAGE` 를 반환합니다.
- 브랜드메시지 전환 안내와 메시지 타입 1:1 대응표를 README 에 추가했습니다.

### 1.1.0 (2026-08-11)

- 짧은 URL 추가 — `sendgo.shortUrl`
- `HttpClient.delete()` 추가. `request()` 의 메서드 타입이 `'GET'|'POST'` 로 묶여 DELETE 를 표현할 수 없었다.
- `ShortUrlParams` / `ShortUrlListParams` / `ShortUrlStatsParams` 타입 추가

## 라이선스

MIT License © 2026 [Sendgo](https://sendgo.io)

---

*키워드: 카카오 알림톡 Node.js, 카카오 친구톡 TypeScript, SMS 발송 Node.js, 알림톡 SDK npm, Next.js 알림톡 연동, NestJS 카카오 API, Express 문자 발송, Sendgo Node SDK*
