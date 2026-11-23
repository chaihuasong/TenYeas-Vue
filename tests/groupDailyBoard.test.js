import test from 'node:test'
import assert from 'node:assert/strict'
import { buildGroupView } from '../src/utils/groupMembership.js'
import {
  assembleTeamDailyBoard,
  buildApprovedRoster,
  buildMonthExportMembers,
  collectTeamMonthExport,
  collectTeamRange,
  reconcileTeamDailyBoard,
  rosterFromGroupView,
  teamRangeKey,
  validateTeamRange
} from '../src/utils/groupDailyBoard.js'

const groupId = 'HTZ-0000009'

function joinedRows() {
  return [[
    { id: 1, groupId, groupName: '晨练组', unionId: 'union-b', nickname: '乙', state: 1, owner: 'union-a', ownerNickName: '甲' },
    { id: 2, groupId, groupName: '晨练组', unionId: 'union-c', nickname: '丙', state: 1, owner: 'union-a', ownerNickName: '甲' },
    { id: 3, groupId, groupName: '晨练组', unionId: 'union-d', nickname: '丁', state: 1, owner: 'union-a', ownerNickName: '甲' },
    { id: 4, groupId, groupName: '晨练组', unionId: 'union-e', nickname: '戊', state: 0, owner: 'union-a', ownerNickName: '甲' },
    { id: 5, groupId, groupName: '晨练组', unionId: 'union-f', nickname: '己', state: 2, owner: 'union-a', ownerNickName: '甲' }
  ]]
}

test('组员视角的已通过名单包含组长和另外三名组员，待审核和已拒绝不在里面', () => {
  const view = buildGroupView({
    ownedGroups: [],
    ownedMemberRows: [],
    unionId: 'union-b',
    joinedRaw: joinedRows()
  })
  const roster = rosterFromGroupView(view, { groupId, isOwner: false })
  assert.deepEqual(roster.map(person => person.unionId), ['union-a', 'union-b', 'union-c', 'union-d'])
  assert.equal(roster[0].isOwner, true)
  assert.equal(roster[0].nickname, '甲')
  assert.equal(roster.filter(person => person.nickname === '戊' || person.nickname === '己').length, 0)
})

test('当日状态只带回两个人时，仍然展示四名已通过成员，没打卡的人不被删掉', () => {
  const view = buildGroupView({
    ownedGroups: [],
    unionId: 'union-b',
    joinedRaw: joinedRows()
  })
  const roster = rosterFromGroupView(view, { groupId, isOwner: false })
  const board = reconcileTeamDailyBoard({
    roster,
    statusMembers: [
      { unionId: 'union-a', nickname: '甲', isOwner: true, checkedIn: true, note: '早课' },
      { unionId: 'union-b', nickname: '乙', isOwner: false, checkedIn: true, note: '' }
    ],
    reportsByKey: {
      'id-c': { id: 'r-c', userId: 'id-c', date: '2026-11-16', note: '晚课' }
    },
    profilesByKey: {
      'union-c': { id: 'id-c', unionid: 'union-c', openid: 'open-c', nickname: '丙' }
    }
  })
  assert.equal(board.total, 4)
  assert.deepEqual(board.members.map(person => person.unionId).sort(), ['union-a', 'union-b', 'union-c', 'union-d'])
  const byName = Object.fromEntries(board.members.map(person => [person.nickname, person.checkedIn]))
  assert.equal(byName['甲'], true)
  assert.equal(byName['乙'], true)
  assert.equal(byName['丙'], true)
  assert.equal(byName['丁'], false)
  assert.equal(board.checkedIn, 3)
  assert.equal(board.members.find(person => person.nickname === '丙').note, '晚课')
})

test('同一个人用主键和 unionid 各出现一次时合并成一条，并认领主键下的打卡', () => {
  const board = reconcileTeamDailyBoard({
    roster: buildApprovedRoster({
      ownerId: 'union-a',
      ownerNickname: '甲',
      members: [
        { unionId: 'union-b', nickname: '乙', state: 1 },
        { unionId: 'id-b', nickname: '', state: 1 }
      ]
    }),
    statusMembers: [],
    profilesByKey: {
      'union-b': { id: 'id-b', unionid: 'union-b', openid: 'open-b', nickname: '乙' },
      'id-b': { id: 'id-b', unionid: 'union-b', openid: 'open-b', nickname: '乙' }
    },
    reportsByKey: {
      'id-b': { id: 'r-b', userId: 'id-b', date: '2026-11-16', note: '已做' }
    }
  })
  assert.equal(board.total, 2)
  const member = board.members.find(person => person.nickname === '乙')
  assert.equal(member.checkedIn, true)
  assert.equal(member.note, '已做')
  assert.equal(board.members.filter(person => person.isOwner).length, 1)
})

test('补拉打卡失败或为空时，这名成员仍留在未打卡里', async () => {
  const roster = buildApprovedRoster({
    ownerId: 'union-a',
    ownerNickname: '甲',
    members: [
      { unionId: 'union-b', nickname: '乙', state: 1 },
      { unionId: 'union-c', nickname: '丙', state: 1 },
      { unionId: 'union-d', nickname: '丁', state: 0 }
    ]
  })
  const board = await assembleTeamDailyBoard({
    roster,
    statusMembers: [
      { unionId: 'union-a', nickname: '甲', isOwner: true, checkedIn: false }
    ],
    fetchReport(person) {
      if (person.unionId === 'union-b') {
        return { id: 'r-b', userId: 'id-b', date: '2026-11-16', note: '补上' }
      }
      if (person.unionId === 'union-c') {
        throw new Error('网络失败')
      }
      return null
    },
    fetchProfile(person) {
      if (person.unionId === 'union-b') {
        return { id: 'id-b', unionid: 'union-b', nickname: '乙' }
      }
      return null
    }
  })
  assert.deepEqual(board.members.map(person => person.nickname).sort(), ['甲', '乙', '丙'].sort())
  assert.equal(board.members.find(person => person.nickname === '乙').checkedIn, true)
  assert.equal(board.members.find(person => person.nickname === '丙').checkedIn, false)
  assert.equal(board.members.find(person => person.nickname === '甲').checkedIn, false)
  assert.equal(board.total, 3)
})

test('月度导出缺某几个人的统计行时仍保留全部成员，没打卡的人天数是 0', () => {
  const days = ['2026-11-01', '2026-11-02']
  const rows = buildMonthExportMembers({
    people: [
      { unionId: 'union-a', nickname: '甲', isOwner: true, aliases: ['union-a', 'id-a'] },
      { unionId: 'union-b', nickname: '乙', isOwner: false, aliases: ['union-b'] },
      { unionId: 'union-c', nickname: '丙', isOwner: false, aliases: ['union-c', 'id-c'] },
      { unionId: 'union-d', nickname: '丁', isOwner: false, aliases: ['union-d'] }
    ],
    statMembers: [
      { unionId: 'union-a', nickname: '甲', isOwner: true, checkedDays: ['2026-11-01'] },
      { unionId: 'union-b', nickname: '乙', isOwner: false, checkedDays: [] }
    ],
    monthDays: days,
    reportsByUnionId: {
      'union-c': [{ userId: 'id-c', date: '2026-11-02' }]
    }
  })
  assert.equal(rows.length, 4)
  const byName = Object.fromEntries(rows.map(person => [person.nickname, person.checkedDays]))
  assert.deepEqual(byName['甲'], ['2026-11-01'])
  assert.deepEqual(byName['乙'], [])
  assert.deepEqual(byName['丙'], ['2026-11-02'])
  assert.deepEqual(byName['丁'], [])
  assert.equal(rows.find(person => person.nickname === '丁').checkedCount, 0)
})

test('团队月报导出保留零打卡的已通过成员，待审核的人不在名册里', async () => {
  const view = buildGroupView({
    ownedGroups: [{ groupId, groupName: '晨练组', owner: 'union-a' }],
    ownedMemberRows: [[
      { groupId, unionId: 'union-b', nickname: '乙', state: 1 },
      { groupId, unionId: 'union-c', nickname: '丙', state: 1 },
      { groupId, unionId: 'union-e', nickname: '戊', state: 0 }
    ]],
    unionId: 'union-a'
  })
  const roster = rosterFromGroupView(view, { groupId, isOwner: true }, 'union-a')
  assert.deepEqual(roster.map(person => person.unionId).sort(), ['union-a', 'union-b', 'union-c'].sort())
  assert.equal(roster.some(person => person.unionId === 'union-e'), false)
  const asked = []
  const collected = await collectTeamMonthExport({
    groupId,
    groupName: '晨练组',
    date: '2026-11-16',
    roster,
    fetchDailyStatus: async () => ({ groupName: '晨练组', members: [] }),
    fetchMonthStats: async () => ({
      groupName: '晨练组',
      days: ['2026-11-01', '2026-11-16'],
      members: [{ unionId: 'union-b', nickname: '乙', checkedDays: ['2026-11-01'] }]
    }),
    fetchMonthReports: async (userId) => {
      asked.push(userId)
      if (userId === 'union-b') return [{ userId: 'union-b', date: '2026-11-01' }]
      return []
    }
  })
  assert.equal(collected.ok, true)
  assert.equal(collected.memberCount, 3)
  assert.equal(collected.zeroCount, 2)
  assert.deepEqual(asked.sort(), ['union-a', 'union-b', 'union-c'].sort())
  assert.equal(collected.monthRows.flat().includes('戊'), false)
  assert.equal(collected.monthRows.find(row => row[0] === '乙')[3], 1)
  assert.equal(collected.monthRows.find(row => row[0] === '丙')[3], 0)
  assert.equal(collected.dailyRows.filter(row => row[3] === '未打卡').length, 3)
  assert.equal(collected.fileName, '晨练组_202611打卡统计.xlsx')
})

function rangeRoster() {
  return [
    { unionId: 'union-a', nickname: '甲', isOwner: true, aliases: ['union-a'] },
    { unionId: 'union-b', nickname: '乙', name: '乙某', isOwner: false, state: 1, aliases: ['union-b'] },
    { unionId: 'union-c', nickname: '丙', isOwner: false, state: 1, aliases: ['union-c'] },
    { unionId: 'union-e', nickname: '戊', isOwner: false, state: 0, aliases: ['union-e'] }
  ]
}

test('团队日期范围含首尾、跨月跨年，零打卡和待审核不混入', async () => {
  const months = []
  const reportCalls = []
  const result = await collectTeamRange({
    groupId,
    groupName: '晨练组',
    startDate: '2025-12-31',
    endDate: '2026-02-01',
    roster: rangeRoster(),
    fetchProfile: async person => {
      if (person.unionId === 'union-b') return { id: 'id-b', unionid: 'union-b', openid: 'openid-b', nickname: '乙' }
      return { id: person.unionId }
    },
    fetchMonthStats: async (id, month) => {
      months.push(id + ':' + month)
      if (month === '2025-12-') {
        return {
          groupName: '晨练组',
          members: [
            { unionId: 'union-a', checkedDays: ['2025-12-30', '2025-12-31'] },
            { unionId: 'union-e', checkedDays: ['2025-12-31'] }
          ]
        }
      }
      if (month === '2026-02-') {
        return { groupName: '晨练组', members: [{ unionId: 'union-a', checkedDays: ['2026-02-01', '2026-02-03'] }] }
      }
      return { groupName: '晨练组', members: [] }
    },
    fetchMonthReports: async (userId, month) => {
      reportCalls.push(userId + ':' + month)
      if (userId === 'id-b' && month === '2026-01-') {
        return [
          { userId: 'id-b', date: '2026-01-31', note: '跨月' },
          { userId: 'other-user', date: '2026-01-15', note: '别人' }
        ]
      }
      if (userId === 'union-b' && month === '2026-01-') return []
      return []
    }
  })
  assert.equal(result.ok, true)
  assert.deepEqual(months, [
    groupId + ':2025-12-',
    groupId + ':2026-01-',
    groupId + ':2026-02-'
  ])
  assert.equal(result.memberCount, 3)
  assert.equal(result.members.some(person => person.nickname === '戊'), false)
  const owner = result.members.find(person => person.nickname === '甲')
  assert.deepEqual(owner.checkedDays, ['2025-12-31', '2026-02-01'])
  const second = result.members.find(person => person.nickname === '乙')
  assert.deepEqual(second.checkedDays, ['2026-01-31'])
  const quiet = result.members.find(person => person.nickname === '丙')
  assert.equal(quiet.checkedCount, 0)
  assert.equal(result.zeroCount, 1)
  assert.equal(result.monthRows[0][4], '2025-12-31')
  assert.equal(result.summarySheet, '打卡统计')
  assert.equal(result.dailySheet, '每日明细')
  assert.equal(result.dailyRows[0][0], '日期')
  assert.equal(result.dailyRows.some(row => row.join('|').includes('别人')), false)
  assert.equal(result.dailyRows.some(row => row[5] === '跨月' && row[0] === '2026-01-31'), true)
  assert.equal(result.rangeLabel.includes('含开始和结束两天'), true)
  assert.equal(result.fileName, '晨练组_20251231-20260201打卡统计.xlsx')
  assert.equal(reportCalls.includes('id-b:2026-01-'), true)
  assert.equal(reportCalls.includes('openid-b:2026-01-'), true)
})

test('团队单日范围沿用每日表，空数据仍保留成员', async () => {
  const result = await collectTeamRange({
    groupId,
    groupName: '晨练组',
    startDate: '2026-04-04',
    endDate: '2026-04-04',
    roster: [
      { unionId: 'union-a', nickname: '甲', isOwner: true },
      { unionId: 'union-b', nickname: '乙', state: 1 }
    ],
    fetchMonthStats: async () => ({ days: ['2026-04-01', '2026-04-04'], members: [] }),
    fetchMonthReports: async () => []
  })
  assert.equal(result.ok, true)
  assert.equal(result.memberCount, 2)
  assert.equal(result.checkinTotal, 0)
  assert.equal(result.zeroCount, 2)
  assert.equal(result.summarySheet, '月度统计')
  assert.equal(result.monthRows[0][4], '04-04')
  assert.deepEqual(result.dailyRows[0], ['昵称', '姓名', '角色', '是否打卡', '反省'])
  assert.equal(result.dailySheet, '2026-04-04')
  assert.equal(result.dailyRows.filter(row => row[3] === '未打卡').length, 2)
})

test('团队日期无效、倒置、截断或中途失败时不返回可导出的表', async () => {
  assert.equal(validateTeamRange({ startDate: '', endDate: '2026-01-02' }).ok, false)
  assert.equal(validateTeamRange({ startDate: '2023-02-29', endDate: '2023-03-01' }).reason.includes('真实存在'), true)
  assert.equal(validateTeamRange({ startDate: '2026-03-02', endDate: '2026-03-01' }).reason, '开始日期不能晚于结束日期')
  const calls = []
  const failed = await collectTeamRange({
    groupId,
    startDate: '2025-12-01',
    endDate: '2026-01-15',
    roster: [{ unionId: 'union-a', nickname: '甲', isOwner: true }],
    fetchMonthStats: async (id, month) => {
      calls.push(month)
      if (month === '2026-01-') throw new Error('网络失败')
      return { members: [{ unionId: 'union-a', checkedDays: ['2025-12-01'] }] }
    },
    fetchMonthReports: async () => [{ userId: 'union-a', date: '2025-12-01' }]
  })
  assert.equal(failed.ok, false)
  assert.equal(failed.monthRows, undefined)
  assert.equal(failed.reason.includes('没有生成文件'), true)
  const truncated = await collectTeamRange({
    groupId,
    startDate: '2026-05-01',
    endDate: '2026-05-03',
    roster: [{ unionId: 'union-a', nickname: '甲', isOwner: true }],
    fetchMonthStats: async () => ({ members: [] }),
    fetchMonthReports: async () => ({ list: [{ userId: 'union-a', date: '2026-05-01' }], total: 9, truncated: true })
  })
  assert.equal(truncated.ok, false)
  assert.equal(truncated.monthRows, undefined)
})

test('切换团队后结果只属于当前团队', async () => {
  const load = (id, nickname) => collectTeamRange({
    groupId: id,
    groupName: nickname,
    startDate: '2026-06-01',
    endDate: '2026-06-02',
    roster: [{ unionId: id + '-user', nickname, isOwner: true }],
    fetchMonthStats: async () => ({ groupName: nickname, members: [] }),
    fetchMonthReports: async () => []
  })
  const first = await load('HTZ-A', '甲队')
  const second = await load('HTZ-B', '乙队')
  assert.notEqual(first.key, second.key)
  assert.equal(teamRangeKey('HTZ-B', '2026-06-01', '2026-06-02'), second.key)
  assert.equal(second.members.some(person => person.nickname === '甲队'), false)
  assert.equal(second.members[0].nickname, '乙队')
  assert.equal(second.groupId, 'HTZ-B')
})

test('团队月报接口失败时不生成成功结果', async () => {
  const missing = await collectTeamMonthExport({ groupId: '', date: '2026-11-16', roster: [] })
  assert.equal(missing.ok, false)
  const failed = await collectTeamMonthExport({
    groupId,
    date: '2026-11-16',
    roster: [{ unionId: 'union-a', nickname: '甲', isOwner: true, aliases: ['union-a'] }],
    fetchDailyStatus: async () => ({}),
    fetchMonthStats: async () => { throw new Error('网络失败') }
  })
  assert.equal(failed.ok, false)
  assert.equal(failed.reason.includes('没有生成文件'), true)
})
