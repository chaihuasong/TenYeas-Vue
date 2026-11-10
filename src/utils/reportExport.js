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
export const EXPORT_SCOPE_FALLBACK = '仅包含当前资料里仍然存在、且能唯一归属到该资料 _id、unionid 或 openid 的打卡记录。已经从资料中删除的旧身份无法追溯，所以这不是终身全部历史。total 只是本次名单条数。'

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
    reason: '导出接口没有返回可识别的结果',
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
    reasons.push('接口标记这次结果被截断')
  }
  if (accepted.size === 0 && data.list.some(row => ownerId(row))) {
    status = 'partial'
    reasons.push('响应没有给出 acceptedUserIds，不能核对历史身份')
  }
  if (outsideAccepted > 0) {
    status = 'partial'
    reasons.push('有 ' + outsideAccepted + ' 条记录的用户标识不在 acceptedUserIds 中，未写入')
  }
  if (ownIds.some(id => !id)) {
    status = 'partial'
    reasons.push('有记录缺少文档编号')
  }
  if (data.total != null && Number(data.total) !== data.list.length) {
    status = 'partial'
    reasons.push('total 与本次 list 条数不一致，不能当作历史总数')
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
    ['范围', source.scope || EXPORT_SCOPE],
    ['正式用户编号', source.canonicalUserId || ''],
    ['本次写入条数', String((source.rows || []).length)],
    ['接口 total', '只表示本次 list 的条数，不是终身历史总数'],
    ['可归属身份', (source.acceptedUserIds || []).join(', ')],
    ['已排除身份', (source.excludedUserIds || []).join(', ')],
    ['接口说明', source.message || ''],
    ['警告', (source.warnings || []).join('；')]
  ]
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
