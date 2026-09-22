const assert = require('node:assert/strict');
const { AccountClient, SendgoError } = require('../dist');
(async () => {
const baseUrl = process.env.SENDGO_TEST_URL + '/';
assert.throws(() => new AccountClient({agentToken: ''}));
const c = new AccountClient({agentToken: 'test-agent', baseUrl});
assert.equal((await c.me()).message, "Success");
assert.equal((await c.organizations()).message, "Success");
assert.equal((await c.selectOrganization(null)).message, "Success");
assert.equal((await c.selectOrganization("team-id")).message, "Success");
assert.equal((await c.apiKeys()).message, "Success");
assert.equal((await c.createApiKey({"name": "한글 이름", "ipAddresses": [{"ip": "192.0.2.1", "description": "서버"}]})).message, "Success");
assert.equal((await c.apiKey("key/id ?")).message, "Success");
assert.equal((await c.updateApiKey("key/id ?", "새 이름")).message, "Success");
assert.equal((await c.deleteApiKey("key/id ?")).message, "Success");
assert.equal((await c.issueToken("key/id ?")).message, "Success");
assert.equal((await c.allowedIps("key/id ?")).message, "Success");
assert.equal((await c.addAllowedIp("key/id ?", {"ip": "192.0.2.1", "description": "서버"})).message, "Success");
assert.equal((await c.deleteAllowedIp("key/id ?", "ip/id ?")).message, "Success");
for (const [token, status, code] of [['expired', 401, 'AGENT_TOKEN_EXPIRED'], ['forbidden', 403, 'AGENT_ABILITY_MISSING']]) {
 await assert.rejects(new AccountClient({agentToken: token, baseUrl}).me(), e => e instanceof SendgoError && e.statusCode === status && e.errorCode === code);
}
})().catch(e => { console.error(e); process.exit(1); });
