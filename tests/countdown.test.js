import test from 'node:test'
import assert from 'node:assert/strict'
import {
  LEGACY_COUNTDOWN_DATE_TEXT,
  LEGACY_COUNTDOWN_NAME,
  clearStoredCountdown,
  countdownFormValues,
  legacyRemainingDays,
  LEGACY_ITEM_ID,
  SELECT_DEFAULT_NEEDS_DELETE_MESSAGE,
  SERVER_SINGLE_COUNTDOWN_MESSAGE,
  chooseCountdown,
  confirmCountdownWrite,
  countdownStateFromPayload,
  displayedCountdown,
  parseCountdownResponse,
  parseWriteResponse,
  planCountdownChange,
  readStoredCountdown,
  resolveCountdown,
  sameAccount,
  validateCountdownInput,
  writeStoredCountdown
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

test('新增第二个、改回默认或编辑多个项时不发出会覆盖旧数据的请求', () => {
  const saved = countdownStateFromPayload({ name: '已有', deadline: '2031-06-01 08:00:00' })
  const second = planCountdownChange(saved, {
    type: 'add',
    name: '第二个',
    deadline: '2032-01-01 09:00:00'
  })
  assert.equal(second.ok, false)
  assert.equal(second.supported, false)
  assert.equal(second.request, null)
  assert.equal(second.message, SERVER_SINGLE_COUNTDOWN_MESSAGE)
  assert.deepEqual(second.nextState, saved)

  const backToDefault = planCountdownChange(saved, { type: 'select', id: '' })
  assert.equal(backToDefault.request, null)
  assert.equal(backToDefault.message, SELECT_DEFAULT_NEEDS_DELETE_MESSAGE)
  assert.equal(backToDefault.nextState.activeId, LEGACY_ITEM_ID)

  const many = {
    items: [
      { id: 'a', name: '甲', deadline: '2031-06-01 08:00:00' },
      { id: 'b', name: '乙', deadline: '2031-07-01 08:00:00' }
    ],
    activeId: 'a'
  }
  const editMany = planCountdownChange(many, {
    type: 'edit',
    id: 'b',
    name: '乙改',
    deadline: '2031-08-01 08:00:00'
  })
  assert.equal(editMany.request, null)
  assert.deepEqual(editMany.nextState.items.map(item => item.name), ['甲', '乙'])
})

test('第一条可以保存，编辑后仍是这一条，删除才清空，服务器没确认就不算成功', () => {
  const empty = countdownStateFromPayload(null)
  const added = planCountdownChange(empty, {
    type: 'add',
    name: ' 每日打卡 ',
    deadline: '2031-04-17 08:00'
  })
  assert.equal(added.ok, true)
  assert.deepEqual(added.request, { type: 'save', name: '每日打卡', deadline: '2031-04-17 08:00:00' })
  assert.equal(added.nextState.items.length, 1)
  assert.equal(added.nextState.activeId, LEGACY_ITEM_ID)

  const edited = planCountdownChange(added.nextState, {
    type: 'edit',
    id: LEGACY_ITEM_ID,
    name: '冲刺',
    deadline: '2032-01-02 03:04:00'
  })
  assert.equal(edited.request.name, '冲刺')
  assert.equal(edited.nextState.items[0].deadline, '2032-01-02 03:04:00')

  const removed = planCountdownChange(edited.nextState, { type: 'remove', id: LEGACY_ITEM_ID })
  assert.deepEqual(removed.request, { type: 'clear' })
  assert.deepEqual(removed.nextState.items, [])
  assert.equal(displayedCountdown(removed.nextState, NOW).name, LEGACY_COUNTDOWN_NAME)

  assert.equal(confirmCountdownWrite({ success: false, message: '没有写入' }, added.request).ok, false)
  assert.equal(confirmCountdownWrite({ success: true, name: '别的名字', deadline: added.request.deadline }, added.request).ok, false)
  assert.equal(confirmCountdownWrite({ success: true, name: added.request.name, deadline: added.request.deadline }, added.request).ok, true)
  assert.equal(confirmCountdownWrite({ success: true }, { type: 'clear' }).ok, true)
  assert.equal(confirmCountdownWrite('success', added.request).ok, false)
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
