<template>
  <div>
    <div style="font-size: 18px;font-weight: bold;float: left;margin-left: 10px;margin-bottom: 5px">总览</div>
    <el-card style="width: 100%;margin-top: 10px;margin-bottom: 20px">
      <span style="font-weight: bold">您已累计坚持打卡</span>
      <span style="font-weight:bold;font-size: 22px;color: #66b1ff;margin-left: 5px">{{ this.totalReportCount }}</span> 天
      <br/>
      <span style="font-weight: bold">本月已打卡</span>
      <span style="font-weight:bold;font-size: 22px;color: #66b1ff;margin-left: 5px">{{ this.currentMonthReportCount }}</span> 天
      <br/>
    </el-card>

    <div id="statistics_charts" :style="{width:'100%',height: '280px'}"></div>

    <div style="font-size: 18px;font-weight: bold;float: left;margin-left: 10px;margin-bottom: 5px">最近7日汇总</div>
    <el-card style="width: 100%;margin-top: 10px;margin-bottom: 10px">
            <div v-for="(item, index) in last7DaysTotalList" v-bind:key='index'
                 style="float: left;font-size: 18px;margin-left: 15%;margin-right: 15%;margin-bottom: 5px">
              <span v-if="last7DaysTotalList[index] > 0">
                {{last7DaysReportTemplateList[index]}}
                <span v-if="last7DaysTotalList[index] < 100" style="font-size: 22px;color: #c4d363">{{last7DaysTotalList[index]}}</span>
                <span v-if="last7DaysTotalList[index] >= 100 && last7DaysTotalList[index] < 200" style="font-size: 22px;color: #42832d">{{last7DaysTotalList[index]}}</span>
                <span v-if="last7DaysTotalList[index] >= 200 && last7DaysTotalList[index] < 300" style="font-size: 22px;color: #f37b7b">{{last7DaysTotalList[index]}}</span>
                <span v-if="last7DaysTotalList[index] >= 300 && last7DaysTotalList[index] < 500" style="font-size: 22px;color: #f30b95">{{last7DaysTotalList[index]}}</span>
                <span v-if="last7DaysTotalList[index] > 500" style="font-size: 22px;color: #3d0627">{{last7DaysTotalList[index]}}</span>
                {{ last7DaysReportUnitList[index]}}
              </span>
            </div>
    </el-card>

    <div style="font-size: 18px;font-weight: bold;float: left;margin-left: 10px;margin-bottom: 5px">历史汇总</div>
    <el-card style="width: 100%;margin-top: 10px;margin-bottom: 10px">
<!--      <span style="color:lightgray">敬请期待..</span>-->
      <div v-for="(item, index) in mergedResultList" v-bind:key='index'
           style="float: left;font-size: 18px;margin-left: 10%;margin-right: 10%;margin-bottom: 5px">
        <span v-if="item.split('_')[0] !== '七分饱' && mergedResultValueList[index] > 0">
          {{item.split('_')[0]}}
          <span v-if="mergedResultValueList[index] < 100" style="font-size: 22px;color: #c4d363">{{mergedResultValueList[index]}}</span>
          <span v-if="mergedResultValueList[index] >= 100 && mergedResultValueList[index] < 500" style="font-size: 22px;color: #42832d">{{mergedResultValueList[index]}}</span>
          <span v-if="mergedResultValueList[index] >= 500 && mergedResultValueList[index] < 1000" style="font-size: 22px;color: #f37b7b">{{mergedResultValueList[index]}}</span>
          <span v-if="mergedResultValueList[index] >= 1000 && mergedResultValueList[index] < 5000" style="font-size: 22px;color: #b76666">{{mergedResultValueList[index]}}</span>
          <span v-if="mergedResultValueList[index] >= 5000 && mergedResultValueList[index] < 10000" style="font-size: 22px;color: #f30b95">{{mergedResultValueList[index]}}</span>
          <span v-if="mergedResultValueList[index] >= 10000" style="font-size: 22px;color: #3d0627">{{mergedResultValueList[index]}}</span>
          {{ item.split('_')[0] === '早睡' || item.split('_')[0] === '早起' ? '天' : item.split('_')[1] }}
        </span>
      </div>
    </el-card>

    <div style="margin-bottom: 100px"/>
  </div>
</template>

<script>
import axios from 'axios'
import global from "@/components/Common";
import * as echarts from "echarts";

export default {
  name: 'TenYears',
  props: {
    msg: String
  },
  data() {
    return {
      serverUrl: global.httpUrl,
      currentMonthReportCount: 0,
      totalReportCount: 0,
      totalReportList: [],
      templateIdList: [],
      mergedResultList: [],
      mergedResultValueList: [],
      last7DaysDate: [],
      last7DaysReportedDate: [],
      last7DaysReportList: [],
      last7DaysReportTemplateList: [],
      last7DaysReportUnitList: [],
      last7DaysReportValue: [],
      last7DaysTotalList: [],//过去7日汇总
    };
  },
  mounted: function () {
    document.title = this.$route.meta.title
    console.log("myHome getData")
    this.initData()
    this.getData()
  },
  methods: {
    drawPie(id) {
      this.charts = echarts.init(document.getElementById(id))
      let xAxis = []
      for (let i= 0; i < this.last7DaysDate.length; i++) {
        let date = this.last7DaysDate[i]
        xAxis.push(date.substring(date.indexOf('-') + 1).replace('-', '/'))
      }
      let series = []
      for (let i = 0; i < this.last7DaysReportValue.length; i++) {
        let value = {}
        let name = this.last7DaysReportTemplateList[i]
        if (name === '七分饱') continue
        value['name'] = name
        value['type'] = 'line'
        value['data'] = this.last7DaysReportValue[i]
        series.push(value)
      }
      this.charts.setOption({
        title: {
          text: '最近7日统计'
        },
        xAxis: {
          type: 'category',
          data: xAxis,
          axisLabel: {
            interval:0,
            rotate:40
          },
        },
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '36%',
          containLabel: true
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}'
          }
        },
        series: series,
        legend:{
          show: true,
          top: "12%",
          orient: 'horizontal',
        }
      })
    },
    initData() {
      for (let i = 7; i > 0; i--) {
        let date = this.getDateFormat(new Date(Date.now() - i * 24 * 60 * 60 * 1000))
        this.last7DaysDate.push(date)
      }
    },
    getDateFormat(date) {
      let year = date.getFullYear()
      let month = date.getMonth() + 1
      if (month < 10) month = '0' + month
      let day = date.getDate()
      if (day < 10) day = '0' + day
      return year + "-" + month + "-" + day
    },
    getData() {
      this.unionid = this.$store.getters.getUnionid
      if (this.unionid != null) {
        this.unionid = this.unionid.replace("\"", "").replace("\"", "")
      }
      let _this = this
      console.log("getData unionid:" + this.unionid)
      axios({
        method: "GET",
        url: this.serverUrl + "getReportInfoListById?userId=" + this.unionid,
        data: null,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        //console.log("getById: res:" + res.data)
        //首先从服务器端获取所有当前用户的ReportInfo列表
        if (res.data != null && res.data !== '') {
          console.log("getById res.data:" + res.data.length)
          //需要下载的模板列表
          let downloadTemplateList = []
          let totalValueList = []
          let templateList = []
          let last7DaysTemplateIndexList = []

          let currentDate = this.getDateFormat(new Date())
          let monthDate = currentDate.substr(0, currentDate.lastIndexOf('-') + 1)
          this.totalReportList = res.data
          this.totalReportCount = this.totalReportList.length
          //循环遍历当前用户所有的打卡信息
          for (let i = 0; i < this.totalReportCount; i++) {
            let tempId = this.totalReportList[i].templateId
            this.templateIdList.push(tempId)
            let reportItem = this.totalReportList[i]
            let index = downloadTemplateList.indexOf(tempId)

            if (reportItem.date.startsWith(monthDate)) {
              //统计当月打卡数据
              this.currentMonthReportCount++
            }
            if (index < 0) {
              //需要从服务器下载的模板，模板变更都走这里
              downloadTemplateList.push(tempId)
              totalValueList.push(reportItem)
              console.log("reportItem:" + reportItem.date)
            } else {
              //累加操作
              let tempItem = totalValueList[index]
              let totalItem = {}
              for (let i = 1; i <= 20; i++) {
                //可能包含'+'号
                let tmp = tempItem['value' + i]
                if (tmp !== null && tmp.toString().indexOf('+') > 0) {
                  tmp = parseInt(tmp.split('+')[0]) + parseInt(tmp.split('+')[1])
                  tempItem['value' + i] = tmp
                }
                if (reportItem['value' + i] === null || reportItem['value' + i] === '' || reportItem['value' + i] === undefined) {
                  totalItem['value' + i] = tempItem['value' + i]
                  continue
                }
                //可能包含'+'号
                let tmpReportItem = reportItem['value' + i]
                if (tmpReportItem !== null && tmpReportItem.toString().indexOf('+') > 0) {
                  tmpReportItem = parseInt(tmpReportItem.split('+')[0]) + parseInt(tmpReportItem.split('+')[1])
                  reportItem['value' + i] = tmpReportItem
                }
                totalItem['value' + i] = (tempItem['value' + i] === null || tempItem['value' + i] === '' || tempItem['value' + i] === undefined) ? 0 : parseInt(tempItem['value' + i]) + parseInt(reportItem['value' + i])

                // console.log("totalItem[value" + i + "]:" + totalItem['value' + i])
              }
              totalValueList[index] = totalItem
            }

            //获取过去7天数据
            for (let j = 0; j < this.last7DaysDate.length; j++) {
              if (reportItem.date === this.last7DaysDate[j]) {
                this.last7DaysReportList.push(reportItem)
                this.last7DaysReportedDate.push(reportItem.date)
                // console.log("----" + this.last7DaysReportList.length + "-----" + this.last7DaysReportedDate.length + "------------" + reportItem.templateId + "-------" + reportItem.value1)
                last7DaysTemplateIndexList.push(downloadTemplateList.indexOf(reportItem.templateId))
                // console.log(reportItem.templateId + " " + reportItem.date + " downloadTemplateList.indexOf(reportItem.templateId):" + downloadTemplateList.indexOf(reportItem.templateId) + " templateID:" + downloadTemplateList[downloadTemplateList.indexOf(reportItem.templateId)])
              }
            }
          }
          let urlArray = []
          for (let i = 0; i < downloadTemplateList.length; i++) {
            if (downloadTemplateList[i] !== null && downloadTemplateList[i] !== '' && downloadTemplateList[i] !== undefined) {
              urlArray.push(this.serverUrl + "getReportTemplateById?id=" + downloadTemplateList[i])
            }
          }
          let promiseArray = urlArray.map(url => axios.get(url));
          console.log("urlArray:" + urlArray)
          console.log("promiseArray:" + promiseArray)
          console.log("downloadTemplateList:" + downloadTemplateList)
          console.log("last7DaysTemplateIndexList:" + last7DaysTemplateIndexList)
          axios.all(promiseArray)
              .then(function (results) {
                let resArray = results.map(r => r.data)
                console.log(resArray)
                for (let i = 0; i < resArray.length; i++) {
                  templateList = resArray[i]
                  let valueItem = totalValueList[i]
                  console.log("templateList:" + templateList + " templateList.length:" + templateList.length)
                  for (let j = 0; j < templateList.length; j++) {
                    let value = valueItem['value' + (j + 1)]
                    // console.log("valueItem[value" + (j + 1) + "]:" + value)
                    if (value === null || value === '' || value === undefined) continue
                    if (templateList[j] === null || templateList[j] === '' || templateList[j] === undefined) continue
                    if (templateList[j] === '禅坐_分钟') templateList[j] = '静坐_分钟'

                    // 可能包含'+'号
                    let tmp = valueItem['value' + (j + 1)]
                    if (tmp !== null && tmp.toString().indexOf('+') > 0) {
                      tmp = parseInt(tmp.split('+')[0]) + parseInt(tmp.split('+')[1])
                      valueItem['value' + (j + 1)] = tmp
                    }
                    if (_this.mergedResultList.length === 0 || _this.mergedResultList.indexOf(templateList[j]) < 0) {
                      _this.mergedResultList.push(templateList[j])
                      // console.log("!!!" + _this.mergedResultValueList.length)
                      _this.mergedResultValueList.push(valueItem['value' + (j + 1)])
                      // console.log("!!!" + _this.mergedResultValueList.length)
                      // console.log("!!!" + _this.mergedResultValueList[_this.mergedResultValueList.length - 1])
                    } else {
                      //合并操作
                      let index = _this.mergedResultList.indexOf(templateList[j])
                      _this.mergedResultValueList[index] = parseInt(_this.mergedResultValueList[index]) + parseInt(valueItem['value' + (j + 1)])
                      //console.log("---" + _this.mergedResultValueList[index])
                    }
                  }
                }
                // console.log("_this.last7DaysReportList:" + _this.last7DaysReportList.length)
                // console.log(last7DaysTemplateIndexList)
                let last7DaysTemplateMergedList = []
                let last7DaysTemplateList = []
                for (let i = 0; i < last7DaysTemplateIndexList.length; i++) {
                  let template = resArray[last7DaysTemplateIndexList[i]]
                  //这里出现过未-1数组越界导致近7天数据不显示的情况 -->这里的逻辑可能需要再梳理一下
                  if (template === undefined) {
                    template = resArray[last7DaysTemplateIndexList[i] - 1]
                  }
                  // console.log("template:" + template)
                  for (let j = 0; template !== undefined && j < template.length; j++) {
                    if (last7DaysTemplateMergedList.indexOf(template[j]) < 0) {
                      last7DaysTemplateMergedList.push(template[j])
                    }
                  }
                  last7DaysTemplateList[i] = template
                }
                // console.log("last7DaysTemplateMergedList:" + last7DaysTemplateMergedList)
                // console.log("last7DaysTemplateList:" + last7DaysTemplateList.length)
                // console.log("last7DaysTemplateList:" + last7DaysTemplateList)
                // console.log(_this.last7DaysReportValue)
                for (let i = 0; i < last7DaysTemplateMergedList.length; i++) {
                  //初始化
                  let value = []
                  for (let j = 0; j < _this.last7DaysDate.length; j++) {
                    value[j] = '0'
                  }
                  _this.last7DaysReportValue[i] = value
                }

                for (let i = 0; i < last7DaysTemplateMergedList.length; i++) {
                  let value = _this.last7DaysReportValue[i]
                  for (let j = 0; j < _this.last7DaysDate.length; j++) {
                    let reportIndex = _this.last7DaysReportedDate.indexOf(_this.last7DaysDate[j])
                    //说明有功课汇报
                    if (reportIndex >= 0) {
                      // console.log(_this.last7DaysDate[j] + ' reportIndex ' + reportIndex)
                      let reportInfo = _this.last7DaysReportList[reportIndex]
                      let dayIndex = _this.last7DaysDate.indexOf(_this.last7DaysDate[j])
                      if (last7DaysTemplateList[reportIndex] === undefined) continue
                      let templateIndex = last7DaysTemplateList[reportIndex].indexOf(last7DaysTemplateMergedList[i])
                      // console.log(last7DaysTemplateMergedList[i] + ' templateIndex ' + templateIndex)
                      if (templateIndex >= 0) {
                        let val = reportInfo['value' + (templateIndex + 1)]
                        if (val === null || val === '' || val ===undefined) {
                          val = '0'
                        }
                        value[dayIndex] = val
                      }
                       // console.log(dayIndex + " reportIndex:" + reportIndex + " value[dayIndex]:" + value[dayIndex])
                    }
                  }
                  _this.last7DaysReportValue[i] = value
                }
                console.log("last7DaysTemplateMergedList:" + last7DaysTemplateMergedList)

                for (let i = 0; i < last7DaysTemplateMergedList.length; i++) {
                  _this.last7DaysReportTemplateList[i] = last7DaysTemplateMergedList[i].split('_')[0]
                  _this.last7DaysReportUnitList[i] = last7DaysTemplateMergedList[i].split('_')[1]
                }
                console.log("......end.....")
                console.log(_this.last7DaysReportTemplateList)
                console.log(_this.last7DaysReportUnitList)
                console.log(_this.last7DaysReportValue)
                console.log(_this.last7DaysDate)
                console.log(_this.last7DaysReportedDate)

                //新增7日汇总功能
                for (let i = 0; i < _this.last7DaysReportValue.length; i++) {
                  let val = 0;
                  for (let j = 0; j < _this.last7DaysReportValue[i].length; j++) {
                    if (_this.last7DaysReportValue[i][j] !== null && _this.last7DaysReportValue[i][j] !== undefined) {
                      val += parseInt(_this.last7DaysReportValue[i][j]);
                    }
                  }
                  _this.last7DaysTotalList.push(val)
                }
                console.log("last7DaysTotalList:" + _this.last7DaysTotalList)

                _this.drawPie('statistics_charts')
              })
        } else {
          this.$message.warning("未查到任何数据！")
        }
      });
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

img {
  pointer-events: none;
}

* {
  -webkit-touch-callout: none; /*系统默认菜单被禁用*/
  -webkit-user-select: none; /*webkit浏览器*/
  -khtml-user-select: none; /*早期浏览器*/
  -moz-user-select: none; /*火狐*/
  -ms-user-select: none; /*IE10*/
  user-select: none;
}

input, textarea {
  -webkit-user-select: auto; /*webkit浏览器*/
  outline: none;
}

a {
  color: #42b983;
}

</style>
