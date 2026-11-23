import test from 'node:test'
import assert from 'node:assert/strict'
import XLSX from 'xlsx'
import {
  buildExportNoteSheet,
  buildOwnExportSheet,
  describeOwnExportOutcome,
  ownExportRequestUrl,
  prepareDatedExport,
  prepareExportMyReports,
  runOwnExport,
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
  assert.equal(note.includes('不代表你历史上一共打过多少卡'), true)
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
  assert.equal(mismatched.reason.includes('不能当作完整历史'), true)

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

function dated(list, extra) {
  return prepareDatedExport(payload(list, extra), { nickname: '甲' }, {
    mode: 'range',
    startDate: '2025-12-31',
    endDate: '2026-02-01'
  })
}

test('个人导出仍请求 exportMyReports，不把日期塞进旧的 unionid 查询', async () => {
  const url = ownExportRequestUrl('http://app.example/', 'user a')
  assert.equal(url, 'http://app.example/exportMyReports?userId=user%20a')
  assert.equal(url.includes('findReportByUser'), false)
  assert.equal(url.includes('startDate'), false)
  let called = 0
  const invalid = await runOwnExport({
    userId: 'user-a',
    mode: 'range',
    startDate: '2026-03-02',
    endDate: '2026-03-01',
    getExport: async () => { called += 1; return payload([]) }
  })
  assert.equal(called, 0)
  assert.equal(invalid.download, false)
  assert.equal(invalid.status, 'invalid')
  assert.equal(describeOwnExportOutcome(invalid).title, '没有导出')

  const missing = await runOwnExport({
    userId: 'user-a',
    mode: 'range',
    startDate: '',
    endDate: '2026-03-01',
    getExport: async () => { called += 1; return payload([]) }
  })
  assert.equal(called, 0)
  assert.equal(missing.reason, '请选择开始日期和结束日期')

  const badDay = prepareDatedExport(payload([]), null, {
    mode: 'range',
    startDate: '2023-02-29',
    endDate: '2023-02-29'
  })
  assert.equal(badDay.status, 'invalid')

  const broken = await runOwnExport({
    userId: 'user-a',
    mode: 'range',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    getExport: async () => { throw new Error('timeout') }
  })
  assert.equal(broken.download, false)
  assert.equal(broken.status, 'failed')
  assert.equal(describeOwnExportOutcome(broken).title, '没有生成文件')
  assert.equal(describeOwnExportOutcome(broken).detail.includes('已导出'), false)
})

test('日期范围含首尾、跨月跨年、单日和空字段，全量导出不按日期丢记录', () => {
  const list = [
    row(1, 'canonical-a', '2025-12-30', { note: '范围前一天' }),
    row(2, 'openid-a', '2025-12-31', { nickname: '', note: '', value1: '', template1: null, share: null }),
    row(3, 'user-a', '2026-01-31', { note: '跨月' }),
    row(4, 'canonical-a', '2026-02-01', { note: '结束当天' }),
    row(5, 'canonical-a', '2026-02-02', { note: '范围后一天' }),
    row(6, 'other-user', '2026-01-15', { note: '别人' }),
    { id: 7, userId: 'canonical-a', date: '', state: '1', nickname: '', value1: '', template1: null, note: '没有日期的旧记录' }
  ]
  const ranged = dated(list)
  assert.equal(ranged.status, 'complete')
  assert.equal(ranged.download, true)
  assert.deepEqual(ranged.ownIds, ['2', '3', '4'])
  assert.equal(ranged.rows[0].nickname, '甲')
  assert.equal(ranged.rows[0].note, '')
  assert.equal(ranged.rangeLabel.includes('含开始和结束两天'), true)
  const note = buildExportNoteSheet(ranged).flat().join('\n')
  assert.equal(note.includes('2025-12-31 至 2026-02-01'), true)
  assert.equal(note.includes('别人'), false)
  assert.equal(note.includes('没有日期的旧记录'), false)

  const single = prepareDatedExport(payload(list), { nickname: '甲' }, {
    mode: 'range',
    startDate: '2026-01-31',
    endDate: '2026-01-31'
  })
  assert.deepEqual(single.ownIds, ['3'])
  assert.equal(single.rangeLabel.includes('当天'), true)

  const sameDay = prepareDatedExport(payload([
    row(11, 'canonical-a', '2026-04-04', { note: '上午' }),
    row(12, 'openid-a', '2026-04-04', { note: '下午', nickname: '' })
  ]), { nickname: '甲' }, {
    mode: 'range',
    startDate: '2026-04-04',
    endDate: '2026-04-04'
  })
  assert.deepEqual(sameDay.ownIds, ['11', '12'])

  const all = prepareDatedExport(payload(list), { nickname: '甲' }, { mode: 'all' })
  assert.equal(all.rows.some(item => item.note === '没有日期的旧记录'), true)
  assert.equal(all.rows.some(item => item.note === '范围前一天'), true)
  assert.equal(all.rows.some(item => item.note === '别人'), false)
  assert.equal(all.rangeLabel.includes('不按日期筛选'), true)

  const empty = dated([row(8, 'canonical-a', '2024-01-01')])
  assert.equal(empty.status, 'empty')
  assert.equal(empty.download, false)
  assert.equal(describeOwnExportOutcome(empty).title, '没有可导出的记录')
})

test('范围内大量记录不截断；不完整或失败不能报成已导出', () => {
  const list = []
  for (let i = 1; i <= 500; i++) {
    const month = i % 2 === 0 ? '2026-01' : '2026-12'
    const day = String((i % 28) + 1).padStart(2, '0')
    list.push(row(i, i % 2 === 0 ? 'canonical-a' : 'openid-a', month + '-' + day, {
      nickname: i % 6 === 0 ? '' : '三哥',
      value1: i % 7 === 0 ? '' : '1',
      template1: i % 7 === 0 ? null : '站桩_分钟'
    }))
  }
  const ranged = prepareDatedExport(payload(list), { nickname: '甲' }, {
    mode: 'range',
    startDate: '2026-01-01',
    endDate: '2026-01-31'
  })
  const january = list.filter(item => item.date.startsWith('2026-01'))
  assert.equal(ranged.status, 'complete')
  assert.equal(ranged.rows.length, january.length)
  assert.equal(ranged.rows.length > 200, true)
  assert.deepEqual(ranged.ownIds, january.map(item => String(item.id)))

  const truncated = prepareDatedExport(payload([
    row(1, 'canonical-a', '2026-01-01')
  ], { truncated: true, total: 1 }), { nickname: '甲' }, {
    mode: 'range',
    startDate: '2026-01-01',
    endDate: '2026-01-31'
  })
  assert.equal(truncated.status, 'incomplete')
  assert.equal(truncated.download, false)
  assert.equal(truncated.rows.length, 0)
  assert.equal(describeOwnExportOutcome(truncated).title, '没有生成文件')
  assert.equal(describeOwnExportOutcome(truncated).saved, false)

  const mismatched = prepareDatedExport(payload([
    row(1, 'canonical-a', '2026-01-01')
  ], { total: 80 }), null, {
    mode: 'range',
    startDate: '2026-01-01',
    endDate: '2026-01-02'
  })
  assert.equal(mismatched.download, false)
  assert.equal(mismatched.rows.length, 0)

  const denied = prepareDatedExport({
    success: false,
    complete: false,
    message: '身份有歧义',
    list: [row(1, 'canonical-a', '2026-01-01')],
    total: 1
  }, null, { mode: 'range', startDate: '2026-01-01', endDate: '2026-01-31' })
  assert.equal(denied.download, false)
  assert.equal(denied.rows.length, 0)
  assert.equal(describeOwnExportOutcome(denied).detail.includes('身份有歧义'), true)
})
