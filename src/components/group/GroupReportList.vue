<template>
  <div class="report-section">
    <div class="report-header">
      <div class="report-title">
        <span><i class="el-icon-date"></i> 近期打卡</span>
        <span v-if="dayView.count" class="report-count">{{ dayView.count }}条</span>
      </div>
      <el-date-picker
        v-model="selectedDate"
        type="date"
        size="mini"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        placeholder="选择日期"
        :clearable="false"
        :editable="false"
        :picker-options="datePickerOptions"
        class="report-date"
      />
    </div>

    <div v-if="dayView.count" class="report-list">
      <div v-for="data in visibleReports" :key="data.id || (data.userId + '-' + data.date)" class="report-item">
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

      <div v-if="dayView.count > limit" class="report-more" @click="expanded = !expanded">
        {{ expanded ? '收起' : `展开全部 ${dayView.count} 条` }}
        <i :class="expanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
      </div>
    </div>

    <div v-else class="empty-inline">
      <i class="el-icon-document"></i>
      <span>{{ dayView.emptyText }}</span>
    </div>
  </div>
</template>

<script>
import { buildReportItems } from './reportItems'
import {
  calendarDate,
  isAfterShanghaiToday,
  localCalendarDate,
  recentCheckinView,
  shanghaiCalendarDate,
  visibleDayReports
} from '@/utils/groupRecentReports'

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
      expanded: false,
      selectedDate: shanghaiCalendarDate(new Date()),
      datePickerOptions: {
        disabledDate(time) {
          return isAfterShanghaiToday(localCalendarDate(time))
        }
      }
    }
  },
  computed: {
    dayView() {
      return recentCheckinView(this.reports, this.selectedDate)
    },
    // 一次性把当天记录的 template/value 摊平，避免模板里反复计算
    visibleReports() {
      return visibleDayReports(this.dayView, this.expanded, this.limit)
        .map(data => ({ ...data, items: buildReportItems(data) }))
    }
  },
  watch: {
    selectedDate(value) {
      this.expanded = false
      const day = value instanceof Date ? localCalendarDate(value) : calendarDate(value)
      const next = day || shanghaiCalendarDate(new Date())
      if (next && next !== value) this.selectedDate = next
    }
  },
  methods: {
    formatDate(date) {
      if (!date || typeof date !== 'string') return ''
      const day = calendarDate(date)
      const text = day || date
      return text.length > 5 ? text.substring(5) : text
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
  gap: 8px;
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
}

.report-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.report-header i {
  margin-right: 5px;
}

.report-date {
  width: 150px;
  flex-shrink: 0;
}

.report-date /deep/ .el-input__inner {
  height: 28px;
  line-height: 28px;
  border-radius: 14px;
  padding-right: 8px;
  font-size: 12px;
  color: #606266;
}

.report-date /deep/ .el-input__icon {
  line-height: 28px;
}

.report-date /deep/ .el-input__prefix {
  left: 4px;
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
