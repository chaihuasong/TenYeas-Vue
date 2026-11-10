import test from 'node:test'
import assert from 'node:assert/strict'
import XLSX from 'xlsx'
import {
  buildExportNoteSheet,
  buildOwnExportSheet,
  prepareExportMyReports,
  sheetMatchesRecords,
  sheetRecordIds
} from '../src/utils/reportExport.js'

function row(id, userId, date, extra) {
  return Object.assign({
    id,
    date,
    userId,
    nickname: '三哥',
    note: '',
    state: '1',
    template1: '站桩_分钟',
    value1: '30',
    share: ''
  }, extra || {})
}

function payload(list, extra) {
  return Object.assign({
    success: true,
    complete: true,
    truncated: false,
    scope: 'profile-identifiers',
    scopeNote: '仅当前资料仍存在且唯一归属的身份',
    canonicalUserId: 'canonical-a',
    acceptedUserIds: ['canonical-a', 'user-a', 'openid-a'],
    excludedUserIds: ['ambiguous-old'],
    warnings: [],
    message: '',
    total: list.length,
    list
  }, extra || {})
}

test('别名身份、空字段和同日不同 id 都保留，昵称空则用资料补上', () => {
  const list = [
    row(1, 'canonical-a', '2026-11-01', { nickname: '', note: '', value1: '', template1: null, share: null }),
    row(2, 'openid-a', '2026-11-01', { nickname: '   ', note: '历史仍挂在 openid', value1: '30' }),
    row(3, 'user-a', '2026-11-02', { note: '登录 unionid' }),
    row(9, 'other-user', '2026-11-02', { nickname: '别人', note: '不在 acceptedUserIds' })
  ]
  const prepared = prepareExportMyReports(payload(list), { nickname: '甲' })
  assert.equal(prepared.status, 'partial')
  assert.equal(prepared.download, true)
  assert.deepEqual(prepared.ownIds, ['1', '2', '3'])
  assert.equal(prepared.rows[0].nickname, '甲')
  assert.equal(prepared.rows[1].nickname, '甲')
  assert.equal(prepared.outsideAccepted, 1)
  const records = buildOwnExportSheet(prepared.rows)
  assert.equal(sheetMatchesRecords(records, prepared.rows), true)
  assert.equal(records.flat().includes('不在 acceptedUserIds'), false)
  assert.equal(records.filter(line => line[1] === '2026-11-01').length, 2)
  const note = buildExportNoteSheet(prepared).flat().join('\n')
  assert.equal(note.includes('终身'), true)
  assert.equal(note.includes('canonical-a'), true)
})

test('400 条以上、同日同内容不同 id 的名单写回 xlsx 后与源 list 一致', () => {
  const list = []
  for (let i = 1; i <= 450; i++) {
    const userId = i % 3 === 0 ? 'canonical-a' : (i % 3 === 1 ? 'user-a' : 'openid-a')
    list.push(row(i, userId, '2026-01-01', {
      nickname: i % 4 === 0 ? '' : '三哥',
      note: i % 5 === 0 ? '' : 'n' + i,
      value1: '8',
      share: ''
    }))
  }
  list.push(row(90001, 'canonical-a', '2026-01-01', { note: 'n1', value1: '8', share: '' }))
  const prepared = prepareExportMyReports(payload(list), { nickname: '甲' })
  assert.equal(prepared.status, 'complete')
  assert.equal(prepared.rows.length, 451)
  assert.equal(prepared.listCount, 451)
  const records = buildOwnExportSheet(prepared.rows)
  const sheet = XLSX.utils.aoa_to_sheet(records)
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(buildExportNoteSheet(prepared)), '说明')
  XLSX.utils.book_append_sheet(book, sheet, '我的打卡')
  const bytes = XLSX.write(book, { bookType: 'xlsx', type: 'buffer' })
  const loaded = XLSX.read(bytes)
  const back = XLSX.utils.sheet_to_json(loaded.Sheets['我的打卡'], { header: 1, raw: false })
  assert.deepEqual(back.map(line => String(line[0])), ['记录ID'].concat(list.map(item => String(item.id))))
  assert.equal(back.length - 1, list.length)
  const filled = back.filter(line => line[2] === '甲')
  assert.equal(filled.length > 0, true)
})

test('success 为 false 时不提供下载；complete 为 false 时只标成部分导出', () => {
  const denied = prepareExportMyReports({
    success: false,
    complete: false,
    message: '身份有歧义',
    warnings: ['已拒绝'],
    list: [row(1, 'canonical-a', '2026-11-01')],
    total: 1
  })
  assert.equal(denied.download, false)
  assert.equal(denied.rows.length, 0)
  assert.equal(denied.reason.includes('身份有歧义'), true)

  const partial = prepareExportMyReports(payload([
    row(11, 'canonical-a', '2026-11-04', { nickname: '' })
  ], {
    complete: false,
    message: '有歧义身份被排除',
    warnings: ['excluded ambiguous-old'],
    total: 1
  }), { nickname: '甲' })
  assert.equal(partial.status, 'partial')
  assert.equal(partial.download, true)
  assert.equal(partial.rows.length, 1)
  assert.equal(partial.rows[0].nickname, '甲')
  assert.equal(partial.warnings[0], 'excluded ambiguous-old')
  assert.equal(partial.listCount, 1)
})

test('total 与 list 条数不一致或结果被截断时不能当成查全', () => {
  const mismatched = prepareExportMyReports(payload([
    row(1, 'canonical-a', '2026-11-01')
  ], { total: 9999 }))
  assert.equal(mismatched.status, 'partial')
  assert.equal(mismatched.rows.length, 1)
  assert.equal(mismatched.reason.includes('不能当作历史总数'), true)

  const truncated = prepareExportMyReports(payload([
    row(2, 'openid-a', '2026-11-02')
  ], { truncated: true, total: 1 }))
  assert.equal(truncated.status, 'partial')
  assert.equal(truncated.rows.length, 1)
})

test('缺少文档编号的记录仍保留，但不能标成查全', () => {
  const prepared = prepareExportMyReports(payload([
    { date: '2026-11-01', userId: 'canonical-a', state: '1', value1: '1', nickname: '' }
  ]), { nickname: '甲' })
  assert.equal(prepared.status, 'partial')
  assert.equal(prepared.rows.length, 1)
  assert.equal(sheetRecordIds(buildOwnExportSheet(prepared.rows))[0], '')
})
