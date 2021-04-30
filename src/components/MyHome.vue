<template>
  <div>
    <span style="color: #3a8ee6; font-size: 18px;text-align: center">{{this.nickname}} 欢迎回家！</span>

    <br/>
    <br/>
    <table align="center" cellpadding="10">
      <tr>
        <th>
          头像：
        </th>
        <td>
          <el-image
              style="width: 60px; height: 60px"
              :src="this.headimgurl"
              :preview-src-list="[this.headimgurl.substr(0, this.headimgurl.lastIndexOf('/')) + '/0']"
              :fit="none" />
        </td>
      </tr>
      <tr>
        <th>
          姓名：
        </th>
        <td>
          {{this.nickname}}
        </td>
      </tr>
      <tr>
        <th>
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
          {{this.birthday}}
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

      <tr>
        <th>
          十年倒计时：
        </th>
        <td>
          {{ times }}
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import axios from 'axios'
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
      dialogTableVisible: false,
      imgUrl: '',
      isTimeout: false,
      chujieIndex: '11',
      openIndex: '12',
      smallScreen: false,

      times: 3600
    };
  },
  mounted: function () {
    document.title = this.$route.meta.title
    console.log("getData")
    this.getData()
    this.configDiv()
    this.timeCountDown()
  },
  methods: {
    timeCountDown() {
      this.timer = setInterval(()=>{
        this.times--
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
      let openid = getOpenId()
      openid = "onuFi1qE_KG2W3T9YG6bv49cJjyQ"
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
          }
        });
      }
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
