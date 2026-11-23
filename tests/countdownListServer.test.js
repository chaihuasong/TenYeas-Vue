import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import axios from 'axios'
import {
  chooseCountdownList,
  confirmCountdownListWrite,
  countdownListSaveBody,
  displayedCountdown,
  parseCountdownListResponse,
  planCountdownChange
} from '../src/utils/countdown.js'

const NOW = Date.parse('2031-04-16T16:00:00.000Z')

function createContractServer() {
  const docs = new Map()
  const calls = []
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1')
    calls.push(req.method + ' ' + url.pathname)
    if (req.method === 'GET' && url.pathname === '/getUserCountdowns') {
      const userId = (url.searchParams.get('userId') || '').replace(/"/g, '').trim()
      const doc = docs.get(userId)
      const body = doc
        ? { success: true, activeId: doc.activeId, items: doc.items, ...(doc.activeId ? {
          name: doc.items.find(item => item.id === doc.activeId).name,
          deadline: doc.items.find(item => item.id === doc.activeId).deadline
        } : {}) }
        : { success: true, activeId: '', items: [] }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(body))
      return
    }
    if (req.method === 'POST' && url.pathname === '/saveUserCountdowns') {
      const type = req.headers['content-type'] || ''
      if (!type.includes('application/json')) {
        res.writeHead(400, { 'Content-Type': 'text/plain' })
        res.end('bad request')
        return
      }
      let raw = ''
      req.on('data', chunk => { raw += chunk })
      req.on('end', () => {
        let body
        try { body = JSON.parse(raw) } catch (e) {
          res.writeHead(400)
          res.end('bad request')
          return
        }
        const userId = String(body.userId || '').replace(/"/g, '').trim()
        const activeId = body.activeId === 'default' ? '' : String(body.activeId || '')
        const items = Array.isArray(body.items) ? body.items : null
        if (!items) {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: false, message: '请提供倒计时列表' }))
          return
        }
        if (items.length === 0 && activeId === '') {
          docs.delete(userId)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: true, activeId: '', items: [] }))
          return
        }
        docs.set(userId, { activeId, items })
        const saved = { success: true, activeId, items }
        if (activeId) {
          const current = items.find(item => item.id === activeId)
          saved.name = current.name
          saved.deadline = current.deadline
        }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(saved))
      })
      return
    }
    if (url.pathname === '/saveUserCountdown' || url.pathname === '/getUserCountdown' || url.pathname === '/clearUserCountdown') {
      calls.push('legacy ' + url.pathname)
      res.writeHead(500)
      res.end('legacy')
      return
    }
    res.writeHead(404)
    res.end('missing')
  })
  return { server, docs, calls }
}

async function listen(server) {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  return 'http://127.0.0.1:' + server.address().port + '/'
}

test('本地契约服务可以新增、刷新、切换、编辑和删除，失败不会改掉已保存列表', async () => {
  const { server, calls } = createContractServer()
  const base = await listen(server)
  try {
    const userId = 'union-a'
    let loaded = parseCountdownListResponse((await axios.get(base + 'getUserCountdowns?userId=' + userId)).data)
    assert.deepEqual(loaded.state, { items: [], activeId: '' })
    let state = loaded.state
    state = (await save(base, userId, planCountdownChange(state, {
      type: 'add', id: 'morning', name: '晨起', deadline: '2031-06-01 08:00:00'
    }))).state
    state = (await save(base, userId, planCountdownChange(state, {
      type: 'add', id: 'evening', name: '晚课', deadline: '2031-07-01 21:30:00'
    }))).state
    const again = parseCountdownListResponse((await axios.get(base + 'getUserCountdowns?userId=' + userId)).data)
    assert.equal(again.state.items.length, 2)
    assert.equal(again.state.activeId, 'evening')
    assert.equal(displayedCountdown(again.state, NOW).name, '晚课')

    state = (await save(base, userId, planCountdownChange(again.state, {
      type: 'edit', id: 'morning', name: '晨起改', deadline: '2031-06-02 07:15:00'
    }))).state
    assert.equal(state.items.find(item => item.id === 'evening').deadline, '2031-07-01 21:30:00')
    assert.equal(state.items.find(item => item.id === 'morning').name, '晨起改')

    state = (await save(base, userId, planCountdownChange(state, { type: 'select', id: '' }))).state
    assert.equal(state.activeId, '')
    assert.equal(state.items.length, 2)
    assert.equal(displayedCountdown(state, NOW).name, '十年倒计时')
    const quiet = (await axios.get(base + 'getUserCountdowns?userId=' + userId)).data
    assert.equal(quiet.activeId, '')
    assert.equal(quiet.name, undefined)
    assert.equal(quiet.items.length, 2)

    state = (await save(base, userId, planCountdownChange(state, { type: 'select', id: 'evening' }))).state
    const beforeDelete = state
    const failed = await axios.post(base + 'saveUserCountdowns', { userId, activeId: 'missing' }, {
      headers: { 'Content-Type': 'application/json' }
    })
    assert.equal(confirmCountdownListWrite(failed.data, beforeDelete).ok, false)
    const still = parseCountdownListResponse((await axios.get(base + 'getUserCountdowns?userId=' + userId)).data)
    assert.equal(still.state.items.length, 2)
    assert.equal(still.state.activeId, 'evening')

    state = (await save(base, userId, planCountdownChange(still.state, { type: 'remove', id: 'morning' }))).state
    assert.deepEqual(state.items.map(item => item.id), ['evening'])
    state = (await save(base, userId, planCountdownChange(state, { type: 'remove', id: 'evening' }))).state
    assert.equal(state.activeId, '')
    assert.equal(state.items.length, 0)
    assert.equal(calls.some(call => call.includes('saveUserCountdown') && !call.includes('saveUserCountdowns')), false)
    assert.equal(calls.includes('GET /getUserCountdown'), false)
  } finally {
    await new Promise(resolve => server.close(resolve))
  }
})

async function save(base, userId, plan) {
  assert.equal(plan.ok, true)
  const res = await axios.post(base + 'saveUserCountdowns', countdownListSaveBody(userId, plan.nextState), {
    headers: { 'Content-Type': 'application/json' }
  })
  const confirmed = confirmCountdownListWrite(res.data, plan.nextState)
  assert.equal(confirmed.ok, true)
  return confirmed
}

test('列表接口 404 时保留已有数据，不改用旧的单条接口', async () => {
  const calls = []
  const server = http.createServer((req, res) => {
    calls.push(req.method + ' ' + req.url.split('?')[0])
    res.writeHead(404)
    res.end('missing')
  })
  const base = await listen(server)
  try {
    const kept = {
      items: [{ id: 'legacy', name: '旧的', deadline: '2031-04-17 23:59:59' }],
      activeId: 'legacy'
    }
    let thrown = false
    try {
      await axios.get(base + 'getUserCountdowns?userId=union-a')
    } catch (err) {
      thrown = err.response.status === 404
    }
    assert.equal(thrown, true)
    const chosen = chooseCountdownList({ status: 'unavailable', message: '多个倒计时接口还不可用，没有改动已保存的倒计时。' }, kept)
    assert.equal(chosen.state.items[0].name, '旧的')
    assert.equal(chosen.clearLocal, false)
    assert.equal(calls.includes('POST /saveUserCountdown'), false)
    assert.equal(calls.includes('POST /clearUserCountdown'), false)
  } finally {
    await new Promise(resolve => server.close(resolve))
  }
})
