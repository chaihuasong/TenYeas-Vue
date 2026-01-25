<script type="text/javascript">
// 定义一些公共的属性和方法
const httpUrl = 'http://htzchina.org:8081/'
// const httpUrl = 'http://localhost:8081/'
const ossUrl = 'https://htz-storage.oss-cn-shanghai.aliyuncs.com'

function getDateFormat(date) {
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  if (month < 10) month = '0' + month
  let day = date.getDate()
  if (day < 10) day = '0' + day
  return year + "-" + month + "-" + day
}

// 获取用户头像，优先使用 OSS 头像
function getAvatarUrl(user) {
  if (user && user.avatarUrl) {
    return user.avatarUrl
  }
  if (user && user.headimgurl) {
    return user.headimgurl
  }
  return ''
}

// 暴露出这些属性和方法
export default {
  httpUrl,
  ossUrl,
  getDateFormat,
  getAvatarUrl
}
</script>