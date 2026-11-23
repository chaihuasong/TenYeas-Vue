// 团队今日打卡名单。
//
// 成员名单来自入组记录（group.owner + state 为已通过的 groups.unionId）。
// 打卡记录的 userId 在保存时会被写成用户资料的主键 _id，不一定等于入组时记下的 unionid / openid。
// getGroupDailyStatus、getGroupCheckinStats 用成员标识精确去查 report.userId，对不上就显示未打卡。
// findReportsInGroupByOwner / findReportsJoinGroupByOwner 还会在按 unionid 找不到用户时直接丢掉这条打卡。
// 这里以已通过成员为底，再用能解析 _id / unionid / openid 的打卡结果补状态。没有打卡记录的人仍然留下。

import { STATE_JOINED, classifyState } from './groupMembership.js'
import { parseExportDate } from './reportExport.js'

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

export function buildTeamExportTables(input) {
  const source = input || {}
  const days = Array.isArray(source.days) ? source.days : []
  const members = buildMonthExportMembers({
    people: source.people,
    statMembers: source.statMembers,
    monthDays: days,
    reportsByUnionId: source.reportsByUnionId
  })
  const header = ['昵称', '姓名', '角色', '打卡天数', ...days.map(day => String(day).substring(5))]
  const monthRows = [header]
  members.forEach(member => {
    const checkedSet = new Set(member.checkedDays || [])
    monthRows.push([
      member.nickname || '',
      member.name || '',
      member.isOwner ? '组长' : '组员',
      member.checkedCount || 0,
      ...days.map(day => (checkedSet.has(day) ? '✓' : ''))
    ])
  })
  const dailyMembers = Array.isArray(source.dailyMembers) ? source.dailyMembers : []
  const dailyRows = [['昵称', '姓名', '角色', '是否打卡', '反省']]
  dailyMembers.forEach(member => {
    dailyRows.push([
      member.nickname || '',
      member.name || '',
      member.isOwner ? '组长' : '组员',
      member.checkedIn ? '已打卡' : '未打卡',
      member.note || ''
    ])
  })
  return { members, monthRows, dailyRows }
}

function monthToken(date) {
  if (!date || date.length < 7) return ''
  return date.substring(0, 7) + '-'
}

// 团队月报导出。roster 必须是已通过成员；统计接口没返回的人仍保留，打卡天数为 0。
export async function collectTeamMonthExport(input) {
  const source = input || {}
  const groupId = source.groupId || ''
  const date = source.date || ''
  const roster = Array.isArray(source.roster) ? source.roster : []
  if (!groupId || !date) {
    return { ok: false, reason: '请选择团队和日期' }
  }
  let daily = {}
  try {
    daily = (typeof source.fetchDailyStatus === 'function'
      ? await source.fetchDailyStatus(groupId, date)
      : {}) || {}
  } catch (err) {
    if (!roster.length) return { ok: false, reason: '加载失败，请稍后重试' }
    daily = {}
  }
  if (daily.error === 'group_not_found' && !roster.length) {
    return { ok: false, reason: '未找到该团队' }
  }
  const board = await assembleTeamDailyBoard({
    roster,
    statusMembers: Array.isArray(daily.members) ? daily.members : [],
    fetchReport: source.fetchReport,
    fetchProfile: source.fetchProfile
  })
  let stats = {}
  try {
    stats = (typeof source.fetchMonthStats === 'function'
      ? await source.fetchMonthStats(groupId, monthToken(date))
      : {}) || {}
  } catch (err) {
    return { ok: false, reason: '月度统计加载失败，没有生成文件' }
  }
  if (stats.error === 'group_not_found') {
    return { ok: false, reason: '未找到该团队' }
  }
  const days = Array.isArray(stats.days) ? stats.days : []
  const statMembers = Array.isArray(stats.members) ? stats.members : []
  const people = board.members.length ? board.members : statMembers
  const reportsByUnionId = {}
  await Promise.all(people.map(async person => {
    const unionId = person && person.unionId
    if (!unionId || typeof source.fetchMonthReports !== 'function') return
    try {
      const list = await source.fetchMonthReports(unionId, monthToken(date))
      reportsByUnionId[unionId] = Array.isArray(list) ? list : []
    } catch (err) {
      reportsByUnionId[unionId] = []
    }
  }))
  const tables = buildTeamExportTables({
    people,
    statMembers,
    days,
    reportsByUnionId,
    dailyMembers: board.members
  })
  if (!tables.members.length) {
    return { ok: false, reason: '暂无成员数据可导出' }
  }
  const groupName = stats.groupName || source.groupName || groupId
  return {
    ok: true,
    groupName,
    monthRows: tables.monthRows,
    dailyRows: tables.dailyRows,
    fileName: groupName + '_' + monthToken(date).replace(/-/g, '') + '打卡统计.xlsx',
    sheetDate: date,
    memberCount: tables.members.length,
    zeroCount: tables.members.filter(member => !member.checkedCount).length
  }
}

const MAX_TEAM_RANGE_MONTHS = 36

export function currentMonthRange(now) {
  const clock = now instanceof Date ? now : new Date()
  const year = clock.getFullYear()
  const month = String(clock.getMonth() + 1).padStart(2, '0')
  const day = String(clock.getDate()).padStart(2, '0')
  return {
    startDate: year + '-' + month + '-01',
    endDate: year + '-' + month + '-' + day
  }
}

export function teamRangeKey(groupId, startDate, endDate) {
  return [groupId || '', startDate || '', endDate || ''].join('|')
}

function addIsoDays(iso, count) {
  const parts = iso.split('-').map(Number)
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + count))
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return date.getUTCFullYear() + '-' + month + '-' + day
}

function enumerateDates(startDate, endDate) {
  const days = []
  let cursor = startDate
  while (cursor <= endDate) {
    days.push(cursor)
    cursor = addIsoDays(cursor, 1)
  }
  return days
}

function enumerateMonths(startDate, endDate) {
  const months = []
  let year = Number(startDate.slice(0, 4))
  let month = Number(startDate.slice(5, 7))
  const endKey = endDate.slice(0, 7)
  while (months.length < MAX_TEAM_RANGE_MONTHS) {
    const key = year + '-' + String(month).padStart(2, '0')
    months.push(key + '-')
    if (key === endKey) return months
    month += 1
    if (month === 13) {
      month = 1
      year += 1
    }
  }
  return null
}

export function validateTeamRange(input) {
  const source = input || {}
  if (source.startDate == null || source.startDate === '' || source.endDate == null || source.endDate === '') {
    return { ok: false, reason: '请选择开始日期和结束日期' }
  }
  const startDate = parseExportDate(String(source.startDate))
  const endDate = parseExportDate(String(source.endDate))
  if (!startDate || !endDate) {
    return { ok: false, reason: '日期格式应为 YYYY-MM-DD，并且是真实存在的日期' }
  }
  if (startDate > endDate) {
    return { ok: false, reason: '开始日期不能晚于结束日期' }
  }
  const months = enumerateMonths(startDate, endDate)
  if (!months) {
    return { ok: false, reason: '日期范围超过 36 个月，没有生成文件' }
  }
  const rangeLabel = startDate === endDate
    ? startDate + '（当天，含这一天）'
    : startDate + ' 至 ' + endDate + '（含开始和结束两天）'
  return {
    ok: true,
    startDate,
    endDate,
    rangeLabel,
    days: enumerateDates(startDate, endDate),
    months
  }
}

function keepRosterPerson(person) {
  if (!person || typeof person !== 'object') return false
  if (person.isOwner === true) return true
  return classifyState(person.state) === STATE_JOINED
}

function readReportList(data) {
  if (data == null || data === '') return []
  if (Array.isArray(data)) return data
  if (typeof data === 'object') {
    if (data.truncated === true || data.complete === false) {
      throw new Error('打卡记录不完整，没有生成文件')
    }
    if (Array.isArray(data.list)) {
      if (data.total != null && Number(data.total) !== data.list.length) {
        throw new Error('打卡记录不完整，没有生成文件')
      }
      return data.list
    }
  }
  throw new Error('打卡记录不完整，没有生成文件')
}

function readMonthStats(data) {
  if (data == null || data === '') return {}
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('团队统计不完整，没有生成文件')
  }
  if (data.truncated === true || data.complete === false) {
    throw new Error('团队统计不完整，没有生成文件')
  }
  return data
}

function personAliases(person, profile) {
  const aliases = new Set()
  addAlias(aliases, person.unionId)
  ;(Array.isArray(person.aliases) ? person.aliases : []).forEach(alias => addAlias(aliases, alias))
  if (profile && typeof profile === 'object' && !Array.isArray(profile)) {
    addAlias(aliases, profile.id)
    addAlias(aliases, profile.unionid)
    addAlias(aliases, profile.unionId)
    addAlias(aliases, profile.openid)
    addAlias(aliases, profile.openId)
  }
  return aliases
}

function inRangeDay(value, startDate, endDate) {
  if (value == null || value === '') return ''
  const day = parseExportDate(String(value).slice(0, 10))
  if (!day || day < startDate || day > endDate) return ''
  return day
}

function dayHeaderLabels(days) {
  if (!days.length) return []
  const month = days[0].slice(0, 7)
  if (days.every(day => day.slice(0, 7) === month)) return days.map(day => day.slice(5))
  return days.slice()
}

function buildRangeTables(people, days) {
  const labels = dayHeaderLabels(days)
  const header = ['昵称', '姓名', '角色', '打卡天数', ...labels]
  const monthRows = [header]
  people.forEach(person => {
    const checkedSet = new Set(person.checkedDays || [])
    monthRows.push([
      person.nickname || '',
      person.name || '',
      person.isOwner ? '组长' : '组员',
      person.checkedCount || 0,
      ...days.map(day => (checkedSet.has(day) ? '✓' : ''))
    ])
  })
  const singleDay = days.length === 1
  const dailyRows = [singleDay
    ? ['昵称', '姓名', '角色', '是否打卡', '反省']
    : ['日期', '昵称', '姓名', '角色', '是否打卡', '反省']]
  days.forEach(day => {
    people.forEach(person => {
      const checked = (person.checkedDays || []).indexOf(day) >= 0
      const note = person.notes && person.notes[day] ? person.notes[day] : ''
      const base = [
        person.nickname || '',
        person.name || '',
        person.isOwner ? '组长' : '组员',
        checked ? '已打卡' : '未打卡',
        note
      ]
      dailyRows.push(singleDay ? base : [day].concat(base))
    })
  })
  const sameMonth = days.length > 0 && days.every(day => day.slice(0, 7) === days[0].slice(0, 7))
  return {
    monthRows,
    dailyRows,
    summarySheet: sameMonth ? '月度统计' : '打卡统计',
    dailySheet: singleDay ? days[0] : '每日明细'
  }
}

// 按闭区间统计团队打卡。按自然月调用现有整月接口，任一请求失败或结果被截断时不返回可导出的表。
export async function collectTeamRange(input) {
  const source = input || {}
  const groupId = source.groupId || ''
  if (!groupId) return { ok: false, reason: '请选择团队' }
  const checked = validateTeamRange(source)
  if (!checked.ok) return { ok: false, reason: checked.reason }
  const roster = (Array.isArray(source.roster) ? source.roster : []).filter(keepRosterPerson)
  const key = teamRangeKey(groupId, checked.startDate, checked.endDate)
  if (!roster.length) {
    return { ok: false, key, reason: '暂无已通过成员可统计' }
  }
  let statsList = []
  try {
    statsList = await Promise.all(checked.months.map(async month => {
      if (typeof source.fetchMonthStats !== 'function') return {}
      return readMonthStats(await source.fetchMonthStats(groupId, month))
    }))
  } catch (err) {
    return { ok: false, key, reason: err && err.message && err.message.indexOf('没有生成文件') >= 0
      ? err.message
      : '团队统计加载失败，没有生成文件' }
  }
  if (statsList.some(stats => stats && stats.error === 'group_not_found')) {
    return { ok: false, key, reason: '未找到该团队' }
  }
  const profiles = []
  try {
    for (let index = 0; index < roster.length; index += 1) {
      if (typeof source.fetchProfile !== 'function') {
        profiles.push(null)
      } else {
        profiles.push(await source.fetchProfile(roster[index]))
      }
    }
  } catch (err) {
    return { ok: false, key, reason: '成员身份加载失败，没有生成文件' }
  }
  const reportBuckets = []
  try {
    for (let index = 0; index < roster.length; index += 1) {
      const aliases = personAliases(roster[index], profiles[index])
      const reports = []
      if (typeof source.fetchMonthReports === 'function') {
        for (const alias of aliases) {
          for (const month of checked.months) {
            const list = readReportList(await source.fetchMonthReports(alias, month))
            list.forEach(report => {
              if (!report || typeof report !== 'object') return
              const owner = normalizeId(report.userId || report.unionId || report.unionid)
              if (owner && !aliases.has(owner)) return
              reports.push(report)
            })
          }
        }
      }
      reportBuckets.push({ aliases, reports })
    }
  } catch (err) {
    return { ok: false, key, reason: err && err.message && err.message.indexOf('没有生成文件') >= 0
      ? err.message
      : '打卡记录加载失败，没有生成文件' }
  }
  const people = roster.map((person, index) => {
    const profile = profiles[index]
    const bucket = reportBuckets[index]
    const daySet = new Set()
    const notes = {}
    statsList.forEach(stats => {
      const members = Array.isArray(stats.members) ? stats.members : []
      members.forEach(member => {
        if (!statMatches({ unionId: person.unionId, aliases: Array.from(bucket.aliases) }, member)) return
        ;(Array.isArray(member.checkedDays) ? member.checkedDays : []).forEach(day => {
          const parsed = inRangeDay(day, checked.startDate, checked.endDate)
          if (parsed) daySet.add(parsed)
        })
      })
    })
    bucket.reports.forEach(report => {
      const parsed = inRangeDay(report.date, checked.startDate, checked.endDate)
      if (!parsed) return
      daySet.add(parsed)
      if (report.note && !notes[parsed]) notes[parsed] = String(report.note)
    })
    const checkedDays = checked.days.filter(day => daySet.has(day))
    return {
      unionId: person.unionId || '',
      nickname: person.nickname || (profile && (profile.nickname || profile.name)) || '',
      name: person.name || (profile && profile.name) || '',
      isOwner: person.isOwner === true,
      checkedDays,
      checkedCount: checkedDays.length,
      notes
    }
  })
  const tables = buildRangeTables(people, checked.days)
  const groupName = (statsList.find(stats => stats && stats.groupName) || {}).groupName || source.groupName || groupId
  const checkinTotal = people.reduce((sum, person) => sum + person.checkedCount, 0)
  return {
    ok: true,
    key,
    groupId,
    groupName,
    startDate: checked.startDate,
    endDate: checked.endDate,
    rangeLabel: checked.rangeLabel,
    days: checked.days,
    members: people.map(person => ({
      unionId: person.unionId,
      nickname: person.nickname,
      name: person.name,
      isOwner: person.isOwner,
      checkedDays: person.checkedDays,
      checkedCount: person.checkedCount
    })),
    memberCount: people.length,
    checkedPeople: people.filter(person => person.checkedCount > 0).length,
    zeroCount: people.filter(person => person.checkedCount === 0).length,
    checkinTotal,
    monthRows: tables.monthRows,
    dailyRows: tables.dailyRows,
    summarySheet: tables.summarySheet,
    dailySheet: tables.dailySheet,
    fileName: groupName + '_' + checked.startDate.replace(/-/g, '') + '-' + checked.endDate.replace(/-/g, '') + '打卡统计.xlsx'
  }
}
