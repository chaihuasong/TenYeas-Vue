<template>
  <div>

    <el-card style="float: left; width: 100%;margin-top: 10px">
      <span style="font-weight: bold">您已累计坚持打卡</span>
      <span style="font-weight:bold;font-size: 22px;color: #66b1ff">{{this.totalReportCount}}</span> 天
      <br/>
      <br/>
      <span style="font-weight: bold">本月已打卡</span>
      <span style="font-weight:bold;font-size: 22px;color: #66b1ff">{{this.currentMonthReportCount}}</span> 天
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
    };
  },
  mounted: function () {
    document.title = this.$route.meta.title
    console.log("myHome getData")
    this.getData()
  },
  methods: {
    getData() {
      this.unionid = this.$store.getters.getUnionid
      if (this.unionid != null) {
        this.unionid = this.unionid.replace("\"", "").replace("\"", "")
      }
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
          let templateList = []
          let templateIndexList = []
          this.totalReportList = res.data
          this.totalReportCount = this.totalReportList.length
          for (let i = 0; i < this.totalReportCount; i++) {
            console.log(this.totalReportList[i])
            let tempId = this.totalReportList[i].templateId
            this.templateIdList.push(tempId)
            let contains = false
            if (downloadTemplateList.length > 0) {
              for (let i = 0; i < downloadTemplateList.length; i++) {
                if (downloadTemplateList[i] === tempId) {
                  contains = true
                }
              }
            }
            if (!contains) {
              downloadTemplateList.push(tempId)
            }
            templateIndexList.push(downloadTemplateList.length - 1)
          }
          console.log("this.templateIdList:" + this.templateIdList)
          console.log("downloadTemplateList:" + downloadTemplateList)
          let urlArray = []
          for (let i = 0; i < downloadTemplateList.length; i++) {
            urlArray.push(this.serverUrl + "getReportTemplateById?id=" + downloadTemplateList[i])
          }
          console.log("urlArray:" + urlArray)
          let promiseArray = urlArray.map(url => axios.get(url));
          console.log("urlArray:" + urlArray)
          console.log("promiseArray:" + promiseArray)
          axios.all(promiseArray)
              .then(function(results) {
                let resArray = results.map(r => r.data)
                console.log(resArray)
                console.log("templateIndexList:" + templateIndexList)
                for (let i = 0; i < templateIndexList.length; i++) {
                  templateList = resArray[templateIndexList[i]]
                  console.log("templateList:" + templateList)
                }
                console.log("\n")
                console.log("\n")
                console.log("\n")
                console.log("\n")
                console.log("\n")
                console.log("\n")
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
  border-left-width:0;
  border-top-width:0;
  border-right-width:0;
  border-bottom-width:0;
  border-bottom-color:lightgray;
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
  border-left-width:0;
  border-top-width:0;
  border-right-width:0;
  border-bottom-width:0;
  border-bottom-color:lightgray;
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
