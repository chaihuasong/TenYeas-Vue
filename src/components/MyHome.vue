<template>
  <div>
    <div style="background: #303133;height: 150px">
      <el-image
          style="width: 60px; height: 60px;border-radius:50%;float: left;margin-left: 10%;margin-top: 40px"
          :src="this.headimgurl"
          :preview-src-list="[this.headimgurl.substr(0, this.headimgurl.lastIndexOf('/')) + '/0']"
          fit="cover">
        <div slot="error">
          <el-image style="width: 60px; height: 60px"
                    :src="require('../assets/img/not_found.jpg')" />
        </div>
      </el-image>
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
    <el-collapse style="float: left; width: 100%;margin-top: 20px;">
      <el-collapse-item title="基本信息" name="1">
        <el-row style="text-align: left; margin-left: 30px;margin-top: 15px">
          <el-col :span="8" style="font-weight: bold;font-size: 16px">
            性别：
          </el-col>
          <el-col :span="16">
            <el-dropdown trigger="click" @command="handleCommand">
            <span class="el-dropdown-link" style="font-size: 16px">
            {{ this.gender === '1' ? "男" : "女" }}<i class="el-icon-arrow-down el-icon--right"></i>
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
          <el-col :span="8" style="font-weight: bold;font-size: 16px">
            昵称：
          </el-col>
          <el-col :span="16">
            <input class="inputStyle" v-model="nickname" @change="onInputChange"/>
          </el-col>
        </el-row>
        <el-row style="text-align: left; margin-left: 30px;margin-top: 15px">
          <el-col :span="8" style="font-weight: bold;font-size: 16px">
            城市：
          </el-col>
          <el-col :span="16">
            <input class="inputStyle" v-model="province" @change="onInputChange"/>
          </el-col>
        </el-row>
        <el-row style="text-align: left; margin-left: 30px;margin-top: 15px">
          <el-col :span="8" style="font-weight: bold;font-size: 16px;padding-top: 5px">
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
      </el-collapse-item>
    </el-collapse>
    <el-collapse style="float: left; width: 100%">
      <el-collapse-item title="立志信息" name="2">
        <textarea rows="5" class="multiLineInputStyle" v-model="info" @change="onInputChange" style="margin-left: 20px;margin-right: 20px"/>
      </el-collapse-item>
    </el-collapse>
    <el-collapse style="float: left; width: 100%">
      <el-collapse-item title="实施步骤" name="3">
        <textarea rows="stepInfoRows" class="multiLineInputStyle" v-model="stepInfo" @change="onInputChange" style="margin-left: 20px;margin-right: 20px"/>
      </el-collapse-item>
    </el-collapse>

    <el-collapse style="float: left; width: 100%">
      <el-collapse-item title="设置" name="4">
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

        <el-row style="text-align: left; margin-left: 30px;margin-top: 20px">
          <el-col :span="10" style="font-weight: bold">
            <span>内容能否公开</span>
          </el-col>
          <el-col :span="14">
            <el-switch
                style="margin-left: 5px"
                @change="openChange"
                v-model="open">
            </el-switch>
          </el-col>
        </el-row>

        <el-row style="text-align: left; margin-left: 30px;margin-top: 20px" @click.native="clearUnionId">
          <el-col :span="10" style="font-weight: bold">
            <span>清空缓存</span>
          </el-col>
          <el-col :span="14">
            <i class="el-icon-arrow-right" style="margin-left: 10px"></i>
          </el-col>
        </el-row>
      </el-collapse-item>
    </el-collapse>
    <el-collapse style="float: left; width: 100%" @click.native="gotoGroup">
      <el-row>
        <el-col :span="22">
          <div style="text-align: left;margin-left: 20px;font-weight: bold;margin-top: 10px;margin-bottom: 10px">我的团队 <i style="color: red;font-size: 15px;font-weight: lighter"> 新*</i></div>
        </el-col>
        <el-col :span="2">
          <div class="el-icon-arrow-right" style="margin-top: 12px;margin-bottom: 10px"></div>
        </el-col>
      </el-row>
    </el-collapse>

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
      open: false,
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
    clearUnionId() {
      this.$confirm('是否清空缓存？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        confirmButtonClass: 'confirmButtonClass',
        type: 'info'
      }).then(() => {
        this.$store.commit('$_setUnionid', '')
        this.$router.push("/tenyearsHome");
      })
    },
    openChange() {
      let data = qs.stringify({
        id: this.unionid,
        gender: this.gender,
        open: this.open ? '1' : '0',
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
        this.$message.success("操作成功")
      })
    },
    notificationChange() {
      let data = qs.stringify({
        id: this.unionid,
        gender: this.gender,
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
      this.$confirm('是否保存修改？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          confirmButtonClass: 'confirmButtonClass',
          type: 'info'
        }).then(() => {
          let data = qs.stringify({
          id: this.unionid,
          nickname: this.nickname,
          province: this.province,
          birthday: this.birthday,
          info: this.info,
          stepInfo: this.stepInfo,
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
    gotoGroup() {
      this.$router.push("/group")
    },
    gotoHTQ() {
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
        this.unionid = this.unionid.replace("\"", "").replace("\"", "")
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
          this.open = res.data.open === '1'
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
  width: 90%;
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
.confirmButtonClass {
  float: right;
  margin-right: 15%;
  width: 80px;
}
</style>
