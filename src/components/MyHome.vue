<template>
  <div>
    <div style="background: #303133;height: 150px">
      <el-image
          style="width: 60px; height: 60px;border-radius:50%;float: left;margin-left: 10%;margin-top: 40px"
          :src="this.headimgurl"
          :preview-src-list="[this.headimgurl.substr(0, this.headimgurl.lastIndexOf('/')) + '/0']"
          fit="cover"/>
      <div style="float: left;color: white;font-weight: bold;margin-top: 60px;margin-left: 20px">{{ this.nickname }}
      </div>
    </div>

    <br/>
    <!--    <el-card style="float: left;width: 100%;margin-top: 5px" @click.native="PYQ">-->
    <!--      <div style="float: left; margin-bottom: 20px;width: 15%">-->
    <!--        立志圈-->
    <!--      </div>-->
    <!--      <div style="float: right; margin-bottom: 20px;width: 60%;text-align: left;margin-right: 10%">-->
    <!--        <el-image v-if="this.lastImgUrl != ''" :src="lastImgUrl" style="width: 30px; height: 30px;"></el-image>-->
    <!--      </div>-->
    <!--    </el-card>-->
    <div style="text-align: left;margin-left: 5px;color: #e5288a">基本信息</div>
    <div style="width: 100%;height: 1px;background-color: #e7ecf1;margin-top: 5px"/>
    <el-row style="text-align: left; margin-left: 30px;margin-top: 15px">
      <el-col :span="8" style="font-weight: bold">
        性别：
      </el-col>
      <el-col :span="16">
        <el-dropdown trigger="click" @command="handleCommand">
        <span class="el-dropdown-link" style="font-size: 16px">
        {{ this.gender == 1 ? "男" : "女" }}<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="0">女</el-dropdown-item>
            <br/>
            <el-dropdown-item command="1">男</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-row>
    <el-row style="text-align: left; margin-left: 30px;margin-top: 15px">
      <el-col :span="8" style="font-weight: bold">
        昵称：
      </el-col>
      <el-col :span="16">
        <input class="inputStyle" v-model="nickname" @change="onInputChange"/>
      </el-col>
    </el-row>
    <el-row style="text-align: left; margin-left: 30px;margin-top: 15px">
      <el-col :span="8" style="font-weight: bold">
        城市：
      </el-col>
      <el-col :span="16">
        <input class="inputStyle" v-model="province" @change="onInputChange"/>
      </el-col>
    </el-row>
    <el-row style="text-align: left; margin-left: 30px;margin-top: 15px">
      <el-col :span="8" style="font-weight: bold;padding-top: 10px">
        生日：
      </el-col>
      <el-col :span="16">
        <el-date-picker
            v-model="birthday"
            @change="onInputChange"
            type="date"
            :clearable="false"
            :editable="false"
            format="yyyy-MM-dd"
            style="width: 150px"
            placeholder="选择日期">
        </el-date-picker>
      </el-col>
    </el-row>
    <el-row style="text-align: left; margin-left: 20px;margin-top: 15px;margin-right: 20px">
      <el-col :span="8" style="font-weight: bold">
        立志信息：
      </el-col>
      <el-col :span="16">
        <textarea rows="4" class="multiLineInputStyle" v-model="info" @change="onInputChange"/>
      </el-col>
    </el-row>
    <el-row style="text-align: left; margin-left: 20px;margin-top: 15px;margin-right: 20px">
      <el-col :span="8" style="font-weight: bold">
        实施步骤：
      </el-col>
      <el-col :span="16">
        <textarea :rows="stepInfoRows" class="multiLineInputStyle" v-model="stepInfo" @change="onInputChange"/>
      </el-col>
    </el-row>

    <div style="text-align: left;margin-left: 5px;color: #e5288a;margin-top: 15px">设置</div>
    <div style="width: 100%;height: 1px;background-color: #e7ecf1;margin-top: 5px"/>

    <el-row style="text-align: left; margin-left: 30px;margin-top: 20px">
      <el-col :span="10" style="font-weight: bold">
        <span>打卡提醒{{ notification ? '已开启' : '已关闭' }}</span>
      </el-col>
      <el-col :span="14">
        <el-switch
            style="margin-left: 5px"
            @change="notificationChange"
            v-model="notification">
        </el-switch>
      </el-col>
    </el-row>

    <div style="margin-bottom: 150px"/>
  </div>
</template>

<script>
import axios from 'axios'
import html2canvas from "html2canvas";
import qs from "qs";
import global from "@/components/Common";

export default {
  name: 'TenYears',
  props: {
    msg: String
  },
  data() {
    return {
      serverUrl: global.httpUrl,
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
      notification: false,
      stepInfoRows: 7,
    };
  },
  mounted: function () {
    document.title = this.$route.meta.title
    console.log("myHome getData")
    this.getData()
    this.configDiv()
  },
  methods: {
    notificationChange() {
      let data = qs.stringify({
        id: this.unionid,
        notification: this.notification ? '1' : '0',
      })
      axios({
        method: "POST",
        url: this.serverUrl + "update",
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(() => {
        console.log("success")
        this.$message.success("每日打卡通知提醒功能已" + (this.notification ? "开启" : "关闭"))
      })
    },
    onInputChange() {
      let data = qs.stringify({
        id: this.unionid,
        nickname: this.nickname,
        province: this.province,
        birthday: this.birthday,
        info: this.info,
        stepInfo: this.stepInfo,
      })
      axios({
        method: "POST",
        url: this.serverUrl + "update",
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(() => {
        console.log("success")
        this.$message.success("更新成功")
      })
    },
    handleCommand(command) {
      this.gender = command

      let data = qs.stringify({
        id: this.unionid,
        gender: this.gender,
      })
      axios({
        method: "POST",
        url: this.serverUrl + "update",
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(() => {
        console.log("success")
        this.$message.success("更新成功")
      })
    },
    PYQ() {
      this.$router.push("/htq")
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
        url: this.serverUrl + "getById?id=" + this.unionid,
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
          this.nickname = res.data.nickname
          this.notification = res.data.notification === '1'

          this.lastImgUrl = this.headimgurl
          if (this.stepInfo.length > 150) {
            this.stepInfoRows = 10
          }
          console.log('this.notification:' + res.data.notification)
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

.el-dropdown-link {
  cursor: pointer;
  color: #8c939d;
}

.el-icon-arrow-down {
  font-size: 16px;
}
.inputStyle {
  border-left-width:0px;
  border-top-width:0px;
  border-right-width:0px;
  border-bottom-width:0px;
  border-bottom-color:lightgray;
  width: 100%;
  height: auto;
  font-size: 18px;
  text-align: left;
  color: #8c939d;
  margin: 0 0;
  padding: 0 0;
  -webkit-appearance: none;
  border-radius: 0;
}
.multiLineInputStyle {
  border-left-width:0px;
  border-top-width:0px;
  border-right-width:0px;
  border-bottom-width:0px;
  border-bottom-color:lightgray;
  width: 100%;
  height: auto;
  font-size: 18px;
  text-align: left;
  color: #8c939d;
  -webkit-appearance: none;
  border-radius: 0;
}
</style>
