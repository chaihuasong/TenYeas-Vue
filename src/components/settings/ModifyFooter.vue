<template>
  <div>
    <el-input
        type="textarea"
        :rows="20"
        placeholder="请输入"
        style="width: 90%"
        v-model="footerHtml">
    </el-input>
    <br/>
    <br/>
    <el-button type="primary" @click="saveFooter" style="margin-right: 20px; text-align: center">保存</el-button>
  </div>
</template>

<script>
import axios from "axios"
import qs from "qs";

export default {
  mounted: function () {
    axios({
      method: "GET",
      url: "https://htzchina.org:8080/getFooter",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then((res) => {
      if (res == null || res.data === '') {
        this.footerHtml = '  <br/>\n  <br/>\n'
      } else {
        this.footerHtml = res.data
      }
    })
  },
  methods: {
    saveFooter() {
      let data = qs.stringify({
        html: this.footerHtml,
      })
      axios({
        method: "POST",
        url: "https://htzchina.org:8080/saveFooter",
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
      footerHtml: ''
    }
  }
}
</script>