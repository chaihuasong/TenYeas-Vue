<script type="text/javascript">
// 定义一些公共的属性和方法
const httpUrl = 'http://htzchina.org:8080/'
// const httpUrl = 'http://localhost:8080/'

function getDateFormat(date) {
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  if (month < 10) month = '0' + month
  let day = date.getDate()
  if (day < 10) day = '0' + day
  return year + "-" + month + "-" + day
}
// 暴露出这些属性和方法
export default {
  httpUrl,
  getDateFormat
}
</script>