import axios from 'axios'
import OSS from 'ali-oss'
import global from '@/components/Common'

const AKSK_URL = 'http://app.htzchina.org/api-proxy/getaksk'
const BUCKET = 'htz-storage'
const REGION = 'oss-cn-shanghai'
const SIGN_EXPIRES = 12 * 60 * 60

let clientPromise = null

function getClient() {
  if (!clientPromise) {
    clientPromise = axios.get(AKSK_URL, {
      params: { appName: 'htz-oss' }
    }).then(res => {
      if (!res.data || !res.data.data) {
        throw new Error('获取上传凭证失败')
      }
      const aksk = JSON.parse(res.data.data)
      if (!aksk.accessKey || !aksk.accessKeySecure) {
        throw new Error('上传凭证无效')
      }
      // 页面是 http 时，SDK 默认走 http。OSS 重定向到 https 会丢掉 Authorization，
      // 私有桶会把这次请求当成匿名直链拒绝。这里强制 https，用 AccessKey 签名。
      return new OSS({
        region: REGION,
        accessKeyId: aksk.accessKey,
        accessKeySecret: aksk.accessKeySecure,
        bucket: BUCKET,
        secure: true
      })
    }).catch(err => {
      clientPromise = null
      throw err
    })
  }
  return clientPromise
}

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

export async function uploadToOss(objectKey, file) {
  const client = await getClient()
  await client.put(objectKey, file, {
    mime: (file && file.type) || 'image/jpeg'
  })
  return {
    stableUrl: `${global.ossUrl}/${objectKey}`,
    signedUrl: client.signatureUrl(objectKey, { expires: SIGN_EXPIRES })
  }
}

export async function signOssUrl(url) {
  const key = ossObjectKey(url)
  if (!key) return url || ''
  const client = await getClient()
  return client.signatureUrl(key, { expires: SIGN_EXPIRES })
}
