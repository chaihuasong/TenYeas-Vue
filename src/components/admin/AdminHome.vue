<template>
  <div>
    <el-row style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card style="width:250px; height: 140px;">
          <div class="el-card-list">
            <p><span class="el-card-big-font">2,029</span></p>
            <p style="font-size: 14px;padding-top: 10px;">
              总打卡数
            </p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card style="width:250px; height: 140px;">
          <p><span class="el-card-big-font">13,900</span></p>
          <p style="font-size: 14px;padding-top: 10px;">今日打卡</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card style="width:250px; height: 140px;">
          <p><span class="el-card-big-font">2,803</span></p>
          <p style="font-size: 14px;padding-top: 10px;">今日访客<span class="el-card-:span-el-color"></span>
          </p>
        </el-card>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="11">
        <el-card style="width:1066px; height: 350px;">
          <div id="main" :style="{width:'500px',height: '300px'}" style="float: left;"></div>
          <div id="echarts" :style="{width:'500px', height: '300px'}" style="float: left;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import echarts from 'echarts'

export default {
  data() {
    return {
      collapsed: false,
      charts: ''
    };
  },
  methods: {
    drawPie(id) {
      this.charts = echarts.init(document.getElementById(id))
      this.charts.setOption({
        title: {
          text: '每月销售量'
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
            formatter: '{value} 台'
          }
        },
        series: [{
          name: '销售量',
          type: 'line',
          data: [108, 133, 136, 101, 155, 113, 125, 100, 181, 128, 79, 131]
        }]
      })
    },
    drawPie2(id) {
      this.charts = echarts.init(document.getElementById(id))
      this.charts.setOption({
        title: {
          text: '每月销售额'
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
  //调用
  mounted() {
    this.$nextTick(function () {
      this.drawPie('main')
      this.drawPie2('echarts')
    })
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