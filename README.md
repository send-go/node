# @sendgo/node

> **Sendgo** Node.js / TypeScript SDK
> 카카오 알림톡(Alimtalk), 친구톡(Friendtalk), SMS/LMS/MMS를 Node.js에서 간편하게 사용하세요.

[![npm](https://img.shields.io/npm/v/@sendgo/node)](https://www.npmjs.com/package/@sendgo/node)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org)

---

## 빠른 시작 (3단계)

### 1단계 — 패키지 설치

```bash
npm install @sendgo/node
# 또는
pnpm add @sendgo/node
# 또는
yarn add @sendgo/node
```

---

### 2단계 — 환경변수 설정

`.env` 파일:
```env
SENDGO_ACCESS_KEY=your_access_key
SENDGO_SECRET_KEY=your_secret_key
SENDGO_KAKAO_SENDER_KEY=your_kakao_sender_key
SENDGO_SMS_SENDER_KEY=your_sms_sender_key

# v2 API 사용 시
SENDGO_API_VERSION=v2
```

> **발신프로필 키 발급 방법**
> [Sendgo 콘솔](https://sendgo.io) → 카카오 발신프로필 → 발신프로필 등록 → 채널 연결 후 키 복사

---

### 3단계 — 알림톡 전송

```typescript
import Sendgo from '@sendgo/node';

const sendgo = new Sendgo({
  accessKey: process.env.SENDGO_ACCESS_KEY!,
  secretKey: process.env.SENDGO_SECRET_KEY!,
  kakaoSenderKey: process.env.SENDGO_KAKAO_SENDER_KEY,
  smsSenderKey: process.env.SENDGO_SMS_SENDER_KEY,
  apiVersion: 'v2',
});

await sendgo.alimtalk.send({
  templateCode: 'ORDER_CONFIRM_001', // SendGo에서 승인받은 템플릿 코드
  contacts: [
    {
      contact: '01012345678',    // 수신자 전화번호 (필수)
      name: '홍길동',            // 수신자 이름 (선택)
      var1: 'ORD-20260101-001',  // 템플릿 변수 #{var1}
    },
  ],
});
```

---

## 기능별 사용법

### 카카오 알림톡 (Alimtalk)

#### 단건 전송

```typescript
await sendgo.alimtalk.send({
  templateCode: 'ORDER_CONFIRM_001',
  contacts: [{
    contact: '01012345678',
    name: '홍길동',
    var1: 'ORD-20260101-001',  // 주문번호
    var2: '스프링 입문서',      // 상품명
    var3: '29,000원',          // 금액
  }],
});
```

#### 다건 발송

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
  templateCode: 'PROMO_001',
  scheduleType: 'SCHEDULED',
  at: '2026-04-01 09:00:00',  // 예약 발송 시각 (Y-m-d H:i:s)
  contacts: [{ contact: '01012345678', var1: '봄맞이 30% 할인' }],
});
```

#### 알림톡 실패 시 SMS 대체 발송

```typescript
await sendgo.alimtalk.send({
  templateCode: 'DELIVERY_001',
  replaceSms: 'Y',
  smsSubject: '[배송 시작 안내]',
  smsContent: '주문하신 상품이 출고되었습니다.\n송장번호: 1234567890',
  contacts: [{
    contact: '01012345678',
    var1: 'ORD-001',
    var2: '1234567890',
  }],
});
```

---

### 카카오 친구톡 (Friendtalk)

#### 텍스트 친구톡

```typescript
await sendgo.friendtalk.send({
  content: '안녕하세요! 봄맞이 30% 할인 이벤트가 시작되었습니다.',
  contacts: [{ contact: '01012345678' }],
});
```

#### 이미지 포함 친구톡

```typescript
await sendgo.friendtalk.send({
  messageType: 'FI',  // 이미지형
  content: '이번 주 특가 상품을 확인하세요!',
  imageUrl: 'https://example.com/event-banner.jpg',
  imageLink: 'https://example.com/event',
  contacts: [{ contact: '01012345678' }],
});
```

#### 버튼 포함 친구톡

```typescript
await sendgo.friendtalk.send({
  content: '이벤트 페이지를 방문해 보세요.',
  buttons: [
    {
      name: '이벤트 보기',
      type: 'WL',
      url_mobile: 'https://example.com/event',
    },
  ],
  contacts: [{ contact: '01012345678' }],
});
```

---

### SMS / LMS / MMS

```typescript
// SMS (단문, 90자 이하)
await sendgo.sms.sendSms({
  content: '인증번호: 123456',
  contacts: [{ contact: '01012345678' }],
});

// LMS (장문, 2,000자 이하)
await sendgo.sms.sendLms({
  subject: '[공지] 서비스 점검 안내',
  content: '안녕하세요.\n\n서비스 점검이 예정되어 있습니다.\n일시: 2026-04-01 02:00 ~ 06:00',
  contacts: [{ contact: '01012345678' }],
});

// MMS (멀티미디어)
await sendgo.sms.sendMms({
  subject: '[이벤트] 봄 특가',
  content: '이번 주 특가 상품을 확인하세요!',
  contacts: [{ contact: '01012345678' }],
});
```

---

## 예외 처리

```typescript
import Sendgo, { SendgoError } from '@sendgo/node';

try {
  await sendgo.alimtalk.send({ ... });
} catch (error) {
  if (error instanceof SendgoError) {
    console.error('발송 실패:', {
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      message: error.message,
      endpoint: error.endpoint,
    });

    switch (error.errorCode) {
      case 'INVALID_ACCESS_KEY':
      case 'INVALID_SECRET_KEY':
        console.error('인증키를 확인하세요.');
        break;
      case 'INVALID_TEMPLATE_CODE':
        console.error('템플릿 코드를 확인하세요.');
        break;
      case 'PAYMENT_REQUIRED':
        console.error('크레딧이 부족합니다.');
        break;
      case 'EMPTY_CONTACTS':
        console.error('수신자 정보를 확인하세요.');
        break;
    }
  }
}
```

---

## Next.js 통합 예시

```typescript
// app/api/notify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Sendgo from '@sendgo/node';

const sendgo = new Sendgo({
  accessKey: process.env.SENDGO_ACCESS_KEY!,
  secretKey: process.env.SENDGO_SECRET_KEY!,
  kakaoSenderKey: process.env.SENDGO_KAKAO_SENDER_KEY,
  apiVersion: 'v2',
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

---

## Express 통합 예시

```typescript
import express from 'express';
import Sendgo from '@sendgo/node';

const sendgo = new Sendgo({
  accessKey: process.env.SENDGO_ACCESS_KEY!,
  secretKey: process.env.SENDGO_SECRET_KEY!,
  kakaoSenderKey: process.env.SENDGO_KAKAO_SENDER_KEY,
});

const app = express();
app.use(express.json());

app.post('/notify', async (req, res) => {
  const { phone, orderNumber } = req.body;

  await sendgo.alimtalk.send({
    templateCode: 'ORDER_CONFIRM_001',
    contacts: [{ contact: phone, var1: orderNumber }],
  });

  res.json({ success: true });
});
```

---

## v2 API 사용법

```typescript
const sendgo = new Sendgo({
  accessKey: process.env.SENDGO_ACCESS_KEY!,
  secretKey: process.env.SENDGO_SECRET_KEY!,
  apiVersion: 'v2',  // v2 API 활성화
});
```

v2는 에러 코드가 세분화되어 있으며, 아래 코드는 토큰 재발급 없이 즉시 에러를 발생시킵니다:

| 에러 코드 | 설명 |
|-----------|------|
| `INVALID_ACCESS_KEY` | 잘못된 액세스 키 |
| `INVALID_SECRET_KEY` | 잘못된 시크릿 키 |
| `ACCESS_KEY_NOT_APPROVED` | 미승인 앱 |
| `IP_NOT_ALLOWED` | 허용되지 않은 IP |
| `INVALID_SENDER_KEY` | 잘못된 SMS 발신키 |
| `INVALID_KAKAO_SENDER_KEY` | 잘못된 카카오 발신키 |

---

## 설정 옵션

| 옵션 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `accessKey` | `string` | 필수 | — | Sendgo 액세스 키 |
| `secretKey` | `string` | 필수 | — | Sendgo 시크릿 키 |
| `kakaoSenderKey` | `string` | 선택 | — | 카카오 발신프로필 키 |
| `smsSenderKey` | `string` | 선택 | — | SMS 발신자 키 |
| `apiVersion` | `'v1' \| 'v2'` | 선택 | `'v1'` | API 버전 |
| `baseUrl` | `string` | 선택 | `'https://api.sendgo.io'` | API 기본 URL |

---

## 라이선스

MIT License © [Sendgo](https://sendgo.io)
