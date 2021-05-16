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
<!--    <el-card style="float: left;width: 100%;margin-top: 5px" @click.native="PYQ">-->
<!--      <div style="float: left; margin-bottom: 20px;width: 15%">-->
<!--        立志圈-->
<!--      </div>-->
<!--      <div style="float: right; margin-bottom: 20px;width: 60%;text-align: left;margin-right: 10%">-->
<!--        <el-image v-if="this.lastImgUrl != ''" :src="lastImgUrl" style="width: 30px; height: 30px;"></el-image>-->
<!--      </div>-->
<!--    </el-card>-->
    <el-card style="float: left;width: 100%;margin-top: 5px">
      <div style="float: left; margin-bottom: 20px;width: 15%">
        {{this.unionid}}
      </div>
    </el-card>
    <el-card style="float: left">
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
    </el-card>
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
      lastImgUrl: '',
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
    PYQ() {
      this.$router.push("/htq")
    },
    getRemainningTime() {
      let date = new Date(this.tenyearsLater - Date.now())
      let year = date.getFullYear() - 1970
      if (year < 0) year = 0
      let month = date.getMonth() + 1
      if (month < 10 && month > 0) month = "0" + month
      if (month <= 0) month = '00'
      let dates = date.getDate()
      if (dates < 10 && dates > 0) dates = "0" + dates
      if (dates <= 0) dates = '00'
      let hours = date.getHours()
      if (hours < 10 && hours > 0) hours = '0' + hours
      if (hours <= 0) hours = '00'
      let minutes = date.getMinutes();
      if (minutes < 10 && minutes > 0) minutes = '0' + minutes
      if (minutes <= 0) minutes = '00'
      let seconds = date.getSeconds()
      if (seconds < 10 && seconds > 0) seconds = '0' + seconds
      if (seconds <= 0) seconds = '00'
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
        // if(this.times===0){
        //   this.show = true
        //   clearInterval(this.timer)
        // }
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

          this.lastImgUrl = this.headimgurl

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

img {
  pointer-events:none;
}

/deep/ .el-radio {
  white-space: normal;
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
