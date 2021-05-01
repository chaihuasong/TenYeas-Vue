<template>
  <div>
    <div style="background: #303133;height: 200px">
      <el-image
          style="width: 60px; height: 60px;border-radius:50%;float: left;margin-left: 10%;margin-top: 60px"
          :src="this.headimgurl"
          :preview-src-list="[this.headimgurl.substr(0, this.headimgurl.lastIndexOf('/')) + '/0']"
          fit="cover" />
      <div style="float: left;color: white;font-weight: bold;margin-top: 100px">{{this.nickname}}</div>
      <div style="float: right;color: white;font-weight: bold;margin-top: 20px;margin-right: 20px"><i class="el-icon-edit" @click="edit"></i></div>
      <div style="float: left;margin-top:25px;color: white;width: 100%;font-size: 15px;font-weight: bold;">十年倒计时： <span style="color: red;font-size: 15px">{{remainningTime}}</span></div>
    </div>

    <br/>
    <br/>
    <table style="text-align: left" cellpadding="10">
      <tr>
        <th style="width: 30%">
          性别：
        </th>
        <td>
          {{this.gender == 1 ? "男" : "女"}}
        </td>
      </tr>
      <tr>
        <th>
          昵称：
        </th>
        <td>
          {{this.nickname}}
        </td>
      </tr>
      <tr>
        <th>
          城市：
        </th>
        <td>
          {{this.province}}-{{this.city}}
        </td>
      </tr>
      <tr>
        <th>
          生日：
        </th>
        <td>
          {{this.getBirthday()}}
        </td>
      </tr>

      <tr>
        <th>
          立志信息：
        </th>
        <td>
          {{this.info}}
        </td>
      </tr>

      <tr>
        <th>
          实施步骤：
        </th>
        <td>
          {{this.stepInfo}}
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import axios from 'axios'
import html2canvas from "html2canvas";

export default {
  name: 'TenYears',
  props: {
    msg: String
  },
  data() {
    return {
      name: '',
      gender: '1',
      telephone: '',
      wechatgroup: '',
      info: '',
      stepInfo: '',
      createDate: '',
      birthday: '1988',
      open: '',
      daixie: '',
      chujie: '',
      wechatid: '',

      unionid: '',
      nickname: '',
      openid: '',
      headimgurl: '',
      country: '',
      province: '',
      city: '',
      language: '',
      groupId: '',
      submitDisable: false,
      daixieDisabled: false,
      htmlsHeader: '',
      htmlsFooter: '',
      dialogVisible: false,
      dialogTableVisible: false,
      imgUrl: '',
      isTimeout: false,
      chujieIndex: '11',
      openIndex: '12',
      smallScreen: false,
      tenyearsLater: 0,
      remainningTime: '',

      times: 3600
    };
  },
  mounted: function () {
    document.title = this.$route.meta.title
    console.log("myHome getData")
    this.getData()
    this.configDiv()
    this.timeCountDown()
  },
  methods: {
    getRemainningTime() {
      let date = new Date(this.tenyearsLater - Date.now())
      let year = date.getFullYear() - 1970
      let month = date.getMonth() + 1
      if (month < 10) month = "0" + month
      let dates = date.getDate()
      if (dates < 10) dates = "0" + dates
      let hours = date.getHours()
      if (hours < 10) hours = '0' + hours
      let minutes = date.getMinutes();
      if (minutes < 10) minutes = '0' + minutes
      let seconds = date.getSeconds()
      if (seconds < 10) seconds = '0' + seconds
      // let milliseconds = date.getMilliseconds()
      // if (milliseconds < 99 && milliseconds > 10) milliseconds = '0' + milliseconds
      // if (milliseconds < 10 && milliseconds > 0) milliseconds = '00' + milliseconds
      // if (milliseconds <= 0) milliseconds = '000'
      return '剩余 ' + year + '年' + month + '月' + dates + '日' + hours + '时' + minutes + '分' + seconds + '秒';
    },
    getBirthday() {
      let date = new Date(Date.parse(this.birthday) + 8 * 3600 * 1000)
      let year = date.getFullYear()
      let month = date.getMonth() + 1
      if (month < 10) month = "0" + month
      let dates = date.getDate()
      if (dates < 10) dates = "0" + dates
      return year + "-" + month + "-" + dates
    },
    edit() {
      this.$router.push("/index");
    },
    timeCountDown() {
      this.timer = setInterval(()=>{
        this.remainningTime = this.getRemainningTime()
        if(this.times===0){
          this.show = true
          clearInterval(this.timer)
        }
      },1000)
    },
    configDiv() {
      if (Date.now() - Date.parse('2021-5-6') > 0) {
        this.isTimeout = true
        this.chujieIndex = '10'
        this.openIndex = '11'
      }
    },
    capture() {
      html2canvas(this.$refs.imageWrapper, {
        scrollY: 0,
        scrollX: 0,
      }).then(canvas => {
        let dataURL = canvas.toDataURL("image/png")
        this.imgUrl = dataURL
        if (this.imgUrl !== "") {
          this.dialogTableVisible = true
          this.dialogVisible = false
        }
      });
    },
    getData() {
      this.unionid = this.$store.getters.getUnionid
      if (this.unionid != null) {
        this.unionid = this.unionid.replaceAll("\"", "")
      }
      console.log("getData unionid:" + this.unionid)
      axios({
        method: "GET",
        url: "http://htzchina.org:8080/getById?id=" + this.unionid,
        data: null,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        console.log("getById: res:" + res.data)
        if (res.data != null && res.data !== '') {
          console.log("getById res:" + res)
          console.log("getById res.data:" + res.data)
          this.name = res.data.name
          this.headimgurl = res.data.headimgurl
          this.gender = res.data.gender + ''
          this.wechatgroup = res.data.wechatgroup
          this.telephone = res.data.telephone
          this.info = res.data.info
          this.stepInfo = res.data.stepInfo
          this.createDate = res.data.createDate
          this.birthday = res.data.birthday
          this.open = res.data.open
          this.daixie = res.data.daixie
          this.chujie = res.data.chujie
          this.wechatid = res.data.wechatid
          this.province = res.data.province

          let createdDate = new Date(this.createDate)
          this.tenyearsLater = new Date((createdDate.getFullYear() + 10) + this.createDate.substr(4))
          this.remainningTime = this.getRemainningTime()
          console.log("createdDate:" + createdDate)
          console.log("tenyearsLater:" + (createdDate.getFullYear() + 10) + this.createDate.substr(4))

          let endTime = Date.parse("2021-05-1T00:00:00.000Z")
          console.log("endTime:" + endTime)
          console.log("remaining:" + (Date.now() - endTime))
          if (Date.now() - endTime > 0) {
            this.daixieDisabled = true
            this.daixie = '0'
          }
        } else {
          alert("信息获取失败，请先填写立志信息！")
          //this.$router.push("/index");
        }
      });
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.large {
  margin: 0 auto;
  right: 18%;
  top: 10%;
  width: 80%;
  height: 85%;
  font-size: 28px;
  position: absolute;
  color: #3a8ee6;
  letter-spacing: 12px;
  word-wrap: break-word;
  writing-mode: tb-rl;
  -webkit-writing-mode: vertical-rl;
}
.small {
  margin: 0 auto;
  right: 15%;
  top: 10%;
  width: 80%;
  height: 85%;
  font-size: 25px;
  position: absolute;
  color: #3a8ee6;
  letter-spacing: 10px;
  word-wrap: break-word;
  writing-mode: tb-rl;
  -webkit-writing-mode: vertical-rl;
}
.signName { width: 25px; font-size: 25px; word-wrap: break-word; letter-spacing: 10px; position: absolute; bottom: 6%; right: 65%; color: #3a8ee6 }
.signNameSmall { width: 25px; font-size: 25px; word-wrap: break-word; letter-spacing: 10px; position: absolute; bottom: 6%; right: 68%; color: #3a8ee6 }

img {
  pointer-events:none;
}

/deep/ .el-radio {
  white-space: normal;
}

.req {
  color: red;
  font-size: 16px;
  font-weight:bold;
}

*{
  -webkit-touch-callout:none;  /*系统默认菜单被禁用*/
  -webkit-user-select:none; /*webkit浏览器*/
  -khtml-user-select:none; /*早期浏览器*/
  -moz-user-select:none;/*火狐*/
  -ms-user-select:none; /*IE10*/
  user-select:none;
}
input,textarea {
  -webkit-user-select:auto; /*webkit浏览器*/
  outline: none;
}


.sexTitleStyle {
  float: left;
  width:100%;
  text-align:left;
  font-size: 16px;
  font-weight:bold;
  margin-left: 10px;
}

.titleNameStyle {
  float: left;
  width:100%;
  text-align:left;
  font-size: 16px;
  font-weight:bold;
  margin-left: 10px;
  margin-bottom: 10px;
}

.inputStyle {
  width: 90%;
  margin-bottom: 20px;
}

.submitStyle {
  width: 120px;
  font-size: 18px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
