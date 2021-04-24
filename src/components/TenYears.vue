<template>
  <div>
    <span style="color: #3a8ee6; font-size: 22px;text-align: center">黄庭书院”十年立志“收集</span>

    <br/><br/>

    <p v-html="htmls"></p>


    <br/>
    <br/>
    <br/>

    <div class="titleNameStyle"><span class='req'>*</span> 1.姓名</div>
    <br/>
    <br/>
    <el-input placeholder="请输入" prefix-icon="el-icon-s-custom" v-model="name" class="inputStyle" clearable></el-input>
    <br/>

    <div class="titleNameStyle"><span class='req'>*</span> 2.居住城市</div>
    <br/>
    <br/>
    <el-input placeholder="请输入" prefix-icon="el-icon-office-building" v-model="province" class="inputStyle"
              clearable></el-input>
    <br/>
    <div class="titleNameStyle"><span class='req'>*</span> 3.你所在的黄庭书院（黄庭禅）相关的微信群</div>
    <br/>
    <el-input placeholder="请输入" prefix-icon="el-icon-chat-line-square" v-model="wechatgroup" class="inputStyle"
              clearable></el-input>
    <br/>
    <br/>
    <div class="titleNameStyle"><span class='req'>*</span> 4.微信号（能联系到您的微信，建议用捆绑的手机）</div>
    <br/>
    <el-input placeholder="请输入" prefix-icon="el-icon-user" v-model="wechatid" class="inputStyle" clearable></el-input>
    <br/>
    <div class="titleNameStyle"><p>&nbsp;</p> 5.手机号（若与微信号相同，可不填）</div>
    <br/>
    <br/>
    <el-input placeholder="请输入" prefix-icon="el-icon-mobile-phone" v-model="telephone" class="inputStyle" clearable
              pattern="[0-9]*"></el-input>
    <br/>

    <div class="titleNameStyle"><span class='req'>*</span> 6.十年立志内容（不超过40字）</div>
    <br/>
    <el-image
        style="width: 90%; height: 10%"
        :src="require('../assets/img/lizhi_demo.jpg')"
        :fit="none" />
    <br/>
    <el-input
        type="textarea"
        :rows="6"
        placeholder="请输入"
        style="width: 90%"
        maxlength="40"
        show-word-limit
        v-model="info">
    </el-input>
    <br/>
    <br/>
    <div class="titleNameStyle"><span class='req'>*</span> 7.为达到十年立志的目标，您会有哪些具体的实施步骤？</div>
    <br/>
    <br/>
    <el-input
        type="textarea"
        :rows="6"
        placeholder="请输入"
        style="width: 90%"
        v-model="stepInfo">
    </el-input>
    <br/>
    <br/>
    <div class="titleNameStyle"><span class='req'>*</span> 8.生日</div>
    <br/>
    <br/>
    <el-date-picker
        v-model="birthday"
        type="date"
        placeholder="选择日期">
    </el-date-picker>
    <br/>
    <br/>
    <div class="sexTitleStyle"><span class='req'>*</span> 9.是否上过黄庭禅初阶课程</div>
    <br/>
    <br/>
    <br/>
    <el-radio-group v-model="chujie">
      <el-radio label="1">是</el-radio>
      <el-radio label="0">否</el-radio>
    </el-radio-group>
    <br/>
    <br/>
    <div class="sexTitleStyle"><span class='req'>*</span> 10.确认是否需要代为填写，能参加线下填写的同学，请尽量线下填写活动</div>
    <br/>
    <br/>
    <br/>
    <el-radio-group :disabled="daixieDisabled" v-model="daixie">
      <el-radio label="1">是</el-radio>
      <el-radio label="0">否</el-radio>
    </el-radio-group>
    <br/>
    <br/>
    <div class="sexTitleStyle"><span class='req'>*</span> 11.立志内容能否公开</div>
    <br/>
    <br/>
    <el-radio-group v-model="open">
      <el-radio label="1">是</el-radio>
      <el-radio label="0">否</el-radio>
    </el-radio-group>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    <el-button :disabled="submitDisable" type="primary" class="submitStyle" @click="submit">提交</el-button>
    <br/>
    <br/>
    <br/>
    <br/>
  </div>
</template>

<script>
import axios from 'axios'
import qs from 'qs'


function getOpenId() {
  const str = window.location.href
  if (str == null || !(str.indexOf("?") > 0)) {
    return null
  }
  const openid = window.location.href.split("?")[1].split("=")[1];
  if (openid != null) {
    return openid
  }
  return null
}

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
      birthday: '',
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
      htmls: ''
    };
  },
  mounted: function () {
    document.title = this.$route.meta.title
    console.log("getData")
    this.getHeaderHtml()
    //this.getData()
  },
  methods: {
    getHeaderHtml() {
      axios({
        method: "GET",
        url: "http://htzchina.org:8080/getHeader",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res == null || res.data === '') {
          this.htmls = '<span style="text-align: left; display:inline-block">\n' +
              '  各位同学好，<br/>\n' +
              '  <br/>\n' +
              '  4月17日，黄庭书院进行了一场「炼30」直播，同时推出“十年立志”活动。<br>\n' +
              '  <br/>\n' +
              '  在此诚邀各位跟着张庆祥先生学习的同学，给自己立个十年的“志”，将“立志”内容填写在一张立志卡上。我们将会把大家填好的立志卡统一打包寄回黄庭书院，密封于时间胶囊，埋藏在中岭山顶峰，待十年后启封。<br>\n' +
              '  <br/>\n' +
              '  为方便无法参加亲手填写立志卡的同学参加此项活动，黄庭书院将安排志工为您代填写立志卡内容，并统一邮寄到黄庭书院。<br>\n' +
              '  <br/>\n' +
              '  链接：<a href="http://lizhi.neixinchan.com" target="_blank" rel="noopener">http://lizhi.neixinchan.com</a><br>\n' +
              '  <br/>\n' +
              '  有意参与者，请在2021/05/05 完成填写。<br>\n' +
              '  <br/>\n' +
              '  <br/>\n' +
              '  <br/>\n' +
              '  PS：此项活动免费，开放给看完直播内容（<a href="http://30.htz.org.cn" target="_blank" rel="noopener">http://30.htz.org.cn</a>）的所有朋友。\n' +
              '  <br/>\n' +
              '  【让我们一起 预约十年后更好的自己】\n' +
              '</span>'
        } else {
          this.htmls = res.data
        }
      })
    },
    getData() {
      let openid = getOpenId()
      console.log("openid:" + openid)
      if (openid !== "" && openid != null && openid.length > 0) {
        console.log("begin axios...")
        axios({
          method: "GET",
          url: "http://htzchina.org:8080/getUserInfo?openid=" + openid,
          data: null,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then((res) => {
          console.log(res)
          console.log(res.data.unionid)
          this.unionid = res.data.unionid
          this.nickname = res.data.nickname
          this.openid = res.data.openid
          this.headimgurl = res.data.headimgurl
          this.country = res.data.country
          this.city = res.data.city
          this.province = res.data.province + this.city
          this.language = res.data.language
          this.groupId = res.data.groupId
          this.gender = res.data.sex + ''

          axios({
            method: "GET",
            url: "http://htzchina.org:8080/getById?id=" + this.unionid,
            data: null,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }).then((res) => {
            console.log(res)
            console.log(res.data)
            if (res != null && res.data != null) {
              this.name = res.data.name
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

              // let createTime = Date.parse(this.createDate)
              // console.log("remaining time:" + (Date.now() - createTime))
              // if ((Date.now() - createTime) > 3600000 * 24) {
              //   this.$message({
              //     message: '数据已被锁定，无法修改！',
              //     type: 'warning'
              //   })
              //   this.submitDisable = true
              // }

              let endTime = Date.parse("2021-05-1T00:00:00.000Z")
              console.log("endTime:" + endTime)
              console.log("remaining:" + (Date.now() - endTime))
              if (Date.now() - endTime > 0) {
                this.daixieDisabled = true
                this.daixie = '0'
              }
            }
          });
        });
      } else {
        window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx83aec75c3ca58f0e&redirect_uri=http://htzchina.org/wc_redirect&response_type=code&scope=snsapi_base&state=123#wechat_redirect"
      }
    },

    submit() {
      if (this.name.trim() === '') {
        this.$message.warning("请输入您的姓名！")
        return;
      }
      if (this.name.length < 2) {
        this.$message.warning("请输入您完整姓名")
        return;
      }
      if (this.province.trim() === '') {
        this.$message.warning("请输入您的居住城市！")
        return;
      }
      if (this.wechatgroup.trim() === '') {
        this.$message.warning("请输入您所在的微信群！")
        return;
      }
      if (this.wechatgroup.length < 2) {
        this.$message.warning("微信群输入有误！")
        return;
      }
      if (this.wechatid.trim() === '') {
        this.$message.warning("请输入您的微信号！")
        return;
      }
      if (this.wechatid.length < 2) {
        this.$message.warning("微信号输入有误！")
        return;
      }
      if (this.info.trim() === '') {
        this.$message.warning("请输入您的立志信息！")
        return;
      }
      if (this.info.length < 2) {
        this.$message.warning("立志信息字数过少！")
        return;
      }
      if (this.info.length > 40) {
        this.$message.warning("立志信息字数超过40字!")
        return;
      }
      if (this.stepInfo.trim() === '') {
        this.$message.warning("请输入您的具体实施步骤！")
        return;
      }
      if (this.stepInfo.length < 2) {
        this.$message.warning("具体实施步骤字数过少！")
        return;
      }
      if (this.birthday === null || this.birthday === '') {
        this.$message.warning("请输入您的生日！")
        return;
      }
      if (this.chujie.trim() === '') {
        this.$message.warning("请选择是否上过初阶课程！")
        return;
      }
      if (this.daixie.trim() === '') {
        this.$message.warning("请选择是否需要代写！")
        return;
      }
      if (this.open.trim() === '') {
        this.$message.warning("请选择立志内容是否公开！")
        return;
      }
      let time = this.createDate
      if (time == null || time === '') {
        time = new Date(Date.now() + 8 * 3600000)
      }

      let data = qs.stringify({
        id: this.unionid,
        name: this.name,
        gender: this.gender,
        wechatid: this.wechatid,
        wechatgroup: this.wechatgroup,
        birthday: this.birthday,
        open: this.open,
        daixie: this.daixie,
        chujie: this.chujie,

        telephone: this.telephone,
        info: this.info,
        stepInfo: this.stepInfo,
        unionid: this.unionid,
        nickname: this.nickname,
        openid: this.openid,
        headimgurl: this.headimgurl,
        country: this.country,
        province: this.province,
        city: this.city,
        language: this.language,
        groupId: this.groupId,
        createDate: time
      })
      axios({
        method: "POST",
        url: "http://htzchina.org:8080/save",
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.$message({
          message: '信息已成功提交！',
          type: 'success'
        })
        console.log(res)
      });
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

/deep/ .el-radio {
  white-space: normal;
}

.req {
  color: red;
}

.radioButtonStyle {
  float: left;
  margin-left: 50px;
}

.radioButtonStyle2 {
  margin-bottom: 20px;
}

.sexTitleStyle {
  float: left;
  font-size: 18px;
  margin-left: 10px;
}

.titleNameStyle {
  float: left;
  font-size: 18px;
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
