// 打卡记录里 template1~15 / value1~15 的摊平逻辑，组内打卡和我的打卡共用
const MAX_ITEMS = 15

function escape(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]))
}

// 把一条打卡记录摊平成可渲染的文案，数值用 .report-num 高亮
export function buildReportItems(data) {
  const items = []
  for (let i = 1; i <= MAX_ITEMS; i++) {
    const value = data['value' + i]
    const template = data['template' + i]
    if (!template || !value || value === '0') continue
    items.push(escape(template).replace('_', `<span class="report-num">${escape(value)}</span>`))
  }
  return items
}

// 最近的排在前面
export function sortByDateDesc(reports) {
  return reports.slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
}
