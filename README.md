# @sendgo/node

> **Node.js / TypeScript에서 카카오 알림톡, 친구톡, SMS를 가장 쉽게 발송하는 SDK**

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
| `baseUrl` | `string` | 선택 | `'https://api.sendgo.io'` | API 기본 URL |

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
| Spring Boot | `io.sendgo:sendgo-spring` | [sendgo-spring-boot-starter](https://github.com/send-go/spring) |
| Python | `sendgo-python` | [sendgo-python](https://github.com/send-go/python) |
| 전체 목록 | — | [send-go GitHub 조직](https://github.com/send-go) |

---

## 라이선스

MIT License © 2026 [Sendgo](https://sendgo.io)

---

*키워드: 카카오 알림톡 Node.js, 카카오 친구톡 TypeScript, SMS 발송 Node.js, 알림톡 SDK npm, Next.js 알림톡 연동, NestJS 카카오 API, Express 문자 발송, Sendgo Node SDK*
