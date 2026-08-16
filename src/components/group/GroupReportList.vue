<template>
  <div class="report-section">
    <div class="report-header">
      <span><i class="el-icon-date"></i> 近期打卡</span>
      <span v-if="reports.length > 0" class="report-count">{{ reports.length }}条</span>
    </div>

    <div v-if="reports.length > 0" class="report-list">
      <div v-for="data in visibleReports" :key="data.id" class="report-item">
        <div class="report-user">
          <el-avatar :size="36" :src="data.headimgurl" class="report-avatar">
            <i class="el-icon-user-solid"></i>
          </el-avatar>
          <div class="report-user-info">
            <div class="report-nickname">{{ data.nickname || '匿名用户' }}</div>
            <div class="report-date">{{ formatDate(data.date) }}</div>
          </div>
        </div>
        <div class="report-content">
          <div v-for="(text, i) in data.items" :key="i" class="report-value" v-html="text"></div>
          <div v-if="data.items.length === 0" class="report-value muted">暂无打卡内容</div>
        </div>
      </div>

      <div v-if="reports.length > limit" class="report-more" @click="expanded = !expanded">
        {{ expanded ? '收起' : `展开全部 ${reports.length} 条` }}
        <i :class="expanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
      </div>
    </div>

    <div v-else class="empty-inline">
      <i class="el-icon-document"></i>
      <span>暂无打卡记录</span>
    </div>
  </div>
</template>

<script>
import { buildReportItems, sortByDateDesc } from './reportItems'

export default {
  name: 'GroupReportList',
  props: {
    reports: {
      type: Array,
      default: () => []
    },
    limit: {
      type: Number,
      default: 3
    }
  },
  data() {
    return {
      expanded: false
    }
  },
  computed: {
    // 一次性把 template/value 摊平缓存，避免模板里反复计算
    normalizedReports() {
      return sortByDateDesc(this.reports).map(data => ({ ...data, items: buildReportItems(data) }))
    },
    visibleReports() {
      return this.expanded ? this.normalizedReports : this.normalizedReports.slice(0, this.limit)
    }
  },
  methods: {
    formatDate(date) {
      if (!date || typeof date !== 'string') return ''
      return date.length > 5 ? date.substring(5) : date
    }
  }
}
</script>

<style scoped>
.report-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 14px;
}

.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
}

.report-header i {
  margin-right: 5px;
}

.report-count {
  font-size: 12px;
  color: #c0c4cc;
}

.report-list {
  display: flex;
  flex-direction: column;
}

.report-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 10px;
}

.report-avatar {
  flex-shrink: 0;
  margin-right: 10px;
}

.report-user {
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
  max-width: 40%;
  margin-right: 12px;
}

.report-user-info {
  min-width: 0;
}

.report-nickname {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.report-date {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
  text-align: left;
}

.report-content {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.report-value {
  font-size: 13px;
  color: #606266;
  line-height: 1.7;
  word-break: break-all;
}

.report-value.muted {
  color: #c0c4cc;
}

.report-value /deep/ .report-num {
  color: #667eea;
  font-weight: 600;
  margin: 0 2px;
}

.report-more {
  text-align: center;
  font-size: 13px;
  color: #667eea;
  padding: 8px 0 2px;
  cursor: pointer;
}

.report-more i {
  margin-left: 4px;
}

.empty-inline {
  text-align: center;
  color: #c0c4cc;
  font-size: 13px;
  padding: 18px 0;
}

.empty-inline i {
  margin-right: 5px;
}
</style>
