<template>
  <div>

  </div>
</template>

<style>
</style>

<script language="javascript">

export default {
  data() {
    return {
      tableData: []
    }
  },
  mounted: function () {
    this.getData()
  },
  methods: {
    getData() {
      //window.location.href = "https://htzchina.org:8081/#/redirect?code=1234"
      //encodeURI() // TODO
      window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx83aec75c3ca58f0e&redirect_uri=https://htzchina.org/wc_redirect&response_type=code&scope=snsapi_base&state=123#wechat_redirect"
    }
  }
};
</script>