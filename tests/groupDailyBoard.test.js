import test from 'node:test'
import assert from 'node:assert/strict'
import { buildGroupView } from '../src/utils/groupMembership.js'
import {
  assembleTeamDailyBoard,
  buildApprovedRoster,
  buildMonthExportMembers,
  reconcileTeamDailyBoard,
  rosterFromGroupView
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
