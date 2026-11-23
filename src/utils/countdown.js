// 首页倒计时。每个用户的自定义名称和截止时间存在本机，键是当前用户 id。
// 未设置或内容无效时回到原来的「十年倒计时 / 2031-04-17」。
// 截止时间按北京时间解释，避免只写日期时被 UTC 解析提前一天。

export const LEGACY_COUNTDOWN_NAME = '十年倒计时'
export const LEGACY_COUNTDOWN_DATE_TEXT = '2031年04月17日'
export const LEGACY_FORM_DEADLINE = '2031-04-17 23:59:59'
export const LEGACY_ITEM_ID = 'legacy'
export const COUNTDOWN_NAME_MAX = 20
export const COUNTDOWN_ITEM_MAX = 20
export const LIST_UNAVAILABLE_MESSAGE = '多个倒计时接口还不可用，没有改动已保存的倒计时。'
const STORAGE_PREFIX = 'tenyears.countdown.'
const SHANGHAI = 'Asia/Shanghai'

export function legacyRemainingDays(nowMs) {
  const tenYearsLater = new Date('2031-04-18')
  let remaining = tenYearsLater.getTime() - nowMs
  if (remaining < 0) remaining = 0
  return parseInt(remaining / (24 * 3600 * 1000) + '', 10)
}

export function remainingDays(deadlineMs, nowMs) {
  let remaining = deadlineMs - nowMs
  if (remaining < 0) remaining = 0
  return parseInt(remaining / (24 * 3600 * 1000) + '', 10)
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function shanghaiParts(date) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: SHANGHAI,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  const map = {}
  fmt.formatToParts(date).forEach(part => {
    if (part.type !== 'literal') map[part.type] = part.value
  })
  let hour = Number(map.hour)
  if (hour === 24) hour = 0
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour,
    minute: Number(map.minute),
    second: Number(map.second)
  }
}

export function formatShanghaiText(ms, withTime) {
  const parts = shanghaiParts(new Date(ms))
  const date = parts.year + '年' + pad(parts.month) + '月' + pad(parts.day) + '日'
  if (!withTime) return date
  return date + ' ' + pad(parts.hour) + ':' + pad(parts.minute)
}

function fromShanghaiParts(year, month, day, hour, minute, second) {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  if (hour > 23 || minute > 59 || second > 59) return null
  const iso = year + '-' + pad(month) + '-' + pad(day) + 'T'
    + pad(hour) + ':' + pad(minute) + ':' + pad(second) + '+08:00'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const back = shanghaiParts(date)
  if (back.year !== year || back.month !== month || back.day !== day
      || back.hour !== hour || back.minute !== minute || back.second !== second) {
    return null
  }
  return {
    ms: date.getTime(),
    text: year + '-' + pad(month) + '-' + pad(day) + ' '
      + pad(hour) + ':' + pad(minute) + ':' + pad(second)
  }
}

// 保存值是「YYYY-MM-DD HH:mm:ss」。旧数据若只有日期，按当天北京时间 23:59:59。
export function parseDeadline(raw) {
  if (raw instanceof Date) {
    if (Number.isNaN(raw.getTime())) return null
    const parts = shanghaiParts(raw)
    return fromShanghaiParts(parts.year, parts.month, parts.day, parts.hour, parts.minute, parts.second)
  }
  const text = String(raw == null ? '' : raw).trim()
  if (!text) return null
  let matched = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(text)
  if (matched) {
    return fromShanghaiParts(
      Number(matched[1]), Number(matched[2]), Number(matched[3]),
      Number(matched[4]), Number(matched[5]), Number(matched[6] || '0')
    )
  }
  matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
  if (matched) {
    return fromShanghaiParts(Number(matched[1]), Number(matched[2]), Number(matched[3]), 23, 59, 59)
  }
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
    const date = new Date(text)
    if (Number.isNaN(date.getTime())) return null
    const parts = shanghaiParts(date)
    return fromShanghaiParts(parts.year, parts.month, parts.day, parts.hour, parts.minute, parts.second)
  }
  return null
}

function readPayload(payload) {
  if (payload == null || payload === '' || payload === 'null') return null
  if (typeof payload === 'string') {
    const text = payload.trim()
    if (!text || text === 'null') return null
    try {
      return JSON.parse(text)
    } catch (e) {
      return null
    }
  }
  if (typeof payload === 'object') return payload
  return null
}

export function resolveCountdown(payload, nowMs) {
  const data = readPayload(payload)
  const name = data ? String(data.name || data.title || '').trim() : ''
  const deadlineRaw = data ? (data.deadline || data.endTime || data.datetime || '') : ''
  const parsed = name ? parseDeadline(deadlineRaw) : null
  if (!parsed || !name || name.length > COUNTDOWN_NAME_MAX) {
    return {
      legacy: true,
      name: LEGACY_COUNTDOWN_NAME,
      dateText: LEGACY_COUNTDOWN_DATE_TEXT,
      days: legacyRemainingDays(nowMs),
      deadlineText: LEGACY_FORM_DEADLINE
    }
  }
  return {
    legacy: false,
    name,
    dateText: formatShanghaiText(parsed.ms, true),
    days: remainingDays(parsed.ms, nowMs),
    deadlineText: parsed.text
  }
}

export function countdownFormValues(payload) {
  const view = resolveCountdown(payload, Date.now())
  return {
    name: view.name,
    deadline: view.deadlineText,
    saved: !view.legacy
  }
}

export function countdownStorageKey(userId) {
  const id = String(userId == null ? '' : userId).replace(/"/g, '').trim()
  return id ? STORAGE_PREFIX + id : ''
}

function storageOf(storage) {
  if (storage) return storage
  if (typeof localStorage === 'undefined') return null
  return localStorage
}

export function readStoredCountdown(userId, storage) {
  const key = countdownStorageKey(userId)
  const store = storageOf(storage)
  if (!key || !store) return null
  try {
    const raw = store.getItem(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

export function writeStoredCountdown(userId, value, storage) {
  const key = countdownStorageKey(userId)
  const store = storageOf(storage)
  if (!key || !store || !value) return false
  store.setItem(key, JSON.stringify({
    name: value.name,
    deadline: value.deadline
  }))
  return true
}

export function clearStoredCountdown(userId, storage) {
  const key = countdownStorageKey(userId)
  const store = storageOf(storage)
  if (!key || !store) return false
  store.removeItem(key)
  return true
}

export function normalizeAccountId(userId) {
  return String(userId == null ? '' : userId).replace(/"/g, '').trim()
}

export function sameAccount(left, right) {
  const a = normalizeAccountId(left)
  const b = normalizeAccountId(right)
  return a !== '' && a === b
}

export function emptyCountdownState() {
  return { items: [], activeId: '' }
}

function copyState(state) {
  const source = state || emptyCountdownState()
  return {
    items: (source.items || []).map(item => ({
      id: item.id,
      name: item.name,
      deadline: item.deadline
    })),
    activeId: source.activeId || ''
  }
}

function itemIdOk(id) {
  return /^[A-Za-z0-9_-]{1,40}$/.test(id)
}

// 服务器现有记录只有 name、deadline。把它变成列表里的一项，id 固定为 legacy，避免老数据换一次 id。
export function countdownStateFromPayload(payload) {
  const data = readPayload(payload)
  if (!data || Array.isArray(data)) return emptyCountdownState()
  if (Array.isArray(data.items)) {
    const items = []
    const seen = new Set()
    data.items.forEach(raw => {
      if (!raw || typeof raw !== 'object') return
      const checked = validateCountdownInput(raw.name, raw.deadline)
      const id = String(raw.id == null ? '' : raw.id).trim()
      if (!checked.ok || !itemIdOk(id) || seen.has(id)) return
      seen.add(id)
      items.push({ id, name: checked.value.name, deadline: checked.value.deadline })
    })
    if (items.length) {
      let activeId = String(data.activeId == null ? items[0].id : data.activeId).trim()
      if (activeId === 'default') activeId = ''
      if (activeId && !seen.has(activeId)) activeId = items[0].id
      return { items, activeId }
    }
  }
  const single = resolveCountdown(data, Date.now())
  if (!single.legacy) {
    return {
      items: [{ id: LEGACY_ITEM_ID, name: single.name, deadline: single.deadlineText }],
      activeId: LEGACY_ITEM_ID
    }
  }
  return emptyCountdownState()
}

export function displayedCountdown(state, nowMs) {
  const normalized = countdownStateFromPayload(state)
  const active = normalized.items.find(item => item.id === normalized.activeId)
  return resolveCountdown(active || null, nowMs)
}

export function createCountdownId(existingIds, rng) {
  const used = new Set(existingIds || [])
  const rand = typeof rng === 'function' ? rng : Math.random
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for (let attempt = 0; attempt < 8; attempt += 1) {
    let body = ''
    for (let i = 0; i < 16; i += 1) {
      body += alphabet[Math.floor(rand() * alphabet.length)]
    }
    const id = 'cd' + body
    if (itemIdOk(id) && !used.has(id)) return id
  }
  return ''
}

function listRequest(nextState) {
  return {
    type: 'list',
    state: copyState(nextState)
  }
}

export function planCountdownChange(state, action, rng) {
  const current = copyState(countdownStateFromPayload(state))
  const type = action && action.type
  const refused = message => ({
    ok: false,
    supported: true,
    message,
    request: null,
    nextState: current
  })
  if (type === 'add' || type === 'edit') {
    const checked = validateCountdownInput(action.name, action.deadline)
    if (!checked.ok) return refused(checked.message)
    if (type === 'add') {
      if (current.items.length >= COUNTDOWN_ITEM_MAX) return refused('倒计时最多 20 个')
      const id = action.id
        ? String(action.id).trim()
        : createCountdownId(current.items.map(item => item.id), rng)
      if (!itemIdOk(id) || current.items.some(item => item.id === id)) return refused('倒计时编号无效')
      const item = { id, name: checked.value.name, deadline: checked.value.deadline }
      const nextState = { items: current.items.concat([item]), activeId: item.id }
      return { ok: true, supported: true, message: '', request: listRequest(nextState), nextState }
    }
    const index = current.items.findIndex(entry => entry.id === action.id)
    if (index < 0) return refused('没有找到这个倒计时')
    const items = current.items.slice()
    items[index] = { id: current.items[index].id, name: checked.value.name, deadline: checked.value.deadline }
    const nextState = { items, activeId: current.activeId }
    return { ok: true, supported: true, message: '', request: listRequest(nextState), nextState }
  }
  if (type === 'remove') {
    if (!current.items.some(entry => entry.id === action.id)) return refused('没有找到这个倒计时')
    const items = current.items.filter(entry => entry.id !== action.id)
    const activeId = items.some(entry => entry.id === current.activeId) ? current.activeId : ''
    const nextState = { items, activeId }
    return { ok: true, supported: true, message: '', request: listRequest(nextState), nextState }
  }
  if (type === 'select') {
    const id = action.id == null || action.id === 'default' ? '' : String(action.id)
    if (id && !current.items.some(entry => entry.id === id)) return refused('没有找到这个倒计时')
    if ((current.activeId || '') === id) {
      return { ok: true, supported: true, message: '', request: null, nextState: current }
    }
    const nextState = { items: current.items, activeId: id }
    return { ok: true, supported: true, message: '', request: listRequest(nextState), nextState }
  }
  return refused('无法识别的操作')
}

export function countdownListSaveBody(userId, state) {
  const normalized = countdownStateFromPayload(state)
  return {
    userId: normalizeAccountId(userId),
    activeId: normalized.activeId || '',
    items: normalized.items.map(item => ({
      id: item.id,
      name: item.name,
      deadline: item.deadline
    }))
  }
}

export function sameCountdownState(left, right) {
  const a = countdownStateFromPayload(left)
  const b = countdownStateFromPayload(right)
  if (a.activeId !== b.activeId || a.items.length !== b.items.length) return false
  for (let i = 0; i < a.items.length; i += 1) {
    if (a.items[i].id !== b.items[i].id || a.items[i].name !== b.items[i].name
        || a.items[i].deadline !== b.items[i].deadline) return false
  }
  return true
}

export function parseCountdownListResponse(data) {
  let body = data
  if (typeof body === 'string') {
    const text = body.trim()
    if (!text) return { status: 'unavailable', message: LIST_UNAVAILABLE_MESSAGE }
    try {
      body = JSON.parse(text)
    } catch (e) {
      return { status: 'unavailable', message: LIST_UNAVAILABLE_MESSAGE }
    }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body) || typeof body.success !== 'boolean'
      || !Array.isArray(body.items)) {
    return { status: 'unavailable', message: LIST_UNAVAILABLE_MESSAGE }
  }
  if (body.success !== true) {
    return { status: 'error', message: body.message || '读取倒计时失败' }
  }
  if (body.items.length > COUNTDOWN_ITEM_MAX) {
    return { status: 'error', message: '倒计时数据无法识别' }
  }
  const items = []
  const seen = new Set()
  for (let i = 0; i < body.items.length; i += 1) {
    const raw = body.items[i]
    if (!raw || typeof raw !== 'object') return { status: 'error', message: '倒计时数据无法识别' }
    const checked = validateCountdownInput(raw.name, raw.deadline)
    const id = String(raw.id == null ? '' : raw.id).trim()
    if (!checked.ok || !itemIdOk(id) || seen.has(id)) {
      return { status: 'error', message: '倒计时数据无法识别' }
    }
    seen.add(id)
    items.push({ id, name: checked.value.name, deadline: checked.value.deadline })
  }
  let activeId = body.activeId == null ? '' : String(body.activeId).trim()
  if (activeId === 'default') activeId = ''
  if (activeId && !seen.has(activeId)) {
    return { status: 'error', message: '倒计时数据无法识别' }
  }
  return { status: 'ready', state: { items, activeId } }
}

export function confirmCountdownListWrite(data, requestedState) {
  const parsed = parseCountdownListResponse(data)
  if (parsed.status !== 'ready') {
    return { ok: false, message: parsed.message || '服务器没有确认操作成功' }
  }
  if (!sameCountdownState(parsed.state, requestedState)) {
    return { ok: false, message: '服务器确认的列表和提交的不一致，没有改用本次填写的内容' }
  }
  return { ok: true, state: parsed.state, message: '' }
}

// 读取失败时保留已有列表。只有新接口明确返回 success 和 items，才用服务器结果替换。
export function chooseCountdownList(parsed, localState) {
  const kept = localState ? countdownStateFromPayload(localState) : emptyCountdownState()
  if (parsed && parsed.status === 'ready') {
    return {
      state: parsed.state,
      status: 'server',
      clearLocal: parsed.state.items.length === 0,
      writeLocal: parsed.state.items.length ? parsed.state : null
    }
  }
  if (parsed && parsed.status === 'unavailable') {
    return {
      state: kept,
      status: 'unavailable',
      clearLocal: false,
      writeLocal: null,
      message: parsed.message || LIST_UNAVAILABLE_MESSAGE
    }
  }
  if (kept.items.length) {
    return {
      state: kept,
      status: 'local-unconfirmed',
      clearLocal: false,
      writeLocal: null,
      message: parsed && parsed.message ? parsed.message : '读取倒计时失败'
    }
  }
  return {
    state: kept,
    status: 'error',
    clearLocal: false,
    writeLocal: null,
    message: parsed && parsed.message ? parsed.message : '读取倒计时失败'
  }
}

export function readStoredCountdownState(userId, storage) {
  const raw = readStoredCountdown(userId, storage)
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  if (raw.version === 2 && Array.isArray(raw.items)) {
    const parsed = parseCountdownListResponse({
      success: true,
      activeId: raw.activeId || '',
      items: raw.items
    })
    return parsed.status === 'ready' ? parsed.state : null
  }
  const single = countdownStateFromPayload(raw)
  return single.items.length ? single : null
}

export function writeStoredCountdownState(userId, state, storage) {
  const key = countdownStorageKey(userId)
  const store = storageOf(storage)
  const normalized = countdownStateFromPayload(state)
  if (!key || !store) return false
  store.setItem(key, JSON.stringify({
    version: 2,
    activeId: normalized.activeId || '',
    items: normalized.items
  }))
  return true
}

export function confirmCountdownWrite(data, request) {
  const parsed = parseWriteResponse(data)
  if (!parsed.ok) return parsed
  if (!request || request.type === 'clear') return { ok: true, message: parsed.message || '' }
  if (request.type !== 'save') {
    return { ok: false, message: '服务器没有确认这次倒计时变更' }
  }
  if (data && data.name != null && String(data.name) !== request.name) {
    return { ok: false, message: '服务器确认的名称不一致，没有改用本次填写的内容' }
  }
  if (data && data.deadline != null && String(data.deadline) !== request.deadline) {
    return { ok: false, message: '服务器确认的截止时间不一致，没有改用本次填写的内容' }
  }
  return { ok: true, message: parsed.message || '' }
}

// GET /getUserCountdown：空正文表示服务器没有自定义倒计时；success:false 不是空配置。
export function parseCountdownResponse(data) {
  if (data == null) return { status: 'empty' }
  if (typeof data === 'string') {
    const text = data.trim()
    if (!text || text === 'null') return { status: 'empty' }
    try {
      return parseCountdownResponse(JSON.parse(text))
    } catch (e) {
      return { status: 'invalid', message: '倒计时数据无法识别' }
    }
  }
  if (typeof data !== 'object' || Array.isArray(data)) {
    return { status: 'invalid', message: '倒计时数据无法识别' }
  }
  if (data.success === false) {
    return { status: 'error', message: data.message || '读取倒计时失败' }
  }
  if (Array.isArray(data.items)) {
    const state = countdownStateFromPayload(data)
    const active = state.items.find(item => item.id === state.activeId)
    if (active) {
      return {
        status: 'ready',
        value: { name: active.name, deadline: active.deadline },
        state
      }
    }
    if (state.items.length && (data.activeId === '' || data.activeId === 'default')) {
      return { status: 'empty', state }
    }
  }
  const view = resolveCountdown(data, Date.now())
  if (view.legacy) return { status: 'invalid', message: '倒计时数据无法识别' }
  return {
    status: 'ready',
    value: { name: view.name, deadline: view.deadlineText },
    state: countdownStateFromPayload(data)
  }
}

// 服务器读成功时以服务器为准。空配置会清掉本机旧值，避免之后把旧值写回去。
// 读取失败时可以暂时显示本机记录，但 writeLocal 为空，表示没有同步成功。
export function chooseCountdown(parsed, localPayload) {
  if (parsed && parsed.status === 'ready' && parsed.value) {
    return {
      payload: parsed.value,
      status: 'server',
      clearLocal: false,
      writeLocal: parsed.value,
      state: parsed.state || countdownStateFromPayload(parsed.value)
    }
  }
  if (parsed && parsed.status === 'empty') {
    const state = parsed.state || emptyCountdownState()
    return {
      payload: null,
      status: 'default',
      clearLocal: state.items.length === 0,
      writeLocal: null,
      state
    }
  }
  const localView = resolveCountdown(localPayload, Date.now())
  if (!localView.legacy) {
    const payload = { name: localView.name, deadline: localView.deadlineText }
    return {
      payload,
      status: 'local-unconfirmed',
      clearLocal: false,
      writeLocal: null,
      state: countdownStateFromPayload(payload)
    }
  }
  return {
    payload: null,
    status: 'error',
    clearLocal: false,
    writeLocal: null,
    state: emptyCountdownState()
  }
}

// POST 保存/恢复：HTTP 200 不够，必须看到 success === true。
export function parseWriteResponse(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || data.success !== true) {
    const message = data && typeof data === 'object' && data.message ? data.message : '服务器没有确认操作成功'
    return { ok: false, message }
  }
  return { ok: true, message: data.message || '' }
}

export function validateCountdownInput(name, deadlineText) {
  const trimmed = String(name || '').trim()
  if (!trimmed) return { ok: false, message: '请填写倒计时名称' }
  if (trimmed.length > COUNTDOWN_NAME_MAX) {
    return { ok: false, message: '倒计时名称不能超过 20 个字' }
  }
  const text = String(deadlineText || '').trim()
  if (!text) return { ok: false, message: '请选择截止时间' }
  if (text.includes('T')) return { ok: false, message: '请选择有效的截止时间' }
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return { ok: false, message: '请选择截止时间（含小时和分钟）' }
  }
  const parsed = parseDeadline(text)
  if (!parsed) return { ok: false, message: '请选择有效的截止时间' }
  return { ok: true, value: { name: trimmed, deadline: parsed.text } }
}
