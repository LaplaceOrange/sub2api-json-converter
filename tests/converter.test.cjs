const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const htmlPath = path.join(__dirname, '..', 'index.html')
const html = fs.readFileSync(htmlPath, 'utf8')
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1]
const sandbox = { module: { exports: {} }, console, setTimeout, clearTimeout }
vm.runInNewContext(script, sandbox, { filename: htmlPath })
const api = sandbox.module.exports

const oauthAccount = {
  name: 'oauth-one',
  platform: 'openai',
  type: 'oauth',
  credentials: {
    access_token: 'access-one',
    refresh_token: 'refresh-one',
    id_token: 'id-one',
    chatgpt_account_id: 'account-one',
    chatgpt_user_id: 'user-one',
    email: 'one@example.com',
    plan_type: 'plus'
  }
}

const agentReplacement = {
  name: 'agent-one-newer',
  platform: 'openai',
  type: 'oauth',
  credentials: {
    auth_mode: 'agentIdentity',
    agent_runtime_id: 'runtime-one',
    agent_private_key: 'private-one',
    chatgpt_account_id: 'account-one',
    chatgpt_user_id: 'user-one',
    email: 'one@example.com',
    plan_type: 'plus'
  }
}

const secondAgent = {
  name: 'agent-two',
  platform: 'openai',
  type: 'oauth',
  credentials: {
    auth_mode: 'agentIdentity',
    agent_runtime_id: 'runtime-two',
    agent_private_key: 'private-two',
    chatgpt_account_id: 'account-two',
    chatgpt_user_id: 'user-two'
  }
}

const first = {
  accounts: [oauthAccount],
  proxies: [{ proxy_key: 'proxy-one', host: 'old.example.com', port: 443 }]
}
const second = {
  accounts: [agentReplacement, secondAgent],
  proxies: [{ proxy_key: 'proxy-one', host: 'new.example.com', port: 443 }]
}

const merged = api.mergePayloads([first, second], { deduplicate: true })
assert.equal(merged.payload.accounts.length, 2)
assert.equal(merged.payload.proxies.length, 1)
assert.equal(merged.duplicateAccounts, 1)
assert.equal(merged.duplicateProxies, 1)
assert.equal(merged.payload.accounts[0].name, 'agent-one-newer')
assert.equal(merged.payload.proxies[0].host, 'new.example.com')

const unfiltered = api.mergePayloads([first, second], { deduplicate: false })
assert.equal(unfiltered.payload.accounts.length, 3)
assert.equal(unfiltered.payload.proxies.length, 2)

const current = api.convertPayload(first, { target: 'current', keepUnknown: true })
assert.equal(current.output.accounts[0].credentials.agent_runtime_id, 'access-one')
assert.equal(current.output.accounts[0].credentials.agent_private_key, 'refresh-one')
assert.equal(current.output.accounts[0].credentials.auth_mode, 'agentIdentity')
assert.ok(!('access_token' in current.output.accounts[0].credentials))
assert.ok(!('refresh_token' in current.output.accounts[0].credentials))
assert.ok(!('id_token' in current.output.accounts[0].credentials))

const legacy = api.convertPayload(second, { target: 'legacy', keepUnknown: true })
assert.equal(legacy.output.accounts[0].credentials.access_token, 'runtime-one')
assert.equal(legacy.output.accounts[0].credentials.refresh_token, 'private-one')
assert.ok(!('agent_runtime_id' in legacy.output.accounts[0].credentials))
assert.ok(!('agent_private_key' in legacy.output.accounts[0].credentials))
assert.ok(!('auth_mode' in legacy.output.accounts[0].credentials))

const outline = api.safeOutline(legacy)
assert.match(outline, /access_token:\[敏感值\]/)
assert.match(outline, /refresh_token:\[敏感值\]/)
assert.ok(!outline.includes('private-one'))

console.log('converter tests passed')
