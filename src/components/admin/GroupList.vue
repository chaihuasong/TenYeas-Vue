<template>
  <div>
    <el-table :data="tableData.slice((currentPage-1)*pageSize,currentPage*pageSize)">
      <el-table-column prop="id" label="id" width="80">
      </el-table-column>
      <el-table-column prop="groupId" label="组ID" width="120">
      </el-table-column>
      <el-table-column prop="groupName" label="组名" width="120">
      </el-table-column>
      <el-table-column prop="owner" label="创建者" width="250">
      </el-table-column>
      <el-table-column prop="note" label="组备注" width="250">
      </el-table-column>
      <el-table-column prop="time" label="时间" width="250">
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" @click="editItem(scope.$index, scope.row)">编辑</el-button>
          <br/>
          <br/>
          <el-button size="mini" type="danger" @click="delItem(scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tableData.length">
    </el-pagination>

    <!-- 编辑 -->
    <el-dialog title="编辑" :visible.sync="editDialogVisible">
      <el-form ref="form" :model="newGroupInfo" label-width="80px">
        <el-form-item label="ID">
          <el-input v-model="newGroupInfo.id" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="组ID">
          <el-input v-model="newGroupInfo.groupId" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="组名称">
          <el-input v-model="newGroupInfo.groupName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="创建者">
          <el-input v-model="newGroupInfo.owner" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="组备注">
          <el-input v-model="newGroupInfo.note" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="时间">
          <el-input v-model="newGroupInfo.time" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveItem">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 删除 -->
    <el-dialog title="提示" :visible.sync="delDialogVisible" width="30%">
        <span slot="footer" class="dialog-footer">
          <el-button @click="delDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="delDialogVisible = false">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<style>
.el-header {
  background-color: #B3C0D1;
  color: #333;
  line-height: 60px;
}

.el-aside {
  color: #333;
}
</style>

<script>
import axios from "axios"
import qs from "qs"
import global from '../Common.vue'

export default {
  data() {
    return {
      serverUrl: global.httpUrl,
      tableData: [],
      currentPage: 1,
      pageSize: 10,
      search: '',
      delDialogVisible: false,
      editDialogVisible: false,
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
      groupInfoIndex: 0,
    }
  },

  mounted: function () {
    console.log("login?" + this.checkLogin())
    if (this.checkLogin()) {
      this.getData()
    } else {
      let loginUser = this.$store.getters.getUser
      if (loginUser === 'admin') {
        this.$router.push("/admin")
      } else {
        this.$router.push("/role")
      }
    }
    document.title = this.$route.meta.title
  },
  methods: {
    getData() {
      axios({
        method: "GET",
        url: this.serverUrl + "findAllGroup",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.tableData = res.data
      })
    },
    checkLogin() {
      let loginDate = this.$store.getters.getSortage
      if (loginDate != null && loginDate !== '') {
        if ((Date.now() - loginDate) < 3600000) {
          return true
        }
      }
      return false
    },
    editItem(index, item) {
      this.groupInfoIndex = index
      console.log("index:" + index)
      this.newGroupInfo = {
        id: item.id,
        groupId: item.groupId,
        groupName: item.groupName,
        owner: item.owner,
        note: item.note,
        time: item.time
      }
      this.editDialogVisible = true
    },
    saveItem() {
      this.editDialogVisible = false;
      this.$set(this.tableData, this.groupInfoIndex, this.newGroupInfo);
      axios({
        method: "POST",
        url: this.serverUrl + "modifyGroup",
        data: qs.stringify(this.newGroupInfo),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(() => {
        this.$message.success("已更新")
        this.getData()
      })
    },
    delItem(index) {
      let id = (this.currentPage - 1) * this.pageSize + index
      this.$confirm('确认删除 id 为 ' + this.tableData[id].id + ' 的记录吗？')
          .then(() => {
            console.log("delete:" + this.tableData[id].id)
            let data = qs.stringify({
              id: this.tableData[id].id,
            })
            axios({
              method: "POST",
              url: this.serverUrl + "deleteGroup",
              data: data,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }).then((res) => {
              this.$message.success('已删除！')
              this.tableData.splice(index, 1)
              console.log(res)
            })
          })
          .catch(() => { })
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
  }
}
</script>