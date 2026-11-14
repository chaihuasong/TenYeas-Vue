import axios from 'axios'

// 使用相对路径，随当前站点（app.htzchina.org 或 htzclass.com）同源反代，避免 HTTPS 页面里 HTTP 请求被浏览器拦截（mixed content）以及跨域 CORS 报错
const API = '/htz-api-pyservice/api/v1'

export function ossObjectKey(url) {
  if (!url || typeof url !== 'string' || url.indexOf('htz-storage') === -1) {
    return ''
  }
  try {
    const parsed = new URL(url)
    if (parsed.hostname.indexOf('htz-storage') === -1) return ''
    return decodeURIComponent(parsed.pathname.replace(/^\//, ''))
  } catch (e) {
    return ''
  }
}

function apiError(err, fallback) {
  const status = err && err.response && err.response.status
  const msg = err && err.response && err.response.data && err.response.data.msg
  if (msg) return new Error(msg)
  if (status) return new Error(fallback + ' (' + status + ')')
  return err || new Error(fallback)
}

export async function uploadToOss(objectKey, file) {
  const form = new FormData()
  form.append('file', file)
  form.append('objectKey', objectKey)
  try {
    const res = await axios.post(`${API}/oss/avatar`, form)
    const data = res.data && res.data.data
    if (!res.data || res.data.code !== '0' || !data || !data.signedUrl) {
      throw new Error((res.data && res.data.msg) || '上传失败')
    }
    return data
  } catch (err) {
    throw apiError(err, '上传失败')
  }
}

export async function signOssUrl(url) {
  const key = ossObjectKey(url)
  if (!key) return url || ''
  try {
    const res = await axios.get(`${API}/oss/sign`, { params: { url } })
    const signed = res.data && res.data.data
    if (!res.data || res.data.code !== '0' || !signed) {
      return url
    }
    return signed
  } catch (err) {
    console.error('头像签名失败', err)
    return url
  }
}
