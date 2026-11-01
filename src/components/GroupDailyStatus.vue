<template>
  <div class="status-page">
    <div class="status-header">
      <div class="header-top">
        <div class="back-btn" @click="goBack" v-if="!fromShare">
          <i class="el-icon-arrow-left"></i>
        </div>
        <div class="header-titles">
          <div class="group-name">{{ groupName || '团队打卡' }}</div>
          <div class="group-meta">{{ groupId }}</div>
        </div>
      </div>

      <div class="summary-row">
        <div class="summary-ring">
          <div class="ring-value">{{ checkedIn }}/{{ total }}</div>
          <div class="ring-label">今日完成</div>
        </div>
        <div class="summary-info">
          <div class="rate-text">完成率 {{ completionRate }}%</div>
          <div class="date-row">
            <el-date-picker
              v-model="selectedDate"
              type="date"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              :clearable="false"
              :editable="false"
              size="small"
              :picker-options="datePickerOptions"
              @change="loadDailyStatus"
            />
          </div>
        </div>
      </div>

      <div class="action-row">
        <button class="action-btn primary" @click="copyShareLink">
          <i class="el-icon-share"></i> 复制提醒链接
        </button>
        <button class="action-btn" :disabled="exporting" @click="exportMonthExcel">
          <i class="el-icon-download"></i> {{ exporting ? '导出中...' : '导出本月 Excel' }}
        </button>
      </div>
    </div>

    <div class="content">
      <div v-if="loading" class="state-box">
        <i class="el-icon-loading"></i>
        <span>加载中...</span>
      </div>

      <template v-else-if="loadError">
        <div class="state-box">
          <i class="el-icon-warning-outline"></i>
          <span>{{ loadError }}</span>
        </div>
      </template>

      <template v-else>
        <div class="section">
          <div class="section-title">
            <span class="dot done"></span>
            已打卡 {{ doneMembers.length }}
          </div>
          <div v-if="doneMembers.length === 0" class="empty-line">还没有人打卡</div>
          <div v-for="m in doneMembers" :key="'d-' + m.unionId" class="member-row">
            <el-avatar :size="40" :src="m.headimgurl">
              <i class="el-icon-user-solid"></i>
            </el-avatar>
            <div class="member-main">
              <div class="member-name">
                {{ displayName(m) }}
                <span v-if="m.isOwner" class="owner-tag">组长</span>
              </div>
              <div class="member-note" v-if="m.note">{{ m.note }}</div>
            </div>
            <span class="status-tag done">已打卡</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <span class="dot pending"></span>
            未打卡 {{ pendingMembers.length }}
          </div>
          <div v-if="pendingMembers.length === 0" class="empty-line">全员已打卡</div>
          <div v-for="m in pendingMembers" :key="'p-' + m.unionId" class="member-row">
            <el-avatar :size="40" :src="m.headimgurl">
              <i class="el-icon-user-solid"></i>
            </el-avatar>
            <div class="member-main">
              <div class="member-name">
                {{ displayName(m) }}
                <span v-if="m.isOwner" class="owner-tag">组长</span>
              </div>
            </div>
            <span class="status-tag pending">未打卡</span>
          </div>
        </div>

        <div class="hint">
          把上方链接发到群里，组员打开即可查看今日完成情况；需要月度统计可点「导出本月 Excel」。
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import XLSX from 'xlsx'
import FileSaver from 'file-saver'
import global from '@/components/Common'
import { copyToClipboard } from '@/utils/clipboard'

export default {
  name: 'GroupDailyStatus',
  data() {
    return {
      serverUrl: global.httpUrl,
      groupId: '',
      groupName: '',
      selectedDate: '',
      total: 0,
      checkedIn: 0,
      members: [],
      loading: true,
      loadError: '',
      exporting: false,
      fromShare: false,
      datePickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      }
    }
  },
  computed: {
    completionRate() {
      if (!this.total) return 0
      return Math.round((this.checkedIn / this.total) * 100)
    },
    doneMembers() {
      return this.members.filter(m => m.checkedIn)
    },
    pendingMembers() {
      return this.members.filter(m => !m.checkedIn)
    }
  },
  mounted() {
    document.title = '团队打卡情况'
    this.groupId = this.$route.params.groupId || this.$route.query.groupId || ''
    this.selectedDate = this.$route.query.date || this.todayStr()
    // 从首页/团队页进来显示返回；群里点开的分享链接不显示返回
    this.fromShare = this.$route.query.from !== 'home' && this.$route.query.from !== 'group'
    if (!this.groupId) {
      this.loading = false
      this.loadError = '缺少组 ID'
      return
    }
    this.loadDailyStatus()
  },
  methods: {
    todayStr() {
      return global.getDateFormat(new Date())
    },
    displayName(m) {
      return m.nickname || m.name || '匿名用户'
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.back()
      } else {
        this.$router.push('/group')
      }
    },
    shareUrl() {
      const base = window.location.href.split('#')[0]
      return `${base}#/groupStatus/${encodeURIComponent(this.groupId)}?date=${this.selectedDate}&from=share`
    },
    async copyShareLink() {
      const text = `【${this.groupName || '团队'}】${this.selectedDate} 打卡完成 ${this.checkedIn}/${this.total}（${this.completionRate}%）\n未打卡的伙伴请尽快完成～\n${this.shareUrl()}`
      const ok = await copyToClipboard(text, this)
      if (ok) {
        this.$quickMessage('提醒链接已复制，可粘贴到群里')
      } else {
        this.$message.warning('复制失败，请手动长按链接复制')
      }
    },
    async loadDailyStatus() {
      if (!this.groupId || !this.selectedDate) return
      this.loading = true
      this.loadError = ''
      try {
        const res = await axios.get(
          `${this.serverUrl}getGroupDailyStatus?groupId=${encodeURIComponent(this.groupId)}&date=${this.selectedDate}`
        )
        const data = res.data || {}
        if (data.error === 'group_not_found') {
          this.loadError = '未找到该团队'
          this.members = []
          this.total = 0
          this.checkedIn = 0
          return
        }
        this.groupName = data.groupName || ''
        this.total = data.total || 0
        this.checkedIn = data.checkedIn || 0
        this.members = data.members || []
        document.title = `${this.groupName || '团队'} · 打卡情况`
      } catch (err) {
        console.error('加载团队打卡情况失败', err)
        this.loadError = '加载失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    monthPrefix(dateStr) {
      if (!dateStr || dateStr.length < 7) return ''
      return dateStr.substring(0, 7) + '-'
    },
    async exportMonthExcel() {
      if (!this.groupId || this.exporting) return
      this.exporting = true
      try {
        const monthDate = this.monthPrefix(this.selectedDate)
        const res = await axios.get(
          `${this.serverUrl}getGroupCheckinStats?groupId=${encodeURIComponent(this.groupId)}&monthDate=${monthDate}`
        )
        const data = res.data || {}
        if (data.error === 'group_not_found') {
          this.$message.warning('未找到该团队')
          return
        }
        const days = data.days || []
        const members = data.members || []
        if (members.length === 0) {
          this.$message.warning('暂无成员数据可导出')
          return
        }

        // 表头：昵称 / 姓名 / 角色 / 打卡天数 / 各日
        const header = ['昵称', '姓名', '角色', '打卡天数', ...days.map(d => d.substring(5))]
        const rows = [header]
        members.forEach(m => {
          const checkedSet = new Set(m.checkedDays || [])
          const dayCells = days.map(d => (checkedSet.has(d) ? '✓' : ''))
          rows.push([
            m.nickname || '',
            m.name || '',
            m.isOwner ? '组长' : '组员',
            m.checkedCount || 0,
            ...dayCells
          ])
        })

        // 当日汇总 sheet
        const dailyHeader = ['昵称', '姓名', '角色', '是否打卡', '反省']
        const dailyRows = [dailyHeader]
        this.members.forEach(m => {
          dailyRows.push([
            m.nickname || '',
            m.name || '',
            m.isOwner ? '组长' : '组员',
            m.checkedIn ? '已打卡' : '未打卡',
            m.note || ''
          ])
        })

        const wb = XLSX.utils.book_new()
        const wsMonth = XLSX.utils.aoa_to_sheet(rows)
        const wsDaily = XLSX.utils.aoa_to_sheet(dailyRows)
        XLSX.utils.book_append_sheet(wb, wsMonth, '月度统计')
        XLSX.utils.book_append_sheet(wb, wsDaily, this.selectedDate)
        const wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' })
        const fileName = `${data.groupName || this.groupId}_${monthDate.replace(/-/g, '')}打卡统计.xlsx`
        FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName)
        this.$quickMessage('Excel 已导出')
      } catch (err) {
        console.error('导出失败', err)
        this.$message.error('导出失败，请稍后重试')
      } finally {
        this.exporting = false
      }
    }
  }
}
</script>

<style scoped>
.status-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 40px;
}

.status-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 16px 16px 20px;
}

.header-top {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.back-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  flex-shrink: 0;
}

.header-titles {
  min-width: 0;
}

.group-name {
  font-size: 20px;
  font-weight: 700;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-meta {
  font-size: 12px;
  opacity: 0.85;
  margin-top: 2px;
  text-align: left;
}

.summary-row {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 14px;
}

.summary-ring {
  width: 88px;
  text-align: center;
  margin-right: 14px;
  flex-shrink: 0;
}

.ring-value {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
}

.ring-label {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 2px;
}

.summary-info {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.rate-text {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
}

.date-row /deep/ .el-input__inner {
  background: rgba(255, 255, 255, 0.95);
  border: none;
  color: #303133;
}

.action-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.action-btn {
  flex: 1;
  border: none;
  border-radius: 22px;
  padding: 10px 8px;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
}

.action-btn.primary {
  background: #fff;
  color: #667eea;
  font-weight: 600;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.content {
  padding: 14px;
}

.section {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
  text-align: left;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.dot.done {
  background: #67c23a;
}

.dot.pending {
  background: #f56c6c;
}

.member-row {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-top: 1px solid #f0f2f5;
}

.member-row:first-of-type {
  border-top: none;
}

.member-main {
  flex: 1;
  min-width: 0;
  margin: 0 10px;
  text-align: left;
}

.member-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.owner-tag {
  display: inline-block;
  margin-left: 6px;
  font-size: 11px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.12);
  border-radius: 4px;
  padding: 1px 5px;
  font-weight: 400;
}

.member-note {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-tag {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 10px;
  flex-shrink: 0;
}

.status-tag.done {
  color: #67c23a;
  background: rgba(103, 194, 58, 0.12);
}

.status-tag.pending {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.12);
}

.empty-line,
.state-box {
  text-align: center;
  color: #909399;
  font-size: 13px;
  padding: 24px 0;
}

.state-box i {
  margin-right: 6px;
}

.hint {
  font-size: 12px;
  color: #909399;
  line-height: 1.6;
  padding: 4px 6px 20px;
  text-align: left;
}
</style>
