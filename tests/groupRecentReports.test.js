import test from 'node:test'
import assert from 'node:assert/strict'
import {
  calendarDate,
  isAfterShanghaiToday,
  localCalendarDate,
  recentCheckinView,
  reportsOnDate,
  shanghaiCalendarDate,
  visibleDayReports
} from '../src/utils/groupRecentReports.js'

const noonUtc = new Date('2026-11-25T04:00:00Z')
const afterShanghaiMidnight = new Date('2026-11-25T16:30:00Z')

function report(date, nickname, extra) {
  return Object.assign({
    id: nickname + '-' + date,
    date,
    nickname,
    template1: '早课 _ 分钟',
    value1: '20'
  }, extra || {})
}

test('默认日期按北京时间的日历日，跨过北京零点才换日', () => {
  assert.equal(shanghaiCalendarDate(noonUtc), '2026-11-25')
  assert.equal(shanghaiCalendarDate(new Date('2026-11-25T15:59:00Z')), '2026-11-25')
  assert.equal(shanghaiCalendarDate(afterShanghaiMidnight), '2026-11-26')
  assert.equal(shanghaiCalendarDate(new Date('invalid')), '')
})

test('只认真实存在的 YYYY-MM-DD，带时间的记录仍按当天', () => {
  assert.equal(calendarDate('2026-11-16'), '2026-11-16')
  assert.equal(calendarDate('2026-11-16 08:30:00'), '2026-11-16')
  assert.equal(calendarDate('2026-11-16T00:30:00Z'), '2026-11-16')
  assert.equal(calendarDate('2026-02-31'), '')
  assert.equal(calendarDate('2026-11-1'), '')
  assert.equal(calendarDate(''), '')
  assert.equal(calendarDate(null), '')
})

test('选中某一天后只留下这一天的打卡，邻近日期不会被前缀带进来', () => {
  const reports = [
    report('2026-11-16', '甲'),
    report('2026-11-01', '乙'),
    report('2026-11-160', '坏数据'),
    report('2026-11-16 21:00:00', '丙'),
    report('2026-02-31', '丁'),
    report('2026-11-17', '戊')
  ]
  const matched = reportsOnDate(reports, '2026-11-16')
  assert.deepEqual(matched.map(item => item.nickname), ['甲', '丙'])
  assert.equal(reportsOnDate(reports, '2026-11-01').length, 1)
  assert.equal(reportsOnDate(reports, '2026-11-01')[0].nickname, '乙')
  assert.deepEqual(reportsOnDate(reports, '2026-11-18'), [])
  assert.deepEqual(reportsOnDate(null, '2026-11-16'), [])
  assert.deepEqual(reportsOnDate(reports, '2026-02-31'), [])
})

test('同一天多条记录保留原有先后，日期更新的排在前面', () => {
  const matched = reportsOnDate([
    report('2026-11-15', '先'),
    report('2026-11-16', '乙'),
    report('2026-11-16', '甲')
  ], '2026-11-16')
  assert.deepEqual(matched.map(item => item.nickname), ['乙', '甲'])
})

test('没有历史打卡时提示暂无记录；有历史但当天没有时写明这一天', () => {
  const history = [report('2026-11-20', '甲'), report('2026-11-21', '乙')]
  const today = recentCheckinView(history, '2026-11-25', noonUtc)
  assert.equal(today.date, '2026-11-25')
  assert.equal(today.today, '2026-11-25')
  assert.equal(today.count, 0)
  assert.equal(today.emptyText, '今天还没有人打卡')

  const otherDay = recentCheckinView(history, '2026-11-19', noonUtc)
  assert.deepEqual(otherDay.reports, [])
  assert.equal(otherDay.emptyText, '2026-11-19 这一天没有打卡数据')

  const none = recentCheckinView([], '2026-11-25', noonUtc)
  assert.equal(none.emptyText, '暂无打卡记录')
  assert.equal(none.count, 0)
})

test('未选日期时回到北京时间的今天，并展示这一天的打卡内容', () => {
  const history = [
    report('2026-11-26', '次日'),
    report('2026-11-25', '甲', { value1: '15' }),
    report('2026-11-24', '乙')
  ]
  const view = recentCheckinView(history, '', noonUtc)
  assert.equal(view.date, '2026-11-25')
  assert.equal(view.emptyText, '')
  assert.equal(view.count, 1)
  assert.equal(view.reports[0].nickname, '甲')
  assert.equal(view.reports[0].template1, '早课 _ 分钟')
  assert.equal(view.reports[0].value1, '15')

  const picked = recentCheckinView(history, '2026-11-24', noonUtc)
  assert.equal(picked.reports[0].nickname, '乙')
  assert.equal(recentCheckinView(history, 'not-a-date', noonUtc).date, '2026-11-25')
})

test('北京时间跨日后，默认今天变成新的一天', () => {
  const history = [report('2026-11-25', '甲')]
  const view = recentCheckinView(history, '', afterShanghaiMidnight)
  assert.equal(view.today, '2026-11-26')
  assert.equal(view.date, '2026-11-26')
  assert.equal(view.emptyText, '今天还没有人打卡')
  assert.equal(recentCheckinView(history, '2026-11-25', afterShanghaiMidnight).reports[0].nickname, '甲')
})

test('列表先展示当天的前几条，展开后才是这一天的全部', () => {
  const reports = ['甲', '乙', '丙', '丁'].map(name => report('2026-11-25', name))
  const view = recentCheckinView(reports, '2026-11-25', noonUtc)
  assert.equal(view.count, 4)
  assert.deepEqual(visibleDayReports(view, false, 3).map(item => item.nickname), ['甲', '乙', '丙'])
  assert.deepEqual(visibleDayReports(view, true, 3).map(item => item.nickname), ['甲', '乙', '丙', '丁'])
  assert.equal(visibleDayReports(view, false, 3).some(item => item.nickname === '丁'), false)
})

test('不能选北京时间今天之后的日期', () => {
  assert.equal(isAfterShanghaiToday('2026-11-26', noonUtc), true)
  assert.equal(isAfterShanghaiToday('2026-11-25', noonUtc), false)
  assert.equal(isAfterShanghaiToday('2026-11-24', noonUtc), false)
  assert.equal(isAfterShanghaiToday('2026-11-26', afterShanghaiMidnight), false)
  assert.equal(isAfterShanghaiToday('2026-02-31', noonUtc), false)
  assert.equal(localCalendarDate(new Date(2026, 10, 25)), '2026-11-25')
  assert.equal(localCalendarDate(new Date('invalid')), '')
})
