import { Message } from 'element-ui'

export function showQuickTip(message, type = 'success', duration = 1200) {
  Message.closeAll()
  Message({
    message,
    type,
    duration,
  })
}
