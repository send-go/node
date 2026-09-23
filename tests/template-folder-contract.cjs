const assert = require('node:assert/strict');
const { Sendgo, SendgoError } = require('../dist');
(async () => {
  const c = new Sendgo({ accessKey: 'test-access', secretKey: 'test-secret', apiVersion: 'v2', baseUrl: process.env.SENDGO_TEST_URL });
  const f = '11111111-1111-4111-8111-111111111111';
  const key = '채널 /?';
  await c.templateFolders.list();
  await c.templateFolders.list({ templateType: 'brand', kakaoSenderKey: key });
  await c.templateFolders.create({ name: '주문' });
  await c.templateFolders.create({ name: '하위', parentUuid: f });
  for (const type of ['notice', 'brand']) {
    await c.templateFolders.assign({ templateType: type, kakaoSenderKey: key, templateCodes: ['코드 1', 'code/2'], folderUuid: f });
    await c.templateFolders.assign({ templateType: type, kakaoSenderKey: key, templateCodes: ['코드 1'], folderUuid: null });
  }
  await c.noticeTemplates.list({ folderUuid: 'none' });
  await c.brandTemplates.list({ folderUuid: f });
  await c.noticeTemplates.create({ templateName: '테스트', folderUuid: f });
  await c.brandTemplates.create({ templateName: '테스트', folderUuid: f });
  for (const [type, status, code] of [['forbidden',403,'ACCESS_KEY_NOT_APPROVED'], ['invalid',422,'VALIDATION_FAILED'], ['missing',404,'TEMPLATE_FOLDER_NOT_FOUND']]) {
    await assert.rejects(c.templateFolders.list({templateType: type}), e => e instanceof SendgoError && e.statusCode === status && e.errorCode === code);
  }
})().catch(e => { console.error(e); process.exit(1); });
