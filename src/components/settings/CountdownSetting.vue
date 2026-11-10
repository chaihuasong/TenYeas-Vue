<template>
  <div>
    <el-alert
        :title="statusText"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 16px; width: 90%" />
    <el-form label-width="120px" style="width: 640px; max-width: 90%">
      <el-form-item label="倒计时名称">
        <el-input v-model="form.name" maxlength="20" show-word-limit placeholder="例如：每日打卡倒计时"></el-input>
      </el-form-item>
      <el-form-item label="截止时间">
        <el-date-picker
            v-model="form.deadline"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            format="yyyy-MM-dd HH:mm"
            placeholder="选择北京时间"
            :editable="false" />
        <div style="color:#909399;font-size:12px;line-height:1.6">
          按北京时间保存。未保存前，首页仍使用原来的十年倒计时（2031年04月17日）。
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import axios from 'axios'
import qs from 'qs'
import global from '@/components/Common'
import { countdownFormValues, validateCountdownInput } from '@/utils/countdown'

export default {
  data() {
    return {
      serverUrl: global.httpUrl,
      saving: false,
      saved: false,
      form: {
        name: '',
        deadline: ''
      }
    }
  },
  computed: {
    statusText() {
      if (this.saved) return '首页正在使用已保存的倒计时名称和截止时间。'
      return '尚未单独保存。首页仍按原来的十年倒计时显示，刷新不会丢失这套旧配置。'
    }
  },
  mounted() {
    if (!this.checkLogin()) {
      const loginUser = this.$store.getters.getUser
      this.$router.push(loginUser === 'admin' ? '/admin' : '/role')
      return
    }
    document.title = this.$route.meta.title
    this.load()
  },
  methods: {
    checkLogin() {
      const loginDate = this.$store.getters.getSortage
      if (loginDate != null && loginDate !== '') {
        if ((Date.now() - loginDate) < 3600000) return true
      }
      return false
    },
    applyPayload(payload) {
      const values = countdownFormValues(payload)
      this.form.name = values.name
      this.form.deadline = values.deadline
      this.saved = values.saved
    },
    load() {
      axios.get(this.serverUrl + 'getCountdown').then(res => {
        this.applyPayload(res.data)
      }).catch(() => {
        this.applyPayload(null)
      })
    },
    save() {
      const checked = validateCountdownInput(this.form.name, this.form.deadline)
      if (!checked.ok) {
        this.$message.warning(checked.message)
        return
      }
      this.saving = true
      axios({
        method: 'POST',
        url: this.serverUrl + 'saveCountdown',
        data: qs.stringify(checked.value),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(res => {
        if (res.data === 'fail' || res.data === false) {
          this.$message.warning('保存失败！')
          return
        }
        this.form.name = checked.value.name
        this.form.deadline = checked.value.deadline
        this.saved = true
        this.$message.success('保存成功！')
      }).catch(err => {
        console.error('保存倒计时失败:', err)
        this.$message.error('保存失败，请确认倒计时接口可用后重试')
      }).finally(() => {
        this.saving = false
      })
    }
  }
}
</script>
