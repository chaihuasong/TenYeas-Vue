<template>
  <div class="htq-container">
    <!-- 顶部头图区域 -->
    <div class="header-section">
      <div class="header-bg"></div>
      <div class="header-content">
        <el-avatar :size="56" :src="headimgurl" class="user-avatar">
          <i class="el-icon-user-solid"></i>
        </el-avatar>
        <div class="header-info">
          <div class="header-title">立志圈</div>
          <div class="header-subtitle">{{ nickname || '匿名用户' }}</div>
        </div>
      </div>
    </div>

    <!-- 内容列表 -->
    <div class="content-section">
      <div v-if="loading" class="loading-state">
        <i class="el-icon-loading"></i>
        <span>加载中...</span>
      </div>

      <div v-else-if="filteredData.length > 0" class="post-list">
        <div v-for="item in filteredData" :key="item.unionid" class="post-card">
          <div class="post-header">
            <el-avatar :size="44" :src="item.headimgurl" class="post-avatar">
              <i class="el-icon-user-solid"></i>
            </el-avatar>
            <div class="post-user-info">
              <div class="post-nickname">{{ item.nickname || '匿名用户' }}</div>
              <div class="post-meta">
                <span v-if="item.province"><i class="el-icon-location-outline"></i> {{ item.province }}</span>
              </div>
            </div>
          </div>

          <div class="post-image-wrapper">
            <el-image
              class="post-image"
              :src="getImageUrl(item.path)"
              :preview-src-list="[getImageUrl(item.path)]"
              fit="contain"
              lazy>
              <div slot="placeholder" class="image-loading">
                <i class="el-icon-loading"></i>
              </div>
              <div slot="error" class="image-error">
                <i class="el-icon-picture-outline"></i>
                <span>图片加载失败</span>
              </div>
            </el-image>
          </div>

          <div v-if="item.info" class="post-content">
            <div class="post-text">{{ item.info }}</div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <el-image :src="require('../assets/img/empty.png')" class="empty-img"/>
        <div class="empty-text">暂无公开的立志内容</div>
        <div class="empty-hint">快去填写你的立志信息并设为公开吧</div>
        <el-button type="primary" round @click="$router.push('/myHome')">
          <i class="el-icon-edit"></i> 去设置
        </el-button>
      </div>
    </div>

    <!-- 底部间距 -->
    <div style="height: 80px;"></div>
  </div>
</template>

<script>
import axios from 'axios'
import global from '@/components/Common'

export default {
  name: 'HTQ',
  data() {
    return {
      serverUrl: global.httpUrl,
      unionid: '',
      nickname: '',
      headimgurl: '',
      datas: [],
      loading: true
    }
  },
  computed: {
    filteredData() {
      return this.datas.filter(item =>
        item.open === '1' && item.path && item.path !== ''
      )
    }
  },
  mounted() {
    document.title = this.$route.meta.title
    this.getUserInfo()
    this.getData()
  },
  methods: {
    getImageUrl(path) {
      if (!path) return ''
      return `http://htzchina.org/imgs/tenyears/${path}`
    },

    async getUserInfo() {
      this.unionid = this.$store.getters.getUnionid
      if (this.unionid) {
        this.unionid = this.unionid.replace(/"/g, '')
      }

      try {
        const res = await axios.get(`${this.serverUrl}getById?id=${this.unionid}`)
        if (res.data) {
          this.nickname = res.data.nickname || ''
          this.headimgurl = res.data.headimgurl || ''
        }
      } catch (err) {
        console.error('获取用户信息失败', err)
      }
    },

    async getData() {
      this.loading = true
      try {
        const res = await axios.get(`${this.serverUrl}getAll`)
        this.datas = res.data || []
      } catch (err) {
        console.error('获取数据失败', err)
        this.$message.error('加载失败，请重试')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.htq-container {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 顶部头图 */
.header-section {
  position: relative;
  height: 160px;
}

.header-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.header-content {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  align-items: center;
}

.user-avatar {
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.header-info {
  color: white;
  margin-left: 15px;
}

.header-title {
  font-size: 22px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 3px;
}

/* 内容区域 */
.content-section {
  padding: 15px;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 60px 0;
  color: #909399;
}

.loading-state i {
  font-size: 24px;
  margin-bottom: 10px;
  display: block;
}

/* 帖子列表 */
.post-list {
  display: flex;
  flex-direction: column;
}

.post-list > *:not(:last-child) {
  margin-bottom: 15px;
}

/* 帖子卡片 */
.post-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.post-header {
  display: flex;
  align-items: center;
  padding: 15px;
}

.post-avatar {
  flex-shrink: 0;
  margin-right: 12px;
}

.post-user-info {
  flex: 1;
}

.post-nickname {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.post-meta {
  font-size: 12px;
  color: #909399;
  margin-top: 3px;
}

.post-meta i {
  margin-right: 3px;
}

/* 帖子图片 */
.post-image-wrapper {
  width: 100%;
  background: #f8f9fa;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.post-image {
  width: 100%;
  max-height: 400px;
}

.image-loading,
.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #c0c4cc;
}

.image-loading i,
.image-error i {
  font-size: 36px;
  margin-bottom: 10px;
}

.image-error span {
  font-size: 14px;
}

/* 帖子内容 */
.post-content {
  padding: 12px 15px 15px;
}

.post-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  word-break: break-word;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-img {
  width: 150px;
  height: 150px;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 16px;
  color: #606266;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: #909399;
  margin-bottom: 20px;
}

/* 通用 */
img {
  pointer-events: none;
}

* {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

input, textarea {
  -webkit-user-select: auto;
  outline: none;
}
</style>
