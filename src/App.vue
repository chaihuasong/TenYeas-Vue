<template>
  <div id="app">
<!--    <img alt="Vue logo" src="./assets/logo.png">-->
    <router-view></router-view>
    <main-tab-bar v-if="$route.meta.footShow"/>
  </div>
</template>

<script>
import MainTabBar from './components/MainTabBar'
export default {
  name: 'App',
  components: {
    MainTabBar
  }
}
</script>

<style>
/* 去掉移动端点击时的方形高亮框，避免与圆角按钮不一致 */
* {
  -webkit-tap-highlight-color: transparent;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}

/* 全局对话框按钮样式 - 统一为椭圆形 */
.dialog-footer .el-button {
  border-radius: 15px;
}
</style>
