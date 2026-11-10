// 「我的打卡」导出当前用户自己的记录。列只包含打卡内容，不附带手机号等其它资料。

export const OWN_EXPORT_COLUMNS = [
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
  if (formatted != null) return formatted
  const value = row && row['value' + index]
  if (value == null || value === '' || value === '0') return ''
  return value
}

export function buildOwnExportRow(row) {
  const source = row || {}
  return OWN_EXPORT_COLUMNS.map(column => {
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

function ownerId(row) {
  if (!row) return ''
  if (row.userId != null && row.userId !== '') return String(row.userId)
  if (row.unionId != null && row.unionId !== '') return String(row.unionId)
  if (row.unionid != null && row.unionid !== '') return String(row.unionid)
  return ''
}

function sameId(left, right) {
  return String(left || '').replace(/"/g, '') === String(right || '').replace(/"/g, '')
}

// 接口已经按当前用户查询。带了别人的 userId 的行丢掉；没有用户字段的行视为这次查询的本人记录。
export function keepOwnReports(rows, userId) {
  const id = String(userId == null ? '' : userId).replace(/"/g, '').trim()
  if (!id || !Array.isArray(rows)) return []
  return rows.filter(row => {
    if (!row || typeof row !== 'object') return false
    const owner = ownerId(row).replace(/"/g, '')
    return !owner || sameId(owner, id)
  })
}

export function sortOwnReports(rows) {
  return (Array.isArray(rows) ? rows : []).slice().sort((a, b) => {
    return String((b && b.date) || '').localeCompare(String((a && a.date) || ''))
  })
}

// 统计页已经把 getReportInfoListById 的数组当作全部记录。若返回带 total 且多于本次列表，说明被截断。
export function unwrapReportList(data) {
  if (Array.isArray(data)) {
    return { rows: data, total: data.length, truncated: false }
  }
  if (!data || typeof data !== 'object') {
    return { rows: [], total: 0, truncated: false }
  }
  const rows = Array.isArray(data.list) ? data.list
    : Array.isArray(data.records) ? data.records
    : Array.isArray(data.content) ? data.content
    : []
  const total = Number(data.total != null ? data.total : data.totalCount)
  const knownTotal = Number.isFinite(total) ? total : rows.length
  return {
    rows,
    total: knownTotal,
    truncated: Number.isFinite(total) && total > rows.length
  }
}
