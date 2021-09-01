<template>
  <div>
    <div style="float: left">
      <div style="width: 96%; height: 150px;position: absolute">
        <el-image :src="'http://htzchina.org/imgs/group_header.png'"
                  fit="cover"/>
      </div>
      <div style="position: absolute;margin-top: 5px;margin-left: 82%; z-index: 1">
        <el-popover
            placement="top"
            v-model="addListDialogVisible"
            ref="popover_add">
          <div style="text-align: center;margin-top: 5px;height: 30px;font-size: 16px" @click="showNewGroupDialog">创建组+</div>
          <div style="width: 100%;height: 1px;background-color: #d8d9d9"/>
          <div style="text-align:center;margin-top:5px;height: 30px;font-size: 16px" @click="showJoinGroupDialog">申请入组</div>
          <el-button class="el-icon-plus" style="background-color: unset;border-width: 0;color: white; font-weight: bold;font-size: 15px" slot="reference"
                     v-popover:popover_add></el-button>
        </el-popover>
      </div>
    </div>

    <el-dialog title="创建新组" :visible.sync="addGroupFormDialogVisible" customClass="customDialogWidth">
      <el-form :model="groupInfo">
        <el-form-item label="组名称" style="margin: 0">
          <el-input v-model="groupInfo.groupName" autocomplete="off" placeholder="请输入名称"></el-input>
        </el-form-item>
        <el-form-item label="备注" style="margin: 0">
          <el-input type="textarea" v-model="groupInfo.note" autocomplete="off" placeholder="备注" :rows="2"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addGroupFormDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addGroup">创 建</el-button>
      </div>
    </el-dialog>

    <el-dialog title="申请入组" :visible.sync="joinGroupFormDialogVisible" customClass="customDialogWidth">
      <el-input v-model="joinGroupId" autocomplete="off" placeholder="请输入组ID"></el-input>
      <div slot="footer" class="dialog-footer">
        <el-button @click="joinGroupFormDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="joinGroup">申 请</el-button>
      </div>
    </el-dialog>

    <div style="float: left;width: 100%;margin-top: 180px">
      <el-tabs v-model="activeName" type="card">
        <el-tab-pane label="我的分组" name="myGroup">
          <div v-if="myGroup.length > 0" style="color: #fa02c4;float: left;text-align: left;margin-bottom: 5px;margin-left: 10px">我创建的</div>
          <el-collapse style="float: left; width: 100%" accordion v-model="myGroupSelectedName">
            <div v-for="(item, index) in myGroup" v-bind:key="item !== null ? item.groupId : null">
              <el-collapse-item :title="item != null ? item.groupName : null" style="min-height: 50px" :name="item.groupId">
                <div style="text-align: left;margin-left: 30px;font-size: 12px;font-weight: bold">组ID: {{item.groupId}}</div>
                <div style="text-align: left;margin-left: 30px;font-size: 16px;color: gray" v-for="member in myGroupMember[index]" v-bind:key="member !== null ? member.groupId : null">
                  <el-row>
                    <el-col :span="12">
                      <span>{{member.nickname}}</span>
                    </el-col>
                    <el-col :span="6">
                      <el-button size="mini" style="color: #0d32e8" v-if="member.state === 0" @click="agreeJoinGroup(member.owner, member.groupId, member.unionId)">同意入组</el-button>
                      <span style="margin-left: 40%;color: #f50c8d;font-size: 12px" v-if="member.state === 2">已拒绝</span>
                    </el-col>
                    <el-col :span="6">
                      <el-button size="mini" style="color: #f50c8d" v-if="member.state === 0" @click="rejectJoinGroup(member.owner, member.groupId, member.unionId)">拒绝入组</el-button>
                      <span style="margin-left: 40%;color: #2b9a0b;font-size: 12px" v-if="member.state === 1">已加入</span>
                      <el-button size="mini" style="color: #f50c8d" v-if="member.state === 2" @click="deleteJoinGroup(member.id)">删除</el-button>
                    </el-col>
                  </el-row>
                </div>
                <div style="float: right;margin-top: 10px">
                  <el-button @click="modifyGroup(item.groupId, item.groupName, item.note)">修改</el-button>
                  <el-popconfirm title="确定删除吗？" @confirm="deleteGroup(item.id)">
                    <el-button slot="reference">删除</el-button>
                  </el-popconfirm>
                </div>
              </el-collapse-item>
            </div>
          </el-collapse>
          <div v-if="myJoinGroup.length > 0" style="color: #fa02c4;float: left;text-align: left;margin-bottom: 5px;margin-left: 10px">我加入的</div>
          <el-collapse style="float: left; width: 100%" accordion v-if="myJoinGroup.length > 0">
            <div v-for="(item, index) in myJoinGroup" v-bind:key="item !== null && item[0] !== null ? item[0].groupId : null">
              <el-collapse-item :title="item != null && item[0] != null ? item[0].groupName : null" style="min-height: 50px">
                <div style="text-align: left;margin-left: 30px;font-size: 12px;font-weight: bold">组ID: {{item[0].groupId}}</div>
                <div style="text-align: left;margin-left: 30px;font-size: 16px;color: gray" v-for="member in myJoinGroup[index]" v-bind:key="member !== null ? member.groupId : null">
                  <span>{{member.nickname}}</span>
                </div>
              </el-collapse-item>
            </div>
          </el-collapse>
          <div v-if="emptyShow">
            <el-image style="width: 150px; height: 150px; float: left; margin-left: 30%"
                      :src="require('../assets/img/empty.png')"/>
            <div style="float: left; width: 80%; margin-left: 10%; color: gray">您还未加入任何组，请点击图片右上角的 “<span
                style="font-size: 20px;color: gray">+</span>” 图标创建或点击如下按钮申请入组。
            </div>
            <div style="float: left;margin-top: 20px;margin-left: 38%">
              <el-popover
                  placement="top"
                  v-model="joinGroupDialogVisible">
                <p>请输入您要加入组的ID:</p>
                <el-input type="text" placeholder="ID" v-model="joinGroupId"></el-input>
                <div style="text-align: right;margin-top: 5px">
                  <el-button type="primary" size="mini" @click="joinGroup">申请</el-button>
                </div>
                <el-button type="primary" slot="reference">申请入组</el-button>
              </el-popover>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="打卡日志" name="dailyReport">

          <el-card style="float: left;width: 100%;margin-top: 5px">
            <div v-for="(data) in allMemberReports" :key='data.day'>
              <div style="float: left;width: 100%">
                <div style="float: left;width: 15%;">
                  <el-image style="width: 50px; height: 50px"
                            :src="data.headimgurl"></el-image>
                </div>
                <div style="float: left;margin-left:15px;width:80%;text-align: left;color: #2b69c9;font-weight: bold">{{data.nickname}}</div>
                <div style="float: left;margin-left: 20px;margin-top:5px;margin-bottom: 20px;text-align: left">
                  <div style="color: #797a7b">{{data.date.substring(5)}} 打卡：</div>
                  <div v-if="data.value1 != null && data.value1 !== '0'" style="color: #797a7b;margin-top: 5px">{{data.template2 != null ? data.template1.replace("_", data.value1) : ""}}</div>
                  <div v-if="data.value2 != null && data.value2 !== '0'" style="color: #797a7b">{{data.template2 != null ? data.template2.replace("_", data.value2) : ""}}</div>
                  <div v-if="data.value3 != null && data.value3 !== '0'" style="color: #797a7b">{{data.template3 != null ? data.template3.replace("_", data.value3) : ""}}</div>
                  <div v-if="data.value4 != null && data.value4 !== '0'" style="color: #797a7b">{{data.template4 != null ? data.template4.replace("_", data.value4) : ""}}</div>
                  <div v-if="data.value5 != null && data.value5 !== '0'" style="color: #797a7b">{{data.template5 != null ? data.template5.replace("_", data.value5) : ""}}</div>
                  <div v-if="data.value6 != null && data.value6 !== '0'" style="color: #797a7b">{{data.template6 != null ? data.template6.replace("_", data.value6) : ""}}</div>
                  <div v-if="data.value7 != null && data.value7 !== '0'" style="color: #797a7b">{{data.template7 != null ? data.template7.replace("_", data.value7) : ""}}</div>
                  <div v-if="data.value8 != null && data.value8 !== '0'" style="color: #797a7b">{{data.template8 != null ? data.template8.replace("_", data.value8) : ""}}</div>
                  <div v-if="data.value9 != null && data.value9 !== '0'" style="color: #797a7b">{{data.template9 != null ? data.template9.replace("_", data.value9) : ""}}</div>
                  <div v-if="data.value10 != null && data.value10 !== '0'" style="color: #797a7b">{{data.template10 != null ? data.template10.replace("_", data.value10) : ""}}</div>
                  <div v-if="data.value11 != null && data.value11 !== '0'" style="color: #797a7b">{{data.template11 != null ? data.template11.replace("_", data.value11) : ""}}</div>
                  <div v-if="data.value12 != null && data.value12 !== '0'" style="color: #797a7b">{{data.template12 != null ? data.template12.replace("_", data.value12) : ""}}</div>
                  <div v-if="data.value13 != null && data.value13 !== '0'" style="color: #797a7b">{{data.template13 != null ? data.template13.replace("_", data.value13) : ""}}</div>
                  <div v-if="data.value14 != null && data.value14 !== '0'" style="color: #797a7b">{{data.template14 != null ? data.template14.replace("_", data.value14) : ""}}</div>
                  <div v-if="data.value15 != null && data.value15 !== '0'" style="color: #797a7b">{{data.template15 != null ? data.template15.replace("_", data.value15) : ""}}</div>
                </div>
              </div>
            </div>
            <div v-if="allMemberReports === null || allMemberReports.length == 0">
              <el-image style="width: 150px; height: 150px; float: left; margin-left: 30%"
                        :src="require('../assets/img/empty.png')"/>
              <div style="float: left; width: 80%; margin-left: 10%;margin-bottom: 20%; color: gray">未查到任何打卡信息</div>
            </div>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 编辑 -->
    <el-dialog title="编辑" :visible.sync="editDialogVisible" customClass="customDialogWidth">
      <el-form ref="form" :model="newGroupInfo" label-width="80px">
        <el-form-item label="组ID">
          <el-input v-model="newGroupInfo.groupId" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="组名称">
          <el-input v-model="newGroupInfo.groupName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="组备注">
          <el-input v-model="newGroupInfo.note" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="realModifyGroup">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import qs from "qs";
import global from "@/components/Common";

export default {
  name: 'TenYears',
  props: {
    msg: String
  },
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
      birthday: '1988',
      open: '',
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
      imgUrl: '',
      groupInfo: {
        id: '',
        groupId: '',
        groupName: '',
        owner: '',
        note: '',
        time: 0
      },
      newGroupInfo: {
        id: '',
        groupId: '',
        groupName: '',
        owner: '',
        note: '',
        time: 0
      },
      groupsInfo: {
        id: '',
        groupId: '',
        unionId: '',
        state: '',
        time: 0
      },
      joinGroupId: '',

      editDialogVisible: false,
      joinGroupDialogVisible: false,
      addListDialogVisible: false,
      addGroupFormDialogVisible: false,
      joinGroupFormDialogVisible: false,
      myGroup: [],
      myJoinGroup: [],
      myGroupMember: [],
      emptyShow: false,
      activeName: 'myGroup',
      myGroupSelectedName: '',

      myGroupQueryDone: false,
      myGroupsQueryDone: false,
      allMemberReports: [],
    };
  },
  mounted: function () {
    document.title = this.$route.meta.title
    console.log("group getInfo")
    this.getUserInfo()
    this.getData()
    this.getGroupReports()
  },
  methods: {
    getGroupReports() {
      axios({
        method: "GET",
        url: this.serverUrl + "findAllMemberReportByUser?unionId=" + this.unionid,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.allMemberReports = res.data
        // console.log("allMemberReports:" + this.allMemberReports.length)
        // console.log("allMemberReports:" + this.allMemberReports)
        // for (let i = 0; i < this.allMemberReports.length; i++) {
        //   console.log(this.allMemberReports[i])
        // }
      })
    },
    deleteJoinGroup(id) {
      axios({
        method: "POST",
        url: this.serverUrl + "deleteGroups?id=" + id,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        console.log("createGroup res:" + res.data)
        this.$message.success("已删除！")
        this.getData()
      })
    },
    agreeJoinGroup(owner, groupId, unionId) {
      axios({
        method: "POST",
        url: this.serverUrl + "agreeGroup?owner=" + owner + "&groupId=" + groupId + "&unionId=" + unionId,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        console.log("createGroup res:" + res.data)
        this.$message.success("已同意入组！")
        this.getData()
      })
    },
    rejectJoinGroup(owner, groupId, unionId) {
      axios({
        method: "POST",
        url: this.serverUrl + "rejectGroup?owner=" + owner + "&groupId=" + groupId + "&unionId=" + unionId,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        console.log("createGroup res:" + res.data)
        this.$message.warning("已拒绝入组！")
        this.getData()
      })
    },
    deleteGroup(id) {
      axios({
        method: "POST",
        url: this.serverUrl + "deleteGroup?id=" + id,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        console.log("createGroup res:" + res.data)
        this.$message.success("已删除！")
        this.getData()
      })
    },
    realModifyGroup() {
      axios({
        method: "POST",
        url: this.serverUrl + "modifyGroup",
        data: qs.stringify(this.newGroupInfo),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        console.log("createGroup res:" + res.data)
        this.$message.success("修改成功！")
        this.editDialogVisible = false
        this.getData()
      })
    },
    modifyGroup(groupId, groupName, note) {
      this.editDialogVisible = true
      this.newGroupInfo.groupId = groupId
      this.newGroupInfo.groupName = groupName
      this.newGroupInfo.note = note
    },
    joinGroup() {
      if (this.joinGroupId === null || this.joinGroupId === '') {
        this.$message.warning("请输入组ID")
        return;
      }
      if (this.joinGroupId.length !== 11 && !this.joinGroupId.startsWith("HTZ-")) {
        this.$message.warning("请输入正确的组ID")
        return;
      }
      this.joinGroupFormDialogVisible = false
      this.joinGroupDialogVisible = false
      let data = qs.stringify({
        groupId: this.joinGroupId,
        unionId: this.unionid
      })
      axios({
        method: "POST",
        url: this.serverUrl + "joinGroup",
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        const result = res.data;
        console.log("joinGroup res:" + result)
        if (result !== null) {
          if (result === 0) {
            this.$message.success("申请已发出，请等待组长审批")
          } else if (result === 1) {
            this.$message.warning("申请的组不存在")
          } else if (result === 2) {
            this.$message.warning("你已在组中，无需申请")
          } else if (result === 3) {
            this.$message.success("已再次提交申请")
          } else if (result === 4) {
            this.$message.warning("无法申请加入自己的组")
          } else if (result === 5) {
            this.$message.success("已再次提交申请")
          }
        } else {
          this.$message.error("请求失败，请再次尝试")
        }
      })
    },
    addGroup() {
      this.addGroupFormDialogVisible = false

      let data = qs.stringify({
        groupName: this.groupInfo.groupName,
        owner: this.unionid,
        note: this.groupInfo.note,
        time: new Date().getTime()
      })
      axios({
        method: "POST",
        url: this.serverUrl + "createGroup",
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        console.log("createGroup res:" + res.data)
        this.groupInfo.groupId = res.data
        this.$message.success("已创建成功！")
        this.getData()
      })
    },
    showNewGroupDialog() {
      this.addListDialogVisible = false
      this.addGroupFormDialogVisible = true
    },
    showJoinGroupDialog() {
      this.addListDialogVisible = false
      this.joinGroupFormDialogVisible = true
    },
    getUserInfo() {
      this.unionid = this.$store.getters.getUnionid
      if (this.unionid != null) {
        this.unionid = this.unionid.replace("\"", "").replace("\"", "")
      }
      console.log("getData unionid:" + this.unionid)
      axios({
        method: "GET",
        url: this.serverUrl + "getById?id=" + this.unionid,
        data: null,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        console.log("getById: res:" + res.data)
        if (res.data != null && res.data !== '') {
          console.log("getById res:" + res)
          console.log("getById res.data:" + res.data)
          this.name = res.data.name
          this.headimgurl = res.data.headimgurl
          this.gender = res.data.gender + ''
          this.wechatgroup = res.data.wechatgroup
          this.telephone = res.data.telephone
          this.info = res.data.info
          this.stepInfo = res.data.stepInfo
          this.createDate = res.data.createDate
          this.birthday = res.data.birthday
          this.open = res.data.open
          this.daixie = res.data.daixie
          this.chujie = res.data.chujie
          this.wechatid = res.data.wechatid
          this.province = res.data.province
        }
      });
    },
    getData() {
      axios({
        method: "GET",
        url: this.serverUrl + "findGroupByOwner?unionId=" + this.unionid,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        console.log("mygroup:::" + res.data)
        this.myGroup = res.data
        this.myGroupQueryDone = true
        if (this.myGroupsQueryDone) {
          this.emptyShow = this.myGroup.length === 0 && this.myJoinGroup.length === 0
        }
        console.log("myGroup:" + this.myGroup + " " + (this.myGroup.length))
        if (this.myGroup.length > 0) {
          axios({
            method: "GET",
            url: this.serverUrl + "findJoinGroups?unionId=" + this.unionid,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }).then((res) => {
            this.myGroupMember = res.data
            // console.log("myGroupMember:" + this.myGroupMember + " " + (this.myGroupMember.length))
            // for (let i = 0; i < this.myGroupMember.length; i++) {
            //   console.log("myGroupMember:" + this.myGroupMember[i])
            // }
          })
        }
      })
      axios({
        method: "GET",
        url: this.serverUrl + "findAllJoinGroups?unionId=" + this.unionid,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.myJoinGroup = res.data
        this.myGroupsQueryDone = true
        if (this.myGroupQueryDone) {
          this.emptyShow = this.myGroup.length === 0 && this.myJoinGroup.length === 0
        }
        // console.log("myJoinGroup:" + this.myJoinGroup + " " + (this.myJoinGroup.length))
        // for (let i = 0; i < this.myJoinGroup.length; i++) {
        //   console.log("myJoinGroup:" + this.myJoinGroup[i])
        // }
      })
    },
  },
}
</script>

<style>
.customDialogWidth{
  width:74%;
}
img {
  pointer-events: none;
}

/deep/ .el-radio {
  white-space: normal;
}

* {
  -webkit-touch-callout: none; /*系统默认菜单被禁用*/
  -webkit-user-select: none; /*webkit浏览器*/
  -khtml-user-select: none; /*早期浏览器*/
  -moz-user-select: none; /*火狐*/
  -ms-user-select: none; /*IE10*/
  user-select: none;
}

input, textarea {
  -webkit-user-select: auto; /*webkit浏览器*/
  outline: none;
}
</style>
