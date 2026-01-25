<template>
  <div class="group-container">
    <!-- 顶部头图区域 -->
    <div class="header-section">
      <div class="header-bg">
        <el-image :src="'http://htzchina.org/imgs/group_header.png'" fit="cover" class="header-img"/>
        <div class="header-overlay"></div>
      </div>
      <div class="header-content">
        <div class="header-title">我的团队</div>
        <div class="header-subtitle">与志同道合的伙伴一起成长</div>
      </div>
      <div class="header-actions">
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="add-btn">
            <i class="el-icon-plus"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="create">
              <i class="el-icon-folder-add"></i> 创建新组
            </el-dropdown-item>
            <el-dropdown-item command="join">
              <i class="el-icon-connection"></i> 申请入组
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <!-- Tab切换区域 -->
    <div class="tab-section">
      <div class="tab-wrapper">
        <div
          class="tab-item"
          :class="{ active: activeName === 'myGroup' }"
          @click="activeName = 'myGroup'">
          <i class="el-icon-s-home"></i>
          <span>我的分组</span>
        </div>
        <div
          class="tab-item"
          :class="{ active: activeName === 'dailyReport' }"
          @click="activeName = 'dailyReport'">
          <i class="el-icon-document-checked"></i>
          <span>我的打卡</span>
        </div>
      </div>
    </div>

    <!-- 我的分组内容 -->
    <div v-show="activeName === 'myGroup'" class="content-section">
      <!-- 我创建的组 -->
      <div v-if="myGroup.length > 0" class="group-section">
        <div class="section-header">
          <div class="section-icon created">
            <i class="el-icon-star-on"></i>
          </div>
          <span>我创建的</span>
          <span class="section-count">{{ myGroup.length }}个</span>
        </div>

        <div class="group-list">
          <div v-for="(item, index) in myGroup" :key="item.groupId" class="group-card">
            <div class="group-card-header" @click="toggleGroup(item.groupId)">
              <div class="group-avatar">
                <i class="el-icon-s-custom"></i>
              </div>
              <div class="group-info">
                <div class="group-name">{{ item.groupName }}</div>
                <div class="group-id">ID: {{ item.groupId }}</div>
              </div>
              <div class="group-arrow">
                <i :class="expandedGroups[item.groupId] ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
              </div>
            </div>

            <div v-show="expandedGroups[item.groupId]" class="group-card-body">
              <!-- 组员管理 -->
              <div class="member-section">
                <div class="member-header">
                  <span><i class="el-icon-user"></i> 组员管理</span>
                  <div class="group-actions">
                    <el-button size="mini" type="primary" plain @click="modifyGroup(item.groupId, item.groupName, item.note)">
                      <i class="el-icon-edit"></i> 修改
                    </el-button>
                    <el-popconfirm title="删除后不可恢复，确定删除吗？" @confirm="deleteGroup(item.id)">
                      <el-button size="mini" type="danger" plain slot="reference">
                        <i class="el-icon-delete"></i> 删除
                      </el-button>
                    </el-popconfirm>
                  </div>
                </div>

                <div class="member-list">
                  <div v-for="member in myGroupMember[index]" :key="member.unionId" class="member-item">
                    <div class="member-info">
                      <el-avatar :size="36" :src="member.headimgurl">
                        <i class="el-icon-user-solid"></i>
                      </el-avatar>
                      <span class="member-name">{{ member.nickname }}</span>
                    </div>
                    <div class="member-actions">
                      <template v-if="member.state === 0">
                        <el-button size="mini" type="success" @click="agreeJoinGroup(member.owner, member.groupId, member.unionId)">
                          同意
                        </el-button>
                        <el-button size="mini" type="danger" @click="rejectJoinGroup(member.owner, member.groupId, member.unionId)">
                          拒绝
                        </el-button>
                      </template>
                      <el-tag v-else-if="member.state === 1" type="success" size="small">已加入</el-tag>
                      <template v-else-if="member.state === 2">
                        <el-tag type="info" size="small">已拒绝</el-tag>
                        <el-button size="mini" type="text" @click="deleteJoinGroup(member.id)">删除</el-button>
                      </template>
                    </div>
                  </div>
                  <div v-if="!myGroupMember[index] || myGroupMember[index].length === 0" class="empty-member">
                    暂无组员
                  </div>
                </div>
              </div>

              <!-- 打卡记录 -->
              <div class="report-section">
                <div class="report-header">
                  <i class="el-icon-date"></i> 近期打卡
                </div>
                <div class="report-list">
                  <div v-for="data in myGroupMemberReports[item.groupId]" :key="data.id" class="report-item">
                    <div class="report-user">
                      <el-avatar :size="40" :src="data.headimgurl">
                        <i class="el-icon-user-solid"></i>
                      </el-avatar>
                      <div class="report-user-info">
                        <div class="report-nickname">{{ data.nickname }}</div>
                        <div class="report-date">{{ data.date.substring(5) }}</div>
                      </div>
                    </div>
                    <div class="report-content">
                      <template v-for="i in 15">
                        <div v-if="data['value' + i] && data['value' + i] !== '0'" :key="i" class="report-value">
                          {{ data['template' + i] ? data['template' + i].replace('_', data['value' + i]) : '' }}
                        </div>
                      </template>
                    </div>
                  </div>
                  <div v-if="!myGroupMemberReports[item.groupId] || myGroupMemberReports[item.groupId].length === 0" class="empty-report">
                    暂无打卡记录
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 我加入的组 -->
      <div v-if="myJoinGroup.length > 0" class="group-section">
        <div class="section-header">
          <div class="section-icon joined">
            <i class="el-icon-s-check"></i>
          </div>
          <span>我加入的</span>
          <span class="section-count">{{ myJoinGroup.length }}个</span>
        </div>

        <div class="group-list">
          <div v-for="(item, index) in myJoinGroup" :key="item[0] ? item[0].groupId : index" class="group-card">
            <div class="group-card-header" @click="toggleJoinGroup(item[0] ? item[0].groupId : index)">
              <div class="group-avatar joined">
                <i class="el-icon-s-custom"></i>
              </div>
              <div class="group-info">
                <div class="group-name">{{ item[0] ? item[0].groupName : '' }}</div>
                <div class="group-meta">
                  <span class="group-id">ID: {{ item[0] ? item[0].groupId : '' }}</span>
                  <span class="group-owner">组长: {{ item[0] ? item[0].ownerName : '' }}</span>
                </div>
              </div>
              <div class="group-arrow">
                <i :class="expandedJoinGroups[item[0] ? item[0].groupId : index] ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
              </div>
            </div>

            <div v-show="expandedJoinGroups[item[0] ? item[0].groupId : index]" class="group-card-body">
              <!-- 组员列表 -->
              <div class="member-section">
                <div class="member-header">
                  <span><i class="el-icon-user"></i> 组员列表</span>
                  <el-popconfirm title="确定退出该组吗？" @confirm="deleteGroups(item.id)">
                    <el-button size="mini" type="warning" plain slot="reference">
                      <i class="el-icon-switch-button"></i> 退出
                    </el-button>
                  </el-popconfirm>
                </div>

                <div class="member-list simple">
                  <div v-for="member in myJoinGroup[index]" :key="member.unionId" class="member-chip">
                    <el-avatar :size="24" :src="member.headimgurl">
                      <i class="el-icon-user-solid"></i>
                    </el-avatar>
                    <span>{{ member.nickname }}</span>
                  </div>
                </div>
              </div>

              <!-- 打卡记录 -->
              <div class="report-section">
                <div class="report-header">
                  <i class="el-icon-date"></i> 近期打卡
                </div>
                <div class="report-list">
                  <div v-for="data in myJoinGroupMemberReports[item[0] ? item[0].groupId : '']" :key="data.id" class="report-item">
                    <div class="report-user">
                      <el-avatar :size="40" :src="data.headimgurl">
                        <i class="el-icon-user-solid"></i>
                      </el-avatar>
                      <div class="report-user-info">
                        <div class="report-nickname">{{ data.nickname }}</div>
                        <div class="report-date">{{ data.date.substring(5) }}</div>
                      </div>
                    </div>
                    <div class="report-content">
                      <template v-for="i in 15">
                        <div v-if="data['value' + i] && data['value' + i] !== '0'" :key="i" class="report-value">
                          {{ data['template' + i] ? data['template' + i].replace('_', data['value' + i]) : '' }}
                        </div>
                      </template>
                    </div>
                  </div>
                  <div v-if="!myJoinGroupMemberReports[item[0] ? item[0].groupId : ''] || myJoinGroupMemberReports[item[0] ? item[0].groupId : ''].length === 0" class="empty-report">
                    暂无打卡记录
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="emptyShow" class="empty-state">
        <el-image :src="require('../assets/img/empty.png')" class="empty-img"/>
        <div class="empty-text">您还未加入任何组</div>
        <div class="empty-hint">点击右上角 "+" 创建或加入组</div>
        <el-button type="primary" round @click="joinGroupFormDialogVisible = true">
          <i class="el-icon-connection"></i> 申请入组
        </el-button>
      </div>
    </div>

    <!-- 我的打卡内容 -->
    <div v-show="activeName === 'dailyReport'" class="content-section">
      <div v-if="myReports && myReports.length > 0" class="my-reports">
        <div v-for="data in myReports" :key="data.id" class="report-card">
          <div class="report-card-header">
            <el-avatar :size="48" :src="data.headimgurl">
              <i class="el-icon-user-solid"></i>
            </el-avatar>
            <div class="report-card-info">
              <div class="report-card-name">{{ data.nickname }}</div>
              <div class="report-card-date">
                <i class="el-icon-time"></i>
                {{ data.date }}
              </div>
            </div>
          </div>
          <div class="report-card-content">
            <template v-for="i in 15">
              <div v-if="data['value' + i] && data['value' + i] !== '0'" :key="i" class="report-card-value">
                <i class="el-icon-check"></i>
                {{ data['template' + i] ? data['template' + i].replace('_', data['value' + i]) : '' }}
              </div>
            </template>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <el-image :src="require('../assets/img/empty.png')" class="empty-img"/>
        <div class="empty-text">未查到任何打卡信息</div>
        <div class="empty-hint">快去打卡记录你的成长吧</div>
      </div>
    </div>

    <!-- 创建组对话框 -->
    <el-dialog title="创建新组" :visible.sync="addGroupFormDialogVisible" width="85%" center>
      <el-form :model="groupInfo" label-position="top">
        <el-form-item label="组名称">
          <el-input v-model="groupInfo.groupName" placeholder="请输入组名称" prefix-icon="el-icon-edit"></el-input>
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input type="textarea" v-model="groupInfo.note" placeholder="简单描述一下这个组" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addGroupFormDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addGroup">创建</el-button>
      </div>
    </el-dialog>

    <!-- 申请入组对话框 -->
    <el-dialog title="申请入组" :visible.sync="joinGroupFormDialogVisible" width="85%" center>
      <div class="join-dialog-content">
        <div class="join-hint">请输入要加入组的ID（如：HTZ-XXXXXXX）</div>
        <el-input v-model="joinGroupId" placeholder="组ID" prefix-icon="el-icon-key" clearable></el-input>
      </div>
      <div slot="footer">
        <el-button @click="joinGroupFormDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="joinGroup">申请</el-button>
      </div>
    </el-dialog>

    <!-- 编辑组对话框 -->
    <el-dialog title="编辑组信息" :visible.sync="editDialogVisible" width="85%" center>
      <el-form :model="newGroupInfo" label-position="top">
        <el-form-item label="组ID">
          <el-input v-model="newGroupInfo.groupId" disabled prefix-icon="el-icon-key"></el-input>
        </el-form-item>
        <el-form-item label="组名称">
          <el-input v-model="newGroupInfo.groupName" prefix-icon="el-icon-edit"></el-input>
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input type="textarea" v-model="newGroupInfo.note" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="realModifyGroup">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import qs from 'qs'
import global from '@/components/Common'

export default {
  name: 'Group',
  data() {
    return {
      serverUrl: global.httpUrl,
      unionid: '',
      headimgurl: '',

      activeName: 'myGroup',
      expandedGroups: {},
      expandedJoinGroups: {},

      myGroup: [],
      myJoinGroup: [],
      myGroupMember: [],
      myGroupMemberReports: {},
      myJoinGroupMemberReports: {},
      myReports: [],

      emptyShow: false,
      myGroupQueryDone: false,
      myGroupsQueryDone: false,

      // 对话框
      addGroupFormDialogVisible: false,
      joinGroupFormDialogVisible: false,
      editDialogVisible: false,

      // 表单数据
      groupInfo: {
        groupName: '',
        note: ''
      },
      newGroupInfo: {
        groupId: '',
        groupName: '',
        note: ''
      },
      joinGroupId: ''
    }
  },
  mounted() {
    document.title = this.$route.meta.title
    this.getUserInfo()
    this.getData()
    this.getMyReports()
  },
  methods: {
    handleCommand(command) {
      if (command === 'create') {
        this.addGroupFormDialogVisible = true
      } else if (command === 'join') {
        this.joinGroupFormDialogVisible = true
      }
    },

    toggleGroup(groupId) {
      this.$set(this.expandedGroups, groupId, !this.expandedGroups[groupId])
    },

    toggleJoinGroup(groupId) {
      this.$set(this.expandedJoinGroups, groupId, !this.expandedJoinGroups[groupId])
    },

    async getUserInfo() {
      this.unionid = this.$store.getters.getUnionid
      if (this.unionid) {
        this.unionid = this.unionid.replace(/"/g, '')
      }

      try {
        const res = await axios.get(`${this.serverUrl}getById?id=${this.unionid}`)
        if (res.data) {
          this.headimgurl = res.data.headimgurl
        }
      } catch (err) {
        console.error('获取用户信息失败', err)
      }
    },

    async getMyReports() {
      try {
        const res = await axios.get(`${this.serverUrl}findReportByUser?unionId=${this.unionid}`)
        this.myReports = res.data || []
      } catch (err) {
        console.error('获取打卡记录失败', err)
      }
    },

    async getData() {
      // 获取我创建的组
      try {
        const res = await axios.get(`${this.serverUrl}findGroupByOwner?unionId=${this.unionid}`)
        this.myGroup = res.data || []
        this.myGroupQueryDone = true
        this.checkEmpty()

        if (this.myGroup.length > 0) {
          this.getMyGroupMembers()
          this.getMyGroupReports()
        }
      } catch (err) {
        console.error('获取我创建的组失败', err)
      }

      // 获取我加入的组
      try {
        const res = await axios.get(`${this.serverUrl}findAllJoinGroups?unionId=${this.unionid}`)
        this.myJoinGroup = res.data || []
        this.myGroupsQueryDone = true
        this.checkEmpty()
        this.getJoinGroupReports()
      } catch (err) {
        console.error('获取我加入的组失败', err)
      }
    },

    async getMyGroupMembers() {
      try {
        const res = await axios.get(`${this.serverUrl}findJoinGroups?unionId=${this.unionid}`)
        this.myGroupMember = res.data || []
      } catch (err) {
        console.error('获取组员失败', err)
      }
    },

    async getMyGroupReports() {
      try {
        const res = await axios.get(`${this.serverUrl}findReportsInGroupByOwner?unionId=${this.unionid}`)
        this.myGroupMemberReports = res.data || {}
      } catch (err) {
        console.error('获取组员打卡记录失败', err)
      }
    },

    async getJoinGroupReports() {
      try {
        const res = await axios.get(`${this.serverUrl}findReportsJoinGroupByOwner?unionId=${this.unionid}`)
        this.myJoinGroupMemberReports = res.data || {}
      } catch (err) {
        console.error('获取加入组打卡记录失败', err)
      }
    },

    checkEmpty() {
      if (this.myGroupQueryDone && this.myGroupsQueryDone) {
        this.emptyShow = this.myGroup.length === 0 && this.myJoinGroup.length === 0
      }
    },

    async addGroup() {
      if (!this.groupInfo.groupName) {
        this.$message.warning('请输入组名称')
        return
      }

      this.addGroupFormDialogVisible = false

      try {
        await axios.post(`${this.serverUrl}createGroup`, qs.stringify({
          groupName: this.groupInfo.groupName,
          owner: this.unionid,
          note: this.groupInfo.note,
          time: Date.now()
        }))
        this.$message.success('创建成功！')
        this.groupInfo = { groupName: '', note: '' }
        this.getData()
      } catch (err) {
        this.$message.error('创建失败，请重试')
      }
    },

    async joinGroup() {
      if (!this.joinGroupId) {
        this.$message.warning('请输入组ID')
        return
      }

      if (this.joinGroupId.length !== 11 && !this.joinGroupId.startsWith('HTZ-')) {
        this.$message.warning('请输入正确的组ID')
        return
      }

      this.joinGroupFormDialogVisible = false

      try {
        const res = await axios.post(`${this.serverUrl}joinGroup`, qs.stringify({
          groupId: this.joinGroupId,
          unionId: this.unionid
        }))

        const result = res.data
        const messages = {
          0: '申请已发出，请等待组长审批',
          1: '申请的组不存在',
          2: '你已在组中，无需申请',
          3: '已再次提交申请',
          4: '无法申请加入自己的组',
          5: '已再次提交申请'
        }

        if (result === 0 || result === 3 || result === 5) {
          this.$message.success(messages[result])
        } else if (messages[result]) {
          this.$message.warning(messages[result])
        } else {
          this.$message.error('请求失败，请再次尝试')
        }

        this.joinGroupId = ''
      } catch (err) {
        this.$message.error('申请失败，请重试')
      }
    },

    modifyGroup(groupId, groupName, note) {
      this.newGroupInfo = { groupId, groupName, note }
      this.editDialogVisible = true
    },

    async realModifyGroup() {
      try {
        await axios.post(`${this.serverUrl}modifyGroup`, qs.stringify(this.newGroupInfo))
        this.$message.success('修改成功！')
        this.editDialogVisible = false
        this.getData()
      } catch (err) {
        this.$message.error('修改失败，请重试')
      }
    },

    async deleteGroup(id) {
      try {
        await axios.post(`${this.serverUrl}deleteGroup?id=${id}`)
        this.$message.success('已删除！')
        this.getData()
      } catch (err) {
        this.$message.error('删除失败，请重试')
      }
    },

    async deleteGroups(id) {
      try {
        await axios.post(`${this.serverUrl}deleteGroups?id=${id}`)
        this.$message.success('已退出！')
        this.getData()
      } catch (err) {
        this.$message.error('退出失败，请重试')
      }
    },

    async agreeJoinGroup(owner, groupId, unionId) {
      try {
        await axios.post(`${this.serverUrl}agreeGroup?owner=${owner}&groupId=${groupId}&unionId=${unionId}`)
        this.$message.success('已同意入组！')
        this.getData()
      } catch (err) {
        this.$message.error('操作失败，请重试')
      }
    },

    async rejectJoinGroup(owner, groupId, unionId) {
      try {
        await axios.post(`${this.serverUrl}rejectGroup?owner=${owner}&groupId=${groupId}&unionId=${unionId}`)
        this.$message.warning('已拒绝入组！')
        this.getData()
      } catch (err) {
        this.$message.error('操作失败，请重试')
      }
    },

    async deleteJoinGroup(id) {
      try {
        await axios.post(`${this.serverUrl}deleteGroups?id=${id}`)
        this.$message.success('已删除！')
        this.getData()
      } catch (err) {
        this.$message.error('删除失败，请重试')
      }
    }
  }
}
</script>

<style scoped>
.group-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 20px;
}

/* 顶部头图 */
.header-section {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  width: 100%;
  height: 100%;
}

.header-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.7), rgba(118, 75, 162, 0.7));
}

.header-content {
  position: absolute;
  bottom: 50px;
  left: 20px;
  color: white;
}

.header-title {
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.header-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 5px;
}

.header-actions {
  position: absolute;
  top: 15px;
  right: 15px;
}

.add-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.add-btn i {
  font-size: 20px;
  color: #667eea;
}

/* Tab切换 */
.tab-section {
  margin-top: -30px;
  padding: 0 15px;
  position: relative;
  z-index: 10;
}

.tab-wrapper {
  background: white;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tab-item {
  flex: 1;
  padding: 12px 0;
  text-align: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
  font-size: 14px;
}

.tab-item i {
  margin-right: 5px;
}

.tab-item.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

/* 内容区域 */
.content-section {
  padding: 15px;
}

/* 分组区域 */
.group-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding-left: 5px;
}

.section-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

.section-icon.created {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
}

.section-icon.joined {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
}

.section-header span {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.section-count {
  margin-left: auto;
  font-size: 12px !important;
  color: #999 !important;
  font-weight: normal !important;
}

/* 组卡片 */
.group-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.group-card-header {
  display: flex;
  align-items: center;
  padding: 15px;
  cursor: pointer;
}

.group-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.group-avatar.joined {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.group-info {
  flex: 1;
  margin-left: 12px;
}

.group-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.group-id {
  font-size: 12px;
  color: #999;
  margin-top: 3px;
}

.group-meta {
  display: flex;
  font-size: 12px;
  color: #999;
  margin-top: 3px;
}

.group-meta > *:not(:last-child) {
  margin-right: 15px;
}

.group-arrow {
  color: #ccc;
  font-size: 14px;
}

.group-card-body {
  border-top: 1px solid #f0f0f0;
  padding: 15px;
}

/* 组员区域 */
.member-section {
  margin-bottom: 15px;
}

.member-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
}

.member-header i {
  margin-right: 5px;
}

.group-actions {
  display: flex;
}

.group-actions > *:not(:last-child) {
  margin-right: 8px;
}

.member-list {
  display: flex;
  flex-direction: column;
}

.member-list > *:not(:last-child) {
  margin-bottom: 10px;
}

.member-list.simple {
  flex-direction: row;
  flex-wrap: wrap;
}

.member-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.member-info {
  display: flex;
  align-items: center;
}

.member-info > *:not(:last-child) {
  margin-right: 10px;
}

.member-name {
  font-size: 14px;
  color: #333;
}

.member-actions {
  display: flex;
  align-items: center;
}

.member-actions > *:not(:last-child) {
  margin-right: 8px;
}

.member-chip {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background: #f0f2f5;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
}

.member-chip > *:not(:last-child) {
  margin-right: 6px;
}

.empty-member {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
}

/* 打卡记录区域 */
.report-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 15px;
}

.report-header {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.report-header i {
  margin-right: 5px;
}

.report-list {
  display: flex;
  flex-direction: column;
}

.report-list > *:not(:last-child) {
  margin-bottom: 12px;
}

.report-item {
  display: flex;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
}

.report-item > *:not(:last-child) {
  margin-right: 12px;
}

.report-user {
  display: flex;
  align-items: flex-start;
}

.report-user > *:not(:last-child) {
  margin-right: 10px;
}

.report-user-info {
  min-width: 80px;
}

.report-nickname {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.report-date {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.report-content {
  flex: 1;
}

.report-value {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.empty-report {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
}

/* 我的打卡卡片 */
.my-reports {
  display: flex;
  flex-direction: column;
}

.my-reports > *:not(:last-child) {
  margin-bottom: 15px;
}

.report-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.report-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.report-card-header > *:not(:last-child) {
  margin-right: 12px;
}

.report-card-info {
  flex: 1;
}

.report-card-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.report-card-date {
  font-size: 12px;
  color: #999;
  margin-top: 3px;
}

.report-card-date i {
  margin-right: 4px;
}

.report-card-content {
  padding-left: 5px;
}

.report-card-value {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
}

.report-card-value i {
  color: #67c23a;
  margin-right: 6px;
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
  color: #666;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
}

/* 对话框 */
.join-dialog-content {
  text-align: center;
}

.join-hint {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
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
