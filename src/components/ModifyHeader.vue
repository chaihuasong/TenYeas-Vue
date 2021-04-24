<template>
  <div>
    <el-input
        type="textarea"
        :rows="20"
        placeholder="请输入"
        style="width: 90%"
        v-model="headerHtml">
    </el-input>
    <br/>
    <br/>
    <el-button type="primary" @click="saveHeader" style="margin-right: 20px; text-align: center">保存</el-button>
  </div>
</template>

<script>
import axios from "axios"
import qs from "qs";

export default {
  mounted: function () {
    axios({
      method: "GET",
      url: "http://htzchina.org:8080/getHeader",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then((res) => {
      if (res == null || res.data === '') {
        this.headerHtml = '  <br/>\n' +
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
            '  <br/>\n' +
            '  PS：此项活动免费，开放给看完直播内容（<a href="http://30.htz.org.cn" target="_blank" rel="noopener">http://30.htz.org.cn</a>）的所有朋友。\n' +
            '  <br/>\n' +
            '  【让我们一起 预约十年后更好的自己】\n' +
            '  <br/>\n' +
            '</span>'
      } else {
        this.headerHtml = res.data
      }
    })
  },
  methods: {
    saveHeader() {
      let data = qs.stringify({
        html: this.headerHtml,
      })
      axios({
        method: "POST",
        url: "http://htzchina.org:8080/saveHeader",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data,
      }).then(() => {
        this.$message.success("保存成功！")
      })
    }
  },
  data () {
    return {
      headerHtml: ''
    }
  }
}
</script>