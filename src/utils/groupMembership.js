// 团队成员归并。创建、申请、审核和「我加入的」共用同一套状态，
// 兼容 findJoinGroups / findAllJoinGroups 现有的二维数组，也兼容扁平记录和按组 ID 分组的对象。

export const STATE_PENDING = 0
export const STATE_JOINED = 1
export const STATE_REJECTED = 2

export function classifyState(value) {
  if (value === undefined || value === null || value === '') return STATE_JOINED
  const n = Number(value)
  if (n === STATE_PENDING || n === STATE_JOINED || n === STATE_REJECTED) return n
  return STATE_JOINED
}

export function sameUser(left, right) {
  if (left == null || right == null) return false
  return String(left).replace(/"/g, '') === String(right).replace(/"/g, '')
}

function decorateMember(member, fallbackGroupId) {
  const groupId = member.groupId || member.groupid || fallbackGroupId || ''
  return Object.assign({}, member, { groupId })
}

function pushMember(map, member, fallbackGroupId) {
  if (!member || typeof member !== 'object' || Array.isArray(member)) return
  const groupId = member.groupId || member.groupid || fallbackGroupId
  if (!groupId) return
  if (!map[groupId]) map[groupId] = []
  map[groupId].push(decorateMember(member, groupId))
}

// findJoinGroups 是二维数组，顺序不稳定，每条记录自带 groupId。只按 groupId 归组，不按下标猜测。
export function indexOwnedMembers(ownedGroups, ownedMemberRows) {
  void ownedGroups
  const map = {}
  if (Array.isArray(ownedMemberRows)) {
    ownedMemberRows.forEach(entry => {
      const list = Array.isArray(entry) ? entry : [entry]
      list.forEach(member => pushMember(map, member, ''))
    })
    return map
  }
  if (ownedMemberRows && typeof ownedMemberRows === 'object') {
    Object.keys(ownedMemberRows).forEach(key => {
      const entry = ownedMemberRows[key]
      const list = Array.isArray(entry) ? entry : [entry]
      list.forEach(member => pushMember(map, member, key))
    })
  }
  return map
}

function joinedRowGroups(raw) {
  if (raw == null || raw === '') return []
  if (Array.isArray(raw)) {
    if (raw.length === 0) return []
    const nested = raw.some(item => Array.isArray(item))
    if (!nested) {
      const map = new Map()
      raw.forEach(member => {
        if (!member || typeof member !== 'object' || Array.isArray(member)) return
        const groupId = member.groupId || member.groupid
        if (!groupId) return
        if (!map.has(groupId)) map.set(groupId, [])
        map.get(groupId).push(decorateMember(member, groupId))
      })
      return Array.from(map.values())
    }
    return raw.map(entry => {
      if (Array.isArray(entry)) {
        return entry
          .filter(member => member && typeof member === 'object')
          .map(member => decorateMember(member, member.groupId || member.groupid))
      }
      if (entry && typeof entry === 'object') {
        const groupId = entry.groupId || entry.groupid
        if (!groupId) return []
        return [decorateMember(entry, groupId)]
      }
      return []
    }).filter(rows => rows.length > 0)
  }
  if (typeof raw === 'object') {
    return Object.keys(raw).map(key => {
      const entry = raw[key]
      const list = Array.isArray(entry) ? entry : [entry]
      return list
        .filter(member => member && typeof member === 'object' && !Array.isArray(member))
        .map(member => decorateMember(member, member.groupId || member.groupid || key))
    }).filter(rows => rows.length > 0)
  }
  return []
}

function summarizeJoined(rows, unionId) {
  const first = rows.find(row => row && (row.groupId || row.groupName)) || rows[0] || {}
  const mine = rows.find(row => sameUser(row.unionId || row.unionid, unionId))
  const state = mine ? classifyState(mine.state) : STATE_JOINED
  return {
    groupId: first.groupId || '',
    groupName: first.groupName || first.groupname || '',
    ownerName: first.ownerName || first.ownerNickName || '',
    members: rows.filter(row => classifyState(row.state) === STATE_JOINED),
    myRecordId: mine && mine.id != null ? mine.id : null,
    state
  }
}

function bucketJoined(raw, unionId) {
  const joined = []
  const pending = []
  const rejected = []
  joinedRowGroups(raw).forEach(rows => {
    const group = summarizeJoined(rows, unionId)
    if (group.state === STATE_PENDING) pending.push(group)
    else if (group.state === STATE_REJECTED) rejected.push(group)
    else joined.push(group)
  })
  return { joined, pending, rejected }
}

export function buildGroupView(input) {
  const source = input || {}
  const ownedRaw = Array.isArray(source.ownedGroups) ? source.ownedGroups : []
  const ownedReports = source.ownedReports || {}
  const joinedReports = source.joinedReports || {}
  const memberMap = indexOwnedMembers(ownedRaw, source.ownedMemberRows)
  const owned = ownedRaw.map(group => {
    const groupId = group && group.groupId
    const all = (groupId && memberMap[groupId]) || []
    return Object.assign({}, group, {
      members: all.filter(member => classifyState(member.state) === STATE_JOINED),
      pending: all.filter(member => classifyState(member.state) === STATE_PENDING),
      rejected: all.filter(member => classifyState(member.state) === STATE_REJECTED),
      reports: ownedReports[groupId] || []
    })
  })
  const ownedIds = new Set(owned.map(group => group.groupId).filter(Boolean))
  const buckets = bucketJoined(source.joinedRaw, source.unionId)
  const attachReports = group => Object.assign({}, group, {
    reports: joinedReports[group.groupId] || []
  })
  const notOwned = group => group.groupId && !ownedIds.has(group.groupId)
  return {
    owned,
    joined: buckets.joined.filter(notOwned).map(attachReports),
    pendingApplications: buckets.pending.filter(notOwned).map(attachReports),
    rejectedApplications: buckets.rejected.filter(notOwned).map(attachReports),
    pendingCount: owned.reduce((sum, group) => sum + group.pending.length, 0)
  }
}

export function visibleTeamSummaries(input) {
  const view = buildGroupView(input)
  return view.owned
    .filter(group => group.groupId)
    .map(group => ({
      groupId: group.groupId,
      groupName: group.groupName || '',
      isOwner: true
    }))
    .concat(view.joined.filter(group => group.groupId).map(group => ({
      groupId: group.groupId,
      groupName: group.groupName || '',
      isOwner: false
    })))
}

export function withCacheBust(url, nowMs) {
  const stamp = nowMs == null ? Date.now() : nowMs
  const joiner = url.indexOf('?') >= 0 ? '&' : '?'
  return url + joiner + '_t=' + stamp
}

// joinGroup 约定返回 0-5。空响应不能当成 0，否则会把失败显示成申请成功。
export function parseJoinResult(data) {
  if (data === 0 || data === '0') return 0
  if (typeof data === 'number' && data >= 1 && data <= 5) return data
  if (typeof data === 'string' && /^[1-5]$/.test(data.trim())) return Number(data.trim())
  return null
}

// agreeGroup / rejectGroup 在 HTTP 200 时仍可能用正文 error! 表示失败。
export function readReviewResult(data) {
  if (data == null) return { ok: false, message: '服务器没有返回审核结果' }
  const text = typeof data === 'string' ? data.trim() : ''
  if (text === 'error!' || text === 'error') return { ok: false, message: '审核没有成功' }
  if (data && typeof data === 'object' && data.success === false) {
    return { ok: false, message: data.message || '审核没有成功' }
  }
  return { ok: true, message: '' }
}
