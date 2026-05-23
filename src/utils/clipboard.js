function copyWithTextarea(text) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.cssText = 'position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:none;outline:none;box-shadow:none;background:transparent;'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  textarea.setSelectionRange(0, text.length)

  let copied = false
  try {
    copied = document.execCommand('copy')
  } catch (err) {
    copied = false
  }

  document.body.removeChild(textarea)
  return copied
}

export function copyToClipboard(text, vm) {
  if (!text) {
    return Promise.resolve(false)
  }

  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch(() => copyWithFallback(text, vm))
  }

  return copyWithFallback(text, vm)
}

function copyWithFallback(text, vm) {
  if (copyWithTextarea(text)) {
    return Promise.resolve(true)
  }

  if (vm && vm.$copyText) {
    return vm.$copyText(text).then(() => true).catch(() => false)
  }

  return Promise.resolve(false)
}

export function copyToClipboardSync(text) {
  if (!text) {
    return false
  }

  if (copyWithTextarea(text)) {
    return true
  }

  return false
}
