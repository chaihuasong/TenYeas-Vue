<template>
  <div>
    <el-table :data="tableData.slice((currentPage-1)*pageSize,currentPage*pageSize)">
      <el-table-column prop="id" label="id" width="80">
      </el-table-column>
      <el-table-column prop="userId" label="用户ID" width="100">
      </el-table-column>
      <el-table-column prop="date" label="日期" width="100">
      </el-table-column>
      <el-table-column prop="note" label="总结" width="100">
      </el-table-column>
      <el-table-column prop="templateId" label="模板" width="100">
      </el-table-column>
      <el-table-column prop="state" label="状态" width="80" :formatter="stateFormatter">
      </el-table-column>
      <el-table-column prop="value1" label="项目1" width="100">
      </el-table-column>
      <el-table-column prop="value2" label="项目2" width="100">
      </el-table-column>
      <el-table-column prop="value3" label="项目3" width="100">
      </el-table-column>
      <el-table-column prop="value4" label="项目4" width="100">
      </el-table-column>
      <el-table-column prop="value5" label="项目5" width="100">
      </el-table-column>
      <el-table-column prop="value6" label="项目6" width="100">
      </el-table-column>
      <el-table-column prop="value7" label="项目7" width="100">
      </el-table-column>
      <el-table-column prop="value8" label="项目8" width="100">
      </el-table-column>
      <el-table-column prop="value9" label="项目9" width="100">
      </el-table-column>
      <el-table-column prop="value10" label="项目10" width="100">
      </el-table-column>
      <el-table-column prop="value11" label="项目11" width="100">
      </el-table-column>
      <el-table-column prop="value12" label="项目12" width="100">
      </el-table-column>
      <el-table-column prop="value13" label="项目13" width="100">
      </el-table-column>
      <el-table-column prop="value14" label="项目14" width="100">
      </el-table-column>
      <el-table-column prop="value15" label="项目15" width="100">
      </el-table-column>
      <el-table-column prop="value16" label="项目16" width="100">
      </el-table-column>
      <el-table-column prop="value17" label="项目17" width="100">
      </el-table-column>
      <el-table-column prop="value18" label="项目18" width="100">
      </el-table-column>
      <el-table-column prop="value19" label="项目19" width="100">
      </el-table-column>
      <el-table-column prop="value20" label="项目20" width="100">
      </el-table-column>
      <el-table-column prop="share" label="每日分享" width="120">
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" @click="editUser(scope.$index, scope.row)">编辑</el-button>
          <br/>
          <br/>
          <el-button size="mini" type="danger" @click="delUser(scope.$index)">删除</el-button>
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
      <el-form ref="form" :model="newValueInfo" label-width="80px">
        <el-form-item label="ID">
          <el-input v-model="newValueInfo.id" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input v-model="newValueInfo.userId" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="日期">
          <el-input v-model="newValueInfo.date" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="总结">
          <el-input v-model="newValueInfo.note" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="模板">
          <el-input v-model="newValueInfo.templateId" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-input v-model="newValueInfo.state" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="1.">
          <el-input v-model="newValueInfo.value1" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="2.">
          <el-input v-model="newValueInfo.value2" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="3.">
          <el-input v-model="newValueInfo.value3" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="4.">
          <el-input v-model="newValueInfo.value4" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="5.">
          <el-input v-model="newValueInfo.value5" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="6.">
          <el-input v-model="newValueInfo.value6" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="7.">
          <el-input v-model="newValueInfo.value7" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="8.">
          <el-input v-model="newValueInfo.value8" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="9.">
          <el-input v-model="newValueInfo.value9" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="10.">
          <el-input v-model="newValueInfo.value10" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="11.">
          <el-input v-model="newValueInfo.value11" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="12.">
          <el-input v-model="newValueInfo.value12" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="13.">
          <el-input v-model="newValueInfo.value13" autocomplete="off" :rows="4"></el-input>
        </el-form-item>
        <el-form-item label="14.">
          <el-input v-model="newValueInfo.value14" autocomplete="off" :rows="4"></el-input>
        </el-form-item>
        <el-form-item label="15.">
          <el-input v-model="newValueInfo.value15" autocomplete="off" :rows="4"></el-input>
        </el-form-item>
        <el-form-item label="16.">
          <el-input v-model="newValueInfo.value16" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="17.">
          <el-input v-model="newValueInfo.value17" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="18.">
          <el-input v-model="newValueInfo.value18" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="19.">
          <el-input v-model="newValueInfo.value19" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="20.">
          <el-input v-model="newValueInfo.value20" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveUser">确 定</el-button>
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
import global from './Common.vue'

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
      valueInfo: {
        id : '',
        userId: '',
        date: '',
        note: '',
        templateId: '',
        state: '',
        value1: '',
        value2: '',
        value3: '',
        value4: '',
        value5: '',
        value6: '',
        value7: '',
        value8: '',
        value9: '',
        value10: '',
        value11: '',
        value12: '',
        value13: '',
        value14: '',
        value15: '',
        value16: '',
        value17: '',
        value18: '',
        value19: '',
        value20: ''
      },
      newValueInfo: {
        id : '',
        userId: '',
        date: '',
        note: '',
        templateId: '',
        state: '',
        value1: '',
        value2: '',
        value3: '',
        value4: '',
        value5: '',
        value6: '',
        value7: '',
        value8: '',
        value9: '',
        value10: '',
        value11: '',
        value12: '',
        value13: '',
        value14: '',
        value15: '',
        value16: '',
        value17: '',
        value18: '',
        value19: '',
        value20: ''
      },
      valueIndex: 0,
    }
  },

  mounted: function () {
    console.log("login?" + this.checkLogin())
    if (this.checkLogin()) {
      this.getData()
    } else {
      this.$router.push("/admin");
    }
    document.title = this.$route.meta.title
  },
  methods: {
    stateFormatter(row) {
      if (row.state === '1') {
        return "+";
      }
      return "-";
    },
    getData() {
      axios({
        method: "GET",
        url: this.serverUrl + "getAllReportInfo",
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
    editUser(index, item) {
      this.valueIndex = index
      console.log("index:" + index)
      this.newValueInfo = {
        id: item.id,
        userId: item.userId,
        date: item.date,
        note: item.note,
        templateId: item.templateId,
        state: item.state,
        value1: item.value1,
        value2: item.value2,
        value3: item.value3,
        value4: item.value4,
        value5: item.value5,
        value6: item.value6,
        value7: item.value7,
        value8: item.value8,
        value9: item.value9,
        value10: item.value10,
        value11: item.value11,
        value12: item.value12,
        value13: item.value13,
        value14: item.value14,
        value15: item.value15,
        value16: item.value16,
        value17: item.value17,
        value18: item.value18,
        value19: item.value19,
        value20: item.value20,
      }
      this.editDialogVisible = true
    },
    saveUser() {
      this.editDialogVisible = false;
      this.$set(this.tableData, this.valueIndex, this.newValueInfo);
      axios({
        method: "POST",
        url: this.serverUrl + "updateReportInfo",
        data: qs.stringify(this.newValueInfo),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(() => {
        this.$message.success("已更新")
        this.getData()
      })
    },
    delUser(index) {
      let id = (this.currentPage - 1) * this.pageSize + index
      this.$confirm('确认删除 id 为 ' + this.tableData[id].id + ' 的记录吗？')
          .then(() => {
            console.log("delete:" + this.tableData[id].id)
            let data = qs.stringify({
              id: this.tableData[id].id,
            })
            axios({
              method: "POST",
              url: this.serverUrl + "deleteReportInfoById",
              data: data,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }).then((res) => {
              axios({
                method: "GET",
                url: this.serverUrl + "getReportInfoById?id=" + this.id,
                data: null,
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                }
              }).then((res) => {
                console.log(res)
                console.log(res.data)
                if (res.data != null && res.data !== '') {
                  this.$message.warning('删除失败！')
                } else {
                  this.$message.success('已删除！')
                  this.tableData.splice(index, 1)
                }
              })
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