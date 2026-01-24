<template>
  <div class="my-home-container">
    <!-- 顶部个人信息卡片 -->
    <div class="profile-header">
      <div class="profile-bg"></div>
      <div class="profile-content">
        <div class="avatar-wrapper">
          <el-image
            class="avatar"
            :src="headimgurl"
            :preview-src-list="headimgurl ? [headimgurl.replace('/132', '/0')] : []"
            fit="cover">
            <div slot="error" class="avatar-error">
              <i class="el-icon-user"></i>
            </div>
          </el-image>
        </div>
        <div class="profile-info">
          <div class="nickname">{{ nickname || '未设置昵称' }}</div>
          <div class="user-meta">
            <span v-if="province"><i class="el-icon-location-outline"></i> {{ province }}</span>
            <span v-if="gender"><i class="el-icon-user"></i> {{ gender === '1' ? '男' : '女' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能入口 -->
    <div class="quick-actions">
      <div class="action-item" @click="gotoGroup">
        <div class="action-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <i class="el-icon-user"></i>
        </div>
        <span>我的团队</span>
      </div>
      <div class="action-item" @click="$router.push('/statistics')">
        <div class="action-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <i class="el-icon-data-line"></i>
        </div>
        <span>数据统计</span>
      </div>
      <div class="action-item" @click="$router.push('/tenyearsHome')">
        <div class="action-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
          <i class="el-icon-edit-outline"></i>
        </div>
        <span>去打卡</span>
      </div>
      <div class="action-item" @click="$router.push('/checkinCircle')">
        <div class="action-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <i class="el-icon-chat-dot-round"></i>
        </div>
        <span>打卡圈</span>
      </div>
    </div>

    <!-- 基本信息卡片 -->
    <div class="section-card">
      <div class="card-header">
        <i class="el-icon-user"></i>
        <span>基本信息</span>
      </div>
      <div class="card-body">
        <div class="info-item">
          <span class="info-label">昵称</span>
          <div class="info-value">
            <input class="info-input" v-model="nickname" @blur="onInfoChange" placeholder="请输入昵称"/>
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">性别</span>
          <div class="info-value">
            <el-radio-group v-model="gender" @change="onGenderChange" size="small">
              <el-radio-button label="1">男</el-radio-button>
              <el-radio-button label="0">女</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">城市</span>
          <div class="info-value">
            <input class="info-input" v-model="province" @blur="onInfoChange" placeholder="请输入城市"/>
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">生日</span>
          <div class="info-value">
            <el-date-picker
              v-model="birthday"
              type="date"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              placeholder="选择生日"
              :clearable="false"
              @change="onInfoChange"
              size="small">
            </el-date-picker>
          </div>
        </div>
      </div>
    </div>

    <!-- 立志信息卡片 -->
    <div class="section-card">
      <div class="card-header">
        <i class="el-icon-aim"></i>
        <span>我的立志</span>
      </div>
      <div class="card-body">
        <div class="textarea-wrapper">
          <textarea
            v-model="info"
            @blur="onInfoChange"
            placeholder="写下你的立志宣言..."
            rows="4"
            class="custom-textarea">
          </textarea>
        </div>
      </div>
    </div>

    <!-- 实施步骤卡片 -->
    <div class="section-card">
      <div class="card-header">
        <i class="el-icon-document-checked"></i>
        <span>实施步骤</span>
      </div>
      <div class="card-body">
        <div class="textarea-wrapper">
          <textarea
            v-model="stepInfo"
            @blur="onInfoChange"
            placeholder="记录你的实施计划..."
            rows="5"
            class="custom-textarea">
          </textarea>
        </div>
      </div>
    </div>

    <!-- 设置卡片 -->
    <div class="section-card">
      <div class="card-header">
        <i class="el-icon-setting"></i>
        <span>设置</span>
      </div>
      <div class="card-body">
        <div class="setting-item" @click="notification = !notification; notificationChange()">
          <div class="setting-left">
            <i class="el-icon-bell"></i>
            <span>打卡提醒</span>
          </div>
          <div class="setting-right">
            <span class="setting-status" :class="{ active: notification }">
              {{ notification ? '已开启' : '已关闭' }}
            </span>
            <el-switch v-model="notification" @change="notificationChange"></el-switch>
          </div>
        </div>
        <div class="setting-item" @click="open = !open; openChange()">
          <div class="setting-left">
            <i class="el-icon-view"></i>
            <span>内容公开</span>
          </div>
          <div class="setting-right">
            <span class="setting-status" :class="{ active: open }">
              {{ open ? '已公开' : '已隐藏' }}
            </span>
            <el-switch v-model="open" @change="openChange"></el-switch>
          </div>
        </div>
        <div class="setting-item" @click="clearUnionId">
          <div class="setting-left">
            <i class="el-icon-delete"></i>
            <span>清空缓存</span>
          </div>
          <div class="setting-right">
            <i class="el-icon-arrow-right"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部间距 -->
    <div style="height: 100px;"></div>
  </div>
</template>

<script>
import axios from 'axios'
import qs from "qs";
import global from "@/components/Common";

export default {
  name: 'MyHome',
  data() {
    return {
      serverUrl: global.httpUrl,
      name: '',
      gender: '1',
      telephone: '',
      wechatgroup: '',
      info: '',
      stepInfo: '',
      createDate: '',
      birthday: '',
      open: false,
      daixie: '',
      chujie: '',
      wechatid: '',
      unionid: '',
      nickname: '',
      openid: '',
      headimgurl: '',
      country: '',
      province: '',
      city: '',
      language: '',
      groupId: '',
      notification: false,
      hasChanges: false
    };
  },
  mounted() {
    document.title = this.$route.meta.title
    this.getData()
  },
  methods: {
    getData() {
      this.unionid = this.$store.getters.getUnionid
      if (this.unionid) {
        this.unionid = this.unionid.replace(/"/g, '')
      }

      axios.get(`${this.serverUrl}getById?id=${this.unionid}`)
        .then(res => {
          if (res.data) {
            const data = res.data
            this.name = data.name || ''
            this.headimgurl = data.headimgurl || ''
            this.gender = String(data.gender || '1')
            this.wechatgroup = data.wechatgroup || ''
            this.telephone = data.telephone || ''
            this.info = data.info || ''
            this.stepInfo = data.stepInfo || ''
            this.createDate = data.createDate || ''
            this.birthday = data.birthday || ''
            this.open = data.open === '1'
            this.daixie = data.daixie || ''
            this.chujie = data.chujie || ''
            this.wechatid = data.wechatid || ''
            this.province = data.province || ''
            this.nickname = data.nickname || ''
            this.notification = data.notification === '1'
          } else {
            this.$message.warning("请先填写立志信息")
            this.$router.push("/tenyears")
          }
        })
        .catch(err => {
          console.error('获取数据失败:', err)
          this.$message.error('获取数据失败')
        })
    },

    onInfoChange() {
      this.updateUserInfo()
    },

    onGenderChange() {
      this.updateUserInfo()
    },

    updateUserInfo() {
      const data = qs.stringify({
        id: this.unionid,
        nickname: this.nickname,
        province: this.province,
        birthday: this.birthday,
        info: this.info,
        stepInfo: this.stepInfo,
        gender: this.gender,
      })

      axios.post(`${this.serverUrl}update`, data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
        .then(() => {
          this.$message.success("保存成功")
        })
        .catch(() => {
          this.$message.error("保存失败")
        })
    },

    openChange() {
      const data = qs.stringify({
        id: this.unionid,
        gender: this.gender,
        open: this.open ? '1' : '0',
      })

      axios.post(`${this.serverUrl}update`, data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
        .then(() => {
          this.$message.success(this.open ? "内容已公开" : "内容已隐藏")
        })
    },

    notificationChange() {
      const data = qs.stringify({
        id: this.unionid,
        gender: this.gender,
        notification: this.notification ? '1' : '0',
      })

      axios.post(`${this.serverUrl}update`, data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
        .then(() => {
          this.$message.success(this.notification ? "提醒已开启" : "提醒已关闭")
        })
    },

    clearUnionId() {
      this.$confirm('清空缓存后需要重新登录，确定继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.commit('$_setUnionid', '')
        this.$message.success("缓存已清空")
        this.$router.push("/tenyearsHome")
      }).catch(() => {})
    },

    gotoGroup() {
      this.$router.push("/group")
    }
  }
}
</script>

<style scoped>
.my-home-container {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 顶部个人信息 */
.profile-header {
  position: relative;
  padding-bottom: 30px;
}

.profile-bg {
  height: 140px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -50px;
  position: relative;
}

.avatar-wrapper {
  flex-shrink: 0;
}

.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  background: white;
}

.avatar-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 50%;
}

.avatar-error i {
  font-size: 40px;
  color: #c0c4cc;
}

.profile-info {
  text-align: center;
  margin-top: 12px;
}

.nickname {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 6px;
}

.user-meta {
  font-size: 13px;
  color: #909399;
}

.user-meta span {
  margin: 0 8px;
}

.user-meta i {
  margin-right: 4px;
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  justify-content: space-around;
  padding: 20px 15px;
  background: white;
  margin: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: transform 0.2s;
}

.action-item:active .action-icon {
  transform: scale(0.95);
}

.action-icon i {
  font-size: 22px;
  color: white;
}

.action-item span {
  font-size: 12px;
  color: #606266;
}

/* 卡片通用样式 */
.section-card {
  background: white;
  margin: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.card-header i {
  margin-right: 10px;
  font-size: 18px;
  color: #409eff;
}

.card-body {
  padding: 10px 20px;
}

/* 信息项 */
.info-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f7fa;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  width: 60px;
  font-size: 14px;
  color: #606266;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
}

.info-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 14px;
  color: #303133;
  background: transparent;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.2s;
}

.info-input:focus {
  background: #f5f7fa;
}

.info-input::placeholder {
  color: #c0c4cc;
}

/* 文本域 */
.textarea-wrapper {
  padding: 5px 0;
}

.custom-textarea {
  width: 100%;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  color: #303133;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.custom-textarea:focus {
  border-color: #409eff;
}

.custom-textarea::placeholder {
  color: #c0c4cc;
}

/* 设置项 */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #f5f7fa;
  cursor: pointer;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item:active {
  background: #f9f9f9;
  margin: 0 -20px;
  padding: 15px 20px;
}

.setting-left {
  display: flex;
  align-items: center;
}

.setting-left i {
  font-size: 18px;
  color: #909399;
  margin-right: 12px;
}

.setting-left span {
  font-size: 14px;
  color: #303133;
}

.setting-right {
  display: flex;
  align-items: center;
}

.setting-status {
  font-size: 13px;
  color: #909399;
  margin-right: 10px;
}

.setting-status.active {
  color: #67c23a;
}

.setting-right .el-icon-arrow-right {
  color: #c0c4cc;
}

/* Element UI 样式覆盖 */
/deep/ .el-radio-button__inner {
  padding: 8px 20px;
}

/deep/ .el-date-editor.el-input {
  width: 150px;
}

/deep/ .el-switch {
  margin-left: 5px;
}
</style>
