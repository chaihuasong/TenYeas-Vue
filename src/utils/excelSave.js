import FileSaver from 'file-saver'

export function inHtzApp(userAgent, storage) {
  const ua = userAgent == null ? (navigator.userAgent || '') : userAgent
  if (typeof window !== 'undefined' && window.HTZApp && typeof window.HTZApp.saveExcel === 'function') return true
  if (/HTZApp/.test(ua)) return true
  if (/MicroMessenger/i.test(ua)) return false
  if (/\bwv\b/.test(ua)) return true
  try {
    const store = storage || localStorage
    return store.getItem('htz_nickname') != null
  } catch (e) {
    return false
  }
}

export function bytesToBase64(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

export function downloadLocationHint(userAgent) {
  const ua = userAgent == null ? (navigator.userAgent || '') : userAgent
  const inWechat = /MicroMessenger/i.test(ua)
  const isIOS = /iPhone|iPad|iPod/i.test(ua)
  if (inWechat && isIOS) {
    return '微信里通常不会出现下载。请点右上角用 Safari 打开后再导出，文件在「文件」App 的「下载」里'
  }
  if (isIOS) return '「文件」App 的「下载」文件夹'
  if (/Android/i.test(ua)) return '手机「下载」文件夹（内部存储 / Download）'
  return '浏览器的下载文件夹'
}

export async function saveExcelFile(wbout, fileName, pickedHandle) {
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  if (pickedHandle) {
    const writable = await pickedHandle.createWritable()
    await writable.write(blob)
    await writable.close()
    return { location: '你刚才选择的文件夹', saved: true }
  }
  const bridge = typeof window !== 'undefined' ? window.HTZApp : null
  if (bridge && typeof bridge.saveExcel === 'function') {
    const path = bridge.saveExcel(bytesToBase64(wbout), fileName) || ''
    if (!path) return { location: 'App 写入下载目录失败', saved: false }
    return { location: path, saved: true }
  }
  if (inHtzApp()) {
    return {
      location: '当前 App 没有把文件写到手机上，所以没有实际路径。更新 App 后再导出',
      saved: false
    }
  }
  FileSaver.saveAs(blob, fileName)
  return { location: downloadLocationHint(), saved: true }
}
