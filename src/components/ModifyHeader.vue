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
        this.headerHtml = '<span style="text-align: left; display:inline-block">\n' +
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