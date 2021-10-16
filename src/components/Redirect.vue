<template>
  <div>

  </div>
</template>

<style>
</style>

<script language="javascript">

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

import axios from 'axios'

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
      let code = getParameterByName("code", window.location.href)
      if (code !== "" && code != null && code.length > 0) {
        axios({
          method: "GET",
          url: "https://htzchina.org:444/getOpenId?code=" + code,
          data: null,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then((res) => {
          window.location.href = "https://htzchina.org/tenyears/#/index?openid=" + res.data
        });
      }
    }
  }
};
</script>