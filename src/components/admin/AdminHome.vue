<template>
  <div class="admin-home">
    <!-- 打卡数据 -->
    <div class="section-title">
      <i class="el-icon-edit-outline"></i> 打卡数据
    </div>
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <i class="el-icon-back"></i>
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ yesterdayReportCount }}</div>
            <div class="stats-label">昨日打卡数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            <i class="el-icon-edit"></i>
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ dailyReportCount }}</div>
            <div class="stats-label">今日打卡数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            <i class="el-icon-document"></i>
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ formatNumber(totalReportCount) }}</div>
            <div class="stats-label">总打卡数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
            <i class="el-icon-user"></i>
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ userCount }}</div>
            <div class="stats-label">立志卡填写数</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 访问统计 -->
    <div class="section-title">
      <i class="el-icon-view"></i> 访问统计 (PV)
    </div>
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
            <i class="el-icon-back"></i>
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ yesterdayVisitCount }}</div>
            <div class="stats-label">昨日访问量</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-icon" style="background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);">
            <i class="el-icon-view"></i>
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ dailyVisitCount }}</div>
            <div class="stats-label">今日访问量</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-icon" style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);">
            <i class="el-icon-date"></i>
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ weekVisitCount }}</div>
            <div class="stats-label">本周访问量</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-icon" style="background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);">
            <i class="el-icon-s-data"></i>
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ formatNumber(totalVisitCount) }}</div>
            <div class="stats-label">总访问量</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 访客统计 -->
    <div class="section-title">
      <i class="el-icon-user-solid"></i> 访客统计 (UV)
    </div>
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-icon" style="background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%);">
            <i class="el-icon-back"></i>
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ yesterdayVisitedUser }}</div>
            <div class="stats-label">昨日访客量</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-icon" style="background: linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%);">
            <i class="el-icon-user-solid"></i>
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ dailyVisitedUser }}</div>
            <div class="stats-label">今日访客量</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-icon" style="background: linear-gradient(135deg, #37ecba 0%, #72afd3 100%);">
            <i class="el-icon-date"></i>
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ weekVisitedUser }}</div>
            <div class="stats-label">本周访客量</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-icon" style="background: linear-gradient(135deg, #0acffe 0%, #495aff 100%);">
            <i class="el-icon-s-custom"></i>
          </div>
          <div class="stats-content">
            <div class="stats-value">{{ formatNumber(totalVisitedUser) }}</div>
            <div class="stats-label">总访客量</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 年度统计图表 -->
    <div class="section-title">
      <i class="el-icon-data-line"></i> 年度统计
      <div class="year-selector">
        <el-select v-model="selectedYear" size="small" @change="onYearChange">
          <el-option
            v-for="year in yearOptions"
            :key="year"
            :label="year + '年'"
            :value="year">
          </el-option>
        </el-select>
      </div>
    </div>
    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card class="chart-card" shadow="hover">
          <div class="chart-wrapper">
            <div id="daily_report" class="chart-item"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card class="chart-card" shadow="hover">
          <div class="chart-wrapper">
            <div id="daily_report_count" class="chart-item"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import axios from "axios";
import global from "@/components/Common";
// import '@/assets/echarts/map/js/china.js'

export default {
  data() {
    const currentYear = new Date().getFullYear()
    // 生成年份选项：从2020年到当前年份
    const yearOptions = []
    for (let y = currentYear; y >= 2020; y--) {
      yearOptions.push(y)
    }
    return {
      serverUrl: global.httpUrl,
      getDateFormat: global.getDateFormat,
      collapsed: false,
      charts: '',
      totalReportCount: 0,
      dailyReportCount: 0,
      yesterdayReportCount: 0,
      userCount: 0,
      totalVisitCount: 0,
      dailyVisitCount: 0,
      yesterdayVisitCount: 0,
      weekVisitCount: 0,
      totalVisitedUser: 0,
      dailyVisitedUser: 0,
      yesterdayVisitedUser: 0,
      weekVisitedUser: 0,
      dailyReportCountList: [],
      dailyReportDateList: [],
      monthsReportCountList: [],
      monthsVisitCountList: [],
      // 年份选择
      selectedYear: currentYear,
      yearOptions: yearOptions,
    };
  },
  //调用
  mounted() {
    document.title = this.$route.meta.title
    this.getDailyReportDateList();
    this.getDailyReportCountList();
    this.getDailyReportCount()
    this.getYesterdayReportCount()
    this.getTotalReportCount()
    this.getUserCount()
    this.getDailyVisitCount()
    this.getYesterdayVisitCount()
    this.getWeekVisitCount()
    this.getTotalVisitCount()
    this.getDailyVisitedUser()
    this.getYesterdayVisitedUser()
    this.getWeekVisitedUser()
    this.getTotalVisitedUser()
    this.getMonthData()
    this.$nextTick(()=>{
      this.initEchartMap();
    })
  },
  methods: {
    //初始化中国地图
    initEchartMap() {
      //let mapDiv = document.getElementById('china_echarts');
      //let myChart = echarts.init(mapDiv);
      //myChart.setOption(this.options);
    },
    getMonthData() {
      let me = this
      axios.all([this.getMonthReportData(), this.getMonthVisitData()])
          .then(axios.spread(function (monthReports, monthVisits) {
            console.log('monthReports:' + monthReports.data)
            console.log('monthVisits:' + monthVisits.data)
            me.monthsReportCountList = monthReports.data || []
            me.monthsVisitCountList = monthVisits.data || []

            // 只有当前年份才截取到当前月份，历史年份显示全年数据
            const currentYear = new Date().getFullYear()
            if (me.selectedYear === currentYear) {
              let thisMonth = new Date().getMonth()
              me.monthsReportCountList = me.monthsReportCountList.slice(0, thisMonth + 1)
              me.monthsVisitCountList = me.monthsVisitCountList.slice(0, thisMonth + 1)
            }

            me.drawPie('daily_report')
      }));
    },

    onYearChange() {
      this.getMonthData()
    },
    getDailyReportDateList() {
      for(let i = 14; i > 0; i--) {
        this.dailyReportDateList.push(this.getDateFormat(new Date(Date.now() - i * 24 * 3600 * 1000)))
      }
    },
    getMonthReportData() {
      return axios({
        method: "GET",
        url: this.serverUrl + "getReportInfoCountListByYear?year=" + this.selectedYear,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
    },
    getMonthVisitData() {
      return axios({
        method: "GET",
        url: this.serverUrl + "getVisitCountByYear?year=" + this.selectedYear,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
    },
    getDailyReportCountList() {
      axios({
        method: "GET",
        url: this.serverUrl + "getReportCountListByDays?days=14",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.dailyReportCountList = res.data
        this.drawDailyCount('daily_report_count')
      }).catch((err) => {
        console.error('获取打卡统计失败:', err)
      })
    },
    getDailyReportCount() {
      axios({
        method: "GET",
        url: this.serverUrl + "getReportInfoByDate?date=" + this.getDateFormat(new Date()),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.dailyReportCount = res.data.length
      }).catch((err) => {
        console.error('获取今日打卡数失败:', err)
      })
    },
    getYesterdayReportCount() {
      axios({
        method: "GET",
        url: this.serverUrl + "getReportInfoByDate?date=" + this.getDateFormat(new Date(Date.now() - 24 * 3600*1000)),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.yesterdayReportCount = res.data.length
      }).catch((err) => {
        console.error('获取昨日打卡数失败:', err)
      })
    },
    getTotalReportCount() {
      axios({
        method: "GET",
        url: this.serverUrl + "getAllReportInfoCount?withUser=false",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.totalReportCount = res.data
      }).catch((err) => {
        console.error('获取总打卡数失败:', err)
      })
    },
    getUserCount() {
      axios({
        method: "GET",
        url: this.serverUrl + "getAll",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.userCount = res.data.length
      }).catch((err) => {
        console.error('获取用户数失败:', err)
      })
    },
    getDailyVisitCount() {
      axios({
        method: "GET",
        url: this.serverUrl + "getVisitCount?date=" + this.getDateFormat(new Date()),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.dailyVisitCount = res.data.count === undefined ? 0 : res.data.count
      }).catch((err) => {
        console.error('获取今日访问量失败:', err)
      })
    },
    getYesterdayVisitCount() {
      axios({
        method: "GET",
        url: this.serverUrl + "getVisitCount?date=" + this.getDateFormat(new Date(Date.now() - 24 * 3600*1000)),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.yesterdayVisitCount = res.data.count === undefined ? 0 : res.data.count
      }).catch((err) => {
        console.error('获取昨日访问量失败:', err)
      })
    },
    getTotalVisitCount() {
      axios({
        method: "GET",
        url: this.serverUrl + "getAllVisitCount",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        // 新API返回格式: {"totalPV": 215259}
        this.totalVisitCount = res.data.totalPV || 0
      }).catch((err) => {
        console.error('获取总访问量失败:', err)
      })
    },

    getDailyVisitedUser() {
      axios({
        method: "GET",
        url: this.serverUrl + "getVisitedUserCount?date=" + this.getDateFormat(new Date()),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.dailyVisitedUser = res.data.length
      }).catch((err) => {
        console.error('获取今日访客量失败:', err)
      })
    },
    getYesterdayVisitedUser() {
      axios({
        method: "GET",
        url: this.serverUrl + "getVisitedUserCount?date=" + this.getDateFormat(new Date(Date.now() - 24 * 3600*1000)),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.yesterdayVisitedUser = res.data.length
      }).catch((err) => {
        console.error('获取昨日访客量失败:', err)
      })
    },
    getTotalVisitedUser() {
      axios({
        method: "GET",
        url: this.serverUrl + "getAllVisitedUserCount",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        // 新API返回格式: {"totalUV": 122958}
        this.totalVisitedUser = res.data.totalUV || 0
      }).catch((err) => {
        console.error('获取总访客量失败:', err)
      })
    },

    getWeekVisitCount() {
      // 获取本周每天的访问量并累加
      const promises = []
      for (let i = 0; i < 7; i++) {
        const date = this.getDateFormat(new Date(Date.now() - i * 24 * 3600 * 1000))
        promises.push(
          axios.get(`${this.serverUrl}getVisitCount?date=${date}`)
            .then(res => res.data.count || 0)
            .catch(() => 0)
        )
      }
      Promise.all(promises).then(counts => {
        this.weekVisitCount = counts.reduce((sum, count) => sum + count, 0)
      })
    },

    getWeekVisitedUser() {
      // 获取本周每天的访客数并累加（注意：这里可能有重复访客，但作为趋势参考）
      const promises = []
      for (let i = 0; i < 7; i++) {
        const date = this.getDateFormat(new Date(Date.now() - i * 24 * 3600 * 1000))
        promises.push(
          axios.get(`${this.serverUrl}getVisitedUserCount?date=${date}`)
            .then(res => res.data.length || 0)
            .catch(() => 0)
        )
      }
      Promise.all(promises).then(counts => {
        this.weekVisitedUser = counts.reduce((sum, count) => sum + count, 0)
      })
    },

    formatNumber(num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万'
      }
      return num
    },

    drawPie(id) {
      // 如果图表已存在，先销毁再重新创建
      const chartDom = document.getElementById(id)
      if (!chartDom) return

      // 销毁旧图表实例
      const existingChart = echarts.getInstanceByDom(chartDom)
      if (existingChart) {
        existingChart.dispose()
      }

      this.charts = echarts.init(chartDom)

      // 根据数据长度生成月份标签
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      const displayMonths = months.slice(0, this.monthsReportCountList.length || 12)

      this.charts.setOption({
        title: {
          text: this.selectedYear + '年度统计'
        },
        xAxis: {
          type: 'category',
          data: displayMonths
        },
        tooltip: {
          trigger: 'axis'
        },
        legend:{
          width:10,
          height:10,
          orient:'horizontal',
          left:'right'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}'
          }
        },
        series: [{
          name: '打卡数',
          type: 'line',
          data: this.monthsReportCountList
        },
          {
            name: '访问量',
            type: 'line',
            data: this.monthsVisitCountList
          }
          ]
      })
    },

    drawDailyCount(id) {
      console.log("this.dailyReportDateList:" + this.dailyReportDateList)
      console.log("this.dailyReportCountList:" + this.dailyReportCountList)
      this.charts = echarts.init(document.getElementById(id))
      this.charts.setOption({
        title: {
          text: '最近两周打卡统计'
        },
        xAxis: {
          type: 'category',
          data: this.dailyReportDateList,
          axisLabel: {
            interval:0,
            rotate:40
          },
        },
        tooltip: {
          trigger: 'axis'
        },
        legend:{
          width:10,
          height:10,
          orient:'horizontal',
          left:'right'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}'
          }
        },
        series: [{
          name: '打卡数',
          type: 'line',
          data: this.dailyReportCountList
        },
        ],
      })
    },
    drawPie2(id) {
      this.charts = echarts.init(document.getElementById(id))
      this.charts.setOption({
        title: {
          text: '立志卡数'
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        },
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value} 万'
          }
        },
        series: [{
          name: '销售额',
          type: 'line',
          stack: '总量',
          itemStyle: {
            normal: {
              color: '#99CCFF',
              lineStyle: {
                color: '#99CCFF'
              }
            }
          },
          data: [11, 15, 14, 14, 17, 12, 13, 12, 20, 15, 9, 12]
        }]
      })
    }
  },
  computed: {
    menuitemClasses: function () {
      return [
        'menu-item',
        this.collapsed ? 'el-collapsed-menu' : ''
      ]
    }
  }
}
</script>

<style scoped="scoped">
.admin-home {
  padding: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin: 20px 0 15px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.year-selector {
  margin-left: auto;
}

.year-selector /deep/ .el-select {
  width: 100px;
}

.year-selector /deep/ .el-input__inner {
  border-radius: 20px;
}

.section-title:first-child {
  margin-top: 0;
}

.stats-row {
  margin-bottom: 10px;
}

.stats-card {
  border-radius: 10px;
  overflow: hidden;
}

.stats-card /deep/ .el-card__body {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.stats-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stats-icon i {
  font-size: 24px;
  color: white;
}

.stats-content {
  flex: 1;
}

.stats-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.stats-label {
  font-size: 13px;
  color: #909399;
  margin-top: 5px;
}

.el-card-big-font {
  font-size: 36px;
  color: #666;
  line-height: 36px;
  padding: 5px 0 10px;
  text-overflow: ellipsis;
  word-break: break-all;
  white-space: nowrap;
  margin-bottom: 5px;
}

/* 图表样式 */
.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 10px;
}

.chart-card /deep/ .el-card__body {
  padding: 15px;
}

.chart-wrapper {
  display: flex;
  justify-content: center;
}

.chart-item {
  width: 100%;
  max-width: 900px;
  height: 300px;
}
</style>