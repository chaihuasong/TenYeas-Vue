<template>
  <div>

    <el-card style="float: left; width: 100%;margin-top: 10px">
      <span style="font-weight: bold">您已累计坚持打卡</span>
      <span style="font-weight:bold;font-size: 22px;color: #66b1ff">{{ this.totalReportCount }}</span> 天
      <br/>
      <br/>
      <span style="font-weight: bold">本月已打卡</span>
      <span style="font-weight:bold;font-size: 22px;color: #66b1ff">{{ this.currentMonthReportCount }}</span> 天
      <br/>
    </el-card>

    <el-card style="float: left; width: 100%;margin-top: 10px">
      <div v-for="(item, index) in mergedResultReportList" v-bind:key='index'
           style="float: left;font-size: 18px;margin-left: 20%;margin-right: 20%">
        {{index + 1}}.
        {{mergedResultList[index].split('_')[0]}}
        <span  style="font-size: 22px;color: #66b1ff">{{mergedResultValueList[index]}}</span>
        {{mergedResultList[index].split('_')[1]}}
      </div>
      <br/>
    </el-card>

    <div style="margin-bottom: 150px"/>
  </div>
</template>

<script>
import axios from 'axios'
import global from "@/components/Common";

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
      mergedResultReportList: [],
      mergedResultList: [],
      mergedResultValueList: [],
    };
  },
  mounted: function () {
    document.title = this.$route.meta.title
    console.log("myHome getData")
    this.getData()
  },
  methods: {
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
        url: this.serverUrl + "getReportInfoListById?userId=oJuR60ziKywhvpvU997867RqJT0E",// + this.unionid,
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
          let templateIndexList = []

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
                if (reportItem['value' + i] === null || reportItem['value' + i] === '' || reportItem['value' + i] === undefined) {
                  totalItem['value' + i] = tempItem['value' + i]
                  continue
                }
                totalItem['value' + i] = (tempItem['value' + i] === null || tempItem['value' + i] === '' || tempItem['value' + i] === undefined) ? 0 : parseInt(tempItem['value' + i]) + parseInt(reportItem['value' + i])
              }
              totalValueList[index] = totalItem
            }
            templateIndexList.push(downloadTemplateList.length - 1)
          }
          let urlArray = []
          for (let i = 0; i < downloadTemplateList.length; i++) {
            urlArray.push(this.serverUrl + "getReportTemplateById?id=" + downloadTemplateList[i])
          }
          let promiseArray = urlArray.map(url => axios.get(url));
          console.log("urlArray:" + urlArray)
          console.log("promiseArray:" + promiseArray)
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
                for (let i = 0; i < _this.mergedResultList.length; i++) {
                  let item = _this.mergedResultList[i].split('_')[0] + _this.mergedResultValueList[i] + _this.mergedResultList[i].split('_')[1]
                  _this.mergedResultReportList.push(item)
                }
                console.log("mergedResultReportList------->" + _this.mergedResultReportList)
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
