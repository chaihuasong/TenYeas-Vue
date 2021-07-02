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

    <div style="font-size: 18px;font-weight: bold;float: left;margin-left: 10px;margin-bottom: 5px">数据汇总</div>
    <el-card style="width: 100%;margin-top: 10px;margin-bottom: 10px">
      <div v-for="(item, index) in mergedResultList" v-bind:key='index'
           style="float: left;font-size: 18px;margin-left: 20%;margin-right: 20%;margin-bottom: 5px">
        {{index + 1}}.
        {{mergedResultList[index].split('_')[0]}}
        <span  style="font-size: 22px;color: #66b1ff">{{mergedResultValueList[index]}}</span>
        {{mergedResultList[index].split('_')[1]}}
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
        //if (name === '家人陪伴') continue
        value['name'] = name
        value['type'] = 'line'
        value['data'] = this.last7DaysReportValue[i]
        series.push(value)
      }
      this.charts.setOption({
        title: {
          text: '最近7天统计'
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
      console.log('last7DaysDate:' + this.last7DaysDate)
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
        console.log("getById: res:" + res.data)
        if (res.data != null && res.data !== '') {
          console.log("getById res:" + res)
          console.log("getById res.data:" + res.data)
          let downloadTemplateList = []
          let totalValueList = []
          let templateList = []
          let last7DaysTemplateIndexList = []

          let currentDate = this.getDateFormat(new Date())
          let monthDate = currentDate.substr(0, currentDate.lastIndexOf('-') + 1)
          this.totalReportList = res.data
          this.totalReportCount = this.totalReportList.length
          for (let i = 0; i < this.totalReportCount; i++) {
            let tempId = this.totalReportList[i].templateId
            this.templateIdList.push(tempId)
            let reportItem = this.totalReportList[i]
            let index = downloadTemplateList.indexOf(tempId)

            if (reportItem.date.startsWith(monthDate)) {
              this.currentMonthReportCount++
            }
            if (index < 0) {
              downloadTemplateList.push(tempId)
              totalValueList.push(reportItem)
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
              }
              totalValueList[index] = totalItem
            }

            //获取过去7天数据
            for (let j = 0; j < this.last7DaysDate.length; j++) {
              if (reportItem.date === this.last7DaysDate[j]) {
                this.last7DaysReportList.push(reportItem)
                this.last7DaysReportedDate.push(reportItem.date)
                last7DaysTemplateIndexList.push(downloadTemplateList.indexOf(reportItem.templateId))
                console.log(reportItem.templateId + " " + reportItem.date + " downloadTemplateList.indexOf(reportItem.templateId):" + downloadTemplateList.indexOf(reportItem.templateId))
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
                  for (let j = 0; j < templateList.length; j++) {
                    let value = valueItem['value' + (j + 1)]
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
                      _this.mergedResultValueList.push(valueItem['value' + (j + 1)])
                    } else {
                      //合并操作
                      let index = _this.mergedResultList.indexOf(templateList[j])
                      _this.mergedResultValueList[index] = parseInt(_this.mergedResultValueList[index]) + parseInt(valueItem['value' + (j + 1)])
                    }
                  }
                }
                // console.log("_this.last7DaysReportList:" + _this.last7DaysReportList.length)
                // console.log(last7DaysTemplateIndexList)
                let last7DaysTemplateMergedList = []
                let last7DaysTemplateList = []
                for (let i = 0; i < last7DaysTemplateIndexList.length; i++) {
                  let template = resArray[last7DaysTemplateIndexList[i]]
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
                      // console.log(_this.last7DaysDate[j] + " reportIndex:" + reportIndex + " template:" + template)
                    }
                  }
                  _this.last7DaysReportValue[i] = value
                }

                for (let i = 0; i < last7DaysTemplateMergedList.length; i++) {
                  _this.last7DaysReportTemplateList[i] = last7DaysTemplateMergedList[i].split('_')[0]
                  _this.last7DaysReportUnitList[i] = last7DaysTemplateMergedList[i].split('_')[1]
                }
                console.log(_this.last7DaysReportTemplateList)
                console.log(_this.last7DaysReportUnitList)
                console.log(_this.last7DaysReportValue)
                console.log(_this.last7DaysDate)
                console.log(_this.last7DaysReportedDate)

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

/deep/ .el-radio {
  white-space: normal;
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

.el-dropdown-link {
  cursor: pointer;
  color: #8c939d;
}

.el-icon-arrow-down {
  font-size: 16px;
}

.inputStyle {
  border-left-width: 0;
  border-top-width: 0;
  border-right-width: 0;
  border-bottom-width: 0;
  border-bottom-color: lightgray;
  width: 100%;
  height: auto;
  font-size: 16px;
  text-align: left;
  color: #8c939d;
  margin: 0 0;
  padding: 0 0;
  -webkit-appearance: none;
  border-radius: 0;
}

.multiLineInputStyle {
  border-left-width: 0;
  border-top-width: 0;
  border-right-width: 0;
  border-bottom-width: 0;
  border-bottom-color: lightgray;
  width: 100%;
  height: auto;
  font-size: 16px;
  text-align: left;
  color: #8c939d;
  -webkit-appearance: none;
  border-radius: 0;
}

.confirmButtonClass {
  float: right;
  margin-right: 15%;
  width: 80px;
}
</style>
