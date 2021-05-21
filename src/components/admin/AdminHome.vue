<template>
  <div>
    <el-row style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card style="width:250px; height: 140px;">
          <div class="el-card-list">
            <p><span class="el-card-big-font">{{ dailyReportCount }}</span></p>
            <p style="font-size: 14px;padding-top: 10px;">
              今日打卡数
            </p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card style="width:250px; height: 140px;">
          <p><span class="el-card-big-font">{{ totalReportCount }}</span></p>
          <p style="font-size: 14px;padding-top: 10px;">总打卡数</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card style="width:250px; height: 140px;">
          <p><span class="el-card-big-font"> {{ userCount }} </span></p>
          <p style="font-size: 14px;padding-top: 10px;">立志卡填写数<span class="el-card-:span-el-color"></span>
          </p>
        </el-card>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="11">
        <el-card style="width:1066px; height: 350px;">
          <div id="daily_report" :style="{width:'500px',height: '300px'}" style="float: left;"></div>
          <div id="echarts" :style="{width:'500px', height: '300px'}" style="float: left;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import axios from "axios";
import global from "@/components/Common";

export default {
  data() {
    return {
      serverUrl: global.httpUrl,
      getDateFormat: global.getDateFormat,
      collapsed: false,
      charts: '',
      totalReportCount: 0,
      dailyReportCount: 0,
      userCount: 0,
      monthsReportCountList: [],
    };
  },
  //调用
  mounted() {
    this.getDailyReportCount()
    this.getTotalReportCount()
    this.getUserCount()
    this.getMonthData()
    // this.drawPie2('echarts')
  },
  methods: {
    getMonthData() {
      axios({
        method: "GET",
        url: this.serverUrl + "getReportInfoCountListByYear?year=" + new Date().getFullYear(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        console.log(res.data)
        this.monthsReportCountList = res.data
        this.drawPie('daily_report')
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
      })
    },
    getTotalReportCount() {
      axios({
        method: "GET",
        url: this.serverUrl + "getAllReportInfo",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.totalReportCount = res.data.length
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
      })
    },
    drawPie(id) {
      this.charts = echarts.init(document.getElementById(id))
      console.log("draw..." + this.dailyReportCount)
      this.charts.setOption({
        title: {
          text: '打卡数'
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
            formatter: '{value}'
          }
        },
        series: [{
          name: '统计',
          type: 'line',
          data: this.monthsReportCountList
        }]
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
.el-card-big-font {
  font-size: 36px;
  el-color: #666;
  line-height: 36px;
  padding: 5px 0 10px;
  text-overflow: ellipsis;
  word-break: break-all;
  white-space: nowrap;
  margin-bottom: 5px;
}
</style>