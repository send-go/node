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

## 관리 API — 채널·템플릿·발신번호 등록 (v2 전용)

발송은 처음부터 API였지만 **등록과 심사는 콘솔에서만** 되던 것들이 있었습니다.
1.3.0 부터 그 작업도 코드로 처리합니다.

| 서비스 | 하는 일 | 계정 |
| --- | --- | --- |
| `sendgo.kakaoSenders` | 카카오 채널 인증·등록·동기화, 브랜드메시지 M/N 신청 | 기업 |
| `sendgo.noticeTemplates` | 알림톡 템플릿 CRUD, 검수 요청·취소, 승인 취소, 휴면 해제 | 기업 |
| `sendgo.brandTemplates` | 브랜드메시지(구 친구톡) 템플릿 CRUD, 동기화, 가져오기 | 기업 |
| `sendgo.senderRegistration` | 발신번호 등록 신청, 중복 확인, 유형 안내 | 개인·기업 |
| `sendgo.messageTemplates` | 문자 상용구 템플릿 CRUD | 개인·기업 |
| `sendgo.kakaoImages` | 카카오 이미지 업로드 — 템플릿용 URL 발급 | 기업 |
| `sendgo.rejectedNumbers` | 수신거부(080) 번호 조회 | 개인·기업 |
| `sendgo.webhook` | 이벤트 웹훅 구독 — 심사 결과 수신 | 개인·기업 |

> **sendgo.io 콘솔에 들어올 일이 없습니다.** 고객의 채널·발신번호·템플릿을
> 여러분 화면만으로 끝까지 처리할 수 있습니다. 휴대폰 발신번호는 콘솔의 PASS
> 본인인증 대신 **신분증 사본(`identityDocument`)을 받아 sendgo 운영자가 대신
> 심사**합니다.
>
> 사람이 개입하는 지점은 **카카오 채널 인증번호 하나**뿐이고, 그마저도
> 여러분 화면에서 입력받으면 됩니다 — 카카오가 관리자 휴대폰으로 직접 보내는
> 확인이라 없앨 수 없습니다.
>
> 심사가 붙는 것들은 **비동기**입니다. 등록 호출이 성공했다는 건 "접수됐다"는
> 뜻이지 "쓸 수 있다"는 뜻이 아닙니다 — 웹훅을 구독해 결과를 받으세요.

### 카카오 채널 등록

```ts
// 1단계 — 카카오가 관리자 휴대폰으로 인증번호를 SMS 발송한다 (응답에 번호는 없다)
await sendgo.kakaoSenders.requestToken('@my-channel', '01012345678');

// 2단계 — 사람이 받은 인증번호로 발신프로필 생성
const created = await sendgo.kakaoSenders.create({
  token: '123456',
  yellowId: '@my-channel',
  phoneNumber: '01012345678',
  categoryCode: '001001',          // categories() 로 조회
});

const kakaoSenderKey = created.data.sender.kakaoSenderKey;

await sendgo.kakaoSenders.categories();
await sendgo.kakaoSenders.list();
await sendgo.kakaoSenders.sync();               // 전체 상태 동기화 (하루 한 번 권장)
await sendgo.kakaoSenders.sync(kakaoSenderKey); // 단건
```

채널이 카카오 쪽에서 차단되면 발송이 조용히 실패하기 시작합니다. `sync()` 를
주기적으로 돌리고 `block: true` 인 채널을 감시하세요.

### 알림톡 템플릿 등록과 검수

```ts
const created = await sendgo.noticeTemplates.create({
  kakaoSenderKey,
  templateName: '주문 접수 안내',
  templateContent: '#{name}님, 주문 #{orderNo}이 접수되었습니다.',
  templateMessageType: 'BA',       // BA 기본형 / EX 부가정보형 / AD 채널추가형 / MI 복합형
  templateEmphasizeType: 'NONE',   // NONE / TEXT / ITEM_LIST / IMAGE
  categoryCode: '001001',

  // sendgo 자체 정책 게이트 — 카카오 심사와 별개이며 빠뜨리면 거절된다
  messagePurpose: 'order_delivery',
  legalBasis: 'transaction',
  benefitOrigin: 'none',
  expiryType: 'none',
  optInReviewConfirmed: true,
  ctaClearConfirmed: true,
  policyConfirmed: true,
});

const templateCode = created.data.template.templateCode;

// 검수 요청 — 증빙이 필요하면 파일도 붙인다 (첨부가 있으면 comment 필수)
await sendgo.noticeTemplates.requestInspection(templateCode);

// 결과는 비동기다. 웹훅이 없으므로 폴링한다
const synced = await sendgo.noticeTemplates.sync(templateCode);
synced.data.template.inspectionStatus;   // REG → REQ → APR / REJ
```

정책 필드 조합이 본문과 어긋나면 저장 단계에서 `POLICY_VALIDATION_FAILED` 로
막힙니다. 응답 `errors.reasons` 에 사유가 한국어로 담기니 그대로 사용자에게
보여 주면 됩니다. 여기서 걸리는 문안은 **카카오 심사에서도 거의 반려**되므로,
며칠 기다렸다 반려당하는 것보다 즉시 아는 편이 낫습니다.

```ts
await sendgo.noticeTemplates.list({ kakaoSenderKey, inspectionStatus: 'APR' });
await sendgo.noticeTemplates.show(templateCode);
await sendgo.noticeTemplates.update(templateCode, { /* ... */ });  // 본문이 바뀌면 재검수 필요
await sendgo.noticeTemplates.cancelInspection(templateCode);
await sendgo.noticeTemplates.cancelApproval(templateCode);
await sendgo.noticeTemplates.release(templateCode);                // 휴면 해제
await sendgo.noticeTemplates.delete(templateCode);                 // sendgo 목록에서만 삭제된다
await sendgo.noticeTemplates.categories();
```

이미지 템플릿과 검수 첨부는 multipart 로 나갑니다. `Blob` 을 넘기면 됩니다.

```ts
import { readFile } from 'node:fs/promises';

const image = { value: new Blob([await readFile('banner.jpg')]), filename: 'banner.jpg' };

await sendgo.noticeTemplates.createWithImage({ /* ...필드 동일 */ }, image);
await sendgo.noticeTemplates.requestInspection(templateCode, '주문 확인 화면 첨부', [image]);
```

> **삭제 동작이 채널마다 다릅니다.** 알림톡 템플릿은 카카오에 삭제 API 가 없어
> sendgo 목록에서만 빠지고 동기화하면 되살아납니다. 브랜드메시지 템플릿은
> 카카오 쪽에서도 실제로 삭제됩니다.

### 브랜드메시지 템플릿

```ts
const created = await sendgo.brandTemplates.create({
  kakaoSenderKey,
  templateName: '여름 세일 안내',
  templateType: 'FI',              // FT/FI/FW/FL/FC/FM/FP/FA — 서버가 chatBubbleType 으로 변환
  templateContent: '여름 세일이 시작되었습니다.',
  imageUrl: 'https://mud-kage.kakao.com/....jpg',
});

// 동보 발송(targeting=F)에는 변수가 없는 템플릿만 쓸 수 있다
created.data.template.containsVariables;

await sendgo.brandTemplates.list({ kakaoSenderKey });
await sendgo.brandTemplates.sync(templateCode);
await sendgo.brandTemplates.import(kakaoSenderKey);   // 카카오에 있는 템플릿 가져오기
await sendgo.brandTemplates.delete(templateCode);     // 카카오에서도 삭제된다
```

### 발신번호 등록 신청

```ts
import { readFile } from 'node:fs/promises';

// 계정 종류에 맞는 유형과 유형별 필수 서류
await sendgo.senderRegistration.numberTypes();

// 형식·중복 미리 확인
const check = await sendgo.senderRegistration.validate('02-1234-5678', 'team_main');

const created = await sendgo.senderRegistration.create(
  {
    senderAlias: '고객센터 대표번호',
    senderNumberType: 'team_main',   // personal_other / team_main / team_other_company
    phoneE164: '02-1234-5678',
    // check.data.duplicationReasonRequired 가 true 면 필수
    // duplicationReason: '부서별 분리 운영',
  },
  {
    csuCertificate: {
      value: new Blob([await readFile('csu.pdf')]),
      filename: 'csu.pdf',
    },
  },
);

created.data.sender.status;   // PENDING — 운영자 승인 후 SUCCESS

await sendgo.senderRegistration.list();
await sendgo.senderRegistration.update(senderKey, { senderAlias: '새 이름' });
await sendgo.senderRegistration.delete(senderKey);
```

**휴대폰 유형도 API 로 접수할 수 있습니다.** 콘솔의 PASS 본인인증 대신
신분증 사본(`identityDocument`)을 첨부하면 sendgo 운영자가 직접 확인합니다.
이 경로로 접수된 건은 응답의 `identityVerificationMethod` 가 `document` 이고
**자동 승인되지 않습니다** — 운영자 확인 전까지 `PENDING` 입니다.

유형별 필수 서류는 `numberTypes()` 응답의 `requiredDocuments` 로 확인하세요.
반려되면 `rejectionReason` 에 사유가 담깁니다.

### 문자 템플릿

```ts
await sendgo.messageTemplates.create({
  messageTranType: 'LMS',
  messageTranSubject: '주문 안내',   // LMS·MMS 는 필수
  messageTranMsg: '주문이 접수되었습니다.',
});

await sendgo.messageTemplates.list({ messageType: 'LMS' });
await sendgo.messageTemplates.update(templateKey, { /* ... */ });
await sendgo.messageTemplates.delete(templateKey);
```

### 이벤트 웹훅 — 심사 결과를 밀어 받기

```ts
const created = await sendgo.webhook.subscribe({
  url: 'https://reseller.example.com/hooks/sendgo',
});

// 시크릿은 이 응답에서 한 번만 나온다. 즉시 저장한다.
const secret = created.data.secret;

await sendgo.webhook.show();          // 구독 설정 + 마지막 전송 결과
await sendgo.webhook.test();          // 배선 확인
await sendgo.webhook.unsubscribe();
```

받는 쪽에서는 **원본 바이트**로 서명을 검증합니다. JSON 파서보다 먼저
raw 바디를 잡아야 합니다.

```ts
import express from 'express';
import { WebhookService } from '@sendgo/node';

app.post('/hooks/sendgo', express.raw({ type: 'application/json' }), (req, res) => {
  if (!WebhookService.verifySignature(req.body, req.get('X-Sendgo-Signature') ?? '', secret)) {
    return res.sendStatus(401);
  }

  const { event, data, deliveryId } = JSON.parse(req.body.toString('utf8'));

  // 같은 이벤트가 두 번 올 수 있다 — deliveryId 로 걸러낸다.
  queue.add(event, { data, deliveryId });

  res.sendStatus(204);   // 처리는 큐로. 여기서 오래 끌면 재시도가 쌓인다.
});
```

이벤트 목록은 `WEBHOOK_EVENTS` 로 확인할 수 있습니다.

### 카카오 이미지 업로드

브랜드메시지 템플릿의 `imageUrl` 은 **카카오가 호스팅하는 URL** 이어야 합니다.

```ts
import { readFile } from 'node:fs/promises';

const uploaded = await sendgo.kakaoImages.upload('default', {
  value: new Blob([await readFile('banner.jpg')]),
  filename: 'banner.jpg',
});

await sendgo.brandTemplates.create({
  kakaoSenderKey,
  templateName: '여름 세일 안내',
  templateType: 'FI',
  imageUrl: uploaded.data.imageUrl,
});

await sendgo.kakaoImages.uploadMany('carousel_feed', [slide1, slide2, slide3]);
await sendgo.kakaoImages.types();   // 유형별 필드·최대 개수
```

### 수신거부(080) 동기화

```ts
// 증분만 가져간다. 하루 한 번이면 충분하다.
await sendgo.rejectedNumbers.list({ since: '2026-09-01', count: 500 });
```

---

## 변경 사항

### 1.3.0 (2026-09-11)

- **관리 API 추가** — 콘솔에서만 되던 등록·심사를 코드로 처리합니다.
  `sendgo.kakaoSenders`(채널 인증·등록·동기화, 브랜드메시지 M/N 신청),
  `sendgo.noticeTemplates`(알림톡 템플릿 CRUD·검수 요청·승인 취소·휴면 해제),
  `sendgo.brandTemplates`(브랜드메시지 템플릿 CRUD·동기화·가져오기),
  `sendgo.senderRegistration`(발신번호 등록 신청·중복 확인·유형 안내),
  `sendgo.messageTemplates`(문자 상용구 템플릿 CRUD).
- `HttpClient` 에 `put()`·`patch()`·`postMultipart()` 를 추가했습니다.
  서류 첨부와 이미지 템플릿은 JSON 으로 보낼 수 없습니다.
- 관리 API 의 요청 타입을 모두 export 했습니다 — `NoticeTemplateParams`,
  `BrandTemplateParams`, `SenderRegistrationParams`, `MultipartFile` 등.
- **리셀러는 sendgo.io 콘솔에 들어올 일이 없습니다.** 사람이 개입하는 지점은
  카카오 채널 인증번호 하나뿐이고, 그것도 리셀러 화면에서 입력받으면 됩니다.
- **이벤트 웹훅** 추가 — 발신번호 승인, 알림톡 검수 결과, 채널 차단,
  브랜드메시지 타겟팅 결과를 구독해 받습니다. 서명은 받은 원본 바이트로
  검증합니다(SDK 에 검증 헬퍼 포함).
- **카카오 이미지 업로드** 추가 — 브랜드메시지 템플릿의 `imageUrl` 은 카카오가
  호스팅하는 URL 이어야 하는데, 그 URL 을 얻는 길이 콘솔에만 있었습니다.
- **수신거부(080) 조회** 추가 — 자기 DB 의 수신 상태를 맞출 수 있습니다.

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

## 계정·조직·API 키 관리 (1.5.0)

발송용 `accessKey`/`secretKey`가 없는 단계에서 사용하는 **별도 계정 클라이언트**입니다.
콘솔에서 발급받은 에이전트 토큰(`SENDGO_AGENT_TOKEN`)으로 `/api/v2/account`를 호출합니다.
계정 조회에는 `account:read`, 키·허용 IP 변경에는 `keys:write` 권한이 필요합니다.
토큰 만료나 권한 부족(401/403)은 그대로 예외로 반환하며 자동 갱신·재시도하지 않습니다.

조직 선택은 서버에 저장되는 **사용자 계정의 현재 조직**을 바꿉니다. 같은 사용자로
여러 조직의 설정을 동시에 변경하지 마세요. 개인 계정으로 돌아가려면 조직 ID에
`null`(Python `None`, Ruby `nil`, Go `nil`) 또는 `personal`을 전달합니다.
키 발급 응답의 `data.apiKey.secretKey`는 한 번만 반환되므로 서버의 비밀 저장소에 보관하세요.
허용 IP가 하나라도 등록되면 목록 밖의 IP는 차단됩니다.
에이전트 토큰과 키는 브라우저·모바일 앱에 포함하거나 응답·로그에 출력하지 않습니다.

```typescript
import { AccountClient } from '@sendgo/node';
const account = new AccountClient({ agentToken: process.env.SENDGO_AGENT_TOKEN! });
const result = await account.me();
await account.selectOrganization('team-uuid');
const issued = await account.createApiKey({ name: '서버 연동' });
```

지원 메서드: `me`, `organizations`, `selectOrganization`, `apiKeys`, `createApiKey`, `apiKey`, `updateApiKey`, `deleteApiKey`, `issueToken`, `allowedIps`, `addAllowedIp`, `deleteAllowedIp`.

키 생성 인자는 `name`, 선택적 `ipAddresses: [{ip, description}]`이며, 허용 IP 추가 인자는 `ip`, 선택적 `description`입니다. 키·IP 식별자는 응답의 `id`(UUID)를 사용합니다.

## 템플릿 폴더 (1.5.0)

기업 계정의 발송용 API 키와 `apiVersion=v2` 설정으로 사용하는 서버 전용 API입니다.
폴더는 알림톡·브랜드메시지가 공유하며, 목록의 `templateType`은 `notice` 또는 `brand`입니다.
목록은 `data.folders` 트리와 `total`, `uncategorised` 개수를 반환합니다.
`templateCount`는 하위 폴더를 제외한 해당 폴더의 템플릿 수입니다.

- 생성: `name`, 선택 `parentUuid`. 최대 5단계이며 같은 부모 아래 이름 중복은 409입니다.
- 이동: 동일 발신프로필의 `templateCodes` 1~100개. `folderUuid`는 필수이며 `null`이면 미분류로 이동합니다.
- 템플릿 목록: `folderUuid=none`은 미분류, UUID는 해당 폴더, 생략은 전체입니다.
- 템플릿 등록: 선택 필드 `folderUuid`로 폴더를 지정합니다. 기존 템플릿 수정 API 대신 폴더 이동 API를 사용하세요.

승인되지 않은 키의 `403 ACCESS_KEY_NOT_APPROVED`는 토큰 재발급·재시도 없이 반환합니다.
계정 API의 `autoApprove`는 서버 설정의 실제 승인 정책을 나타냅니다.

```ts
const folders = await sendgo.templateFolders.list({ templateType: 'notice' });
const created = await sendgo.templateFolders.create({ name: '주문 안내' });
await sendgo.templateFolders.assign({
  templateType: 'notice', kakaoSenderKey, templateCodes: ['ORDER_001'], folderUuid: null,
});
await sendgo.noticeTemplates.list({ folderUuid: 'none' });
```
