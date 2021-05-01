<template>
  <div>
    <tab-bar>
      <tab-bar-item path="/homePage" activeColor="deepPink">
        <img slot="item-icon" src="../assets/img/tabbar/home.png" alt="">
        <img slot="item-icon-active" src="../assets/img/tabbar/home_selected.png" alt="">
        <div slot="item-text">首页</div>
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
export default {
  name: 'MainTabBar',
  components: {
    TabBar,
    TabBarItem
  }
}
</script>

<style>
</style>