import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildGroupView,
  parseJoinResult,
  visibleTeamSummaries,
  withCacheBust
} from '../src/utils/groupMembership.js'

const ownerGroups = [
  { id: 1, groupId: 'HTZ-0000001', groupName: '晨练组' },
  { id: 2, groupId: 'HTZ-0000002', groupName: '晚课组' }
]

test('二维成员记录没有 groupId 时仍按组下标出现在待审核里', () => {
  const view = buildGroupView({
    ownedGroups: ownerGroups,
    ownedMemberRows: [
      [{ id: 11, unionId: 'user-b', nickname: '乙', state: 0, owner: 'user-a' }],
      [{ id: 12, unionId: 'user-c', nickname: '丙', state: '1', owner: 'user-a' }]
    ],
    joinedRaw: [],
    unionId: 'user-a'
  })
  assert.equal(view.pendingCount, 1)
  assert.equal(view.owned[0].pending.length, 1)
  assert.equal(view.owned[0].pending[0].groupId, 'HTZ-0000001')
  assert.equal(view.owned[0].pending[0].nickname, '乙')
  assert.equal(view.owned[1].members.length, 1)
  assert.equal(view.owned[1].members[0].nickname, '丙')
  assert.equal(view.owned[0].members.length, 0)
})

test('扁平成员不会因为下标被串到别的组', () => {
  const view = buildGroupView({
    ownedGroups: ownerGroups,
    ownedMemberRows: [
      { id: 21, groupId: 'HTZ-0000002', unionId: 'user-c', state: 0, nickname: '丙' }
    ],
    joinedRaw: [],
    unionId: 'user-a'
  })
  assert.equal(view.owned[0].pending.length, 0)
  assert.equal(view.owned[1].pending[0].nickname, '丙')
})

test('state 缺失的旧记录仍显示为组员，明确的 0 和 2 不会被当成已加入', () => {
  const view = buildGroupView({
    ownedGroups: [ownerGroups[0]],
    ownedMemberRows: [[
      { id: 1, unionId: 'old', nickname: '旧数据' },
      { id: 2, unionId: 'wait', nickname: '待审', state: '0' },
      { id: 3, unionId: 'no', nickname: '拒绝', state: 2 }
    ]],
    joinedRaw: [],
    unionId: 'user-a'
  })
  assert.deepEqual(view.owned[0].members.map(item => item.nickname), ['旧数据'])
  assert.deepEqual(view.owned[0].pending.map(item => item.nickname), ['待审'])
  assert.deepEqual(view.owned[0].rejected.map(item => item.nickname), ['拒绝'])
})

test('申请人在待审核时能看到小组，批准后进入我加入的', () => {
  const pending = buildGroupView({
    ownedGroups: [],
    ownedMemberRows: [],
    unionId: 'user-b',
    joinedRaw: [[
      { id: 31, groupId: 'HTZ-0000001', groupName: '晨练组', unionId: 'user-b', state: 0, ownerName: '甲' },
      { id: 32, groupId: 'HTZ-0000001', groupName: '晨练组', unionId: 'user-c', state: 1, nickname: '丙' }
    ]]
  })
  assert.equal(pending.joined.length, 0)
  assert.equal(pending.pendingApplications.length, 1)
  assert.equal(pending.pendingApplications[0].groupName, '晨练组')
  assert.equal(pending.pendingApplications[0].myRecordId, 31)

  const approved = buildGroupView({
    ownedGroups: [],
    ownedMemberRows: [],
    unionId: 'user-b',
    joinedRaw: [[{
      id: 31, groupId: 'HTZ-0000001', groupName: '晨练组', unionId: 'user-b', state: '1', ownerName: '甲'
    }]]
  })
  assert.equal(approved.joined.length, 1)
  assert.equal(approved.joined[0].groupId, 'HTZ-0000001')
  assert.equal(approved.pendingApplications.length, 0)
})

test('扁平列表、对象分组和拒绝记录都不会把小组丢掉', () => {
  const flat = buildGroupView({
    ownedGroups: [],
    joinedRaw: [
      { id: 41, groupId: 'HTZ-0000003', groupName: '读书组', unionId: 'user-b', state: 1 },
      { id: 42, groupId: 'HTZ-0000003', groupName: '读书组', unionId: 'user-d', state: 1, nickname: '丁' }
    ],
    unionId: 'user-b'
  })
  assert.equal(flat.joined.length, 1)
  assert.equal(flat.joined[0].members.length, 2)

  const mapped = buildGroupView({
    ownedGroups: [],
    joinedRaw: {
      'HTZ-0000004': [{ id: 51, unionId: 'user-b', state: 2, groupName: '静坐组', ownerName: '甲' }]
    },
    unionId: 'user-b'
  })
  assert.equal(mapped.joined.length, 0)
  assert.equal(mapped.rejectedApplications[0].groupName, '静坐组')
  assert.equal(mapped.rejectedApplications[0].groupId, 'HTZ-0000004')
})

test('首页小组只显示自己创建的和已批准加入的，待审核不混进今日打卡', () => {
  const teams = visibleTeamSummaries({
    ownedGroups: [{ groupId: 'HTZ-0000001', groupName: '晨练组' }],
    ownedMemberRows: [],
    unionId: 'user-a',
    joinedRaw: [
      [{ groupId: 'HTZ-0000009', groupName: '已加入', unionId: 'user-a', state: 1 }],
      [{ groupId: 'HTZ-0000010', groupName: '待审核', unionId: 'user-a', state: 0 }]
    ]
  })
  assert.deepEqual(teams.map(team => team.groupName), ['晨练组', '已加入'])
  assert.deepEqual(teams.map(team => team.isOwner), [true, false])
})

test('自己创建的组不会在我加入的里再出现一次', () => {
  const view = buildGroupView({
    ownedGroups: [{ groupId: 'HTZ-0000001', groupName: '晨练组' }],
    unionId: 'user-a',
    joinedRaw: [[{ groupId: 'HTZ-0000001', groupName: '晨练组', unionId: 'user-a', state: 1 }]]
  })
  assert.equal(view.joined.length, 0)
})

test('入组返回码只接受约定的 0 到 5', () => {
  assert.equal(parseJoinResult(0), 0)
  assert.equal(parseJoinResult('0'), 0)
  assert.equal(parseJoinResult(' 3 '), 3)
  assert.equal(parseJoinResult(''), null)
  assert.equal(parseJoinResult(null), null)
  assert.equal(parseJoinResult('success'), null)
  assert.equal(parseJoinResult(6), null)
})

test('成员列表刷新会带上缓存破坏参数', () => {
  assert.equal(
    withCacheBust('http://example/findAllJoinGroups?unionId=abc', 5),
    'http://example/findAllJoinGroups?unionId=abc&_t=5'
  )
})
