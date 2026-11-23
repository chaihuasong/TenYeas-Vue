// 「我的打卡」导出当前用户自己的记录。列只包含打卡内容，不附带手机号等其它资料。

export const OWN_EXPORT_COLUMNS = [
  { key: 'id', label: '记录ID' },
  { key: 'date', label: '日期' },
  { key: 'nickname', label: '昵称' },
  { key: 'note', label: '总结' },
  { key: 'state', label: '状态' },
  { key: 'value1', label: '项目1' },
  { key: 'value2', label: '项目2' },
  { key: 'value3', label: '项目3' },
  { key: 'value4', label: '项目4' },
  { key: 'value5', label: '项目5' },
  { key: 'value6', label: '项目6' },
  { key: 'value7', label: '项目7' },
  { key: 'value8', label: '项目8' },
  { key: 'value9', label: '项目9' },
  { key: 'value10', label: '项目10' },
  { key: 'value11', label: '项目11' },
  { key: 'value12', label: '项目12' },
  { key: 'value13', label: '项目13' },
  { key: 'value14', label: '项目14' },
  { key: 'value15', label: '项目15' },
  { key: 'share', label: '每日分享' }
]

export function stateText(row) {
  if (row && row.state === '1') return '+'
  return '-'
}

export function valueText(row, index) {
  if (!row) return null
  const value = row['value' + index]
  const template = row['template' + index]
  if (value == null || template == null) return null
  return String(template).replace('_', value)
}

function ownValueText(row, index) {
  const formatted = valueText(row, index)
  if (formatted != null && formatted !== '') return formatted
  const value = row && row['value' + index]
  if (value == null || value === '') return ''
  return value
}

export function exportRecordId(row) {
  if (!row || typeof row !== 'object') return ''
  if (row.id != null && row.id !== '') return String(row.id)
  if (row._id != null && row._id !== '') return String(row._id)
  return ''
}

export function buildOwnExportRow(row) {
  const source = row || {}
  return OWN_EXPORT_COLUMNS.map(column => {
    if (column.key === 'id') return exportRecordId(source)
    if (column.key === 'state') return stateText(source)
    const valueMatch = /^value(\d+)$/.exec(column.key)
    if (valueMatch) return ownValueText(source, Number(valueMatch[1]))
    const value = source[column.key]
    return value == null ? '' : value
  })
}

export function buildOwnExportSheet(rows) {
  return [OWN_EXPORT_COLUMNS.map(column => column.label)]
    .concat((Array.isArray(rows) ? rows : []).map(buildOwnExportRow))
}

function normalizeId(value) {
  return String(value == null ? '' : value).replace(/"/g, '').trim()
}

export function selfIdSet(ids) {
  const set = new Set()
  ;(Array.isArray(ids) ? ids : [ids]).forEach(value => {
    const id = normalizeId(value)
    if (id) set.add(id)
  })
  return set
}

function ownerId(row) {
  if (!row || typeof row !== 'object') return ''
  if (row.userId != null && row.userId !== '') return normalizeId(row.userId)
  if (row.unionId != null && row.unionId !== '') return normalizeId(row.unionId)
  if (row.unionid != null && row.unionid !== '') return normalizeId(row.unionid)
  return ''
}

// 本人身份来自 getById 的正式 id、openid 和当前登录 id。不能只拿登录 unionid 去比，
// 否则正式编号不同的本人记录会被丢掉。没有用户字段的行不能当成本人。
export function classifyReports(rows, selfIds) {
  const ids = selfIdSet(selfIds)
  const own = []
  const foreign = []
  const unverified = []
  ;(Array.isArray(rows) ? rows : []).forEach(row => {
    if (!row || typeof row !== 'object') {
      unverified.push(row)
      return
    }
    const owner = ownerId(row)
    if (!owner) {
      unverified.push(row)
      return
    }
    if (ids.has(owner)) own.push(row)
    else foreign.push(row)
  })
  return { own, foreign, unverified }
}

export function sortOwnReports(rows) {
  return (Array.isArray(rows) ? rows : []).slice().sort((a, b) => {
    return String((b && b.date) || '').localeCompare(String((a && a.date) || ''))
  })
}

export const EXPORT_SCOPE = 'profile-identifiers'
export const EXPORT_SCOPE_FALLBACK = '导出的是系统目前还能确认属于你的打卡记录。如果你换过登录方式、合并或删除过账号，早期的部分记录可能无法找回，所以这份导出不一定包含你的全部历史。'

function textList(value) {
  if (!Array.isArray(value)) return []
  return value.map(item => String(item == null ? '' : item)).filter(item => item !== '')
}

function withProfileNickname(row, profile) {
  const copy = Object.assign({}, row)
  const nickname = copy.nickname == null ? '' : String(copy.nickname).trim()
  const profileName = profile && profile.nickname != null ? String(profile.nickname).trim() : ''
  if (!nickname && profileName) copy.nickname = profileName
  return copy
}

// GET /exportMyReports。不按当前登录 unionid 删 list。total 只等于本次 list.length。
export function prepareExportMyReports(data, profile) {
  const empty = {
    status: 'failed',
    download: false,
    reason: '导出没有返回可用的结果',
    message: '',
    warnings: [],
    scope: EXPORT_SCOPE,
    scopeNote: EXPORT_SCOPE_FALLBACK,
    canonicalUserId: '',
    acceptedUserIds: [],
    excludedUserIds: [],
    rows: [],
    ownIds: [],
    listCount: 0,
    outsideAccepted: 0
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return empty
  const warnings = textList(data.warnings)
  const message = data.message == null ? '' : String(data.message)
  if (data.success !== true) {
    return Object.assign({}, empty, {
      reason: message || '导出没有成功',
      message,
      warnings
    })
  }
  if (!Array.isArray(data.list)) {
    return Object.assign({}, empty, {
      reason: message || '导出结果缺少记录列表',
      message,
      warnings
    })
  }
  const accepted = selfIdSet(data.acceptedUserIds)
  const rows = []
  let outsideAccepted = 0
  data.list.forEach(row => {
    if (!row || typeof row !== 'object') {
      outsideAccepted += 1
      return
    }
    const owner = ownerId(row)
    if (owner && accepted.size > 0 && !accepted.has(owner)) {
      outsideAccepted += 1
      return
    }
    rows.push(withProfileNickname(row, profile))
  })
  const ownIds = rows.map(exportRecordId)
  const reasons = []
  let status = data.complete === true ? 'complete' : 'partial'
  if (data.complete !== true) {
    status = 'partial'
    if (message) reasons.push(message)
  }
  if (data.truncated === true) {
    status = 'partial'
    reasons.push('记录太多，这次只取了一部分')
  }
  if (accepted.size === 0 && data.list.some(row => ownerId(row))) {
    status = 'partial'
    reasons.push('系统没返回可核对的身份信息，无法确认导出是否完整')
  }
  if (outsideAccepted > 0) {
    status = 'partial'
    reasons.push('有 ' + outsideAccepted + ' 条记录无法确认属于你，已跳过')
  }
  if (ownIds.some(id => !id)) {
    status = 'partial'
    reasons.push('有记录缺少编号')
  }
  if (data.total != null && Number(data.total) !== data.list.length) {
    status = 'partial'
    reasons.push('本次条数与系统计数不一致，不能当作完整历史')
  }
  return {
    status,
    download: rows.length > 0,
    reason: reasons.filter(Boolean).join('；'),
    message,
    warnings,
    scope: data.scope || EXPORT_SCOPE,
    scopeNote: data.scopeNote || EXPORT_SCOPE_FALLBACK,
    canonicalUserId: data.canonicalUserId == null ? '' : String(data.canonicalUserId),
    acceptedUserIds: Array.from(accepted),
    excludedUserIds: textList(data.excludedUserIds),
    rows,
    ownIds,
    listCount: data.list.length,
    outsideAccepted
  }
}

export function buildExportNoteSheet(prepared) {
  const source = prepared || {}
  return [
    ['说明', source.scopeNote || EXPORT_SCOPE_FALLBACK],
    ['导出范围', source.scope || EXPORT_SCOPE],
    ['日期范围', source.rangeLabel || '全部记录（不按日期筛选）'],
    ['用户编号', source.canonicalUserId || ''],
    ['本次导出条数', String((source.rows || []).length)],
    ['历史总数', '这里只是本次拿到的条数，不代表你历史上一共打过多少卡'],
    ['已确认身份', (source.acceptedUserIds || []).join(', ')],
    ['已排除身份', (source.excludedUserIds || []).join(', ')],
    ['系统说明', source.message || ''],
    ['提醒', (source.warnings || []).join('；')]
  ]
}

const EXPORT_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

// 当前 GET /exportMyReports?userId= 只按身份返回一份名单，没有开始/结束日期参数。
// 日期筛选只能加在「success、complete、未截断、total 等于 list 条数」的完整结果上。
export function ownExportRequestUrl(serverUrl, userId) {
  return String(serverUrl || '') + 'exportMyReports?userId=' + encodeURIComponent(userId || '')
}

export function parseExportDate(value) {
  if (typeof value !== 'string' || !EXPORT_DATE.test(value)) return ''
  const match = value.match(EXPORT_DATE)
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return ''
  return value
}

export function validateOwnExportRequest(input) {
  const source = input || {}
  if (source.mode !== 'range') {
    return {
      ok: true,
      mode: 'all',
      startDate: '',
      endDate: '',
      rangeLabel: '全部记录（不按日期筛选）'
    }
  }
  if (source.startDate == null || source.startDate === '' || source.endDate == null || source.endDate === '') {
    return { ok: false, mode: 'range', reason: '请选择开始日期和结束日期' }
  }
  const startDate = parseExportDate(String(source.startDate))
  const endDate = parseExportDate(String(source.endDate))
  if (!startDate || !endDate) {
    return { ok: false, mode: 'range', reason: '日期格式应为 YYYY-MM-DD，并且是真实存在的日期' }
  }
  if (startDate > endDate) {
    return { ok: false, mode: 'range', reason: '开始日期不能晚于结束日期' }
  }
  const rangeLabel = startDate === endDate
    ? startDate + '（当天，含这一天）'
    : startDate + ' 至 ' + endDate + '（含开始和结束两天）'
  return { ok: true, mode: 'range', startDate, endDate, rangeLabel }
}

export function sourceListIsComplete(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false
  if (data.success !== true || data.complete !== true || data.truncated === true) return false
  if (!Array.isArray(data.list)) return false
  return data.total != null && Number(data.total) === data.list.length
}

function datedShell(checked, extra) {
  return Object.assign({
    status: 'failed',
    download: false,
    reason: '',
    message: '',
    warnings: [],
    scope: EXPORT_SCOPE,
    scopeNote: EXPORT_SCOPE_FALLBACK,
    canonicalUserId: '',
    acceptedUserIds: [],
    excludedUserIds: [],
    rows: [],
    ownIds: [],
    listCount: 0,
    outsideAccepted: 0,
    rangeMode: checked && checked.mode ? checked.mode : '',
    rangeStart: checked && checked.startDate ? checked.startDate : '',
    rangeEnd: checked && checked.endDate ? checked.endDate : '',
    rangeLabel: checked && checked.rangeLabel ? checked.rangeLabel : ''
  }, extra || {})
}

function reportDay(row) {
  const value = row && row.date
  if (typeof value !== 'string') return ''
  return parseExportDate(value.slice(0, 10))
}

function inClosedRange(row, startDate, endDate) {
  const day = reportDay(row)
  return day !== '' && day >= startDate && day <= endDate
}

// mode 为 all 时原样沿用 exportMyReports 的结果，不按日期删空字段旧记录。
// mode 为 range 时，只有完整名单才能筛选；不完整、被截断或条数对不上时不生成文件。
export function prepareDatedExport(data, profile, request) {
  const checked = validateOwnExportRequest(request)
  if (!checked.ok) {
    return datedShell(checked, { status: 'invalid', reason: checked.reason })
  }
  const prepared = prepareExportMyReports(data, profile)
  const base = datedShell(checked, prepared)
  if (checked.mode === 'all') return base
  if (prepared.status === 'failed' || !data || data.success !== true) {
    return Object.assign({}, base, {
      status: 'failed',
      download: false,
      rows: [],
      ownIds: [],
      reason: prepared.reason || '导出没有成功'
    })
  }
  if (!sourceListIsComplete(data)) {
    return Object.assign({}, base, {
      status: 'incomplete',
      download: false,
      rows: [],
      ownIds: [],
      reason: '服务器没有返回完整记录，按日期导出无法保证这个范围内没有遗漏，没有生成文件'
    })
  }
  const rows = prepared.rows.filter(row => inClosedRange(row, checked.startDate, checked.endDate))
  const ownIds = rows.map(exportRecordId)
  if (rows.length === 0) {
    return Object.assign({}, base, {
      status: 'empty',
      download: false,
      rows: [],
      ownIds: [],
      reason: '所选日期范围内没有打卡记录'
    })
  }
  const reasons = []
  let status = 'complete'
  if (ownIds.some(id => !id)) {
    status = 'partial'
    reasons.push('有记录缺少编号，不能把这份文件当成无缺漏的完整档案')
  }
  if (prepared.outsideAccepted > 0) {
    reasons.push('另有 ' + prepared.outsideAccepted + ' 条无法确认属于你，未写入')
  }
  return Object.assign({}, base, {
    status,
    download: true,
    rows,
    ownIds,
    reason: reasons.join('；')
  })
}

export function describeOwnExportOutcome(prepared) {
  const source = prepared || {}
  const range = source.rangeLabel || '全部记录（不按日期筛选）'
  const count = Array.isArray(source.rows) ? source.rows.length : 0
  if (source.status === 'invalid') {
    return { saved: false, title: '没有导出', detail: source.reason || '日期不正确' }
  }
  if (source.status === 'empty' || (source.download !== true && source.status === 'complete')) {
    return {
      saved: false,
      title: '没有可导出的记录',
      detail: range + '。' + (source.reason || '没有找到可导出的打卡记录')
    }
  }
  if (source.download !== true) {
    return {
      saved: false,
      title: '没有生成文件',
      detail: [range, source.reason, source.message].concat(source.warnings || []).filter(Boolean).join('。')
    }
  }
  if (source.status === 'complete') {
    return {
      saved: true,
      title: '已导出 ' + count + ' 条',
      detail: [range, source.scopeNote || EXPORT_SCOPE_FALLBACK, source.reason].filter(Boolean).join('。')
    }
  }
  return {
    saved: true,
    title: '导出不完整：已写入 ' + count + ' 条',
    detail: [range, source.reason, source.message].concat(source.warnings || []).filter(Boolean).join('。')
  }
}

export function ownExportFileName(prepared, now) {
  const clock = now instanceof Date ? now : new Date()
  const pad = value => String(value).padStart(2, '0')
  const stamp = clock.getFullYear() + pad(clock.getMonth() + 1) + pad(clock.getDate())
    + pad(clock.getHours()) + pad(clock.getMinutes())
  const source = prepared || {}
  const range = source.rangeMode === 'range' && source.rangeStart && source.rangeEnd
    ? source.rangeStart.replace(/-/g, '') + '-' + source.rangeEnd.replace(/-/g, '')
    : '全部'
  return '我的打卡_' + range + '_' + stamp + '.xlsx'
}

export async function runOwnExport(input) {
  const source = input || {}
  const checked = validateOwnExportRequest(source)
  if (!checked.ok) return prepareDatedExport(null, null, source)
  if (!source.userId) {
    return datedShell(checked, { status: 'failed', reason: '未获取到用户信息，请重新进入' })
  }
  let profile = null
  if (typeof source.getProfile === 'function') {
    try {
      profile = await source.getProfile(source.userId)
    } catch (err) {
      profile = null
    }
  }
  if (typeof source.getExport !== 'function') {
    return datedShell(checked, { status: 'failed', reason: '导出失败，没有生成文件' })
  }
  let data
  try {
    data = await source.getExport(source.userId)
  } catch (err) {
    return datedShell(checked, {
      status: 'failed',
      reason: '导出失败，没有生成文件',
      rangeLabel: checked.rangeLabel
    })
  }
  return prepareDatedExport(data, profile, source)
}

export function sheetRecordIds(sheet) {
  if (!Array.isArray(sheet) || !sheet.length) return []
  const index = sheet[0].indexOf('记录ID')
  if (index < 0) return []
  return sheet.slice(1).map(row => String(row[index] == null ? '' : row[index]))
}

export function sheetMatchesRecords(sheet, rows) {
  const ids = sheetRecordIds(sheet)
  const expected = (Array.isArray(rows) ? rows : []).map(exportRecordId)
  if (ids.length !== expected.length || sheet.length !== expected.length + 1) return false
  for (let i = 0; i < expected.length; i++) {
    if (ids[i] !== expected[i]) return false
  }
  return true
}
