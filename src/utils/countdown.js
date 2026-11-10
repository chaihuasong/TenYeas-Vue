// 首页倒计时。每个用户的自定义名称和截止时间存在本机，键是当前用户 id。
// 未设置或内容无效时回到原来的「十年倒计时 / 2031-04-17」。
// 截止时间按北京时间解释，避免只写日期时被 UTC 解析提前一天。

export const LEGACY_COUNTDOWN_NAME = '十年倒计时'
export const LEGACY_COUNTDOWN_DATE_TEXT = '2031年04月17日'
export const LEGACY_FORM_DEADLINE = '2031-04-17 23:59:59'
export const COUNTDOWN_NAME_MAX = 20
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

export function validateCountdownInput(name, deadlineText) {
  const trimmed = String(name || '').trim()
  if (!trimmed) return { ok: false, message: '请填写倒计时名称' }
  if (trimmed.length > COUNTDOWN_NAME_MAX) {
    return { ok: false, message: '倒计时名称不能超过 20 个字' }
  }
  const text = String(deadlineText || '').trim()
  if (!text) return { ok: false, message: '请选择截止时间' }
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return { ok: false, message: '请选择截止时间（含小时和分钟）' }
  }
  const parsed = parseDeadline(text)
  if (!parsed) return { ok: false, message: '请选择有效的截止时间' }
  return { ok: true, value: { name: trimmed, deadline: parsed.text } }
}
