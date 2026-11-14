<template>
  <div class="group-container">
    <!-- 顶部头图区域 -->
    <div class="header-section">
      <div class="header-bg">
        <el-image :src="headerImg" fit="cover" class="header-img"/>
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
            <el-dropdown-item command="invite">
              <i class="el-icon-s-promotion"></i> 邀请加入
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <!-- 概览统计 -->
    <div class="stats-bar">
      <div class="stat-item">
        <div class="stat-value">{{ ownedGroups.length }}</div>
        <div class="stat-label">我创建的</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="stat-value">{{ joinedGroups.length }}</div>
        <div class="stat-label">我加入的</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="stat-value" :class="{ warn: pendingCount > 0 }">{{ pendingCount }}</div>
        <div class="stat-label">待审批</div>
      </div>
    </div>

    <!-- Tab切换区域 -->
    <div class="tab-section">
      <div class="tab-wrapper">
        <div
          class="tab-item"
          :class="{ active: activeName === 'myGroup' }"
          @click="switchTab('myGroup')">
          <i class="el-icon-s-home"></i>
          <span>我的分组</span>
        </div>
        <div
          class="tab-item"
          :class="{ active: activeName === 'dailyReport' }"
          @click="switchTab('dailyReport')">
          <i class="el-icon-document-checked"></i>
          <span>我的打卡</span>
        </div>
      </div>
    </div>

    <!-- 我的分组内容 -->
    <div v-show="activeName === 'myGroup'" class="content-section">
      <div v-if="loading" class="loading-state">
        <i class="el-icon-loading"></i>
        <span>加载中...</span>
      </div>

      <template v-else>
        <!-- 待审批提醒 -->
        <div v-if="pendingCount > 0" class="pending-banner" @click="expandPendingGroups">
          <i class="el-icon-bell"></i>
          <span class="pending-text">有 {{ pendingCount }} 位伙伴申请入组，待你处理</span>
          <span class="pending-action">去处理 <i class="el-icon-arrow-right"></i></span>
        </div>

        <!-- 我创建的组 -->
        <div v-if="ownedGroups.length > 0" class="group-section">
          <div class="section-header">
            <div class="section-icon created">
              <i class="el-icon-star-on"></i>
            </div>
            <span>我创建的</span>
            <span class="section-count">{{ ownedGroups.length }}个</span>
          </div>

          <div class="group-list">
            <div v-for="group in ownedGroups" :key="group.groupId" class="group-card">
              <div class="group-card-header" @click="toggleGroup(group.groupId)">
                <div class="group-avatar">
                  <i class="el-icon-s-custom"></i>
                </div>
                <div class="group-info">
                  <div class="group-name-row">
                    <span class="group-name">{{ group.groupName }}</span>
                    <span v-if="group.pending.length > 0" class="pending-badge">
                      {{ group.pending.length }} 待审批
                    </span>
                  </div>
                  <div class="group-meta">
                    <span class="group-id" @click.stop="copyGroupId(group.groupId)">
                      ID: {{ group.groupId }} <i class="el-icon-document-copy"></i>
                    </span>
                    <span>{{ group.members.length }} 人</span>
                  </div>
                </div>
                <div class="group-arrow">
                  <i :class="isExpanded(group.groupId) ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
                </div>
              </div>

              <div v-show="isExpanded(group.groupId)" class="group-card-body">
                <!-- 待审批申请 -->
                <div v-if="group.pending.length > 0" class="apply-section">
                  <div class="block-header">
                    <span><i class="el-icon-bell"></i> 入组申请</span>
                  </div>
                  <div v-for="member in group.pending" :key="member.id" class="member-item apply">
                    <div class="member-info">
                      <el-avatar :size="36" :src="member.headimgurl">
                        <i class="el-icon-user-solid"></i>
                      </el-avatar>
                      <span class="member-name">{{ member.nickname || '匿名用户' }}</span>
                    </div>
                    <div class="member-actions">
                      <el-button
                        size="mini" type="success" :loading="acting === member.id"
                        @click="agreeJoinGroup(member)">同意</el-button>
                      <el-button
                        size="mini" type="danger" plain :loading="acting === member.id"
                        @click="rejectJoinGroup(member)">拒绝</el-button>
                    </div>
                  </div>
                </div>

                <!-- 组员 -->
                <div class="member-section">
                  <div class="block-header">
                    <span><i class="el-icon-user"></i> 组员</span>
                    <span class="block-count">{{ group.members.length }} 人</span>
                  </div>
                  <div v-if="group.members.length > 0" class="member-list simple">
                    <div v-for="member in group.members" :key="member.id" class="member-chip">
                      <el-avatar :size="22" :src="member.headimgurl">
                        <i class="el-icon-user-solid"></i>
                      </el-avatar>
                      <span class="chip-name">{{ member.nickname || '匿名用户' }}</span>
                    </div>
                  </div>
                  <div v-else class="empty-inline">
                    <i class="el-icon-user"></i>
                    <span>暂无组员，把组ID发给伙伴邀请加入吧</span>
                  </div>
                </div>

                <!-- 已拒绝的申请 -->
                <div v-if="group.rejected.length > 0" class="rejected-section">
                  <div class="block-header collapsible" @click="toggleRejected(group.groupId)">
                    <span><i class="el-icon-circle-close"></i> 已拒绝 {{ group.rejected.length }}</span>
                    <i :class="isRejectedOpen(group.groupId) ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
                  </div>
                  <div v-show="isRejectedOpen(group.groupId)" class="member-list">
                    <div v-for="member in group.rejected" :key="member.id" class="member-item">
                      <div class="member-info">
                        <el-avatar :size="30" :src="member.headimgurl">
                          <i class="el-icon-user-solid"></i>
                        </el-avatar>
                        <span class="member-name">{{ member.nickname || '匿名用户' }}</span>
                      </div>
                      <div class="member-actions">
                        <el-tag type="info" size="mini">已拒绝</el-tag>
                        <el-button
                          size="mini" type="text" :loading="acting === member.id"
                          @click="deleteJoinRecord(member.id)">删除</el-button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 打卡记录 -->
                <group-report-list :reports="group.reports"/>

                <!-- 组操作 -->
                <div class="card-footer">
                  <el-button size="small" type="primary" plain @click="openGroupStatus(group.groupId)">
                    <i class="el-icon-data-analysis"></i> 今日完成
                  </el-button>
                  <el-button size="small" plain @click="copyGroupShareLink(group)">
                    <i class="el-icon-share"></i> 复制链接
                  </el-button>
                  <el-button size="small" plain @click="modifyGroup(group)">
                    <i class="el-icon-edit"></i> 修改信息
                  </el-button>
                  <el-popconfirm title="删除后不可恢复，确定删除吗？" @confirm="deleteGroup(group.id)">
                    <el-button size="small" type="danger" plain slot="reference">
                      <i class="el-icon-delete"></i> 解散组
                    </el-button>
                  </el-popconfirm>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 我发出的、还没通过的申请。批准前也要看得到小组 -->
        <div v-if="pendingApplications.length > 0" class="group-section">
          <div class="section-header">
            <div class="section-icon joined">
              <i class="el-icon-time"></i>
            </div>
            <span>我的申请</span>
            <span class="section-count">{{ pendingApplications.length }}个</span>
          </div>
          <div class="group-list">
            <div v-for="(group, index) in pendingApplications" :key="group.groupId || ('pending-' + index)" class="group-card">
              <div class="group-card-header">
                <div class="group-avatar joined">
                  <i class="el-icon-s-custom"></i>
                </div>
                <div class="group-info">
                  <div class="group-name-row">
                    <span class="group-name">{{ group.groupName || '未命名团队' }}</span>
                    <span class="pending-badge">待审核</span>
                  </div>
                  <div class="group-meta">
                    <span v-if="group.groupId" class="group-id" @click.stop="copyGroupId(group.groupId)">
                      ID: {{ group.groupId }} <i class="el-icon-document-copy"></i>
                    </span>
                    <span class="ellipsis">组长: {{ group.ownerName || '—' }}</span>
                  </div>
                </div>
              </div>
              <div class="group-card-body">
                <div class="empty-inline">
                  <i class="el-icon-time"></i>
                  <span>已提交入组申请，组长同意后会出现在「我加入的」</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="rejectedApplications.length > 0" class="group-section">
          <div class="section-header">
            <div class="section-icon joined">
              <i class="el-icon-circle-close"></i>
            </div>
            <span>未通过的申请</span>
            <span class="section-count">{{ rejectedApplications.length }}个</span>
          </div>
          <div class="group-list">
            <div v-for="(group, index) in rejectedApplications" :key="group.groupId || ('rejected-' + index)" class="group-card">
              <div class="group-card-header">
                <div class="group-avatar joined">
                  <i class="el-icon-s-custom"></i>
                </div>
                <div class="group-info">
                  <div class="group-name-row">
                    <span class="group-name">{{ group.groupName || '未命名团队' }}</span>
                    <span class="pending-badge">已拒绝</span>
                  </div>
                  <div class="group-meta">
                    <span class="ellipsis">组长: {{ group.ownerName || '—' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 我加入的组 -->
        <div v-if="joinedGroups.length > 0" class="group-section">
          <div class="section-header">
            <div class="section-icon joined">
              <i class="el-icon-s-check"></i>
            </div>
            <span>我加入的</span>
            <span class="section-count">{{ joinedGroups.length }}个</span>
          </div>

          <div class="group-list">
            <div v-for="group in joinedGroups" :key="group.groupId" class="group-card">
              <div class="group-card-header" @click="toggleGroup(group.groupId)">
                <div class="group-avatar joined">
                  <i class="el-icon-s-custom"></i>
                </div>
                <div class="group-info">
                  <div class="group-name-row">
                    <span class="group-name">{{ group.groupName }}</span>
                  </div>
                  <div class="group-meta">
                    <span class="group-id" @click.stop="copyGroupId(group.groupId)">
                      ID: {{ group.groupId }} <i class="el-icon-document-copy"></i>
                    </span>
                    <span class="ellipsis">组长: {{ group.ownerName || '—' }}</span>
                  </div>
                </div>
                <div class="group-arrow">
                  <i :class="isExpanded(group.groupId) ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
                </div>
              </div>

              <div v-show="isExpanded(group.groupId)" class="group-card-body">
                <!-- 组员列表 -->
                <div class="member-section">
                  <div class="block-header">
                    <span><i class="el-icon-user"></i> 组员</span>
                    <span class="block-count">{{ group.members.length }} 人</span>
                  </div>
                  <div v-if="group.members.length > 0" class="member-list simple">
                    <div v-for="member in group.members" :key="member.id" class="member-chip">
                      <el-avatar :size="22" :src="member.headimgurl">
                        <i class="el-icon-user-solid"></i>
                      </el-avatar>
                      <span class="chip-name">{{ member.nickname || '匿名用户' }}</span>
                    </div>
                  </div>
                  <div v-else class="empty-inline">
                    <i class="el-icon-user"></i>
                    <span>暂无其他组员</span>
                  </div>
                </div>

                <!-- 打卡记录 -->
                <group-report-list :reports="group.reports"/>

                <!-- 组操作 -->
                <div class="card-footer">
                  <el-button size="small" type="primary" plain @click="openGroupStatus(group.groupId)">
                    <i class="el-icon-data-analysis"></i> 今日完成
                  </el-button>
                  <el-button size="small" plain @click="copyGroupShareLink(group)">
                    <i class="el-icon-share"></i> 复制链接
                  </el-button>
                  <el-popconfirm title="确定退出该组吗？" @confirm="quitGroup(group)">
                    <el-button size="small" type="warning" plain slot="reference">
                      <i class="el-icon-switch-button"></i> 退出该组
                    </el-button>
                  </el-popconfirm>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="isEmpty" class="empty-state">
          <el-image :src="emptyImg" class="empty-img"/>
          <div class="empty-text">您还未加入任何组</div>
          <div class="empty-hint">创建一个组邀请伙伴，或用组ID申请加入</div>
          <div class="empty-actions">
            <el-button type="primary" round @click="addGroupFormDialogVisible = true">
              <i class="el-icon-folder-add"></i> 创建新组
            </el-button>
            <el-button round @click="joinGroupFormDialogVisible = true">
              <i class="el-icon-connection"></i> 申请入组
            </el-button>
          </div>
        </div>
      </template>
    </div>

    <!-- 我的打卡内容 -->
    <div v-show="activeName === 'dailyReport'" class="content-section">
      <div class="my-report-toolbar">
        <div class="export-scope-note">只导出系统目前还能确认属于你的打卡记录。如果换过登录方式、合并或删除过账号，早期记录可能无法找回，导出不一定包含全部历史。</div>
        <el-button size="small" type="primary" plain :loading="exportingMine" @click="exportMyReports">
          <i class="el-icon-download"></i> 导出我的打卡
        </el-button>
      </div>
      <div v-if="reportsLoading" class="loading-state">
        <i class="el-icon-loading"></i>
        <span>加载中...</span>
      </div>

      <div v-else-if="myReports.length > 0" class="my-reports">
        <div v-for="data in visibleMyReports" :key="data.id" class="report-card">
          <div class="report-card-header">
            <el-avatar :size="44" :src="data.headimgurl">
              <i class="el-icon-user-solid"></i>
            </el-avatar>
            <div class="report-card-info">
              <div class="report-card-name">{{ data.nickname || '我' }}</div>
              <div class="report-card-date">
                <i class="el-icon-time"></i>
                {{ data.date }}
              </div>
            </div>
          </div>
          <div class="report-card-content">
            <div v-for="(text, i) in data.items" :key="i" class="report-card-value">
              <i class="el-icon-check"></i>
              <span v-html="text"></span>
            </div>
            <div v-if="data.items.length === 0" class="report-card-value muted">
              当日无打卡内容
            </div>
          </div>
        </div>

        <div v-if="visibleMyReports.length < myReports.length" class="load-more" @click="myReportsLimit += 10">
          加载更多（还有 {{ myReports.length - visibleMyReports.length }} 条）
          <i class="el-icon-arrow-down"></i>
        </div>
        <div v-else class="list-end">— 已经到底啦 —</div>
      </div>

      <div v-else class="empty-state">
        <el-image :src="emptyImg" class="empty-img"/>
        <div class="empty-text">未查到任何打卡信息</div>
        <div class="empty-hint">快去打卡记录你的成长吧</div>
      </div>
    </div>

    <!-- 创建组对话框 -->
    <el-dialog title="创建新组" :visible.sync="addGroupFormDialogVisible" width="85%" center>
      <el-form :model="groupInfo" label-position="top">
        <el-form-item label="组名称">
          <el-input v-model="groupInfo.groupName" placeholder="请输入组名称" maxlength="20" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input type="textarea" v-model="groupInfo.note" placeholder="简单描述一下这个组" :rows="3" maxlength="50" show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addGroupFormDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="addGroup">创建</el-button>
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
        <el-button type="primary" :loading="submitting" @click="joinGroup">申请</el-button>
      </div>
    </el-dialog>

    <!-- 邀请加入对话框 -->
    <el-dialog title="邀请加入" :visible.sync="inviteDialogVisible" width="85%" center>
      <div class="invite-dialog-content">
        <div class="invite-hint">选择要邀请伙伴加入的组，复制邀请链接发给对方，对方打开即可申请加入</div>
        <div class="invite-group-list">
          <div
            v-for="group in ownedGroups"
            :key="group.groupId"
            class="invite-group-item"
            :class="{ active: inviteGroupId === group.groupId }"
            @click="inviteGroupId = group.groupId">
            <div class="invite-group-info">
              <div class="invite-group-name">{{ group.groupName }}</div>
              <div class="invite-group-meta">ID: {{ group.groupId }} · {{ group.members.length }} 人</div>
            </div>
            <i :class="inviteGroupId === group.groupId ? 'el-icon-success' : 'el-icon-circle-outline'"></i>
          </div>
        </div>
        <div class="invite-preview">
          <div class="invite-preview-label">邀请文案预览</div>
          <div class="invite-preview-text">{{ buildInviteText() }}</div>
        </div>
      </div>
      <div slot="footer">
        <el-button @click="inviteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="copyInviteLink">
          <i class="el-icon-s-promotion"></i> 复制邀请链接
        </el-button>
      </div>
    </el-dialog>

    <!-- 编辑组对话框 -->
    <el-dialog title="编辑组信息" :visible.sync="editDialogVisible" width="85%" center>
      <el-form :model="newGroupInfo" label-position="top">
        <el-form-item label="组ID">
          <el-input v-model="newGroupInfo.groupId" disabled prefix-icon="el-icon-key"></el-input>
        </el-form-item>
        <el-form-item label="组名称">
          <el-input v-model="newGroupInfo.groupName" maxlength="20" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input type="textarea" v-model="newGroupInfo.note" :rows="3" maxlength="50" show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="realModifyGroup">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import qs from 'qs'
import XLSX from 'xlsx'
import FileSaver from 'file-saver'
import global from '@/components/Common'
import GroupReportList from '@/components/group/GroupReportList'
import { buildReportItems, sortByDateDesc } from '@/components/group/reportItems'
import { copyToClipboard } from '@/utils/clipboard'
import { buildGroupView, parseJoinResult, readReviewResult, withCacheBust } from '@/utils/groupMembership'
import { buildExportNoteSheet, buildOwnExportSheet, prepareExportMyReports, sheetMatchesRecords } from '@/utils/reportExport'

export default {
  name: 'Group',
  components: { GroupReportList },
  data() {
    return {
      serverUrl: global.httpUrl,
      unionid: '',
      headerImg: require('../assets/img/group_header.png'),
      emptyImg: require('../assets/img/empty.png'),

      activeName: 'myGroup',
      expandedGroups: {},
      expandedRejected: {},

      loading: true,
      reportsLoading: false,
      reportsLoaded: false,
      submitting: false,
      acting: null,
      exportingMine: false,

      // 我创建的组（原始数据）
      rawOwnedGroups: [],
      // 我创建的组的成员记录（打平）
      ownedMembers: [],
      // 我加入的组：二维数组，每项是一个组的全部成员记录
      rawJoinedGroups: [],
      ownedReports: {},
      joinedReports: {},

      myReports: [],
      myReportsLimit: 10,

      // 对话框
      addGroupFormDialogVisible: false,
      joinGroupFormDialogVisible: false,
      inviteDialogVisible: false,
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
      joinGroupId: '',
      inviteGroupId: ''
    }
  },
  computed: {
    groupView() {
      return buildGroupView({
        ownedGroups: this.rawOwnedGroups,
        ownedMemberRows: this.ownedMembers,
        joinedRaw: this.rawJoinedGroups,
        unionId: this.unionid,
        ownedReports: this.ownedReports,
        joinedReports: this.joinedReports
      })
    },

    ownedGroups() {
      return this.groupView.owned
    },

    joinedGroups() {
      return this.groupView.joined
    },

    pendingApplications() {
      return this.groupView.pendingApplications
    },

    rejectedApplications() {
      return this.groupView.rejectedApplications
    },

    pendingCount() {
      return this.groupView.pendingCount
    },

    isEmpty() {
      return !this.loading
        && this.ownedGroups.length === 0
        && this.joinedGroups.length === 0
        && this.pendingApplications.length === 0
        && this.rejectedApplications.length === 0
    },

    visibleMyReports() {
      return this.myReports
        .slice(0, this.myReportsLimit)
        .map(data => ({ ...data, items: buildReportItems(data) }))
    }
  },
  mounted() {
    document.title = this.$route.meta.title
    this.unionid = (this.$store.getters.getUnionid || '').replace(/"/g, '')
    if (!this.unionid) {
      this.loading = false
      this.$message.warning('未获取到用户信息，请重新进入')
      return
    }
    this.getData()
    this.checkInviteParam()
  },
  methods: {
    handleCommand(command) {
      if (command === 'create') {
        this.addGroupFormDialogVisible = true
      } else if (command === 'join') {
        this.joinGroupFormDialogVisible = true
      } else if (command === 'invite') {
        this.openInviteDialog()
      }
    },

    switchTab(name) {
      this.activeName = name
      if (name === 'dailyReport' && !this.reportsLoaded) {
        this.getMyReports()
      }
    },

    isExpanded(groupId) {
      return !!this.expandedGroups[groupId]
    },

    toggleGroup(groupId) {
      this.$set(this.expandedGroups, groupId, !this.expandedGroups[groupId])
    },

    isRejectedOpen(groupId) {
      return !!this.expandedRejected[groupId]
    },

    toggleRejected(groupId) {
      this.$set(this.expandedRejected, groupId, !this.expandedRejected[groupId])
    },

    expandPendingGroups() {
      this.ownedGroups.forEach(group => {
        if (group.pending.length > 0) {
          this.$set(this.expandedGroups, group.groupId, true)
        }
      })
    },

    // 默认展开第一个组，减少一次点击
    initExpanded() {
      if (Object.keys(this.expandedGroups).length > 0) return
      const first = this.ownedGroups[0] || this.joinedGroups[0]
      if (first) this.$set(this.expandedGroups, first.groupId, true)
    },

    copyGroupId(groupId) {
      this.$copyText(groupId).then(() => {
        this.$quickMessage('组ID已复制，发给伙伴即可申请入组')
      }).catch(() => {
        this.$message.warning('复制失败，请手动长按复制')
      })
    },

    todayStr() {
      return global.getDateFormat(new Date())
    },

    openGroupStatus(groupId) {
      this.$router.push({
        name: 'groupStatus',
        params: { groupId },
        query: { date: this.todayStr(), from: 'group' }
      })
    },

    async copyGroupShareLink(group) {
      const date = this.todayStr()
      const base = window.location.href.split('#')[0]
      const url = `${base}#/groupStatus/${encodeURIComponent(group.groupId)}?date=${date}&from=share`
      const text = `【${group.groupName || '团队'}】${date} 打卡完成情况\n未打卡的伙伴请尽快完成～\n${url}`
      const ok = await copyToClipboard(text, this)
      if (ok) {
        this.$quickMessage('提醒链接已复制，可粘贴到群里')
      } else {
        this.$message.warning('复制失败，请手动长按复制')
      }
    },

    // 打开邀请链接时，自动把组 ID 填进申请入组对话框
    checkInviteParam() {
      const inviteId = this.$route.query.invite
      if (!inviteId) return
      this.joinGroupId = String(inviteId)
      this.joinGroupFormDialogVisible = true
      this.$quickMessage('收到团队邀请，请确认后申请加入')
    },

    openInviteDialog() {
      if (this.ownedGroups.length === 0) {
        this.$message.warning('你还没有创建的组，请先创建新组')
        return
      }
      this.inviteGroupId = this.ownedGroups[0].groupId
      this.inviteDialogVisible = true
    },

    inviteLink() {
      const base = window.location.href.split('#')[0]
      return `${base}#/group?invite=${encodeURIComponent(this.inviteGroupId)}`
    },

    buildInviteText() {
      const group = this.ownedGroups.find(g => g.groupId === this.inviteGroupId)
      const name = group ? group.groupName : '团队'
      return `邀请你加入【${name}】团队\n组ID：${this.inviteGroupId}\n点击链接申请加入：${this.inviteLink()}`
    },

    async copyInviteLink() {
      if (!this.inviteGroupId) {
        this.$message.warning('请先选择一个组')
        return
      }
      const ok = await copyToClipboard(this.buildInviteText(), this)
      if (ok) {
        this.$quickMessage('邀请链接已复制，可发给伙伴申请加入')
      } else {
        this.$message.warning('复制失败，请手动长按复制')
      }
    },

    groupGet(path) {
      return axios.get(withCacheBust(`${this.serverUrl}${path}${encodeURIComponent(this.unionid)}`))
    },

    async getData() {
      this.loading = true
      try {
        const [owned, joined] = await Promise.all([
          this.groupGet('findGroupByOwner?unionId='),
          this.groupGet('findAllJoinGroups?unionId=')
        ])
        this.rawOwnedGroups = Array.isArray(owned.data) ? owned.data : []
        this.rawJoinedGroups = (joined.data == null || joined.data === '') ? [] : joined.data
      } catch (err) {
        console.error('获取分组失败', err)
        this.$message.error('加载失败，请下拉刷新重试')
      } finally {
        this.loading = false
      }

      const requests = []
      if (this.rawOwnedGroups.length > 0) {
        requests.push(
          this.groupGet('findJoinGroups?unionId=')
            .then(res => { this.ownedMembers = (res.data == null || res.data === '') ? [] : res.data })
            .catch(err => console.error('获取组员失败', err)),
          this.groupGet('findReportsInGroupByOwner?unionId=')
            .then(res => { this.ownedReports = res.data || {} })
            .catch(err => console.error('获取组员打卡记录失败', err))
        )
      } else {
        this.ownedMembers = []
        this.ownedReports = {}
      }

      const joinedCount = Array.isArray(this.rawJoinedGroups)
        ? this.rawJoinedGroups.length
        : (this.rawJoinedGroups && typeof this.rawJoinedGroups === 'object'
          ? Object.keys(this.rawJoinedGroups).length
          : 0)
      if (joinedCount > 0) {
        requests.push(
          this.groupGet('findReportsJoinGroupByOwner?unionId=')
            .then(res => { this.joinedReports = res.data || {} })
            .catch(err => console.error('获取加入组打卡记录失败', err))
        )
      } else {
        this.joinedReports = {}
      }

      await Promise.all(requests)
      this.initExpanded()
    },

    async exportMyReports() {
      if (!this.unionid) {
        this.$message.warning('未获取到用户信息，请重新进入')
        return
      }
      if (this.exportingMine) return
      const loginId = this.unionid
      this.exportingMine = true
      try {
        let profile = null
        try {
          const profileRes = await axios.get(`${this.serverUrl}getById?id=${encodeURIComponent(loginId)}`)
          if (profileRes.data && typeof profileRes.data === 'object') profile = profileRes.data
        } catch (profileErr) {
          profile = null
        }
        if (this.unionid !== loginId) return
        const res = await axios.get(
          `${this.serverUrl}exportMyReports?userId=${encodeURIComponent(loginId)}`
        )
        if (this.unionid !== loginId) return
        const prepared = prepareExportMyReports(res.data, profile)
        if (!prepared.download) {
          const detail = [prepared.reason, prepared.message].filter(Boolean).join('；')
            + (prepared.warnings.length ? '；' + prepared.warnings.join('；') : '')
          if (prepared.status === 'complete') this.$message.warning(detail || '没有找到可导出的打卡记录')
          else this.$message.error(detail || '导出没有成功，没有生成文件')
          return
        }
        const records = buildOwnExportSheet(prepared.rows)
        if (!sheetMatchesRecords(records, prepared.rows)) {
          this.$message.error('导出校验失败，文件内容与系统记录不一致，没有保存文件')
          return
        }
        const book = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(buildExportNoteSheet(prepared)), '说明')
        XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(records), '我的打卡')
        const out = XLSX.write(book, { bookType: 'xlsx', bookSST: true, type: 'array' })
        const now = new Date()
        const pad = value => String(value).padStart(2, '0')
        const stamp = now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate())
          + pad(now.getHours()) + pad(now.getMinutes())
        FileSaver.saveAs(new Blob([out], { type: 'application/octet-stream' }), '我的打卡_' + stamp + '.xlsx')
        const scope = prepared.scopeNote
        if (prepared.status === 'complete') {
          this.$message.success('已导出 ' + prepared.rows.length + ' 条打卡记录。' + scope)
        } else {
          const extra = [prepared.reason, prepared.message].concat(prepared.warnings).filter(Boolean).join('；')
          this.$message.warning('导出不完整：已写入 ' + prepared.rows.length + ' 条，可能还缺早期记录。' + extra)
        }
      } catch (err) {
        console.error('导出我的打卡失败', err)
        this.$message.error('导出失败，没有生成文件')
      } finally {
        this.exportingMine = false
      }
    },

    async getMyReports() {
      this.reportsLoading = true
      try {
        const res = await axios.get(`${this.serverUrl}findReportByUser?unionId=${this.unionid}`)
        this.myReports = sortByDateDesc(res.data || [])
        this.reportsLoaded = true
      } catch (err) {
        console.error('获取打卡记录失败', err)
        this.$message.error('打卡记录加载失败')
      } finally {
        this.reportsLoading = false
      }
    },

    async addGroup() {
      if (!this.groupInfo.groupName.trim()) {
        this.$message.warning('请输入组名称')
        return
      }

      this.submitting = true
      try {
        await axios.post(`${this.serverUrl}createGroup`, qs.stringify({
          groupName: this.groupInfo.groupName.trim(),
          owner: this.unionid,
          note: this.groupInfo.note,
          time: Date.now()
        }))
        this.$message.success('创建成功！')
        this.addGroupFormDialogVisible = false
        this.groupInfo = { groupName: '', note: '' }
        this.getData()
      } catch (err) {
        this.$message.error('创建失败，请重试')
      } finally {
        this.submitting = false
      }
    },

    async joinGroup() {
      const groupId = this.joinGroupId.trim()
      if (!groupId) {
        this.$message.warning('请输入组ID')
        return
      }

      if (groupId.length !== 11 && !groupId.startsWith('HTZ-')) {
        this.$message.warning('请输入正确的组ID')
        return
      }

      this.submitting = true
      try {
        const res = await axios.post(`${this.serverUrl}joinGroup`, qs.stringify({
          groupId,
          unionId: this.unionid
        }))

        const result = parseJoinResult(res.data)
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
          this.joinGroupFormDialogVisible = false
          this.joinGroupId = ''
          await this.getData()
        } else if (messages[result]) {
          this.$message.warning(messages[result])
        } else {
          this.$message.error('请求失败，请再次尝试')
        }
      } catch (err) {
        this.$message.error('申请失败，请重试')
      } finally {
        this.submitting = false
      }
    },

    modifyGroup(group) {
      this.newGroupInfo = {
        groupId: group.groupId,
        groupName: group.groupName,
        note: group.note
      }
      this.editDialogVisible = true
    },

    async realModifyGroup() {
      if (!this.newGroupInfo.groupName.trim()) {
        this.$message.warning('请输入组名称')
        return
      }

      this.submitting = true
      try {
        await axios.post(`${this.serverUrl}modifyGroup`, qs.stringify(this.newGroupInfo))
        this.$message.success('修改成功！')
        this.editDialogVisible = false
        this.getData()
      } catch (err) {
        this.$message.error('修改失败，请重试')
      } finally {
        this.submitting = false
      }
    },

    async deleteGroup(id) {
      try {
        await axios.post(`${this.serverUrl}deleteGroup?id=${id}`)
        this.$message.success('已解散该组')
        this.getData()
      } catch (err) {
        this.$message.error('删除失败，请重试')
      }
    },

    async quitGroup(group) {
      if (!group.myRecordId) {
        this.$message.error('未找到你的入组记录，请刷新后重试')
        return
      }
      try {
        await axios.post(`${this.serverUrl}deleteGroups?id=${group.myRecordId}`)
        this.$message.success('已退出该组')
        this.getData()
      } catch (err) {
        this.$message.error('退出失败，请重试')
      }
    },

    reviewQuery(member) {
      const owner = member.owner || member.ownerId || ''
      const groupId = member.groupId || ''
      const unionId = member.unionId || member.unionid || ''
      if (!owner || !groupId || !unionId) return ''
      return `owner=${encodeURIComponent(owner)}&groupId=${encodeURIComponent(groupId)}&unionId=${encodeURIComponent(unionId)}`
    },

    async agreeJoinGroup(member) {
      const query = this.reviewQuery(member)
      if (!query) {
        this.$message.error('申请记录缺少组长或组员信息，无法审核')
        return
      }
      this.acting = member.id
      try {
        const res = await axios.post(`${this.serverUrl}agreeGroup?${query}`)
        const result = readReviewResult(res.data)
        if (result.ok) this.$message.success('已同意入组！')
        else this.$message.error(result.message || '同意没有成功')
      } catch (err) {
        this.$message.error('操作失败，请重试')
      } finally {
        this.acting = null
        await this.getData()
      }
    },

    async rejectJoinGroup(member) {
      const query = this.reviewQuery(member)
      if (!query) {
        this.$message.error('申请记录缺少组长或组员信息，无法审核')
        return
      }
      this.acting = member.id
      try {
        const res = await axios.post(`${this.serverUrl}rejectGroup?${query}`)
        const result = readReviewResult(res.data)
        if (result.ok) this.$message.warning('已拒绝入组')
        else this.$message.error(result.message || '拒绝没有成功')
      } catch (err) {
        this.$message.error('操作失败，请重试')
      } finally {
        this.acting = null
        await this.getData()
      }
    },

    async deleteJoinRecord(id) {
      this.acting = id
      try {
        await axios.post(`${this.serverUrl}deleteGroups?id=${id}`)
        this.$message.success('已删除')
        await this.getData()
      } catch (err) {
        this.$message.error('删除失败，请重试')
      } finally {
        this.acting = null
      }
    }
  }
}
</script>

<style scoped>
.group-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: calc(20px + constant(safe-area-inset-bottom));
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
}

/* 顶部头图 */
.header-section {
  position: relative;
  height: 160px;
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
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.75), rgba(118, 75, 162, 0.75));
}

.header-content {
  position: absolute;
  bottom: 42px;
  left: 20px;
  right: 70px;
  color: white;
  text-align: left;
}

.header-title {
  font-size: 22px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.header-subtitle {
  font-size: 13px;
  opacity: 0.9;
  margin-top: 4px;
}

.header-actions {
  position: absolute;
  top: 15px;
  right: 15px;
}

.add-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.92);
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

/* 概览统计 */
.stats-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: white;
  margin: -22px 15px 0;
  padding: 14px 10px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 10;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.stat-value.warn {
  color: #f56c6c;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: #ebeef5;
}

/* Tab切换 */
.tab-section {
  padding: 15px 15px 0;
}

.tab-wrapper {
  background: #ecedf2;
  border-radius: 12px;
  padding: 4px;
  display: flex;
}

.tab-item {
  flex: 1;
  padding: 10px 0;
  text-align: center;
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.25s;
  color: #606266;
  font-size: 14px;
}

.tab-item i {
  margin-right: 5px;
}

.tab-item.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.35);
}

/* 内容区域 */
.content-section {
  padding: 15px;
}

.my-report-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.export-scope-note {
  flex: 1;
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
  text-align: left;
}

.loading-state {
  text-align: center;
  padding: 60px 0;
  color: #909399;
  font-size: 14px;
}

.loading-state i {
  font-size: 24px;
  margin-bottom: 10px;
  display: block;
}

/* 待审批提醒 */
.pending-banner {
  display: flex;
  align-items: center;
  background: #fff6e8;
  border: 1px solid #ffe1b8;
  color: #e6a23c;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  margin-bottom: 15px;
  cursor: pointer;
}

.pending-banner > i {
  margin-right: 6px;
  font-size: 15px;
}

.pending-text {
  flex: 1;
  text-align: left;
}

.pending-action {
  flex-shrink: 0;
  font-size: 12px;
}

/* 分组区域 */
.group-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding-left: 2px;
}

.section-icon {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  font-size: 14px;
}

.section-icon.created {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
}

.section-icon.joined {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
}

.section-header > span {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.section-count {
  margin-left: auto;
  font-size: 12px !important;
  color: #909399 !important;
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
  padding: 14px;
  cursor: pointer;
}

.group-avatar {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
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
  min-width: 0;
  margin-left: 12px;
  text-align: left;
}

.group-name-row {
  display: flex;
  align-items: center;
}

.group-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pending-badge {
  flex-shrink: 0;
  margin-left: 8px;
  background: #fef0f0;
  color: #f56c6c;
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 10px;
  line-height: 18px;
}

.group-meta {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.group-meta > *:not(:last-child) {
  margin-right: 12px;
}

.group-id {
  flex-shrink: 0;
  color: #909399;
}

.group-id i {
  margin-left: 2px;
  color: #b3b8ff;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-arrow {
  flex-shrink: 0;
  color: #c0c4cc;
  font-size: 14px;
  padding-left: 8px;
}

.group-card-body {
  border-top: 1px solid #f0f0f0;
  padding: 14px;
}

/* 区块标题 */
.block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.block-header i {
  margin-right: 5px;
}

.block-header.collapsible {
  cursor: pointer;
}

.block-count {
  font-size: 12px;
  color: #c0c4cc;
}

/* 申请 / 组员 */
.apply-section {
  background: #fffaf3;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 15px;
}

.apply-section .block-header {
  color: #e6a23c;
}

.member-section,
.rejected-section {
  margin-bottom: 15px;
}

.member-list {
  display: flex;
  flex-direction: column;
}

.member-list.simple {
  flex-direction: row;
  flex-wrap: wrap;
  margin: -4px;
}

.member-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
}

.member-item.apply {
  background: white;
}

.member-item:last-child {
  margin-bottom: 0;
}

.member-info {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
}

.member-name {
  font-size: 14px;
  color: #303133;
  margin-left: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: 8px;
}

.member-actions > *:not(:last-child) {
  margin-right: 6px;
}

.member-chip {
  display: flex;
  align-items: center;
  max-width: 100%;
  padding: 5px 10px 5px 5px;
  margin: 4px;
  background: #f0f2f5;
  border-radius: 20px;
  font-size: 13px;
  color: #606266;
}

.chip-name {
  margin-left: 6px;
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-inline {
  text-align: center;
  color: #c0c4cc;
  font-size: 13px;
  padding: 16px 0;
}

.empty-inline i {
  margin-right: 5px;
}

/* 卡片底部操作 */
.card-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
  margin-top: 14px;
  gap: 8px;
}

.card-footer > * {
  margin: 0;
}

/* 我的打卡卡片 */
.my-reports {
  display: flex;
  flex-direction: column;
}

.report-card {
  background: white;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 12px;
}

.report-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.report-card-info {
  flex: 1;
  min-width: 0;
  margin-left: 12px;
  text-align: left;
}

.report-card-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.report-card-date {
  font-size: 12px;
  color: #909399;
  margin-top: 3px;
}

.report-card-date i {
  margin-right: 4px;
}

.report-card-content {
  text-align: left;
}

.report-card-value {
  display: flex;
  align-items: flex-start;
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  word-break: break-all;
}

.report-card-value.muted {
  color: #c0c4cc;
}

.report-card-value i {
  color: #67c23a;
  margin-right: 6px;
  line-height: 1.8;
}

.report-card-value /deep/ .report-num {
  color: #667eea;
  font-weight: 600;
  margin: 0 2px;
}

.load-more {
  text-align: center;
  font-size: 14px;
  color: #667eea;
  padding: 12px 0;
}

.load-more i {
  margin-left: 4px;
}

.list-end {
  text-align: center;
  font-size: 12px;
  color: #c0c4cc;
  padding: 10px 0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 50px 20px;
}

.empty-img {
  width: 140px;
  height: 140px;
  margin-bottom: 18px;
}

.empty-text {
  font-size: 16px;
  color: #606266;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 13px;
  color: #909399;
  margin-bottom: 22px;
}

.empty-actions {
  display: flex;
  justify-content: center;
}

/* 对话框 */
.join-dialog-content {
  text-align: center;
}

.join-hint {
  font-size: 13px;
  color: #909399;
  margin-bottom: 15px;
  text-align: left;
}

/* 邀请加入对话框 */
.invite-dialog-content {
  text-align: left;
}

.invite-hint {
  font-size: 13px;
  color: #909399;
  margin-bottom: 15px;
}

.invite-group-list {
  max-height: 40vh;
  overflow-y: auto;
  margin-bottom: 15px;
}

.invite-group-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.invite-group-item.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.06);
}

.invite-group-item > i {
  flex-shrink: 0;
  font-size: 20px;
  color: #c0c4cc;
  margin-left: 10px;
}

.invite-group-item.active > i {
  color: #667eea;
}

.invite-group-info {
  min-width: 0;
}

.invite-group-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.invite-group-meta {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.invite-preview {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 12px 14px;
}

.invite-preview-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.invite-preview-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 通用 */
img {
  pointer-events: none;
}

* {
  -webkit-tap-highlight-color: transparent;
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
