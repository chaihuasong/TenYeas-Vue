<template>
  <div>
    <el-row style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card style="width:250px; height: 140px;">
          <div class="el-card-list">
            <p><span class="el-card-big-font">{{ yesterdayReportCount }}</span></p>
            <p style="font-size: 14px;padding-top: 10px;">
              昨日打卡数
            </p>
          </div>
        </el-card>
      </el-col>
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

    <el-row style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card style="width:250px; height: 140px;">
          <div class="el-card-list">
            <p><span class="el-card-big-font">{{ yesterdayVisitCount }}</span></p>
            <p style="font-size: 14px;padding-top: 10px;">
              昨日访问量
            </p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card style="width:250px; height: 140px;">
          <div class="el-card-list">
            <p><span class="el-card-big-font">{{ dailyVisitCount }}</span></p>
            <p style="font-size: 14px;padding-top: 10px;">
              今日访问量
            </p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card style="width:250px; height: 140px;">
          <p><span class="el-card-big-font">{{ totalVisitCount }}</span></p>
          <p style="font-size: 14px;padding-top: 10px;">总访问量</p>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card style="width:250px; height: 140px;">
          <div class="el-card-list">
            <p><span class="el-card-big-font">{{ yesterdayVisitedUser }}</span></p>
            <p style="font-size: 14px;padding-top: 10px;">
              昨日访客量
            </p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card style="width:250px; height: 140px;">
          <div class="el-card-list">
            <p><span class="el-card-big-font">{{ dailyVisitedUser }}</span></p>
            <p style="font-size: 14px;padding-top: 10px;">
              今日访客量
            </p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card style="width:250px; height: 140px;">
          <p><span class="el-card-big-font">{{ totalVisitedUser }}</span></p>
          <p style="font-size: 14px;padding-top: 10px;">总访客量</p>
        </el-card>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="12">
        <el-card style="width:1066px; height: 350px;">
          <div id="daily_report" :style="{width:'500px',height: '300px'}" style="float: left;"></div>
          <div id="echarts" :style="{width:'500px', height: '300px'}" style="float: left;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card style="width:1066px; height: 350px;">
          <div id="china" :style="{width:'500px',height: '300px'}" style="float: left;"></div>
          <div id="china_echarts" :style="{width:'500px', height: '300px'}" style="float: left;"></div>
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
      totalVisitedUser: 0,
      dailyVisitedUser: 0,
      yesterdayVisitedUser: 0,
      monthsReportCountList: [],
      monthsVisitCountList: [],
    };
  },
  //调用
  mounted() {
    document.title = this.$route.meta.title
    this.getDailyReportCount()
    this.getYesterdayReportCount()
    this.getTotalReportCount()
    this.getUserCount()
    this.getDailyVisitCount()
    this.getYesterdayVisitCount()
    this.getTotalVisitCount()
    this.getDailyVisitedUser()
    this.getYesterdayVisitedUser()
    this.getTotalVisitedUser()
    this.getMonthData()
    this.$nextTick(()=>{
      this.initEchartMap();
    })
    // this.drawPie2('echarts')
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
            let thisMonth = new Date().getMonth()
            me.monthsReportCountList = monthReports.data
            me.monthsReportCountList.splice(thisMonth + 1, 12 - thisMonth)
            me.monthsVisitCountList = monthVisits.data
            me.monthsVisitCountList.splice(thisMonth + 1, 12 - thisMonth)
            me.drawPie('daily_report')
      }));
    },
    getMonthReportData() {
      return axios({
        method: "GET",
        url: this.serverUrl + "getReportInfoCountListByYear?year=" + new Date().getFullYear(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
    },
    getMonthVisitData() {
      return axios({
        method: "GET",
        url: this.serverUrl + "getVisitCountByYear?year=" + new Date().getFullYear(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
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
    getYesterdayReportCount() {
      axios({
        method: "GET",
        url: this.serverUrl + "getReportInfoByDate?date=" + this.getDateFormat(new Date(Date.now() - 24 * 3600*1000)),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.yesterdayReportCount = res.data.length
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
    getDailyVisitCount() {
      axios({
        method: "GET",
        url: this.serverUrl + "getVisitCount?date=" + this.getDateFormat(new Date()),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.dailyVisitCount = res.data.count === undefined ? 0 : res.data.count
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
        for (let i = 0; i < res.data.length; i++) {
          this.totalVisitCount += res.data[i].count
        }
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
        this.totalVisitedUser = res.data.length
      })
    },

    drawPie(id) {
      this.charts = echarts.init(document.getElementById(id))
      this.charts.setOption({
        title: {
          text: new Date().getFullYear() + '年度统计'
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
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