<template>
  <div class="statistics-container" v-loading="loading">
    <!-- 顶部总览卡片 -->
    <div class="summary-section">
      <div class="section-title">数据总览</div>
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <i class="el-icon-calendar"></i>
          </div>
          <div class="card-content">
            <div class="card-value">{{ totalReportCount }}</div>
            <div class="card-label">累计打卡(天)</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            <i class="el-icon-date"></i>
          </div>
          <div class="card-content">
            <div class="card-value">{{ currentMonthReportCount }}</div>
            <div class="card-label">本月打卡(天)</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            <i class="el-icon-trophy"></i>
          </div>
          <div class="card-content">
            <div class="card-value">{{ currentStreak }}</div>
            <div class="card-label">连续打卡(天)</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
            <i class="el-icon-star-on"></i>
          </div>
          <div class="card-content">
            <div class="card-value">{{ maxStreak }}</div>
            <div class="card-label">最长连续(天)</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 打卡率统计 -->
    <div class="rate-section">
      <div class="section-title">打卡率</div>
      <div class="rate-cards">
        <div class="rate-card">
          <div class="rate-info">
            <div class="rate-label">本周打卡率</div>
            <div class="rate-value">{{ weekRate }}%</div>
          </div>
          <el-progress
            type="circle"
            :percentage="weekRate"
            :width="60"
            :stroke-width="6"
            :color="getRateColor(weekRate)">
          </el-progress>
        </div>
        <div class="rate-card">
          <div class="rate-info">
            <div class="rate-label">本月打卡率</div>
            <div class="rate-value">{{ monthRate }}%</div>
          </div>
          <el-progress
            type="circle"
            :percentage="monthRate"
            :width="60"
            :stroke-width="6"
            :color="getRateColor(monthRate)">
          </el-progress>
        </div>
        <div class="rate-card">
          <div class="rate-info">
            <div class="rate-label">本年打卡率</div>
            <div class="rate-value">{{ yearRate }}%</div>
          </div>
          <el-progress
            type="circle"
            :percentage="yearRate"
            :width="60"
            :stroke-width="6"
            :color="getRateColor(yearRate)">
          </el-progress>
        </div>
      </div>
    </div>

    <!-- 本周打卡情况 -->
    <div class="week-section">
      <div class="section-title">本周打卡</div>
      <div class="week-calendar">
        <div v-for="(day, index) in weekDays" :key="index" class="week-day">
          <div class="day-name">{{ day.name }}</div>
          <div :class="['day-circle', { 'checked': day.checked, 'today': day.isToday }]">
            <i v-if="day.checked" class="el-icon-check"></i>
            <span v-else>{{ day.date }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 年度趋势图 -->
    <div class="chart-section">
      <div class="section-title">
        <span>年度趋势</span>
        <el-select v-model="selectedYear" size="mini" class="year-select" @change="onYearChange">
          <el-option
            v-for="year in yearOptions"
            :key="year"
            :label="year + '年'"
            :value="year">
          </el-option>
        </el-select>
      </div>
      <div id="year_chart" class="chart-container"></div>
    </div>

    <!-- 最近7日趋势图 -->
    <div class="chart-section">
      <div class="section-title">最近7日趋势</div>
      <div id="statistics_charts" class="chart-container"></div>
    </div>

    <!-- 月度对比 -->
    <div class="monthly-section" v-if="monthlyComparison.current > 0 || monthlyComparison.previous > 0">
      <div class="section-title">月度对比</div>
      <div class="monthly-comparison">
        <div class="month-item">
          <div class="month-label">上月</div>
          <div class="month-value">{{ monthlyComparison.previous }} 天</div>
          <el-progress :percentage="getMonthPercentage(monthlyComparison.previous)" :show-text="false" color="#909399"></el-progress>
        </div>
        <div class="month-item current">
          <div class="month-label">本月</div>
          <div class="month-value">{{ monthlyComparison.current }} 天</div>
          <el-progress :percentage="getMonthPercentage(monthlyComparison.current)" :show-text="false" color="#67c23a"></el-progress>
        </div>
        <div class="month-trend" v-if="monthlyComparison.previous > 0">
          <span :class="['trend-icon', monthlyComparison.trend > 0 ? 'up' : 'down']">
            <i :class="monthlyComparison.trend > 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
            {{ Math.abs(monthlyComparison.trend) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- 年度统计卡片 -->
    <div class="year-stats-section">
      <div class="section-title">年度统计 ({{ selectedYear }}年)</div>
      <div class="year-stats-grid">
        <div class="year-stat-item">
          <div class="year-stat-value">{{ yearReportCount }}</div>
          <div class="year-stat-label">今年打卡天数</div>
        </div>
        <div class="year-stat-item">
          <div class="year-stat-value">{{ avgMonthDays }}</div>
          <div class="year-stat-label">月均打卡天数</div>
        </div>
        <div class="year-stat-item">
          <div class="year-stat-value">{{ bestMonth }}</div>
          <div class="year-stat-label">最佳月份</div>
        </div>
        <div class="year-stat-item">
          <div class="year-stat-value">{{ daysFromStart }}</div>
          <div class="year-stat-label">坚持天数</div>
        </div>
      </div>
    </div>

    <!-- 最近7日汇总 -->
    <div class="summary-list-section" v-if="last7DaysSummary.length > 0">
      <div class="section-title">最近7日汇总</div>
      <div class="summary-list">
        <div v-for="(item, index) in last7DaysSummary" :key="index" class="summary-item">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-value" :style="{ color: getValueColor(item.value) }">
            {{ item.value }}
          </div>
          <div class="item-unit">{{ item.unit }}</div>
        </div>
      </div>
    </div>

    <!-- 历史总汇总 -->
    <div class="history-section" v-if="historySummary.length > 0">
      <div class="section-title">历史总汇总</div>
      <div class="history-grid">
        <div v-for="(item, index) in historySummary" :key="index" class="history-item">
          <div class="history-value" :style="{ color: getHistoryColor(item.value) }">
            {{ formatNumber(item.value) }}
          </div>
          <div class="history-label">{{ item.name }}</div>
          <div class="history-unit">{{ item.unit }}</div>
        </div>
      </div>
    </div>

    <div style="height: 80px;"></div>
  </div>
</template>

<script>
import axios from 'axios'
import global from "@/components/Common";
import * as echarts from "echarts";

export default {
  name: 'Statistics',
  data() {
    const currentYear = new Date().getFullYear()
    // 生成年份选项：从2020年到当前年份
    const yearOptions = []
    for (let y = currentYear; y >= 2020; y--) {
      yearOptions.push(y)
    }
    return {
      serverUrl: global.httpUrl,
      loading: true,
      totalReportCount: 0,
      currentMonthReportCount: 0,
      currentStreak: 0,
      maxStreak: 0,
      weekDays: [],
      last7DaysSummary: [],
      historySummary: [],
      monthlyComparison: {
        current: 0,
        previous: 0,
        trend: 0
      },
      // 打卡率
      weekRate: 0,
      monthRate: 0,
      yearRate: 0,
      // 年度统计
      currentYear: currentYear,
      selectedYear: currentYear,
      yearOptions: yearOptions,
      yearReportCount: 0,
      avgMonthDays: 0,
      bestMonth: '-',
      daysFromStart: 0,
      monthlyData: [], // 每月打卡天数
      // 图表数据
      chartData: {
        dates: [],
        series: []
      },
      // 原始数据
      allReports: [],
      templateCache: {}
    };
  },
  mounted() {
    document.title = this.$route.meta.title
    this.initWeekDays()
    this.loadData()
  },
  methods: {
    // 初始化本周日期
    initWeekDays() {
      const today = new Date()
      const dayOfWeek = today.getDay() || 7 // 周日为0，转为7
      const weekNames = ['一', '二', '三', '四', '五', '六', '日']

      this.weekDays = []
      for (let i = 1; i <= 7; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() - dayOfWeek + i)
        this.weekDays.push({
          name: '周' + weekNames[i - 1],
          date: date.getDate(),
          fullDate: this.formatDate(date),
          checked: false,
          isToday: this.formatDate(date) === this.formatDate(today)
        })
      }
    },

    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    formatNumber(num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万'
      }
      return num
    },

    getValueColor(value) {
      if (value < 50) return '#67c23a'
      if (value < 100) return '#409eff'
      if (value < 200) return '#e6a23c'
      return '#f56c6c'
    },

    getHistoryColor(value) {
      if (value < 100) return '#67c23a'
      if (value < 500) return '#409eff'
      if (value < 1000) return '#e6a23c'
      if (value < 5000) return '#f56c6c'
      return '#722ed1'
    },

    getRateColor(rate) {
      if (rate >= 80) return '#67c23a'
      if (rate >= 60) return '#409eff'
      if (rate >= 40) return '#e6a23c'
      return '#f56c6c'
    },

    getMonthPercentage(days) {
      const maxDays = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
      return Math.min(100, Math.round((days / maxDays) * 100))
    },

    async loadData() {
      this.loading = true
      const storeUnionid = this.$store.getters.getUnionid
      const unionid = storeUnionid ? storeUnionid.replace(/"/g, '') : ''

      if (!unionid) {
        this.$message.warning("请先登录")
        this.loading = false
        return
      }

      try {
        // 获取所有打卡记录
        const res = await axios.get(`${this.serverUrl}getReportInfoListById?userId=${unionid}`)

        if (!res.data || res.data.length === 0) {
          this.$message.warning("暂无打卡数据")
          this.loading = false
          return
        }

        this.allReports = res.data
        this.totalReportCount = this.allReports.length

        // 计算各项统计
        this.calculateStreaks()
        this.calculateMonthlyStats()
        this.calculateRates()
        this.calculateYearStats()
        this.updateWeekChecks()
        await this.calculateSummaries()

        // 绘制图表
        this.$nextTick(() => {
          this.drawChart()
          this.drawYearChart()
        })

      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('加载数据失败')
      } finally {
        this.loading = false
      }
    },

    // 计算打卡率
    calculateRates() {
      const today = new Date()
      const todayStr = this.formatDate(today)

      // 本周打卡率
      const weekTotal = this.weekDays.filter(d => d.fullDate <= todayStr).length
      const weekCheckedCount = this.weekDays.filter(d => d.checked && d.fullDate <= todayStr).length
      this.weekRate = weekTotal > 0 ? Math.round((weekCheckedCount / weekTotal) * 100) : 0

      // 本月打卡率
      const dayOfMonth = today.getDate()
      this.monthRate = dayOfMonth > 0 ? Math.round((this.currentMonthReportCount / dayOfMonth) * 100) : 0

      // 本年打卡率
      const startOfYear = new Date(today.getFullYear(), 0, 1)
      const dayOfYear = Math.ceil((today - startOfYear) / 86400000) + 1
      this.yearRate = dayOfYear > 0 ? Math.round((this.yearReportCount / dayOfYear) * 100) : 0
    },

    // 计算年度统计
    calculateYearStats() {
      const yearStr = this.selectedYear.toString()
      const yearReports = this.allReports.filter(r => r.date.startsWith(yearStr))
      this.yearReportCount = yearReports.length

      // 计算每月打卡数据
      const monthlyCount = {}
      for (let i = 1; i <= 12; i++) {
        const monthStr = `${yearStr}-${String(i).padStart(2, '0')}`
        monthlyCount[monthStr] = 0
      }

      yearReports.forEach(r => {
        const month = r.date.substring(0, 7)
        if (monthlyCount[month] !== undefined) {
          monthlyCount[month]++
        }
      })

      // 当前年份只显示到当前月，历史年份显示全年
      const isCurrentYear = this.selectedYear === this.currentYear
      const displayMonths = isCurrentYear ? new Date().getMonth() + 1 : 12

      this.monthlyData = Object.entries(monthlyCount)
        .slice(0, displayMonths)
        .map(([month, count]) => ({
          month: month.substring(5) + '月',
          count
        }))

      // 计算月均打卡天数
      const monthsToCount = isCurrentYear ? new Date().getMonth() + 1 : 12
      this.avgMonthDays = monthsToCount > 0
        ? Math.round(this.yearReportCount / monthsToCount)
        : 0

      // 找出最佳月份
      let maxCount = 0
      let bestMonthStr = '-'
      Object.entries(monthlyCount).forEach(([month, count]) => {
        if (count > maxCount) {
          maxCount = count
          bestMonthStr = month.substring(5) + '月'
        }
      })
      this.bestMonth = maxCount > 0 ? `${bestMonthStr}(${maxCount}天)` : '-'

      // 计算从第一次打卡到现在的天数
      if (this.allReports.length > 0) {
        const sortedDates = this.allReports.map(r => r.date).sort()
        const firstDate = new Date(sortedDates[0])
        const today = new Date()
        this.daysFromStart = Math.ceil((today - firstDate) / 86400000) + 1
      }

      // 更新年打卡率
      const today = new Date()
      const startOfYear = new Date(today.getFullYear(), 0, 1)
      const dayOfYear = Math.ceil((today - startOfYear) / 86400000) + 1
      this.yearRate = dayOfYear > 0 ? Math.round((this.yearReportCount / dayOfYear) * 100) : 0
    },

    // 计算连续打卡天数
    calculateStreaks() {
      if (this.allReports.length === 0) return

      // 按日期排序
      const sortedDates = this.allReports
        .map(r => r.date)
        .sort((a, b) => new Date(b) - new Date(a))

      const uniqueDates = [...new Set(sortedDates)]
      const today = this.formatDate(new Date())
      const yesterday = this.formatDate(new Date(Date.now() - 86400000))

      // 计算当前连续天数
      let currentStreak = 0
      let checkDate = uniqueDates[0] === today || uniqueDates[0] === yesterday ? uniqueDates[0] : null

      if (checkDate) {
        for (let i = 0; i < uniqueDates.length; i++) {
          const expectedDate = this.formatDate(new Date(new Date(checkDate).getTime() - i * 86400000))
          if (uniqueDates[i] === expectedDate) {
            currentStreak++
          } else {
            break
          }
        }
      }
      this.currentStreak = currentStreak

      // 计算最长连续天数
      let maxStreak = 1
      let tempStreak = 1
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1])
        const currDate = new Date(uniqueDates[i])
        const diffDays = (prevDate - currDate) / 86400000

        if (diffDays === 1) {
          tempStreak++
          maxStreak = Math.max(maxStreak, tempStreak)
        } else {
          tempStreak = 1
        }
      }
      this.maxStreak = maxStreak
    },

    // 计算月度统计
    calculateMonthlyStats() {
      const now = new Date()
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      const prevMonth = now.getMonth() === 0
        ? `${now.getFullYear() - 1}-12`
        : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`

      this.currentMonthReportCount = this.allReports.filter(r => r.date.startsWith(currentMonth)).length
      const prevMonthCount = this.allReports.filter(r => r.date.startsWith(prevMonth)).length

      this.monthlyComparison = {
        current: this.currentMonthReportCount,
        previous: prevMonthCount,
        trend: prevMonthCount > 0
          ? Math.round((this.currentMonthReportCount - prevMonthCount) / prevMonthCount * 100)
          : 0
      }
    },

    // 更新本周打卡状态
    updateWeekChecks() {
      const checkedDates = new Set(this.allReports.map(r => r.date))
      this.weekDays.forEach(day => {
        day.checked = checkedDates.has(day.fullDate)
      })
    },

    // 计算汇总数据
    async calculateSummaries() {
      const last7Days = []
      const today = new Date()
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 86400000)
        last7Days.push(this.formatDate(date))
      }

      // 获取最近7天的报告
      const last7DaysReports = this.allReports.filter(r => last7Days.includes(r.date))

      // 收集需要的模板ID
      const templateIds = [...new Set(this.allReports.map(r => r.templateId).filter(id => id))]

      // 批量获取模板
      await this.loadTemplates(templateIds)

      // 计算最近7天汇总
      this.calculateLast7DaysSummary(last7DaysReports, last7Days)

      // 计算历史总汇总
      this.calculateHistorySummary()
    },

    async loadTemplates(templateIds) {
      const uncachedIds = templateIds.filter(id => !this.templateCache[id])

      if (uncachedIds.length > 0) {
        const promises = uncachedIds.map(id =>
          axios.get(`${this.serverUrl}getReportTemplateById?id=${id}`)
            .then(res => ({ id, data: res.data }))
            .catch(() => ({ id, data: null }))
        )

        const results = await Promise.all(promises)
        results.forEach(({ id, data }) => {
          if (data) this.templateCache[id] = data
        })
      }
    },

    calculateLast7DaysSummary(reports, dates) {
      const summary = {}
      const chartSeries = {}

      reports.forEach(report => {
        const template = this.templateCache[report.templateId]
        if (!template) return

        template.forEach((tpl, idx) => {
          if (!tpl || tpl === '七分饱_') return

          const [name, unit] = tpl.split('_')
          const value = this.parseValue(report[`value${idx + 1}`])

          if (value > 0) {
            if (!summary[name]) {
              summary[name] = { name, unit: unit || '次', value: 0 }
              chartSeries[name] = { name, data: new Array(7).fill(0) }
            }
            summary[name].value += value

            const dateIndex = dates.indexOf(report.date)
            if (dateIndex >= 0) {
              chartSeries[name].data[dateIndex] += value
            }
          }
        })
      })

      this.last7DaysSummary = Object.values(summary).filter(s => s.value > 0)

      // 准备图表数据
      this.chartData = {
        dates: dates.map(d => d.substring(5).replace('-', '/')),
        series: Object.values(chartSeries).filter(s => s.data.some(v => v > 0))
      }
    },

    calculateHistorySummary() {
      const summary = {}

      this.allReports.forEach(report => {
        const template = this.templateCache[report.templateId]
        if (!template) return

        template.forEach((tpl, idx) => {
          if (!tpl || tpl === '七分饱_') return

          const [name, unit] = tpl.split('_')
          const value = this.parseValue(report[`value${idx + 1}`])

          if (value > 0) {
            if (!summary[name]) {
              summary[name] = {
                name,
                unit: (name === '早睡' || name === '早起') ? '天' : (unit || '次'),
                value: 0
              }
            }
            summary[name].value += value
          }
        })
      })

      this.historySummary = Object.values(summary)
        .filter(s => s.value > 0)
        .sort((a, b) => b.value - a.value)
    },

    parseValue(val) {
      if (!val) return 0
      const str = String(val)
      if (str.includes('+')) {
        return str.split('+').reduce((sum, v) => sum + (parseInt(v) || 0), 0)
      }
      return parseInt(str) || 0
    },

    // 年份切换
    onYearChange() {
      this.calculateYearStats()
      this.$nextTick(() => {
        this.drawYearChart()
      })
    },

    // 绘制年度趋势图
    drawYearChart() {
      if (this.monthlyData.length === 0) return

      const chartDom = document.getElementById('year_chart')
      if (!chartDom) return

      // 销毁旧图表实例
      const existingChart = echarts.getInstanceByDom(chartDom)
      if (existingChart) {
        existingChart.dispose()
      }

      const chart = echarts.init(chartDom)
      const isCurrentYear = this.selectedYear === this.currentYear
      const currentMonth = new Date().getMonth()

      chart.setOption({
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c}天'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: this.monthlyData.map(d => d.month),
          axisLabel: {
            fontSize: 11
          }
        },
        yAxis: {
          type: 'value',
          name: '天数'
        },
        series: [{
          name: '打卡天数',
          type: 'bar',
          data: this.monthlyData.map((d, index) => ({
            value: d.count,
            itemStyle: {
              // 当前年份根据月份显示颜色，历史年份全部显示有效颜色
              color: (!isCurrentYear || index <= currentMonth)
                ? (d.count >= 20 ? '#67c23a' : d.count >= 10 ? '#409eff' : '#e6a23c')
                : '#dcdfe6'
            }
          })),
          barWidth: '60%',
          label: {
            show: true,
            position: 'top',
            formatter: (params) => params.value > 0 ? params.value : ''
          }
        }]
      })
    },

    drawChart() {
      if (this.chartData.series.length === 0) return

      const chartDom = document.getElementById('statistics_charts')
      if (!chartDom) return

      const chart = echarts.init(chartDom)

      const series = this.chartData.series.map(s => ({
        name: s.name,
        type: 'line',
        smooth: true,
        data: s.data,
        symbolSize: 6
      }))

      chart.setOption({
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: this.chartData.series.map(s => s.name),
          top: 0,
          type: 'scroll'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.chartData.dates
        },
        yAxis: {
          type: 'value'
        },
        series: series
      })
    }
  }
}
</script>

<style scoped>
.statistics-container {
  padding: 15px;
  background: #f5f7fa;
  min-height: 100vh;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.year-select {
  width: 90px;
}

.year-select /deep/ .el-input__inner {
  border-radius: 15px;
  height: 28px;
  line-height: 28px;
}

/* 总览卡片 */
.summary-section {
  margin-bottom: 20px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-row-gap: 12px;
  grid-column-gap: 12px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-icon {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.card-icon i {
  font-size: 22px;
  color: white;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.card-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 打卡率 */
.rate-section {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.rate-cards {
  display: flex;
  justify-content: space-between;
}

.rate-card {
  display: flex;
  align-items: center;
}

.rate-card > *:not(:last-child) {
  margin-right: 10px;
}

.rate-info {
  text-align: right;
}

.rate-label {
  font-size: 12px;
  color: #909399;
}

.rate-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

/* 本周打卡 */
.week-section {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.week-calendar {
  display: flex;
  justify-content: space-between;
}

.week-day {
  text-align: center;
  flex: 1;
}

.day-name {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.day-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 14px;
  color: #606266;
  background: #f5f7fa;
  transition: all 0.3s;
}

.day-circle.checked {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  color: white;
}

.day-circle.today {
  border: 2px solid #409eff;
}

.day-circle.checked i {
  font-size: 16px;
}

/* 图表区域 */
.chart-section {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.chart-container {
  width: 100%;
  height: 250px;
}

/* 年度统计 */
.year-stats-section {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.year-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-row-gap: 12px;
  grid-column-gap: 12px;
}

.year-stat-item {
  text-align: center;
  padding: 15px 10px;
  background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);
  border-radius: 10px;
}

.year-stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  line-height: 1.2;
}

.year-stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
}

/* 汇总列表 */
.summary-list-section {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.summary-list {
  display: flex;
  flex-wrap: wrap;
  margin: -5px;
}

.summary-item {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  margin: 5px;
}

.summary-item > *:not(:last-child) {
  margin-right: 8px;
}

.item-name {
  font-size: 14px;
  color: #606266;
}

.item-value {
  font-size: 20px;
  font-weight: bold;
}

.item-unit {
  font-size: 12px;
  color: #909399;
}

/* 历史汇总 */
.history-section {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-row-gap: 12px;
  grid-column-gap: 12px;
}

.history-item {
  text-align: center;
  padding: 12px 8px;
  background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);
  border-radius: 8px;
}

.history-value {
  font-size: 22px;
  font-weight: bold;
  line-height: 1.2;
}

.history-label {
  font-size: 13px;
  color: #606266;
  margin-top: 4px;
}

.history-unit {
  font-size: 11px;
  color: #909399;
}

/* 月度对比 */
.monthly-section {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.monthly-comparison {
  position: relative;
}

.month-item {
  margin-bottom: 15px;
}

.month-item .month-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 5px;
}

.month-item .month-value {
  font-size: 16px;
  font-weight: bold;
  color: #606266;
  margin-bottom: 8px;
}

.month-item.current .month-value {
  color: #67c23a;
}

.month-trend {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.trend-icon {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
}

.trend-icon.up {
  color: #67c23a;
}

.trend-icon.down {
  color: #f56c6c;
}

.trend-icon i {
  margin-right: 4px;
}
</style>
