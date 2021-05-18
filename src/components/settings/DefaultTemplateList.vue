<template>
  <div>
    <el-button size="mini" @click="addTemplate">新增</el-button>
    <el-table :data="tableData.slice((currentPage-1)*pageSize,currentPage*pageSize)">
      <el-table-column prop="id" label="id" width="80">
      </el-table-column>
      <el-table-column prop="template" label="模板" width="200">
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" @click="editTemplate(scope.$index, scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="delTemplate(scope.$index)">删除</el-button>
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

    <!-- 新增 -->
    <el-dialog title="新增" :visible.sync="addDialogVisible">
      <el-form ref="form" :model="newTemplateInfo" label-width="80px">
        <el-form-item label="ID">
          <el-input v-model="newTemplateInfo.id" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="模板名称">
          <el-input v-model="newTemplateInfo.template" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveAddedTemplate">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑 -->
    <el-dialog title="编辑" :visible.sync="editDialogVisible">
      <el-form ref="form" :model="newTemplateInfo" label-width="80px">
        <el-form-item label="ID">
          <el-input v-model="newTemplateInfo.id" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="模板名称">
          <el-input v-model="newTemplateInfo.template" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveTemplate">确 定</el-button>
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
      addDialogVisible: false,
      templateInfo: {
        id : '',
        template: '',
      },
      newTemplateInfo: {
        id : '',
        template: '',
      },
      templateIndex: 0,
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
    getData() {
      axios({
        method: "GET",
        url: this.serverUrl + "getAllDefaultTemplate",
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
    addTemplate() {
      this.newTemplateInfo = {
        id: '',
        template: '',
      }
      this.addDialogVisible = true
    },
    saveAddedTemplate() {
      this.addDialogVisible = false;
      this.$set(this.tableData, this.templateIndex, this.newTemplateInfo);
      axios({
        method: "POST",
        url: this.serverUrl + "saveDefaultTemplate",
        data: qs.stringify(this.newTemplateInfo),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(() => {
        this.$message.success("新增成功")
        this.getData()
      })
    },
    editTemplate(index, item) {
      this.templateIndex = index
      console.log("index:" + index)
      this.newTemplateInfo = {
        id: item.id,
        template: item.template,
      }
      this.editDialogVisible = true
    },
    saveTemplate() {
      this.editDialogVisible = false;
      this.$set(this.tableData, this.templateIndex, this.newTemplateInfo);
      axios({
        method: "POST",
        url: this.serverUrl + "updateDefaultTemplate",
        data: qs.stringify(this.newTemplateInfo),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(() => {
        this.$message.success("已更新")
        this.getData()
      })
    },
    delTemplate(index) {
      let id = (this.currentPage - 1) * this.pageSize + index
      this.$confirm('确认删除 id 为 ' + this.tableData[id].id + ' 的记录吗？')
          .then(() => {
            console.log("delete:" + this.tableData[id].id)
            let data = qs.stringify({
              id: this.tableData[id].id,
            })
            axios({
              method: "POST",
              url: this.serverUrl + "deleteDefaultTemplateById",
              data: data,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }).then((res) => {
              axios({
                method: "GET",
                url: this.serverUrl + "getDefaultTemplateById?id=" + this.id,
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