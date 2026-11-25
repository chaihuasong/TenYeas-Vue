// 「我的团队」近期打卡按北京时间的某一天查看。
//
// findReportsInGroupByOwner / findReportsJoinGroupByOwner 返回组内已通过成员的全部打卡，
// 每条都带 date（YYYY-MM-DD）、昵称和模板内容，没有只截最近几条。
// 这里按选中的日历日筛出当天记录。getGroupDailyStatus 也能按日期查，但只返回是否打卡和反省，
// 没有近期打卡卡片要用的模板和数值。

import { parseExportDate } from './reportExport.js'

const SHANGHAI = 'Asia/Shanghai'

export function shanghaiCalendarDate(now) {
  const date = now instanceof Date ? now : new Date(now)
  if (Number.isNaN(date.getTime())) return ''
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: SHANGHAI,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  const map = {}
  fmt.formatToParts(date).forEach(part => {
    if (part.type !== 'literal') map[part.type] = part.value
  })
  if (!map.year || !map.month || !map.day) return ''
  return map.year + '-' + map.month + '-' + map.day
}

// 打卡日期只认 YYYY-MM-DD。后面若带时间，仍按前面的日历日。非法日期（如 2 月 31 日）不算。
export function calendarDate(value) {
  const text = String(value == null ? '' : value).trim()
  const matched = /^(\d{4}-\d{2}-\d{2})(?:$|[\sT])/.exec(text)
  if (!matched) return ''
  return parseExportDate(matched[1])
}

export function localCalendarDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return calendarDate(date.getFullYear() + '-' + month + '-' + day)
}

export function isAfterShanghaiToday(value, now) {
  const day = calendarDate(value)
  const today = shanghaiCalendarDate(now == null ? new Date() : now)
  if (!day || !today) return false
  return day > today
}

function sortByDateDesc(reports) {
  return reports.slice().sort((a, b) => {
    const left = calendarDate(a && a.date) || String((a && a.date) || '')
    const right = calendarDate(b && b.date) || String((b && b.date) || '')
    return right.localeCompare(left)
  })
}

export function reportsOnDate(reports, date) {
  const day = calendarDate(date)
  if (!day) return []
  const list = Array.isArray(reports) ? reports : []
  return sortByDateDesc(list.filter(report => report && calendarDate(report.date) === day))
}

export function recentCheckinView(reports, selectedDate, now) {
  const today = shanghaiCalendarDate(now == null ? new Date() : now)
  const picked = calendarDate(selectedDate)
  const date = picked || today
  const matched = date ? reportsOnDate(reports, date) : []
  const list = Array.isArray(reports) ? reports : []
  const hasHistory = list.some(report => report && calendarDate(report.date))
  let emptyText = ''
  if (!matched.length) {
    if (!hasHistory) emptyText = '暂无打卡记录'
    else if (date && date === today) emptyText = '今天还没有人打卡'
    else emptyText = (date || '所选日期') + ' 这一天没有打卡数据'
  }
  return {
    date,
    today,
    reports: matched,
    count: matched.length,
    emptyText
  }
}

export function visibleDayReports(view, expanded, limit) {
  const reports = view && Array.isArray(view.reports) ? view.reports : []
  const cap = Number(limit)
  if (expanded || !(cap > 0)) return reports.slice()
  return reports.slice(0, cap)
}
