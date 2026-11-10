import test from 'node:test'
import assert from 'node:assert/strict'
import {
  LEGACY_COUNTDOWN_DATE_TEXT,
  LEGACY_COUNTDOWN_NAME,
  countdownFormValues,
  legacyRemainingDays,
  resolveCountdown,
  validateCountdownInput
} from '../src/utils/countdown.js'

const NOW = Date.parse('2031-04-16T16:00:00.000Z')

test('未配置时沿用原来的十年倒计时文案和天数', () => {
  const view = resolveCountdown(null, NOW)
  assert.equal(view.legacy, true)
  assert.equal(view.name, LEGACY_COUNTDOWN_NAME)
  assert.equal(view.dateText, LEGACY_COUNTDOWN_DATE_TEXT)
  assert.equal(view.days, legacyRemainingDays(NOW))
  assert.equal(view.days, resolveCountdown('', NOW).days)
  assert.equal(view.days, resolveCountdown('null', NOW).days)
})

test('旧的日期配置按北京时间当天结束兼容', () => {
  const view = resolveCountdown(
    { name: '十年倒计时', deadline: '2031-04-17' },
    Date.parse('2031-04-16T15:00:00.000Z')
  )
  assert.equal(view.legacy, false)
  assert.equal(view.dateText, '2031年04月17日 23:59')
  assert.equal(view.days, 1)
})

test('自定义名称和北京时间截止点会改变剩余天数', () => {
  const morning = resolveCountdown({
    name: '每日打卡倒计时',
    deadline: '2031-04-17 08:00:00'
  }, Date.parse('2031-04-16T16:30:00.000Z'))
  assert.equal(morning.name, '每日打卡倒计时')
  assert.equal(morning.dateText, '2031年04月17日 08:00')
  assert.equal(morning.days, 0)

  const evening = resolveCountdown({
    name: '每日打卡倒计时',
    endTime: '2031-04-17T23:59:59+08:00'
  }, Date.parse('2031-04-15T16:00:00.000Z'))
  assert.equal(evening.days, 1)
})

test('非法或超长配置回退到旧倒计时，不显示 NaN', () => {
  const bad = resolveCountdown({ name: '阶段打卡', deadline: '2031-02-31 10:00:00' }, NOW)
  assert.equal(bad.legacy, true)
  assert.equal(bad.name, LEGACY_COUNTDOWN_NAME)
  const longName = resolveCountdown({ name: '一二三四五六七八九十一二三四五六七八九十一', deadline: '2031-05-01 00:00:00' }, NOW)
  assert.equal(longName.legacy, true)
})

test('截止时间已过时天数归零', () => {
  const view = resolveCountdown({
    name: '收官',
    deadline: '2030-01-01 00:00:00'
  }, NOW)
  assert.equal(view.days, 0)
})

test('管理端校验名称和截止时间', () => {
  assert.equal(validateCountdownInput('  ', '2031-04-17 08:00:00').ok, false)
  assert.equal(validateCountdownInput('每日打卡', '').ok, false)
  assert.equal(validateCountdownInput('每日打卡', '2031-04-17').message, '请选择截止时间（含小时和分钟）')
  assert.equal(validateCountdownInput('每日打卡', '2031-13-01 00:00:00').ok, false)
  const ok = validateCountdownInput(' 每日打卡倒计时 ', '2031-04-17 08:00')
  assert.equal(ok.ok, true)
  assert.deepEqual(ok.value, { name: '每日打卡倒计时', deadline: '2031-04-17 08:00:00' })
})

test('表单在没有保存记录时给出旧配置，保存后回填自定义值', () => {
  assert.deepEqual(countdownFormValues(''), {
    name: '十年倒计时',
    deadline: '2031-04-17 23:59:59',
    saved: false
  })
  assert.deepEqual(countdownFormValues({ name: '冲刺', deadline: '2032-01-02 03:04:05' }), {
    name: '冲刺',
    deadline: '2032-01-02 03:04:05',
    saved: true
  })
})
