<template>
  <div class="checkin-container">
    <!-- 顶部头图区域 -->
    <div class="header-section">
      <div class="header-bg"></div>
      <div class="header-content">
        <el-avatar :size="56" :src="headimgurl" class="user-avatar">
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
        <div v-for="item in filteredData" :key="item.id" class="checkin-card">
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
        </div>
      </div>

      <div v-else class="empty-state">
        <el-image :src="require('../assets/img/empty.png')" class="empty-img"/>
        <div class="empty-text">{{ selectedDate === today ? '今天还没有人打卡' : '这一天没有打卡记录' }}</div>
        <div class="empty-hint">快去打卡成为今天第一个吧</div>
        <el-button type="primary" round @click="$router.push('/tenyearsHome')">
          <i class="el-icon-edit"></i> 去打卡
        </el-button>
      </div>
    </div>

    <!-- 加载更多 -->
    <div v-if="!loading && filteredData.length > 0 && hasMore" class="load-more">
      <el-button type="text" @click="loadMore" :loading="loadingMore">
        {{ loadingMore ? '加载中...' : '加载更多' }}
      </el-button>
    </div>

    <!-- 底部间距 -->
    <div style="height: 80px;"></div>
  </div>
</template>

<script>
import axios from 'axios'
import global from '@/components/Common'

export default {
  name: 'CheckinCircle',
  data() {
    const today = new Date().toISOString().split('T')[0]
    return {
      serverUrl: global.httpUrl,
      unionid: '',
      nickname: '',
      headimgurl: '',
      datas: [],
      loading: true,
      loadingMore: false,
      selectedDate: today,
      today: today,
      page: 1,
      pageSize: 20,
      hasMore: true,
      todayCount: 0,
      publicCount: 0
    }
  },
  computed: {
    filteredData() {
      // 只显示公开用户的打卡
      return this.datas.filter(item => item.open === '1')
    }
  },
  mounted() {
    document.title = this.$route.meta.title
    this.getUserInfo()
    this.getData()
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
        }
      } catch (err) {
        console.error('获取用户信息失败', err)
      }
    },

    async getData() {
      this.loading = true
      this.page = 1
      this.hasMore = true

      try {
        const res = await axios.get(`${this.serverUrl}getReportInfoByDate?date=${this.selectedDate}`)
        const reports = res.data || []

        // 获取所有用户信息
        const userIds = [...new Set(reports.map(r => r.userId))]
        const userMap = await this.fetchUserInfos(userIds)

        // 获取所有模板信息
        const templateIds = [...new Set(reports.map(r => r.templateId).filter(id => id))]
        const templateMap = await this.fetchTemplates(templateIds)

        // 合并用户信息和模板信息
        this.datas = reports.map(report => {
          const templates = templateMap[report.templateId] || []
          const templateData = {}
          templates.forEach((t, i) => {
            templateData['template' + (i + 1)] = t
          })
          return {
            ...report,
            ...userMap[report.userId],
            ...templateData
          }
        })

        // 统计
        this.todayCount = reports.length
        this.publicCount = this.datas.filter(d => d.open === '1').length

      } catch (err) {
        console.error('获取数据失败', err)
        this.$message.error('加载失败，请重试')
      } finally {
        this.loading = false
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

    async loadMore() {
      if (this.loadingMore || !this.hasMore) return

      this.loadingMore = true
      this.page++

      try {
        // 目前按日期加载，所以没有更多数据的概念
        // 如果后续需要分页可以扩展
        this.hasMore = false
      } catch (err) {
        console.error('加载更多失败', err)
      } finally {
        this.loadingMore = false
      }
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
  gap: 15px;
}

.user-avatar {
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.header-info {
  color: white;
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
  gap: 15px;
}

/* 打卡卡片 */
.checkin-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.checkin-header {
  display: flex;
  align-items: center;
  padding: 15px;
  gap: 12px;
}

.checkin-avatar {
  flex-shrink: 0;
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
  gap: 12px;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.checkin-meta i {
  margin-right: 3px;
}

/* 打卡内容 */
.checkin-content {
  padding: 0 15px 15px;
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
  gap: 8px;
  padding: 5px 0 5px 2px;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  text-align: left;
}

.checkin-item i {
  color: #67c23a;
  margin-top: 3px;
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
  padding: 6px 15px 12px;
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
