import test from 'node:test'
import assert from 'node:assert/strict'
import {
  LEGACY_COUNTDOWN_DATE_TEXT,
  LEGACY_COUNTDOWN_NAME,
  clearStoredCountdown,
  countdownFormValues,
  legacyRemainingDays,
  COUNTDOWN_ITEM_MAX,
  LEGACY_ITEM_ID,
  LIST_UNAVAILABLE_MESSAGE,
  chooseCountdown,
  chooseCountdownList,
  confirmCountdownListWrite,
  confirmCountdownWrite,
  countdownListSaveBody,
  countdownStateFromPayload,
  displayedCountdown,
  parseCountdownListResponse,
  parseCountdownResponse,
  parseWriteResponse,
  planCountdownChange,
  readStoredCountdown,
  readStoredCountdownState,
  resolveCountdown,
  sameAccount,
  validateCountdownInput,
  writeStoredCountdown,
  writeStoredCountdownState
} from '../src/utils/countdown.js'

const NOW = Date.parse('2031-04-16T16:00:00.000Z')

test('未配置时沿用原来的十年倒计时文案和天数', () => {
  const view = resolveCountdown(null, NOW)
  assert.equal(view.legacy, true)
  assert.equal(view.name, LEGACY_COUNTDOWN_NAME)
  assert.equal(view.dateText, LEGACY_COUNTDOWN_DATE_TEXT)
  assert.equal(view.days, legacyRemainingDays(NOW))
  assert.equal(view.days, resolveCountdown('', NOW).days)
  assert.equal(view.days, resolveCountdown('null', NOW).days)
})

test('旧的日期配置按北京时间当天结束兼容', () => {
  const view = resolveCountdown(
    { name: '十年倒计时', deadline: '2031-04-17' },
    Date.parse('2031-04-16T15:00:00.000Z')
  )
  assert.equal(view.legacy, false)
  assert.equal(view.dateText, '2031年04月17日 23:59')
  assert.equal(view.days, 1)
})

test('自定义名称和北京时间截止点会改变剩余天数', () => {
  const morning = resolveCountdown({
    name: '每日打卡倒计时',
    deadline: '2031-04-17 08:00:00'
  }, Date.parse('2031-04-16T16:30:00.000Z'))
  assert.equal(morning.name, '每日打卡倒计时')
  assert.equal(morning.dateText, '2031年04月17日 08:00')
  assert.equal(morning.days, 0)

  const evening = resolveCountdown({
    name: '每日打卡倒计时',
    endTime: '2031-04-17T23:59:59+08:00'
  }, Date.parse('2031-04-15T16:00:00.000Z'))
  assert.equal(evening.days, 1)
})

test('非法或超长配置回退到旧倒计时，不显示 NaN', () => {
  const bad = resolveCountdown({ name: '阶段打卡', deadline: '2031-02-31 10:00:00' }, NOW)
  assert.equal(bad.legacy, true)
  assert.equal(bad.name, LEGACY_COUNTDOWN_NAME)
  const longName = resolveCountdown({ name: '一二三四五六七八九十一二三四五六七八九十一', deadline: '2031-05-01 00:00:00' }, NOW)
  assert.equal(longName.legacy, true)
})

test('截止时间已过时天数归零', () => {
  const view = resolveCountdown({
    name: '收官',
    deadline: '2030-01-01 00:00:00'
  }, NOW)
  assert.equal(view.days, 0)
})

test('首页修改时校验名称和截止时间', () => {
  assert.equal(validateCountdownInput('  ', '2031-04-17 08:00:00').ok, false)
  assert.equal(validateCountdownInput('每日打卡', '').ok, false)
  assert.equal(validateCountdownInput('每日打卡', '2031-04-17').message, '请选择截止时间（含小时和分钟）')
  assert.equal(validateCountdownInput('每日打卡', '2031-13-01 00:00:00').ok, false)
  const ok = validateCountdownInput(' 每日打卡倒计时 ', '2031-04-17 08:00')
  assert.equal(ok.ok, true)
  assert.deepEqual(ok.value, { name: '每日打卡倒计时', deadline: '2031-04-17 08:00:00' })
})

test('表单在没有保存记录时给出旧配置，保存后回填自定义值', () => {
  assert.deepEqual(countdownFormValues(''), {
    name: '十年倒计时',
    deadline: '2031-04-17 23:59:59',
    saved: false
  })
  assert.deepEqual(countdownFormValues({ name: '冲刺', deadline: '2032-01-02 03:04:05' }), {
    name: '冲刺',
    deadline: '2032-01-02 03:04:05',
    saved: true
  })
})

function memoryStorage() {
  const map = new Map()
  return {
    getItem(key) { return map.has(key) ? map.get(key) : null },
    setItem(key, value) { map.set(key, String(value)) },
    removeItem(key) { map.delete(key) }
  }
}

test('倒计时按当前用户存在本机，恢复默认后回到十年倒计时', () => {
  const storage = memoryStorage()
  assert.equal(writeStoredCountdown('', { name: '甲', deadline: '2031-05-01 08:00:00' }, storage), false)
  assert.equal(writeStoredCountdown('user-a', { name: '甲的打卡', deadline: '2031-05-01 08:00:00' }, storage), true)
  assert.equal(writeStoredCountdown('user-b', { name: '乙的打卡', deadline: '2032-01-01 09:00:00' }, storage), true)

  const mine = resolveCountdown(readStoredCountdown('user-a', storage), NOW)
  const other = resolveCountdown(readStoredCountdown('user-b', storage), NOW)
  assert.equal(mine.name, '甲的打卡')
  assert.equal(mine.legacy, false)
  assert.equal(other.name, '乙的打卡')

  assert.equal(clearStoredCountdown('user-a', storage), true)
  const restored = resolveCountdown(readStoredCountdown('user-a', storage), NOW)
  assert.equal(restored.legacy, true)
  assert.equal(restored.name, LEGACY_COUNTDOWN_NAME)
  assert.equal(resolveCountdown(readStoredCountdown('user-b', storage), NOW).name, '乙的打卡')
})

test('服务器倒计时优先，空配置不会让旧本机值写回，读取失败不算同步成功', () => {
  const server = parseCountdownResponse({ name: '服务器', deadline: '2031-06-01 08:30:00' })
  const chosen = chooseCountdown(server, { name: '旧本机', deadline: '2030-01-01 00:00:00' })
  assert.equal(chosen.status, 'server')
  assert.equal(chosen.payload.name, '服务器')
  assert.equal(chosen.writeLocal.name, '服务器')
  assert.equal(chosen.clearLocal, false)

  const empty = chooseCountdown(parseCountdownResponse(''), { name: '旧本机', deadline: '2030-01-01 00:00:00' })
  assert.equal(empty.status, 'default')
  assert.equal(empty.payload, null)
  assert.equal(empty.clearLocal, true)
  assert.equal(empty.writeLocal, null)

  const failed = chooseCountdown(parseCountdownResponse({ success: false, message: '读取失败' }), {
    name: '旧本机', deadline: '2030-01-01 00:00:00'
  })
  assert.equal(failed.status, 'local-unconfirmed')
  assert.equal(failed.payload.name, '旧本机')
  assert.equal(failed.writeLocal, null)
  assert.equal(parseWriteResponse({ success: false, message: '没有写入' }).ok, false)
  assert.equal(parseWriteResponse({ success: true }).ok, true)
  assert.equal(parseWriteResponse('success').ok, false)
  assert.equal(sameAccount('user-a', 'user-b'), false)
  assert.equal(sameAccount(' "user-a" ', 'user-a'), true)
})

test('旧的单个倒计时迁移成列表中的一项，默认十年倒计时仍是未保存时的显示项', () => {
  const migrated = countdownStateFromPayload({ name: '每日打卡倒计时', deadline: '2031-04-17 08:00:00' })
  assert.deepEqual(migrated, {
    items: [{ id: LEGACY_ITEM_ID, name: '每日打卡倒计时', deadline: '2031-04-17 08:00:00' }],
    activeId: LEGACY_ITEM_ID
  })
  assert.equal(displayedCountdown(migrated, NOW).name, '每日打卡倒计时')
  const defaults = countdownStateFromPayload(null)
  assert.deepEqual(defaults.items, [])
  assert.equal(displayedCountdown(defaults, NOW).name, LEGACY_COUNTDOWN_NAME)
  assert.equal(displayedCountdown(defaults, NOW).legacy, true)
})

test('可以新增多个、编辑一条、删除和切回默认，其它项保持不动', () => {
  const first = planCountdownChange(countdownStateFromPayload(null), {
    type: 'add',
    id: 'a',
    name: ' 甲 ',
    deadline: '2031-06-01 08:00'
  })
  const second = planCountdownChange(first.nextState, {
    type: 'add',
    id: 'b',
    name: '乙',
    deadline: '2031-07-01 09:30:00'
  })
  assert.equal(second.ok, true)
  assert.equal(second.request.type, 'list')
  assert.deepEqual(second.nextState.items.map(item => item.name), ['甲', '乙'])
  assert.equal(second.nextState.activeId, 'b')
  assert.equal(second.nextState.items[0].deadline, '2031-06-01 08:00:00')

  const edited = planCountdownChange(second.nextState, {
    type: 'edit',
    id: 'a',
    name: '甲改',
    deadline: '2031-06-02 10:00:00'
  })
  assert.equal(edited.nextState.items[1].name, '乙')
  assert.equal(edited.nextState.items[1].deadline, '2031-07-01 09:30:00')
  assert.equal(edited.nextState.activeId, 'b')

  const removeOther = planCountdownChange(edited.nextState, { type: 'remove', id: 'a' })
  assert.equal(removeOther.nextState.activeId, 'b')
  assert.deepEqual(removeOther.nextState.items.map(item => item.id), ['b'])

  const removeCurrent = planCountdownChange(second.nextState, { type: 'remove', id: 'b' })
  assert.equal(removeCurrent.nextState.activeId, '')
  assert.equal(removeCurrent.nextState.items[0].name, '甲')

  const back = planCountdownChange(second.nextState, { type: 'select', id: '' })
  assert.equal(back.nextState.activeId, '')
  assert.equal(back.nextState.items.length, 2)
  assert.equal(displayedCountdown(back.nextState, NOW).name, LEGACY_COUNTDOWN_NAME)

  const chosen = planCountdownChange(back.nextState, { type: 'select', id: 'a' })
  assert.equal(chosen.nextState.activeId, 'a')
  assert.equal(displayedCountdown(chosen.nextState, NOW).name, '甲')
})

test('名称或日期不合法时不生成保存请求，第 21 个被拒绝', () => {
  const base = countdownStateFromPayload(null)
  assert.equal(planCountdownChange(base, { type: 'add', id: 'a', name: '  ', deadline: '2031-06-01 08:00:00' }).request, null)
  assert.equal(planCountdownChange(base, { type: 'add', id: 'a', name: '甲', deadline: '2031-06-01' }).request, null)
  assert.equal(planCountdownChange(base, { type: 'add', id: 'a', name: '甲', deadline: '2031-02-31 00:00:00' }).request, null)
  assert.equal(planCountdownChange(base, { type: 'add', id: 'a', name: '甲', deadline: '2031-06-01T08:00:00' }).request, null)
  const items = []
  for (let i = 0; i < COUNTDOWN_ITEM_MAX; i += 1) {
    items.push({ id: 'id' + i, name: '项' + i, deadline: '2031-06-01 08:00:00' })
  }
  const full = planCountdownChange({ items, activeId: 'id0' }, {
    type: 'add',
    id: 'extra',
    name: '超限',
    deadline: '2031-08-01 08:00:00'
  })
  assert.equal(full.ok, false)
  assert.equal(full.request, null)
  assert.equal(full.nextState.items.length, 20)
})

test('列表保存必须和服务器回显一致，失败响应不算出成功', () => {
  const state = {
    items: [
      { id: 'a', name: '甲', deadline: '2031-06-01 08:00:00' },
      { id: 'b', name: '乙', deadline: '2031-07-01 09:30:00' }
    ],
    activeId: 'b'
  }
  const body = countdownListSaveBody(' "union-a" ', state)
  assert.equal(body.userId, 'union-a')
  assert.equal(body.activeId, 'b')
  assert.equal(JSON.stringify(body).includes('saveUserCountdown'), false)
  const ok = confirmCountdownListWrite({
    success: true,
    activeId: 'b',
    name: '乙',
    deadline: '2031-07-01 09:30:00',
    items: body.items
  }, state)
  assert.equal(ok.ok, true)
  assert.equal(confirmCountdownListWrite({ success: false, message: '倒计时编号重复' }, state).ok, false)
  assert.equal(confirmCountdownListWrite({ success: true, activeId: 'a', items: body.items }, state).ok, false)
  const legacy = parseCountdownListResponse({
    success: true,
    activeId: 'legacy',
    name: '每日打卡倒计时',
    deadline: '2031-04-17 08:00:00',
    items: [{ id: 'legacy', name: '每日打卡倒计时', deadline: '2031-04-17 08:00:00' }]
  })
  assert.equal(legacy.state.items[0].id, 'legacy')
  const defaults = parseCountdownListResponse({
    success: true,
    activeId: '',
    items: [{ id: 'a', name: '甲', deadline: '2031-06-01 08:00:00' }]
  })
  assert.equal(defaults.state.activeId, '')
  assert.equal(defaults.state.items.length, 1)
  assert.equal(parseCountdownListResponse({ name: '只有旧字段', deadline: '2031-06-01 08:00:00' }).status, 'unavailable')
  assert.equal(parseCountdownListResponse({ success: false, message: '用户不存在', items: [], activeId: '' }).status, 'error')
})

test('读取失败保留本机列表，不会拿空结果覆盖', () => {
  const storage = memoryStorage()
  const saved = {
    items: [{ id: 'a', name: '甲', deadline: '2031-06-01 08:00:00' }],
    activeId: 'a'
  }
  writeStoredCountdownState('user-a', saved, storage)
  const kept = chooseCountdownList(
    { status: 'error', message: '读取倒计时失败' },
    readStoredCountdownState('user-a', storage)
  )
  assert.equal(kept.status, 'local-unconfirmed')
  assert.equal(kept.clearLocal, false)
  assert.equal(kept.state.items[0].name, '甲')
  const missing = chooseCountdownList({ status: 'unavailable', message: LIST_UNAVAILABLE_MESSAGE }, saved)
  assert.equal(missing.status, 'unavailable')
  assert.equal(missing.state.items[0].name, '甲')
  assert.equal(missing.clearLocal, false)
  const empty = chooseCountdownList(
    parseCountdownListResponse({ success: true, activeId: '', items: [] }),
    saved
  )
  assert.equal(empty.clearLocal, true)
  assert.equal(empty.state.items.length, 0)
})

test('读取带列表的响应时保留各项，当前接口的单条响应仍按原来显示', () => {
  const listed = parseCountdownResponse({
    activeId: 'b',
    items: [
      { id: 'a', name: '甲', deadline: '2031-06-01 08:00:00' },
      { id: 'b', name: '乙', deadline: '2031-07-01 09:30:00' },
      { id: 'bad', name: '', deadline: '2031-07-01 09:30:00' }
    ]
  })
  assert.equal(listed.status, 'ready')
  assert.equal(listed.value.name, '乙')
  assert.equal(listed.state.items.length, 2)
  const chosen = chooseCountdown(listed, { name: '旧本机', deadline: '2030-01-01 00:00:00' })
  assert.equal(chosen.payload.name, '乙')
  assert.equal(chosen.state.activeId, 'b')

  const single = chooseCountdown(parseCountdownResponse({
    name: '服务器',
    deadline: '2031-06-01 08:30:00'
  }), null)
  assert.equal(single.state.items[0].id, LEGACY_ITEM_ID)
  assert.equal(single.state.items[0].name, '服务器')
})

test('损坏的本机记录回退到默认倒计时', () => {
  const storage = memoryStorage()
  storage.setItem('tenyears.countdown.user-a', '{')
  assert.equal(readStoredCountdown('user-a', storage), null)
  assert.equal(resolveCountdown(null, NOW).legacy, true)
})
