<script type="text/javascript">
// 定义一些公共的属性和方法
const httpUrl = 'http://htzchina.org:8080/'
// const httpUrl = 'http://localhost:8080/'
function commonFun() {
  console.log("公共方法")
}
// 暴露出这些属性和方法
export default {
  httpUrl,
  commonFun
}
</script>