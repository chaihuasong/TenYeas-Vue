<template>
  <div>

    <div>
      <el-image style="width: 100%; height: 180px"
                :src="'http://wechatapppro-1252524126.picsh.myqcloud.com/appw8Gkxo2j3844/image/kk0m31b50iadsj42fbb9.png?imageView2/q/70'"
                fit="cover"/>
    </div>

    <nav style="margin-top: 20px;margin-bottom: 20px">
      <div style="width: 20%;margin-left: 4%">
        <a href="http://neixinchan.org:9998/#/" style="text-decoration:none;">
          <img src="http://wechatappdev-10011692.picsh.myqcloud.com/image/column_kind/icon_9.png?imageView2/q/80"/>
          <div>经典搜索</div>
        </a>
      </div>
      <div style="width: 20%;margin-left: 4%">
        <a href="http://htzchina.org/tenyears/#/index" style="text-decoration:none;">
          <img src="http://wechatappdev-10011692.picsh.myqcloud.com/image/column_kind/icon_1.png?imageView2/q/80"/>
          <div>十年立志</div>
        </a>
      </div>
      <div style="width: 20%;margin-left: 4%">
        <a href="http://htzchina.org/tenyears/#/error" style="text-decoration:none;">
          <img src="http://wechatappdev-10011692.picsh.myqcloud.com/image/column_kind/icon_8.png?imageView2/q/80"/>
          <div>家长课堂</div>
        </a>
      </div>
      <div style="width: 20%;margin-left: 4%">
        <a href="http://htzchina.org/tenyears/#/error" style="text-decoration:none;">
          <img src="http://wechatappdev-10011692.picsh.myqcloud.com/image/column_kind/icon_15.png?imageView2/q/80"/>
          <div>线下课程</div>
        </a>
      </div>
    </nav>

    <el-card style="float: left; width: 100%;">
      <div style="text-align: center;float: left;margin-bottom: 10px;margin-left: 10px">
        <div style="float: left">
          <img style="border-radius:50%; width: 70px;height: 70px;"
               src="http://wechatapppro-1252524126.picsh.myqcloud.com/appw8Gkxo2j3844/image/bWljcm9QYWdlRGVzaWduLW1pY3JvUGFnZURlc2lnbi04OTc3MzA0Ng.jpg?imageView2/q/80"
               alt=""/>
        </div>
        <div style="float: left; height: 70px;margin-left: 10px">
          <div style="width:100px;font-size:16px; font-weight: bold; color:#000; height: 25px; text-align: left;">
            张庆祥
          </div>
          <div style="font-size:13px; color:#909399; width: 230px; height: 50px; text-align: left;">
            黄庭禅创办人，中岭山黄庭书院院主； 贯通三教经典、契悟心法精髓的禅师
          </div>
        </div>
      </div>
    </el-card>

    <div style="margin-top: 20px;float: left">
      <ul>
        <li style="width: 100%">
          <span>
            专栏
          </span>
          张庆祥讲易经（一）
        </li>
        <li style="width: 100%">
          <span>
            专栏
          </span>
          黄庭禅静心助眠养生（站桩静坐）
        </li>
        <li style="width: 100%">
          <span>
            专栏
          </span>
          张庆祥讲传习录（视频）
        </li>
      </ul>
    </div>
    <TabBar/>
  </div>
</template>

<script>
import html2canvas from "html2canvas";
import axios from "axios";

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

      times: 0
    };
  },
  mounted: function () {
    document.title = this.$route.meta.title
    console.log("homePage getData")
    this.getData()
    this.configDiv()
    this.timeCountDown()
  },
  methods: {
    getOpenId() {
      const str = window.location.href
      if (str == null || !(str.indexOf("?") > 0)) {
        return null
      }
      let openid = window.location.href.split("?")[1].split("=")[1];
      if (openid != null) {
        return openid
      }
      return null
    },
    timeCountDown() {
      this.timer = setInterval(() => {
        this.times--
        if (this.times === 0) {
          this.show = true
          clearInterval(this.timer)
        }
      }, 1000)
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
      let uid = this.$store.getters.getUnionid
      if (uid != null && uid !== '' && uid !== undefined) {
        this.unionid = uid.replace("\"","").replace("\"","")
        console.log("unionid:" + this.unionid)
        this.getUserInfoByUnionId()
        return;
      }
      let openid = this.getOpenId()
      // openid = "onuFi1qE_KG2W3T9YG6bv49cJjyQ"
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
            console.log("openid:" + res.data)
            console.log("unionid:" + res.data.unionid)
            console.log("sex:" + res.data.sex)
            this.unionid = res.data.unionid
            if (this.unionid === null || this.unionid === '' || this.unionid === undefined) {
              alert("信息获取失败，请关注“黄庭书院”公众号后重试！")
              return
            }
            this.$store.commit('$_setUnionid', this.unionid)
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
        window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx83aec75c3ca58f0e&redirect_uri=http://htzchina.org/wc_redirect2&response_type=code&scope=snsapi_base&state=123#wechat_redirect"
      }
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

          let endTime = Date.parse("2021-05-1T00:00:00.000Z")
          console.log("endTime:" + endTime)
          console.log("remaining:" + (Date.now() - endTime))
          if (Date.now() - endTime > 0) {
            this.daixieDisabled = true
            this.daixie = '0'
          }
        }
      });
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.van-swipe-item {
  width: 100%
}

nav {
  display: flex;
  flex-flow: row wrap;
  /* 交叉轴上的分散对齐 */
  align-content: space-around;
}

nav > div {
  display: flex;
  flex-flow: column nowrap;
  text-align: center;
  width: 25vw;
  margin: 10px 0;
}

nav > div img {
  width: 50%;
}

nav > div > a > p {
  color: #666;
  font-weight: 700;
}

img {
  pointer-events: none;
}

/deep/ .el-radio {
  white-space: normal;
}

.req {
  color: red;
  font-size: 16px;
  font-weight: bold;
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


.sexTitleStyle {
  float: left;
  width: 100%;
  text-align: left;
  font-size: 16px;
  font-weight: bold;
  margin-left: 10px;
}

.titleNameStyle {
  float: left;
  width: 100%;
  text-align: left;
  font-size: 16px;
  font-weight: bold;
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
