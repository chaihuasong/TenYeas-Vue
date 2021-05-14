<template>
  <div>
    <span style="color: #3a8ee6; font-size: 22px;text-align: center">黄庭书院”十年立志“收集</span>

    <p v-html="htmlsHeader"></p>

    <div class="titleNameStyle"><span class='req'>*</span> 1.姓名</div>
    <br/>
    <br/>
    <el-input placeholder="请输入" prefix-icon="el-icon-s-custom" v-model="name" class="inputStyle" clearable></el-input>
    <br/>
    <div class="sexTitleStyle"><span class='req'>*</span> 2.性别</div>
    <br/>
    <br/>
    <el-radio-group v-model="gender">
      <el-radio label="1">男</el-radio>
      <el-radio label="0">女</el-radio>
    </el-radio-group>
    <br/>

    <div class="titleNameStyle"><span class='req'>*</span> 3.居住城市</div>
    <br/>
    <br/>
    <el-input placeholder="请输入" prefix-icon="el-icon-office-building" v-model="province" class="inputStyle"
              clearable></el-input>
    <br/>
    <div class="titleNameStyle"><span class='req'>*</span> 4.您所在的黄庭书院（黄庭禅）微信群 （请填写完整的群名，一个即可）</div>
    <br/>
    <br/>
    <el-input placeholder="请输入" prefix-icon="el-icon-chat-line-square" v-model="wechatgroup" class="inputStyle"
              clearable></el-input>
    <br/>
    <div class="titleNameStyle"><span class='req'>*</span> 5.微信号（需要能够联系到您，建议用捆绑的手机号）</div>
    <br/>
    <br/>
    <el-input placeholder="请输入" prefix-icon="el-icon-user" v-model="wechatid" class="inputStyle" clearable></el-input>
    <br/>
    <div class="titleNameStyle"><span style="margin-left: 10px"/> 6.手机号（若与微信号相同，可不填）</div>
    <br/>
    <br/>
    <el-input placeholder="请输入" prefix-icon="el-icon-mobile-phone" v-model="telephone" class="inputStyle" clearable
              pattern="[0-9]*"></el-input>
    <br/>
    <div class="titleNameStyle"><span class='req'>*</span> 7.十年立志内容（不超过80字）</div>
    <br/>
    <el-image
        style="width: 100%; height: 10%"
        :src="require('../assets/img/lizhi.png')" />
    <br/>
    <el-input
        type="textarea"
        :rows="6"
        placeholder="请输入"
        style="width: 90%"
        maxlength="80"
        show-word-limit
        v-model="info">
    </el-input>
    <br/>
<!--    <el-button type="text" @click="dialogVisible = true">生成图片存档（建议先提交再点击）</el-button>-->
    <el-dialog
        :visible.sync="dialogVisible"
        :title= "stepInfoDialogVisible ? '生成图片' : '信息已成功提交！'"
        width="100%"
        height="100%">
      <span>您可以点击下方'生成图片'按钮将图片保存。</span>
      <br/><br/>
      <div v-if="!stepInfoDialogVisible" ref="imageWrapper" style="position: relative; width: 100%; height: 100%;">
        <img src="../assets/img/lizhi_card.png" width="100%" height="100%" alt="" oncontextmenu="return false;">
        <div style="text-align: left" class="large" v-bind:class="{'small': this.smallScreen}">{{ this.info }}</div>
        <div class="signName" v-bind:class="{'signNameSmall': this.smallScreen}">{{ this.name }}</div>
      </div>
      <div v-if="stepInfoDialogVisible" ref="imageWrapper" style="position: relative; width: 100%; height: 100%;">
        <img src="../assets/img/step_info.png" width="100%" height="100%" alt="" oncontextmenu="return false;">
        <p style="text-align: left" class="stepInfoStyle" v-bind:class="{'stepInfoLargeStyle': this.stepInfo.length < 100}" v-html="this.preText(this.stepInfo).replaceAll('↓', '<br/>')"/>
        <p class="stepSignName" v-bind:class="{'stepSignNameLargeStyle': this.stepInfo.length < 100}">{{ this.name }}</p>
      </div>
      <br/>
      <el-button type="primary" @click="capture">生成图片</el-button>
    </el-dialog>
    <el-dialog
        :visible.sync="dialogTableVisible"
        width="100%"
        height="100%">
      <el-image
          style="width: 100%; height: 10%"
          :src="imgUrl" />
      <br/>
      <br/>
      <span style="font-size: 16px">请长按上方的图片，保存到手机</span>
    </el-dialog>
    <br/>
    <br/>
    <div class="titleNameStyle"><span style="margin-left: 10px"/> 8.为达到十年立志的目标，您会有哪些具体的实施步骤？</div>
    <br/>
    <br/>
    <el-input
        type="textarea"
        :rows="6"
        placeholder="请输入"
        style="width: 90%"
        v-model="stepInfo"/>
    <br/>
    <el-button type="text" @click="stepInfoDialogVisible = true;dialogVisible = true">生成图片存档（建议先提交再点击）</el-button>
    <br/>
    <div class="titleNameStyle"><span class='req'>*</span> 9.生日</div>
    <br/>
    <br/>
    <el-date-picker
        v-model="birthday"
        type="date"
        :editable="false"
        format="yyyy-MM-dd"
        placeholder="选择日期">
    </el-date-picker>
    <br/>
    <br/>
    <div v-show="!isTimeout">
      <div class="sexTitleStyle"><span class='req'>*</span> 10.确认是否需要代为填写（参加线下填写的同学，此处选择“不用代写”）</div>
      <br/>
      <br/>
      <br/>
      <el-radio-group :disabled="daixieDisabled" v-model="daixie">
        <el-radio label="1">需代写</el-radio>
        <el-radio label="0">不用代写</el-radio>
      </el-radio-group>
      <br/>
      <br/>
    </div>
    <div class="sexTitleStyle"><span class='req'>*</span> {{this.chujieIndex}}.是否参加过黄庭禅初阶课程？</div>
    <br/>
    <br/>
    <el-radio-group v-model="chujie">
      <el-radio label="1">参加过</el-radio>
      <el-radio label="0">未参加过</el-radio>
    </el-radio-group>
    <br/>
    <br/>
    <div class="sexTitleStyle"><span class='req'>*</span> {{this.openIndex}}.立志内容能否公开</div>
    <br/>
    <br/>
    <el-radio-group v-model="open">
      <el-radio label="1">能公开</el-radio>
      <el-radio label="0">不能公开</el-radio>
    </el-radio-group>
    <br/>
    <br/>
    <br/>
    <br/>
    <el-button :disabled="submitDisable" type="primary" class="submitStyle" @click="submit">{{buttonText}}</el-button>
    <br/>
    <br/>
    <p v-html="htmlsFooter"></p>
  </div>
</template>

<script>
import axios from 'axios'
import qs from 'qs'
import wx from 'weixin-js-sdk'
import html2canvas from "html2canvas";

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
      stepInfoDialogVisible: false,
      dialogTableVisible: false,
      imgUrl: '',
      isTimeout: false,
      chujieIndex: '11',
      openIndex: '12',
      smallScreen: false,
      buttonText: '提交'
    };
  },
  mounted: function () {
    document.title = this.$route.meta.title
    console.log("getData")
    this.getHeaderHtml()
    this.getFooterHtml()
    this.getData()
    this.configWechat()
    this.configDiv()
  },
  methods: {
    preText (pretext) {
      return pretext.replace(/\r\n/g, '↓').replace(/\n/g, '↓')
    },
    splitStepInfoText() {
      return this.stepInfo.split('↓')
    },
    configDiv() {
      // if (Date.now() - Date.parse('2021-5-6') > 0) {
        this.isTimeout = true
        this.chujieIndex = '10'
        this.openIndex = '11'
      // }
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
    configWechat() {
      axios({
        method: "GET",
        url: "http://htzchina.org:8080/getAccessToken?url=" + window.location.href,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res != null && res.data != null && res.data !== '') {
          wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: 'wx83aec75c3ca58f0e', // 必填，公众号的唯一标识
            timestamp: res.data.timestamp, // 必填，生成签名的时间戳
            nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
            signature: res.data.signature,// 必填，签名
            jsApiList: [
              'onMenuShareTimeline',
              'onMenuShareAppMessage',
              'onMenuShareQQ',
              'onMenuShareWeibo',
              'onMenuShareQZone'
            ] // 必填，需要使用的JS接口列表
          });
        }
      });

      wx.ready(function () {   //需在用户可能点击分享按钮前就先调用
        wx.onMenuShareAppMessage({
          title: '黄庭书院"十年立志"收集', // 分享标题
          desc: '让我们一起 预约十年后更好的自己', // 分享描述
          link: "http://htzchina.org/tenyears/#/login", // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: 'http://htzchina.org/imgs/huangtingshuyuan.png', // 分享图标
          success: function () {
            // 设置成功
            console.log("1234234 设置成功");
          }
        })
        wx.onMenuShareTimeline({
          title: '黄庭书院"十年立志"收集', // 分享标题
          desc: '让我们一起 预约十年后更好的自己', // 分享描述
          link: "http://htzchina.org/tenyears/#/login", // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: 'http://htzchina.org/imgs/huangtingshuyuan.png', // 分享图标
          success: function () {
            // 用户点击了分享后执行的回调函数
            console.log("asdfasdf 设置成功");
          }
        })
      });
    },
    getHeaderHtml() {
      axios({
        method: "GET",
        url: "http://htzchina.org:8080/getHeader",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res == null || res.data === '') {
          this.htmlsHeader = '  <br/>\n' +
              '  <br/>\n' +
              '<span style="text-align: left; display:inline-block">\n' +
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
              '  PS：此项活动免费，开放给看完直播内容（<a href="http://30.htz.org.cn" target="_blank" rel="noopener">http://30.htz.org.cn</a>）的所有朋友。\n' +
              '  <br/>\n' +
              '  【让我们一起 预约十年后更好的自己】\n' +
              '  <br/>\n' +
              '  <br/>\n' +
              '</span>'
        } else {
          this.htmlsHeader = res.data
        }
      })
    },
    getFooterHtml() {
      axios({
        method: "GET",
        url: "http://htzchina.org:8080/getFooter",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res == null || res.data === '') {
          this.htmlsFooter = '  <br/>\n' +
              '  <br/>\n'
        } else {
          this.htmlsFooter = res.data
        }
      })
    },
    getData() {
      let uid = this.$store.getters.getUnionid
      if (uid != null && uid !== '' && uid !== undefined) {
        this.unionid = uid.replace("\"","").replace("\"","")
        console.log("unionid:" + this.unionid)
        this.getUserInfoByUnionId()
        return;
      }
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
          if (res != null && res.data != null && res.data !== '') {
            console.log("openid:" + res)
            console.log("unionid:" + res.data.unionid)
            console.log("sex:" + res.data.sex)
            this.unionid = res.data.unionid
            if (this.unionid === null || this.unionid === '' || this.unionid === undefined) {
              alert("信息获取失败，请关注“黄庭书院”公众号后重试！")
            }
            this.nickname = res.data.nickname
            this.openid = res.data.openid
            this.headimgurl = res.data.headimgurl
            this.country = res.data.country
            this.city = res.data.city
            this.province = res.data.province + this.city
            this.language = res.data.language
            this.groupId = res.data.groupId
            this.gender = res.data.sex + ''

            this.getUserInfoByUnionId()
          }
        });
      } else {
        window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx83aec75c3ca58f0e&redirect_uri=http://htzchina.org/wc_redirect&response_type=code&scope=snsapi_base&state=123#wechat_redirect"
      }
      this.daixieDisabled = true
      this.daixie = '0'
    },
    getUserInfoByUnionId() {
      axios({
        method: "GET",
        url: "http://htzchina.org:8080/getById?id=" + this.unionid,
        data: null,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res != null && res.data != null && res.data !== '') {
          console.log("getById res:" + res)
          console.log("getById res.data:" + res.data)
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

          this.buttonText = '修改'
          this.daixieDisabled = true
          this.daixie = '0'
        }
      });
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
      if (this.info.length > 80) {
        this.$message.warning("立志信息字数超过80字!")
        return;
      }
      if (this.birthday === '1988') {
        this.$message.warning("请选择正确的生日！")
        return;
      }
      if (this.chujie.trim() === '') {
        this.$message.warning("请选择是否上过初阶课程！")
        return;
      }
      // if (this.daixie.trim() === '') {
      //   this.$message.warning("请选择是否需要代写！")
      //   return;
      // }
      if (this.open.trim() === '') {
        this.$message.warning("请选择立志内容是否公开！")
        return;
      }
      if (this.info.length < 50) {
        this.smallScreen = false
      } else {
        this.smallScreen = (document.body.clientWidth < 350)
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
        stepInfo: this.preText(this.stepInfo),
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
        console.log(res.status)
        if (res.status != 200) {
          alert("error!")
        }
        axios({
          method: "GET",
          url: "http://htzchina.org:8080/getById?id=" + this.unionid,
          data: null,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then((res) => {
          if (res != null && res.data != null && res.data !== '') {
            this.$message.success('信息已成功' + this.buttonText + '！')
            this.stepInfoDialogVisible = false
            this.dialogVisible = true
            this.buttonText = '修改'
            console.log(res)
          } else {
            alert('信息提交失败，请刷新页面后重试，注意刷新后数据会丢失！')
          }
        });
      });
    }
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

.stepSignName { width: auto; font-size: 25px;  position: absolute; bottom: 10%; right: 10%; color: #3a8ee6 }

.stepSignNameLargeStyle {
  bottom: 20%;
}

.stepInfoStyle {
  margin: 0 auto;
  left: 10%;
  top: 28%;
  font-size: 16px;
  position: absolute;
  color: #3a8ee6;
}

.stepInfoLargeStyle {
  font-size: 22px;
  left: 15%;
  top: 35%;
}

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
