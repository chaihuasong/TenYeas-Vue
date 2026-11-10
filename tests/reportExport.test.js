import test from 'node:test'
import assert from 'node:assert/strict'
import {
  OWN_EXPORT_COLUMNS,
  buildOwnExportSheet,
  keepOwnReports,
  sortOwnReports,
  unwrapReportList
} from '../src/utils/reportExport.js'

const rows = [
  {
    id: 1,
    date: '2026-11-01',
    userId: 'user-a',
    nickname: '三哥',
    note: '今日总结',
    state: '1',
    template1: '站桩_分钟',
    value1: '30',
    share: '分享A',
    telephone: '13800000000',
    wechatid: 'wx-a'
  },
  {
    id: 2,
    date: '2026-11-03',
    userId: 'user-a',
    nickname: '三哥',
    note: '后一天',
    state: '0',
    value2: '5',
    share: ''
  },
  {
    id: 3,
    date: '2026-11-02',
    userId: 'user-b',
    nickname: '小李',
    note: '别人的',
    state: '1',
    template1: '站桩_分钟',
    value1: '10',
    share: '不应出现'
  },
  {
    id: 4,
    date: '2026-11-04',
    nickname: '三哥',
    note: '接口未带回用户字段',
    state: '1',
    share: ''
  }
]

test('只保留当前用户的记录，并丢掉明确属于别人的行', () => {
  const own = keepOwnReports(rows, 'user-a')
  assert.deepEqual(own.map(row => row.id), [1, 2, 4])
  assert.equal(keepOwnReports(rows, '').length, 0)
  assert.equal(keepOwnReports(null, 'user-a').length, 0)
})

test('导出按日期从新到旧，表头是打卡内容，不包含手机号和微信号', () => {
  const sheet = buildOwnExportSheet(sortOwnReports(keepOwnReports(rows, 'user-a')))
  assert.deepEqual(sheet[0], OWN_EXPORT_COLUMNS.map(column => column.label))
  assert.equal(sheet[1][0], '2026-11-04')
  assert.equal(sheet[2][0], '2026-11-03')
  assert.equal(sheet[3][0], '2026-11-01')
  assert.equal(sheet[3][OWN_EXPORT_COLUMNS.findIndex(column => column.key === 'state')], '+')
  assert.equal(sheet[3][OWN_EXPORT_COLUMNS.findIndex(column => column.key === 'value1')], '站桩30分钟')
  assert.equal(sheet[2][OWN_EXPORT_COLUMNS.findIndex(column => column.key === 'value2')], '5')
  const flat = sheet.flat().map(cell => String(cell))
  assert.equal(flat.includes('13800000000'), false)
  assert.equal(flat.includes('wx-a'), false)
  assert.equal(flat.includes('别人的'), false)
})

test('数组响应视为全部记录，带 total 且更长时标记为被截断', () => {
  assert.deepEqual(unwrapReportList(rows).truncated, false)
  assert.equal(unwrapReportList(rows).total, rows.length)
  const paged = unwrapReportList({ list: [rows[0]], total: 3 })
  assert.equal(paged.truncated, true)
  assert.equal(paged.rows.length, 1)
  assert.deepEqual(unwrapReportList(null), { rows: [], total: 0, truncated: false })
})
