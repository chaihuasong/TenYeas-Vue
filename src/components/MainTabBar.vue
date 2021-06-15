<template>
  <div>
    <tab-bar>
      <tab-bar-item path="/tenyearsHome" activeColor="deepPink">
        <img slot="item-icon" src="../assets/img/tabbar/home.png" alt="">
        <img slot="item-icon-active" src="../assets/img/tabbar/home_selected.png" alt="">
        <div slot="item-text">首页</div>
      </tab-bar-item>
      <tab-bar-item path="/statistics" activeColor="deepPink">
        <img slot="item-icon" src="../assets/img/tabbar/statistics.png" alt="">
        <img slot="item-icon-active" src="../assets/img/tabbar/statistics_selected.png" alt="">
        <div slot="item-text">统计</div>
      </tab-bar-item>
      <tab-bar-item path="/myHome" activeColor="deepPink">
        <img slot="item-icon" src="../assets/img/tabbar/my.png" alt="">
        <img slot="item-icon-active" src="../assets/img/tabbar/my_selected.png" alt="">
        <div slot="item-text">我的</div>
      </tab-bar-item>
    </tab-bar>
  </div>
</template>

<script>
import TabBar from "./tabbar/TabBar";
import TabBarItem from "./tabbar/TabBarItem";
import qs from "qs";
import axios from "axios";
import global from "@/components/Common";
export default {
  name: 'MainTabBar',
  components: {
    TabBar,
    TabBarItem
  },
  data() {
    return {
      serverUrl: global.httpUrl,
    }
  },
  mounted() {
    this.$nextTick(()=>{
      this.visited()
    })
  },
  methods: {
    visited() {
      let data = qs.stringify({
        date: this.getDateFormat(new Date()),
      })
      axios({
        method: "POST",
        url: this.serverUrl + "visited",
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
    },
    getDateFormat(date) {
      let year = date.getFullYear()
      let month = date.getMonth() + 1
      if (month < 10) month = '0' + month
      let day = date.getDate()
      if (day < 10) day = '0' + day
      return year + "-" + month + "-" + day
    },
  }
}
</script>

<style>
</style>