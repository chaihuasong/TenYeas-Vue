import test from 'node:test'
import assert from 'node:assert/strict'
import {
  REPORT_EXPORT_COLUMNS,
  buildReportExportRow,
  buildReportSearchUrl,
  distinctPeople,
  selectPersonRows
} from '../src/utils/reportExport.js'

const rows = [
  {
    id: 1,
    date: '2026-11-01',
    userId: 'user-a',
    wechatid: 'wx-a',
    name: '张三',
    nickname: '三哥',
    gender: 1,
    note: '今日总结',
    templateId: 2,
    state: '1',
    template1: '站桩_分钟',
    value1: '30',
    share: '分享A',
    telephone: '13800000000'
  },
  {
    id: 2,
    date: '2026-11-02',
    userId: 'user-b',
    wechatid: 'wx-b',
    name: '李四',
    nickname: '小李',
    gender: 2,
    note: '',
    templateId: 2,
    state: '0',
    template1: '站桩_分钟',
    value1: null,
    share: ''
  },
  {
    id: 3,
    date: '2026-11-03',
    userId: 'user-a',
    name: '张三',
    nickname: '三哥',
    gender: 1,
    state: '0',
    share: '分享B'
  }
]

test('选择单个人时只保留该用户的打卡记录', () => {
  const selected = selectPersonRows(rows, 'user-a')
  assert.deepEqual(selected.map(row => row.id), [1, 3])
  assert.equal(selectPersonRows(rows, 'missing').length, 0)
  assert.equal(selectPersonRows(null, 'user-a').length, 0)
})

test('人员选项按用户去重，不把别人收进来', () => {
  const people = distinctPeople(rows)
  assert.equal(people.length, 2)
  assert.equal(people[0].label, '张三 / 三哥')
  assert.equal(people[1].userId, 'user-b')
})

test('导出行沿用原表头，并格式化性别、状态和项目', () => {
  assert.deepEqual(REPORT_EXPORT_COLUMNS.map(column => column.label).slice(0, 7), [
    'id', '日期', '用户ID', '微信号', '姓名', '昵称', '性别'
  ])
  const exported = buildReportExportRow(rows[0])
  assert.equal(exported[REPORT_EXPORT_COLUMNS.findIndex(column => column.key === 'gender')], '男')
  assert.equal(exported[REPORT_EXPORT_COLUMNS.findIndex(column => column.key === 'state')], '+')
  assert.equal(exported[REPORT_EXPORT_COLUMNS.findIndex(column => column.key === 'value1')], '站桩30分钟')
  assert.equal(exported.includes('13800000000'), false)
  const other = buildReportExportRow(rows[1])
  assert.equal(other[REPORT_EXPORT_COLUMNS.findIndex(column => column.key === 'gender')], '女')
  assert.equal(other[REPORT_EXPORT_COLUMNS.findIndex(column => column.key === 'state')], '-')
  assert.equal(other[REPORT_EXPORT_COLUMNS.findIndex(column => column.key === 'value1')], null)
})

test('个人导出使用原来的搜索接口，并保留未选日期时的 date=null', () => {
  assert.equal(
    buildReportSearchUrl('http://app.example:8081/', '张三', null),
    'http://app.example:8081/getReportInfoByNameOrNickNameLike?name=%E5%BC%A0%E4%B8%89&date=null'
  )
  assert.equal(
    buildReportSearchUrl('http://app.example:8081', 'a&b', '2026-11-01'),
    'http://app.example:8081/getReportInfoByNameOrNickNameLike?name=a%26b&date=2026-11-01'
  )
})
