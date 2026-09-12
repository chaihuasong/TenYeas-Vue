<template>
  <div class="checkin-container">
    <!-- 顶部头图区域 -->
    <div class="header-section">
      <div class="header-bg"></div>
      <div class="header-content">
        <el-avatar :size="56" :src="displayAvatar" class="user-avatar">
          <i class="el-icon-user-solid"></i>
        </el-avatar>
        <div class="header-info">
          <div class="header-title">打卡圈</div>
          <div class="header-subtitle">{{ nickname || '匿名用户' }}</div>
        </div>
      </div>
      <!-- 日期筛选 -->
      <div class="header-actions">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          format="MM-dd"
          value-format="yyyy-MM-dd"
          placeholder="选日期"
          :clearable="false"
          :editable="false"
          @change="onDateChange"
          size="small"
          class="date-picker">
        </el-date-picker>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-bar">
      <div class="stat-item">
        <div class="stat-value">{{ todayCount }}</div>
        <div class="stat-label">今日打卡</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="stat-value">{{ publicCount }}</div>
        <div class="stat-label">公开分享</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="stat-value">{{ selectedDate.substring(5) }}</div>
        <div class="stat-label">当前日期</div>
      </div>
    </div>

    <!-- 内容列表 -->
    <div class="content-section">
      <div v-if="loading" class="loading-state">
        <i class="el-icon-loading"></i>
        <span>加载中...</span>
      </div>

      <div v-else-if="filteredData.length > 0" class="checkin-list">
        <template v-for="group in groupedData">
        <div v-if="showDayDivider" :key="'day-' + group.date" class="day-divider">
          <span class="day-label">{{ formatDayLabel(group.date) }}</span>
          <span class="day-count">{{ group.items.length }} 条</span>
        </div>
        <div v-for="item in group.items" :key="item.id" :id="'checkin-card-' + item.id"
             class="checkin-card"
             :class="{ 'checkin-card-highlight': item.id === highlightReportId }">
          <div class="checkin-header">
            <el-avatar :size="44" :src="item.headimgurl" class="checkin-avatar">
              <i class="el-icon-user-solid"></i>
            </el-avatar>
            <div class="checkin-user-info">
              <div class="checkin-nickname">{{ item.nickname || '匿名用户' }}</div>
              <div class="checkin-meta">
                <span class="checkin-time">
                  <i class="el-icon-time"></i> {{ formatTime(item.date) }}
                </span>
                <span v-if="item.province" class="checkin-location">
                  <i class="el-icon-location-outline"></i> {{ item.province }}
                </span>
              </div>
            </div>
          </div>

          <!-- 反省总结/心得体会（如果有） -->
          <div v-if="item.state" class="checkin-summary">
            <div class="summary-text">{{ item.state === '1' ? '精气神得到长养，朝着目标' : '精气神没有长养，偏离目标' }}{{ item.note ? '：' + item.note : '' }}</div>
          </div>

          <div class="checkin-content">
            <div class="checkin-items">
              <template v-for="i in 15">
                <div v-if="item['value' + i] && item['value' + i] !== '0'" :key="i" class="checkin-item">
                  <i class="el-icon-check"></i>
                  <span v-html="formatCheckinItem(item['template' + i], item['value' + i])"></span>
                </div>
              </template>
            </div>
          </div>

          <!-- 互动区域 -->
          <div class="interaction-section">
            <!-- 点赞和评论按钮 -->
            <div class="action-bar">
              <span class="action-btn" @click="toggleLike(item.id)">
                <i :class="isLiked(item.id) ? 'heart-icon liked' : 'heart-icon'"></i>
                <span>{{ getLikeCount(item.id) || '点赞' }}</span>
              </span>
              <span class="action-btn" @click="toggleCommentInput(item.id)">
                <i class="el-icon-chat-dot-round"></i>
                <span>{{ getCommentCount(item.id) || '评论' }}</span>
              </span>
            </div>

            <!-- 点赞用户列表 -->
            <div v-if="getLikeUsers(item.id)" class="like-users">
              <i class="heart-icon liked"></i>
              <span>{{ getLikeUsers(item.id) }}</span>
            </div>

            <!-- 评论列表 -->
            <div v-if="getComments(item.id).length > 0" class="comment-list">
              <div v-for="comment in getComments(item.id)" :key="comment.id"
                   :id="'checkin-comment-' + comment.id"
                   class="comment-item"
                   :class="{ 'comment-item-highlight': comment.id === highlightCommentId }">
                <span class="comment-author">{{ comment.nickname }}</span>
                <span v-if="comment.replyToNickname" class="comment-reply">
                  回复 <span class="reply-to">{{ comment.replyToNickname }}</span>
                </span>
                <span>：{{ comment.content }}</span>
                <span class="comment-actions">
                  <span v-if="comment.userId === unionid" class="delete-btn" @click="deleteComment(item.id, comment.id)">删除</span>
                  <span class="reply-btn" @click="startReply(item.id, comment)">回复</span>
                </span>
              </div>
            </div>

            <!-- 评论输入框 -->
            <div v-if="showComments[item.id]" class="comment-input">
              <el-input
                v-model="commentInputs[item.id]"
                :placeholder="getCommentPlaceholder(item.id)"
                size="small"
                @keyup.enter.native="submitComment(item.id)"
              >
                <el-button slot="append" size="small" @click="submitComment(item.id)">发送</el-button>
              </el-input>
              <span v-if="replyingTo && replyingTo.reportId === item.id" class="cancel-reply" @click="cancelReply">
                取消回复
              </span>
            </div>
          </div>
        </div>
        </template>
      </div>

      <div v-else class="empty-state">
        <el-image :src="require('../assets/img/empty.png')" class="empty-img"/>
        <div class="empty-text">{{ selectedDate === today ? '今天还没有人打卡' : '这一天没有打卡记录' }}</div>
        <div class="empty-hint">{{ hasMore ? '点下面的「加载更多」，往前看看之前几天' : '快去打卡成为今天第一个吧' }}</div>
        <el-button type="primary" round @click="$router.push('/tenyearsHome')">
          <i class="el-icon-edit"></i> 去打卡
        </el-button>
      </div>
    </div>

    <!-- 加载更多：按天往前翻，每点一次往前找一天有打卡的记录 -->
    <div v-if="!loading && hasMore" class="load-more">
      <el-button type="text" @click="loadMore" :loading="loadingMore">
        {{ loadingMore ? '加载中...' : '加载更多（看前一天）' }}
      </el-button>
    </div>
    <div v-else-if="!loading && filteredData.length > 0" class="list-end">— 已经到底啦 —</div>

    <!-- 底部间距 -->
    <div style="height: 80px;"></div>
  </div>
</template>

<script>
import axios from 'axios'
import global from '@/components/Common'

// 打卡圈按天翻页：点一次「加载更多」最多往前探这么多天，
// 中间没人打卡的空白日直接跳过，免得点了一下页面毫无变化。
const MAX_DAYS_PER_LOAD = 7
// 十年持志从 2021 年开始，再往前没有数据，翻到这里就收尾
const EARLIEST_DATE = '2021-01-01'
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

// 后端有时给的是 2021-1-5 这种没补零的日期，补齐后才能按字符串比较和分组
function normalizeDate(dateStr) {
  if (!dateStr) return ''
  const parts = String(dateStr).trim().split('-')
  if (parts.length !== 3) return String(dateStr).trim()
  return `${parts[0]}-${String(parts[1]).padStart(2, '0')}-${String(parts[2]).padStart(2, '0')}`
}

// 取本地今天：toISOString 是 UTC，东八区早上 8 点前会算成昨天
function localToday() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export default {
  name: 'CheckinCircle',
  data() {
    const today = localToday()
    return {
      serverUrl: global.httpUrl,
      unionid: '',
      nickname: '',
      headimgurl: '',
      avatarUrl: '',
      datas: [],
      loading: true,
      loadingMore: false,
      selectedDate: today,
      today: today,
      // 已加载的最早一天，「加载更多」从这天继续往前翻
      earliestDate: today,
      // 每次换日期自增，切日期时把在途请求的返回作废，避免串日期
      loadToken: 0,
      hasMore: true,
      todayCount: 0,
      publicCount: 0,
      // 互动相关
      interactions: {},      // { reportId: { likes, comments, likeCount, commentCount, liked } }
      commentInputs: {},     // { reportId: '输入的评论内容' }
      replyingTo: null,      // { reportId, commentId, userId, nickname }
      showComments: {},      // { reportId: true/false }
      // 从 App 互动通知跳进来时要定位的目标，定位一次后清空
      targetReportId: '',
      targetCommentId: '',
      highlightReportId: '',
      highlightCommentId: ''
    }
  },
  computed: {
    filteredData() {
      // 只显示公开用户的打卡
      return this.datas.filter(item => item.open === '1')
    },
    // 按天分组，日期新的在上，便于「加载更多」翻出来的前几天看得出分界
    groupedData() {
      const groups = []
      const byDate = {}
      this.filteredData.forEach(item => {
        const date = item.date || this.selectedDate
        if (!byDate[date]) {
          byDate[date] = { date, items: [] }
          groups.push(byDate[date])
        }
        byDate[date].items.push(item)
      })
      return groups.sort((a, b) => (a.date < b.date ? 1 : -1))
    },
    // 只翻了选中那一天时，日期已经写在顶部统计里，不再重复一条分界
    showDayDivider() {
      return this.earliestDate !== this.selectedDate
    },
    displayAvatar() {
      // 优先使用上传的头像，其次使用微信头像
      return this.avatarUrl || this.headimgurl || ''
    }
  },
  mounted() {
    document.title = this.$route.meta.title
    // App 的互动通知会带上 date/reportId/commentId 跳进来，先把日期切过去再拉数据
    const query = this.$route.query || {}
    const queryDate = normalizeDate(query.date)
    if (DATE_PATTERN.test(queryDate)) {
      this.selectedDate = queryDate
    }
    this.targetReportId = query.reportId || ''
    this.targetCommentId = query.commentId || ''
    this.getUserInfo()
    this.getData()

    // 防止移动端日期选择器弹出键盘
    this.$nextTick(() => {
      const dateInput = document.querySelector('.date-picker .el-input__inner')
      if (dateInput) {
        dateInput.setAttribute('readonly', 'readonly')
      }
    })
  },
  methods: {
    formatTime(dateStr) {
      if (!dateStr) return ''
      return dateStr.substring(5) // 显示 MM-dd
    },

    formatCheckinItem(template, value) {
      if (!template) return ''
      // 将数字用特殊样式包裹，前后加空格
      return template.replace('_', `<span class="checkin-value"> ${value} </span>`)
    },

    async getUserInfo() {
      this.unionid = this.$store.getters.getUnionid
      if (this.unionid) {
        this.unionid = this.unionid.replace(/"/g, '')
      }

      try {
        const res = await axios.get(`${this.serverUrl}getById?id=${this.unionid}`)
        if (res.data) {
          this.nickname = res.data.nickname || ''
          this.headimgurl = res.data.headimgurl || ''
          this.avatarUrl = res.data.avatarUrl || ''
        }
      } catch (err) {
        console.error('获取用户信息失败', err)
      }
    },

    // 拉某一天的打卡，并把用户、模板、互动数据一并补齐
    async loadDay(date) {
      const res = await axios.get(`${this.serverUrl}getReportInfoByDate?date=${date}`)
      const reports = res.data || []
      if (reports.length === 0) return []

      // 获取所有用户信息和模板信息
      const userIds = [...new Set(reports.map(r => r.userId))]
      const templateIds = [...new Set(reports.map(r => r.templateId).filter(id => id))]
      const [userMap, templateMap] = await Promise.all([
        this.fetchUserInfos(userIds),
        this.fetchTemplates(templateIds)
      ])

      // 合并用户信息和模板信息
      const items = reports.map(report => {
        const templates = templateMap[report.templateId] || []
        const templateData = {}
        templates.forEach((t, i) => {
          templateData['template' + (i + 1)] = t
        })
        return {
          ...report,
          ...userMap[report.userId],
          ...templateData,
          // 分组按日期走，后端个别记录缺 date 时兜底成查询的那天
          date: normalizeDate(report.date) || date
        }
      })

      // 获取互动数据
      const reportIds = reports.map(r => r.id).filter(id => id)
      if (reportIds.length > 0) {
        await this.fetchInteractions(reportIds)
      }

      return items
    },

    async getData() {
      const token = ++this.loadToken
      this.loading = true
      this.loadingMore = false
      this.datas = []
      this.earliestDate = this.selectedDate
      this.hasMore = this.selectedDate > EARLIEST_DATE

      try {
        const items = await this.loadDay(this.selectedDate)
        // 请求返回前用户又换了日期，这批数据已经不属于当前视图
        if (token !== this.loadToken) return
        this.datas = items

        // 统计只反映选中的那天，「加载更多」翻出来的前几天各自有分组标题
        this.todayCount = items.length
        this.publicCount = items.filter(d => d.open === '1').length

        // 评论要等互动数据回来才渲染得出，定位排在这后面
        this.locateTarget()

      } catch (err) {
        if (token !== this.loadToken) return
        console.error('获取数据失败', err)
        this.$message.error('加载失败，请重试')
      } finally {
        if (token === this.loadToken) this.loading = false
      }
    },

    async fetchUserInfos(userIds) {
      const userMap = {}
      if (userIds.length === 0) return userMap

      try {
        // 批量获取用户信息
        const promises = userIds.map(id =>
          axios.get(`${this.serverUrl}getById?id=${id}`)
            .then(res => ({ id, data: res.data }))
            .catch(() => ({ id, data: null }))
        )

        const results = await Promise.all(promises)

        results.forEach(({ id, data }) => {
          if (data) {
            userMap[id] = {
              nickname: data.nickname,
              headimgurl: data.avatarUrl || data.headimgurl,
              province: data.province,
              open: data.open,
              info: data.info
            }
          }
        })
      } catch (err) {
        console.error('获取用户信息失败', err)
      }

      return userMap
    },

    async fetchTemplates(templateIds) {
      const templateMap = {}
      if (templateIds.length === 0) return templateMap

      try {
        // 批量获取模板信息
        const promises = templateIds.map(id =>
          axios.get(`${this.serverUrl}getReportTemplateById?id=${id}`)
            .then(res => ({ id, data: res.data }))
            .catch(() => ({ id, data: null }))
        )

        const results = await Promise.all(promises)

        results.forEach(({ id, data }) => {
          if (data && Array.isArray(data)) {
            templateMap[id] = data
          }
        })
      } catch (err) {
        console.error('获取模板信息失败', err)
      }

      return templateMap
    },

    onDateChange() {
      this.getData()
    },

    // 往前推一天，入参和返回都是 yyyy-MM-dd
    previousDate(date) {
      const [year, month, day] = date.split('-').map(Number)
      // 用 UTC 构造，避开本地时区把日期算差一天
      const d = new Date(Date.UTC(year, month - 1, day - 1))
      return d.toISOString().split('T')[0]
    },

    formatDayLabel(date) {
      const suffix = date === this.today
        ? ' 今天'
        : (date === this.previousDate(this.today) ? ' 昨天' : '')
      const [, month, day] = date.split('-')
      return `${Number(month)}月${Number(day)}日${suffix}`
    },

    // 按天往前翻：一次最多探 MAX_DAYS_PER_LOAD 天，跳过没有公开打卡的空白日
    async loadMore() {
      if (this.loadingMore || !this.hasMore) return

      const token = this.loadToken
      this.loadingMore = true
      try {
        let date = this.earliestDate
        let appended = 0

        for (let i = 0; i < MAX_DAYS_PER_LOAD && appended === 0; i++) {
          date = this.previousDate(date)
          const items = await this.loadDay(date)
          // 翻的过程中用户换了日期，剩下的结果全部丢弃，别混进新那天的列表
          if (token !== this.loadToken) return
          this.earliestDate = date
          if (items.length > 0) {
            this.datas = this.datas.concat(items)
            appended = items.filter(item => item.open === '1').length
          }
          if (date <= EARLIEST_DATE) {
            this.hasMore = false
            break
          }
        }

        if (appended === 0 && this.hasMore) {
          this.$message(`${this.formatDayLabel(this.earliestDate)}之后这几天没有公开打卡，再点一次继续往前看`)
        }
      } catch (err) {
        if (token !== this.loadToken) return
        console.error('加载更多失败', err)
        this.$message.error('加载失败，请重试')
      } finally {
        if (token === this.loadToken) this.loadingMore = false
      }
    },

    // ============ 互动相关方法 ============

    // 获取互动数据
    async fetchInteractions(reportIds) {
      if (!reportIds || reportIds.length === 0) return

      try {
        const url = `${this.serverUrl}getInteractions?reportIds=${reportIds.join(',')}&userId=${this.unionid || ''}`
        const res = await axios.get(url)
        this.interactions = { ...this.interactions, ...res.data }
      } catch (err) {
        console.error('获取互动数据失败', err)
      }
    },

    // 点赞/取消点赞
    async toggleLike(reportId) {
      if (!this.unionid) {
        this.$message.warning('请先登录')
        return
      }

      try {
        await axios.post(`${this.serverUrl}toggleLike`, null, {
          params: {
            reportId,
            userId: this.unionid,
            nickname: this.nickname,
            headimgurl: this.displayAvatar
          }
        })

        // 重新获取该条记录的互动数据
        await this.fetchInteractions([reportId])
      } catch (err) {
        console.error('点赞失败', err)
        this.$message.error('操作失败，请重试')
      }
    },

    /**
     * 从 App 互动通知跳进来时，滚到那条打卡并高亮，有 commentId 时把评论也高亮出来。
     * 只认第一次加载，之后用户自己翻日期不再抢滚动位置。
     */
    locateTarget() {
      const reportId = this.targetReportId
      if (!reportId) {
        return
      }
      const commentId = this.targetCommentId
      this.targetReportId = ''
      this.targetCommentId = ''

      // 打卡可能已被删除，或者作者把它改成了不公开
      if (!this.filteredData.some(item => item.id === reportId)) {
        this.$message.warning('这条打卡已删除或未公开')
        return
      }

      this.$set(this.showComments, reportId, true)
      this.highlightReportId = reportId
      this.highlightCommentId = commentId || ''

      this.$nextTick(() => {
        // 回复类通知直接落到那条评论上，其余落到打卡卡片
        const el = (commentId && document.getElementById('checkin-comment-' + commentId))
          || document.getElementById('checkin-card-' + reportId)
        if (el && el.scrollIntoView) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      })

      setTimeout(() => {
        if (this.highlightReportId === reportId) {
          this.highlightReportId = ''
          this.highlightCommentId = ''
        }
      }, 3000)
    },

    // 切换评论输入框显示
    toggleCommentInput(reportId) {
      this.$set(this.showComments, reportId, !this.showComments[reportId])
      if (!this.showComments[reportId]) {
        this.replyingTo = null
      }
    },

    // 提交评论
    async submitComment(reportId) {
      const content = this.commentInputs[reportId]
      if (!content || !content.trim()) {
        this.$message.warning('请输入评论内容')
        return
      }

      if (!this.unionid) {
        this.$message.warning('请先登录')
        return
      }

      try {
        const comment = {
          reportId,
          userId: this.unionid,
          nickname: this.nickname,
          headimgurl: this.displayAvatar,
          content: content.trim(),
          parentId: (this.replyingTo && this.replyingTo.commentId) || null,
          replyToUserId: (this.replyingTo && this.replyingTo.userId) || null,
          replyToNickname: (this.replyingTo && this.replyingTo.nickname) || null
        }

        await axios.post(`${this.serverUrl}addComment`, comment)

        // 清空输入和回复状态
        this.$set(this.commentInputs, reportId, '')
        this.replyingTo = null

        // 刷新互动数据
        await this.fetchInteractions([reportId])

        this.$message.success('评论成功')
      } catch (err) {
        console.error('评论失败', err)
        this.$message.error('评论失败，请重试')
      }
    },

    // 删除评论
    async deleteComment(reportId, commentId) {
      try {
        await this.$confirm('确定删除这条评论吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await axios.delete(`${this.serverUrl}deleteComment`, {
          params: { commentId, userId: this.unionid }
        })

        // 刷新互动数据
        await this.fetchInteractions([reportId])

        this.$message.success('删除成功')
      } catch (err) {
        if (err !== 'cancel') {
          console.error('删除评论失败', err)
          this.$message.error('删除失败，请重试')
        }
      }
    },

    // 开始回复
    startReply(reportId, comment) {
      this.replyingTo = {
        reportId,
        commentId: comment.id,
        userId: comment.userId,
        nickname: comment.nickname
      }
      this.$set(this.showComments, reportId, true)
    },

    // 取消回复
    cancelReply() {
      this.replyingTo = null
    },

    // 获取评论占位符
    getCommentPlaceholder(reportId) {
      if (this.replyingTo && this.replyingTo.reportId === reportId) {
        return `回复 ${this.replyingTo.nickname}：`
      }
      return '写评论...'
    },

    // 辅助方法：判断是否已点赞
    isLiked(reportId) {
      const interaction = this.interactions[reportId]
      return (interaction && interaction.liked) || false
    },

    // 辅助方法：获取点赞数
    getLikeCount(reportId) {
      const interaction = this.interactions[reportId]
      return (interaction && interaction.likeCount) || 0
    },

    // 辅助方法：获取点赞用户名列表
    getLikeUsers(reportId) {
      const interaction = this.interactions[reportId]
      const likes = (interaction && interaction.likes) || []
      if (!likes || likes.length === 0) {
        return ''
      }
      return likes.map(l => l.nickname || '匿名用户').join('、')
    },

    // 辅助方法：获取评论列表
    getComments(reportId) {
      const interaction = this.interactions[reportId]
      return (interaction && interaction.comments) || []
    },

    // 辅助方法：获取评论数
    getCommentCount(reportId) {
      const interaction = this.interactions[reportId]
      return (interaction && interaction.commentCount) || 0
    }
  }
}
</script>

<style scoped>
.checkin-container {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 顶部头图 */
.header-section {
  position: relative;
  height: 160px;
}

.header-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.header-content {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  align-items: center;
}

.user-avatar {
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.header-info {
  color: white;
  margin-left: 15px;
}

.header-title {
  font-size: 22px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 3px;
}

.header-actions {
  position: absolute;
  top: 15px;
  right: 15px;
}

.date-picker {
  width: 100px !important;
}

/deep/ .date-picker .el-input__inner {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  /* 防止光标显示 */
  caret-color: transparent;
  /* 防止文本选择 */
  user-select: none;
  -webkit-user-select: none;
}

/deep/ .date-picker .el-input__inner:focus {
  outline: none;
}

/* 统计栏 */
.stats-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: white;
  margin: -10px 15px 15px;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: #e4e7ed;
}

/* 内容区域 */
.content-section {
  padding: 0 15px;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 60px 0;
  color: #909399;
}

.loading-state i {
  font-size: 24px;
  margin-bottom: 10px;
  display: block;
}

/* 打卡列表 */
.checkin-list {
  display: flex;
  flex-direction: column;
}

/* 按天分组的分界线 */
.day-divider {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px 10px;
}

.day-label {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.day-count {
  font-size: 12px;
  color: #c0c4cc;
}

/* 打卡卡片 */
.checkin-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 15px;
  transition: box-shadow 0.4s ease, background-color 0.4s ease;
}

/* 从 App 互动通知跳进来时，短暂高亮目标打卡 */
.checkin-card-highlight {
  box-shadow: 0 0 0 2px #e6a23c, 0 2px 12px rgba(230, 162, 60, 0.35);
}

.comment-item-highlight {
  background: #fdf6ec;
  border-radius: 4px;
  box-shadow: 0 0 0 2px #f5dab1;
}

.checkin-header {
  display: flex;
  align-items: center;
  padding: 12px 15px 8px;
}

.checkin-avatar {
  flex-shrink: 0;
  margin-right: 12px;
}

.checkin-user-info {
  flex: 1;
}

.checkin-nickname {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  text-align: left;
}

.checkin-meta {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.checkin-meta span {
  display: inline-flex;
  align-items: center;
  margin-right: 12px;
}

.checkin-meta i {
  margin-right: 3px;
}

/* 打卡内容 */
.checkin-content {
  padding: 0 15px 5px;
}

.checkin-items {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 8px 17px;
  text-align: left;
}

.checkin-item {
  display: flex;
  align-items: flex-start;
  padding: 5px 0 5px 2px;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  text-align: left;
}

.checkin-item i {
  color: #67c23a;
  margin-top: 3px;
  margin-right: 8px;
  flex-shrink: 0;
}

.checkin-item span {
  flex: 1;
  text-align: left;
}

.checkin-value {
  color: #409eff;
  font-weight: 600;
  background: #ecf5ff;
  padding: 1px 6px;
  border-radius: 4px;
  margin: 0 2px;
}

/* 反省总结 */
.checkin-summary {
  padding: 3px 15px 6px;
  background: #ffffff;
}

.summary-text {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
  text-align: left;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-img {
  width: 150px;
  height: 150px;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 16px;
  color: #606266;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: #909399;
  margin-bottom: 20px;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 20px;
}

.list-end {
  text-align: center;
  padding: 20px;
  font-size: 13px;
  color: #c0c4cc;
}

/* 互动区域 */
.interaction-section {
  padding: 0 15px 5px;
  background: #ffffff;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 6px;
}

.action-btn {
  display: flex;
  align-items: center;
  color: #909399;
  cursor: pointer;
  font-size: 13px;
  transition: color 0.2s;
  margin-left: 20px;
}

.action-btn i {
  margin-right: 4px;
  font-size: 15px;
}

.action-btn:hover {
  color: #409eff;
}

/* 心形图标 */
.heart-icon {
  display: inline-block;
  font-style: normal;
  font-size: 15px;
  margin-right: 4px;
}

.heart-icon::before {
  content: '♡';
  color: #909399;
  transition: all 0.2s;
}

.heart-icon.liked::before {
  content: '♥';
  color: #f56c6c;
  animation: heartBeat 0.3s ease-in-out;
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.3);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.like-users {
  background: #f5f7fa;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
  text-align: left;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 8px;
}

.like-users .heart-icon::before {
  font-size: 15px;
}

.like-users span {
  flex: 1;
  text-align: left;
}

.comment-list {
  background: #f5f7fa;
  padding: 8px 10px;
  border-radius: 4px;
  margin-bottom: 8px;
  margin-top: 4px;
}

.comment-item {
  font-size: 13px;
  line-height: 1.8;
  color: #606266;
  text-align: left;
}

.comment-author {
  color: #409eff;
  font-weight: 500;
}

.comment-reply {
  color: #909399;
}

.reply-to {
  color: #409eff;
}

.comment-actions {
  float: right;
}

.delete-btn, .reply-btn {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
  cursor: pointer;
  transition: color 0.2s;
}

.delete-btn:hover {
  color: #f56c6c;
}

.reply-btn:hover {
  color: #409eff;
}

.comment-input {
  margin-top: 8px;
  position: relative;
}

.cancel-reply {
  position: absolute;
  right: 70px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #909399;
  cursor: pointer;
}

.cancel-reply:hover {
  color: #f56c6c;
}

/* 通用 */
img {
  pointer-events: none;
}

* {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

input, textarea {
  -webkit-user-select: auto;
  outline: none;
}
</style>
