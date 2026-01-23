<template>
  <div>
    <el-card style="float: left;width: 100%;margin-top: 5px">
      <span style="font-size: 22px;color: #66b1ff">每日打卡</span>
      <br/>
      <br/>
      <br/>
      <el-date-picker
          v-model="date"
          align="right"
          type="date"
          :editable="false"
          placeholder="选择打卡日期"
          style="margin-left: 20%;width: 150px"
          :picker-options="pickerOptions">
      </el-date-picker>
      <i :class="[saving ? 'el-icon-loading' : (editMode ? 'el-icon-finished' : 'el-icon-edit')]"
         style="float: right;margin-right: 10%;margin-top: 20px" @click="changeMode"></i>
      <br/>
      <br/>
      <form action="" class="ready-form">
        <ul v-for='(list, index) in lists' :key='index'>
          <li>
            <!-- 使用 v-show 替代 v-if 减少 DOM 操作 -->
            <span v-show="!editMode" style="display: inline-block;width: 20%;text-align: right">{{ list.title }}</span>
            <el-input v-show="editMode" style="display: inline-block;width: 30%;" v-model="list.title"
                      placeholder="请输入项目"></el-input>
            <el-input v-show="!editMode" v-model="list.value" placeholder="请输入"
                      style="display: inline-block;width: 30%;margin: 0 20px"></el-input>
            <el-input disabled v-show="editMode"
                      style="display: inline-block;width: 12%;margin: 0 20px"></el-input>
            <el-input v-show="editMode" style="display: inline-block;width: 30%;" v-model="list.unit"
                      placeholder="请输入单位"></el-input>
            <span v-show="!editMode" style="display: inline-block;width: 20%;text-align: left">{{ list.unit }}</span>
            <el-button v-show="editMode" icon="el-icon-minus" circle @click="del(index)"
                       style="background: hotpink;margin-left: 10px;display: inline-block"></el-button>
          </li>
        </ul>
      </form>
      <div v-show="editMode" style="position: relative;top: 5%;">
        <el-button icon="el-icon-plus" circle @click="addEl"
                   style="background: lightcyan;margin-top: 10px"></el-button>
      </div>
      <div style="margin-top: 30px">
        <el-button v-show="!editMode" type="primary" @click="submit" :loading="submitting" :disabled="loading">打卡</el-button>
      </div>
    </el-card>
    <el-card>
      <span>{{ nickname }} {{ formattedDate }}</span>
      <ul v-for='(list, index) in lists' :key="'preview-' + index" style="text-align: center;">
        <li>
          <span v-show="!editMode" style="font-size: 18px;color: #3535c6">{{ index + 1 }}.{{ list.title }}:{{ list.value }} {{ list.unit }}</span>
        </li>
      </ul>
    </el-card>
  </div>
</template>


<script>

import axios from "axios"
import qs from "qs"
import wx from 'weixin-js-sdk'
import global from './Common.vue'

// 从 URL 参数中获取 openid
function getOpenId() {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('openid')
  } catch (e) {
    // 兼容不支持 URLSearchParams 的浏览器
    const str = window.location.href
    if (str === null || str.indexOf("?") <= 0) {
      return null
    }
    const params = window.location.href.split("?")[1].split("&")
    for (let i = 0; i < params.length; i++) {
      const pair = params[i].split("=")
      if (pair[0] === 'openid') {
        return pair[1] || null
      }
    }
    return null
  }
}

export default {
  name: 'DailyReport',
  props: {
    msg: String
  },
  data() {
    return {
      serverUrl: global.httpUrl,
      loading: false,
      saving: false,
      submitting: false,
      sex: '',
      unionid: '',
      nickname: '',
      openid: '',
      headimgurl: '',
      country: '',
      province: '',
      city: '',
      language: '',
      groupId: '',
      date: Date.now(),
      editMode: false,
      template: {},
      lists: [
        {title: "站桩", unit: '分钟', value: ''},
        {title: "静坐", unit: '分钟', value: ''},
        {title: "诵读经典", unit: '分钟', value: ''},
        {title: "经典学习", unit: '分钟', value: ''},
        {title: "运动", unit: '分钟', value: ''},
        {title: "善本", unit: '条', value: ''},
        {title: "宽两秒", unit: '次', value: ''}
      ],
      // 使用 Object.freeze 冻结静态配置，避免 Vue 添加响应式，提升性能
      pickerOptions: Object.freeze({
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', new Date());
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24);
            picker.$emit('pick', date);
          }
        }, {
          text: '前天',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 2);
            picker.$emit('pick', date);
          }
        }]
      }),
    };
  },
  mounted: function () {
    document.title = this.$route.meta.title
    // 并行请求，提升加载速度
    this.getData()
    this.configWechat()
  },
  computed: {
    // 使用计算属性缓存日期格式化结果，避免每次渲染都重新计算
    formattedDate() {
      const date = new Date(this.date)
      let month = date.getMonth() + 1
      if (month < 10 && month > 0) month = "0" + month
      let dates = date.getDate()
      if (dates < 10 && dates > 0) dates = "0" + dates
      return month + '/' + dates
    }
  },
  methods: {
    getData() {
      let openid = getOpenId()
      console.log("openid:" + openid)
      if (openid !== "" && openid !== null && openid && openid.length > 0) {
        console.log("begin axios...")
        this.loading = true
        axios({
          method: "GET",
          url: this.serverUrl + "getUserInfo?openid=" + openid,
          data: null,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then((res) => {
          if (res !== null && res.data !== null && res.data !== '') {
            console.log("openid:" + res)
            console.log("unionid:" + res.data.unionid)
            console.log("sex:" + res.data.sex)
            this.unionid = res.data.unionid
            if (this.unionid === null || this.unionid === '' || this.unionid === undefined) {
              alert("信息获取失败，请关注"黄庭书院"公众号后重试！")
            }
            this.nickname = res.data.nickname
            this.openid = res.data.openid
            this.headimgurl = res.data.headimgurl
            this.country = res.data.country
            this.city = res.data.city
            this.province = res.data.province + this.city
            this.language = res.data.language
            this.groupId = res.data.groupId
            this.sex = res.data.sex + ''
          }
        }).catch((err) => {
          console.error('获取用户信息失败:', err)
          this.$message.error('获取用户信息失败，请刷新重试')
        }).finally(() => {
          this.loading = false
        });
      } else {
        window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx83aec75c3ca58f0e&redirect_uri=http://htzchina.org/wc_redirect3&response_type=code&scope=snsapi_base&state=123#wechat_redirect"
      }
    },
    submit() {
      // 防止重复提交
      if (this.submitting) {
        return
      }

      // 验证是否填写了打卡数值
      for (let i = 0; i < this.lists.length; i++) {
        if (this.lists[i].value.trim() === '') {
          this.$message.warning('请填写"' + this.lists[i].title + '"的数值')
          return
        }
      }

      this.submitting = true
      let data = {}
      for (let i = 0; i < this.lists.length; i++) {
        data['template' + i] = this.lists[i].title.trim() + this.lists[i].value.trim() + this.lists[i].unit.trim()
      }

      this.$message.success(qs.stringify(data))

      // 防抖：500ms 后允许再次提交
      setTimeout(() => {
        this.submitting = false
      }, 500)
    },
    changeMode() {
      if (this.editMode) {
        for (let i = 0; i < this.lists.length; i++) {
          if (this.lists[i].title.trim() === '') {
            this.$message.warning("请输入项目")
            return
          }
          // if(this.lists[i].unit.trim() === '') {
          //   this.$message.warning("请输入单位")
          //   return
          // }
          this.template['template' + i] = this.lists[i].title.trim() + "_" + this.lists[i].unit.trim()
        }

        this.saving = true
        let data = qs.stringify(this.template)
        axios({
          method: "POST",
          url: this.serverUrl + "saveTemplate",
          data: data,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then((res) => {
          if (res.status === 200) {
            this.$message.success("模板保存成功")
          } else {
            this.$message.warning("保存出错！\n" + res.statusText)
          }
        }).catch((err) => {
          console.error('保存模板失败:', err)
          this.$message.error('保存失败，请重试')
        }).finally(() => {
          this.saving = false
        });
      }
      this.editMode = !this.editMode
    },
    addEl: function () {
      if (this.lists.length > 19) {
        this.$message.warning("已达到上限！")
        return
      }
      let cope = {
        title: '',
        unit: '',
        value: ''
      }
      this.lists.push(cope);
    },
    del: function (index) {
      this.lists.splice(index, 1);
    },
    configWechat() {
      axios({
        method: "GET",
        url: this.serverUrl + "getAccessToken?url=" + window.location.href,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res !== null && res.data !== null && res.data !== '') {
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
      }).catch((err) => {
        console.error('获取微信配置失败:', err)
      });

      wx.ready(function () {   //需在用户可能点击分享按钮前就先调用
        wx.onMenuShareAppMessage({
          title: '黄庭书院"养气功课"打卡', // 分享标题
          desc: '让我们一起 抱团成长~', // 分享描述
          link: "http://htzchina.org/tenyears/#/dailyReport", // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: 'http://htzchina.org/imgs/huangtingshuyuan.png', // 分享图标
          success: function () {
            // 设置成功
            console.log("分享设置成功");
          }
        })
        wx.onMenuShareTimeline({
          title: '黄庭书院"养气功课"打卡', // 分享标题
          desc: '让我们一起 抱团成长~', // 分享描述
          link: "http://htzchina.org/tenyears/#/dailyReport", // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: 'http://htzchina.org/imgs/huangtingshuyuan.png', // 分享图标
          success: function () {
            // 用户点击了分享后执行的回调函数
            console.log("分享到朋友圈设置成功");
          }
        })
      });

      wx.error(function (res) {
        console.error('微信配置失败:', res)
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

::v-deep .el-radio {
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
</style>
