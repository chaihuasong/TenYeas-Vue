// 打卡列表导出的列和单元格文案，与管理后台隐藏表格一致。
// 只包含列表里已经展示的打卡字段和姓名、昵称、微信号、性别，不追加其它个人资料。

export const REPORT_EXPORT_COLUMNS = [
  { key: 'id', label: 'id' },
  { key: 'date', label: '日期' },
  { key: 'userId', label: '用户ID' },
  { key: 'wechatid', label: '微信号' },
  { key: 'name', label: '姓名' },
  { key: 'nickname', label: '昵称' },
  { key: 'gender', label: '性别' },
  { key: 'note', label: '总结' },
  { key: 'templateId', label: '模板' },
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

export function genderText(row) {
  if (row && row.gender === 1) return '男'
  return '女'
}

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

export function buildReportExportRow(row) {
  const source = row || {}
  return REPORT_EXPORT_COLUMNS.map(column => {
    if (column.key === 'gender') return genderText(source)
    if (column.key === 'state') return stateText(source)
    const valueMatch = /^value(\d+)$/.exec(column.key)
    if (valueMatch) return valueText(source, Number(valueMatch[1]))
    return source[column.key]
  })
}

export function selectPersonRows(rows, userId) {
  if (!Array.isArray(rows) || userId == null || userId === '') return []
  const id = String(userId)
  return rows.filter(row => row && String(row.userId) === id)
}

export function distinctPeople(rows) {
  const map = new Map()
  ;(Array.isArray(rows) ? rows : []).forEach(row => {
    if (!row || row.userId == null || row.userId === '') return
    const id = String(row.userId)
    if (map.has(id)) return
    const name = row.name || ''
    const nickname = row.nickname || ''
    const label = [name, nickname].filter(Boolean).join(' / ') || id
    map.set(id, { userId: id, name, nickname, label })
  })
  return Array.from(map.values())
}

// 与打卡列表搜索相同的接口和 date=null 约定，姓名做编码，避免特殊字符把查询截断。
export function buildReportSearchUrl(serverUrl, name, date) {
  const base = serverUrl.endsWith('/') ? serverUrl : serverUrl + '/'
  const dateParam = (date === null || date === undefined || date === '')
    ? 'null'
    : encodeURIComponent(date)
  return base + 'getReportInfoByNameOrNickNameLike?name='
    + encodeURIComponent(name == null ? '' : String(name))
    + '&date=' + dateParam
}
