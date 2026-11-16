// 团队今日打卡名单。
//
// 成员名单来自入组记录（group.owner + state 为已通过的 groups.unionId）。
// 打卡记录的 userId 在保存时会被写成用户资料的主键 _id，不一定等于入组时记下的 unionid / openid。
// getGroupDailyStatus、getGroupCheckinStats 用成员标识精确去查 report.userId，对不上就显示未打卡。
// findReportsInGroupByOwner / findReportsJoinGroupByOwner 还会在按 unionid 找不到用户时直接丢掉这条打卡。
// 这里以已通过成员为底，再用能解析 _id / unionid / openid 的打卡结果补状态。没有打卡记录的人仍然留下。

import { STATE_JOINED, classifyState } from './groupMembership.js'

export function normalizeId(value) {
  return String(value == null ? '' : value).replace(/"/g, '').trim()
}

function checkedFlag(value) {
  return value === true || value === 1 || value === '1' || value === 'true'
}

export function isDailyReport(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false
  return ['id', 'userId', 'date', 'note', 'state'].some(key => {
    return data[key] != null && String(data[key]).trim() !== ''
  })
}

function addAlias(set, value) {
  const id = normalizeId(value)
  if (id) set.add(id)
}

function aliasSetFrom(person) {
  const set = new Set()
  if (!person || typeof person !== 'object') return set
  addAlias(set, person.unionId)
  addAlias(set, person.unionid)
  addAlias(set, person.openid)
  addAlias(set, person.openId)
  addAlias(set, person.userId)
  addAlias(set, person.canonicalId)
  addAlias(set, person.userKey)
  if (Array.isArray(person.aliases)) person.aliases.forEach(alias => addAlias(set, alias))
  return set
}

function blank(value) {
  return value == null || String(value).trim() === ''
}

function keepOfficial(person) {
  if (!person || typeof person !== 'object' || Array.isArray(person)) return false
  if (person.isOwner === true) return true
  return classifyState(person.state) === STATE_JOINED
}

function seedPerson(person, fromStatus) {
  const aliases = aliasSetFrom(person)
  const unionId = normalizeId(person.unionId || person.unionid || person.userId) || Array.from(aliases)[0] || ''
  if (unionId) aliases.add(unionId)
  return {
    unionId,
    nickname: person.nickname || '',
    name: person.name || '',
    headimgurl: person.headimgurl || person.avatarUrl || '',
    isOwner: person.isOwner === true,
    checkedIn: fromStatus ? checkedFlag(person.checkedIn) : false,
    note: person.note || '',
    aliases
  }
}

function applyProfile(person, profilesByKey) {
  if (!profilesByKey) return
  const profile = profilesByKey[person.unionId] || profilesByKey[Array.from(person.aliases)[0]]
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) return
  addAlias(person.aliases, profile.id)
  addAlias(person.aliases, profile.unionid)
  addAlias(person.aliases, profile.unionId)
  addAlias(person.aliases, profile.openid)
  addAlias(person.aliases, profile.openId)
  if (blank(person.nickname)) person.nickname = profile.nickname || profile.name || ''
  if (blank(person.name)) person.name = profile.name || ''
  if (blank(person.headimgurl)) person.headimgurl = profile.headimgurl || profile.avatarUrl || ''
}

function sharesAlias(left, right) {
  for (const key of left.aliases) {
    if (right.aliases.has(key)) return true
  }
  return false
}

function mergePerson(into, extra) {
  extra.aliases.forEach(key => into.aliases.add(key))
  if (extra.isOwner) into.isOwner = true
  if (extra.checkedIn) into.checkedIn = true
  if (blank(into.nickname)) into.nickname = extra.nickname
  if (blank(into.name)) into.name = extra.name
  if (blank(into.headimgurl)) into.headimgurl = extra.headimgurl
  if (blank(into.note)) into.note = extra.note
  if (!into.unionId) into.unionId = extra.unionId
}

function foldPeople(people) {
  const folded = []
  people.forEach(person => {
    if (person.aliases.size === 0 && blank(person.nickname) && blank(person.name)) return
    const existing = folded.find(item => sharesAlias(item, person))
    if (existing) mergePerson(existing, person)
    else folded.push(person)
  })
  return folded
}

function reportIndex(reportsByKey) {
  const index = new Map()
  if (!reportsByKey || typeof reportsByKey !== 'object') return index
  Object.keys(reportsByKey).forEach(key => {
    const id = normalizeId(key)
    const report = reportsByKey[key]
    if (id && isDailyReport(report)) index.set(id, report)
  })
  return index
}

function applyReports(person, index) {
  for (const key of person.aliases) {
    const report = index.get(key)
    if (!report) continue
    person.checkedIn = true
    if (blank(person.note) && report.note) person.note = report.note
    addAlias(person.aliases, report.userId)
    return
  }
}

function toView(person, index) {
  const aliases = Array.from(person.aliases)
  return {
    key: person.unionId || aliases[0] || ('member-' + index),
    unionId: person.unionId || aliases[0] || '',
    nickname: person.nickname || '',
    name: person.name || '',
    headimgurl: person.headimgurl || '',
    isOwner: person.isOwner === true,
    checkedIn: person.checkedIn === true,
    note: person.note || '',
    aliases
  }
}

// roster：组长 + 已通过组员。statusMembers：getGroupDailyStatus / getGroupCheckinStats 的 members。
// 两边都出现的同一个人只留一条。待审核和已拒绝不会从 roster 里被加进来。
// reportsByKey 的键可以是入组标识，也可以是打卡文档上的 userId。没有对应打卡时成员仍保留，checkedIn 为 false。
export function reconcileTeamDailyBoard(input) {
  const source = input || {}
  const profilesByKey = source.profilesByKey || {}
  const people = []
  const roster = Array.isArray(source.roster) ? source.roster : []
  const statusMembers = Array.isArray(source.statusMembers) ? source.statusMembers : []
  roster.forEach(person => {
    if (!keepOfficial(person)) return
    people.push(seedPerson(person, false))
  })
  statusMembers.forEach(person => {
    if (!keepOfficial(person)) return
    people.push(seedPerson(person, true))
  })
  people.forEach(person => applyProfile(person, profilesByKey))
  const folded = foldPeople(people)
  const reports = reportIndex(source.reportsByKey)
  folded.forEach(person => applyReports(person, reports))
  const members = folded.map(toView)
  members.sort((a, b) => {
    if (a.checkedIn !== b.checkedIn) return a.checkedIn ? -1 : 1
    if (a.isOwner !== b.isOwner) return a.isOwner ? -1 : 1
    return String(a.nickname || a.name || '').localeCompare(String(b.nickname || b.name || ''))
  })
  return {
    members,
    total: members.length,
    checkedIn: members.filter(member => member.checkedIn).length
  }
}

export function buildApprovedRoster(input) {
  const source = input || {}
  const ownerId = normalizeId(source.ownerId)
  const members = []
  if (ownerId) {
    members.push({
      unionId: ownerId,
      nickname: source.ownerNickname || source.ownerName || '',
      name: source.ownerName || '',
      isOwner: true,
      aliases: [ownerId]
    })
  }
  const rows = Array.isArray(source.members) ? source.members : []
  rows.forEach(member => {
    if (!member || typeof member !== 'object') return
    if (classifyState(member.state) !== STATE_JOINED) return
    const unionId = normalizeId(member.unionId || member.unionid)
    if (!unionId || unionId === ownerId) return
    members.push({
      unionId,
      nickname: member.nickname || '',
      name: member.name || '',
      headimgurl: member.headimgurl || '',
      isOwner: false,
      state: STATE_JOINED,
      aliases: [unionId]
    })
  })
  return members
}

export function rosterFromGroupView(view, team, viewerId) {
  const source = view || {}
  const groupId = team && team.groupId
  if (team && team.isOwner) {
    const group = (source.owned || []).find(item => item && item.groupId === groupId)
    return buildApprovedRoster({
      ownerId: (group && group.owner) || viewerId,
      members: group ? group.members : []
    })
  }
  const group = (source.joined || []).find(item => item && item.groupId === groupId)
  return buildApprovedRoster({
    ownerId: group && group.ownerId,
    ownerName: group && group.ownerName,
    ownerNickname: group && group.ownerNickName,
    members: group ? group.members : []
  })
}

export async function assembleTeamDailyBoard(input) {
  const source = input || {}
  const first = reconcileTeamDailyBoard({
    roster: source.roster,
    statusMembers: source.statusMembers
  })
  const reportsByKey = {}
  const profilesByKey = {}
  await Promise.all(first.members.map(async person => {
    if (!person.unionId) return
    const jobs = []
    if (!person.checkedIn && typeof source.fetchReport === 'function') {
      jobs.push(Promise.resolve()
        .then(() => source.fetchReport(person))
        .then(report => {
          if (!isDailyReport(report)) return
          reportsByKey[person.unionId] = report
          const userId = normalizeId(report.userId)
          if (userId) reportsByKey[userId] = report
        })
        .catch(() => {}))
    }
    if (typeof source.fetchProfile === 'function') {
      jobs.push(Promise.resolve()
        .then(() => source.fetchProfile(person))
        .then(profile => {
          if (profile && typeof profile === 'object' && !Array.isArray(profile)) {
            profilesByKey[person.unionId] = profile
          }
        })
        .catch(() => {}))
    }
    await Promise.all(jobs)
  }))
  return reconcileTeamDailyBoard({
    roster: source.roster,
    statusMembers: source.statusMembers,
    reportsByKey,
    profilesByKey
  })
}

function statMatches(person, member) {
  const keys = new Set(person.aliases || [])
  addAlias(keys, person.unionId)
  const memberKeys = aliasSetFrom(member)
  for (const key of memberKeys) {
    if (keys.has(key)) return true
  }
  return false
}

// 月度导出以当日名册为底。统计接口没返回的人补上空行，不能因为某月没有打卡就把人删掉。
export function buildMonthExportMembers(input) {
  const source = input || {}
  const people = Array.isArray(source.people) ? source.people : []
  const statMembers = Array.isArray(source.statMembers) ? source.statMembers : []
  const roster = people.map(person => ({
    unionId: person.unionId,
    nickname: person.nickname || '',
    name: person.name || '',
    headimgurl: person.headimgurl || '',
    isOwner: person.isOwner === true,
    state: person.isOwner === true ? undefined : (person.state == null ? STATE_JOINED : person.state),
    aliases: person.aliases || [person.unionId]
  }))
  const board = reconcileTeamDailyBoard({
    roster,
    statusMembers: statMembers
  })
  const rows = people.length ? board.members : statMembers.map((member, index) => ({
    key: member.unionId || ('stat-' + index),
    unionId: normalizeId(member.unionId || member.unionid),
    nickname: member.nickname || '',
    name: member.name || '',
    isOwner: member.isOwner === true,
    aliases: Array.from(aliasSetFrom(member))
  }))
  const monthDays = Array.isArray(source.monthDays) ? source.monthDays : null
  const reportsByUnionId = source.reportsByUnionId || {}
  return rows.map(person => {
    const stat = statMembers.find(member => statMatches(person, member))
    const dates = new Set(stat && Array.isArray(stat.checkedDays) ? stat.checkedDays : [])
    const keys = new Set(person.aliases || [])
    addAlias(keys, person.unionId)
    keys.forEach(key => {
      const list = reportsByUnionId[key]
      if (!Array.isArray(list)) return
      list.forEach(report => {
        if (report && report.date) dates.add(report.date)
      })
    })
    const checkedDays = monthDays
      ? monthDays.filter(day => dates.has(day))
      : Array.from(dates)
    return {
      unionId: person.unionId || '',
      nickname: person.nickname || (stat && stat.nickname) || '',
      name: person.name || (stat && stat.name) || '',
      isOwner: person.isOwner === true || !!(stat && stat.isOwner),
      checkedDays,
      checkedCount: checkedDays.length
    }
  })
}
