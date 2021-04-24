<template>
  <div>
    <span style="color: #3a8ee6; font-size: 22px;text-align: center">黄庭书院”十年立志“收集</span>

    <br/><br/>

    <p v-html="htmls"></p>


    <br/>
    <br/>
    <br/>

    <div class="titleNameStyle"><span class='req'>*</span> 1. 姓名</div>
    <br/>
    <br/>
    <el-input placeholder="请输入" prefix-icon="el-icon-s-custom" v-model="name" class="inputStyle" clearable></el-input>
    <br/>

    <div class="titleNameStyle"><span class='req'>*</span> 2. 居住城市</div>
    <br/>
    <br/>
    <el-input placeholder="请输入" prefix-icon="el-icon-office-building" v-model="province" class="inputStyle"
              clearable></el-input>
    <br/>
    <div class="titleNameStyle"><span class='req'>*</span> 3. 你所在的黄庭书院（黄庭禅）相关的微信群</div>
    <br/>
    <el-input placeholder="请输入" prefix-icon="el-icon-chat-line-square" v-model="wechatgroup" class="inputStyle"
              clearable></el-input>
    <br/>
    <br/>
    <div class="titleNameStyle"><span class='req'>*</span> 4. 微信号（能联系到您的微信，建议用捆绑的手机）</div>
    <br/>
    <el-input placeholder="请输入" prefix-icon="el-icon-user" v-model="wechatid" class="inputStyle" clearable></el-input>
    <br/>
    <div class="titleNameStyle"><p>&nbsp;</p> 5. 手机号（若与微信号相同，可不填）</div>
    <br/>
    <br/>
    <el-input placeholder="请输入" prefix-icon="el-icon-mobile-phone" v-model="telephone" class="inputStyle" clearable
              pattern="[0-9]*"></el-input>
    <br/>

    <div class="titleNameStyle"><span class='req'>*</span> 6. 十年立志内容（不超过100字，请谨慎填写）</div>
    <br/>
    <br/>
    <el-input
        type="textarea"
        :rows="6"
        placeholder="请输入"
        style="width: 90%"
        maxlength="100"
        show-word-limit
        v-model="info">
    </el-input>
    <br/>
    <br/>
    <div class="titleNameStyle"><span class='req'>*</span> 7. 生日</div>
    <br/>
    <br/>
    <el-date-picker
        v-model="birthday"
        type="date"
        placeholder="选择日期">
    </el-date-picker>
    <br/>
    <br/>
    <div class="sexTitleStyle"><span class='req'>*</span> 8. 是否上过黄庭禅初阶课程</div>
    <br/>
    <br/>
    <br/>
    <el-radio-group v-model="chujie">
      <el-radio label="1">是</el-radio>
      <el-radio label="0">否</el-radio>
    </el-radio-group>
    <br/>
    <br/>
    <div class="sexTitleStyle"><span class='req'>*</span> 9. 确认是否需要代为填写，能参加线下填写的同学，请尽量线下填写活动</div>
    <br/>
    <br/>
    <br/>
    <el-radio-group :disabled="daixieDisabled" v-model="daixie">
      <el-radio label="1">是</el-radio>
      <el-radio label="0">否</el-radio>
    </el-radio-group>
    <br/>
    <br/>
    <div class="sexTitleStyle"><span class='req'>*</span> 10. 立志内容能否公开</div>
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
    <ul>
      <li><a href="http://htz.org.cn" target="_blank" rel="noopener">黄庭禅台湾</a></li>
      <li><a href="https://neixinchan.com" target="_blank" rel="noopener">黄庭禅官网</a></li>
    </ul>
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
    this.getData()
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
              '  各位同学好<br/>\n' +
              '  <br/>\n' +
              '  4月17日黄庭书院「炼30」直播活动已圆满结束此次推出了十年立志卡填写活动，待书院收齐同学的立志卡后，会将其密封于时间胶囊中，埋在中岭山上，十年后再开封！<br>\n' +
              '  <br/>\n' +
              '  为此，内地同步推出十年立志卡填写活动，请各位同学尽量在当地生活禅亲手填写立志卡（黄庭会比较有感觉哟）。<br>\n' +
              '  <br/>\n' +
              '  您若无法参与线下填写活动，又想参与此项活动，请打开下方链接填写相关内容，会有志工代您填写立志卡统一邮寄到黄庭书院。<br>\n' +
              '  <br/>\n' +
              '  链接：<a href="http://lizhi.neixinchan.com" target="_blank" rel="noopener">http://lizhi.neixinchan.com</a><br>\n' +
              '  <br/>\n' +
              '  立志卡填写信息收集截止日期：2021/04/30<br>\n' +
              '  <br/>\n' +
              '  <br/>\n' +
              '  <br/>\n' +
              '  PS：此项活动免费，开放给看完直播内容（<a href="http://30.htz.org.cn" target="_blank" rel="noopener">http://30.htz.org.cn</a>）的所有朋友。\n' +
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
      if (this.info.length > 100) {
        this.$message.warning("立志信息字数超过100个字！")
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
