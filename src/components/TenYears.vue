<template>
  <div>
    <h2>十年立志</h2>
    <p style="color: chocolate;font-style: italic">
      让我们一起 预约十年后更好的自己
    </p>
    <div class="titleNameStyle"><span class='req'>*</span> 1、您的姓名</div>
    <el-input placeholder="请输入" prefix-icon="el-icon-s-custom" v-model="name" class="inputStyle" clearable></el-input>
    <br/>
    <div class="sexTitleStyle"><span class='req'>*</span> 2、您的性别</div>
    <br/>
    <br/>
    <div class="radioButtonStyle2">
      <el-radio-group v-model="gender" >
        <el-radio label="1">男</el-radio>
        <el-radio label="0">女</el-radio>
      </el-radio-group>
    </div>
    <div class="titleNameStyle"><span class='req'>*</span> 3、您的手机号</div>
    <el-input placeholder="请输入" prefix-icon="el-icon-mobile-phone" v-model="telephone" class="inputStyle" clearable pattern="[0-9]*"></el-input>

    <div class="titleNameStyle"><span class='req'>*</span> 4、您的身份证号</div>
    <el-input placeholder="请输入" prefix-icon="el-icon-postcard" v-model="identityCard" class="inputStyle" clearable pattern="[0-9]*[x]"></el-input>

    <div class="titleNameStyle"><span class='req'>*</span> 5、请输入立志信息</div>
    <el-input
        type="textarea"
        :rows="8"
        placeholder="请输入"
        style="width: 90%"
        maxlength="999"
        show-word-limit
        v-model="info">
    </el-input>
    <br/>
    <br/>
    <el-button :disabled="submitDisable" type="primary" class="submitStyle" @click="submit">提交</el-button>
    <br/>
    <br/>
    <ul>
      <li><a href="http://htz.org.cn" target="_blank" rel="noopener">黄庭禅台湾</a></li>
      <li><a href="https://neixinchan.com" target="_blank" rel="noopener">黄庭禅官网</a></li>
    </ul>
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
  data () {
    return {
      name: '',
      gender: '1',
      telephone: '',
      identityCard: '',
      info: '',
      createDate: '',

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

    };
  },
  mounted: function () {
    document.title = this.$route.meta.title
    console.log("getData")
    this.getData()
  },
  methods: {
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
          this.province = res.data.province
          this.city = res.data.city
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
              this.identityCard = res.data.identityCard
              this.telephone = res.data.telephone
              this.info = res.data.info
              this.createDate = res.data.createDate

              let createTime = Date.parse(this.createDate)
              console.log("remaining time:" + (Date.now() - createTime))
              if ((Date.now() - createTime) > 3600000 * 24) {
                this.$message({
                  message: '数据已被锁定，无法修改！',
                  type: 'warning'
                })
                this.submitDisable = true
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
        this.$message({
          message: '请输入您的姓名！',
          type: 'warning'
        })
        return;
      }
      if (this.name.length < 2) {
        this.$message({
          message: '请输入您完整姓名！',
          type: 'warning'
        })
        return;
      }
      if (this.telephone.trim() === '') {
        this.$message({
          message: '请输入您的手机号！',
          type: 'warning'
        })
        return;
      }
      if (this.telephone.length !== 11) {
        this.$message({
          message: '请输入正确的手机号码！',
          type: 'warning'
        })
        return;
      }
      if (this.identityCard.trim() === '') {
        this.$message({
          message: '请输入您的身份证号！',
          type: 'warning'
        })
        return;
      }
      if (this.identityCard.length !== 18) {
        this.$message({
          message: '请输入正确的身份证号码！',
          type: 'warning'
        })
        return;
      }
      if (this.info.trim() === '') {
        this.$message({
          message: '请输入您的立志信息！',
          type: 'warning'
        })
        return;
      }
      if (this.info.length < 10) {
        this.$message({
          message: '立志信息字数过少！',
          type: 'warning'
        })
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
        identityCard: this.identityCard,
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

/deep/ .el-radio{
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
