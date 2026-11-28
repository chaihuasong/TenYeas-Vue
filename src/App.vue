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

/* 移动端确认弹窗收窄：Element UI 默认 420px，在手机屏幕上会被裁掉，
   按钮（靠右对齐）显示不全，这里按屏宽收小 */
.el-message-box {
  max-width: 85vw;
}

/* el-avatar 默认只给图片 height:100%，没有宽度，object-fit 不生效，
   非正方形头像（如上传的长方形照片）铺不满圆形会露出灰色底，
   补上宽高让头像铺满整个圆 */
.el-avatar > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
