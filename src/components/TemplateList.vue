<template>
  <div>
    <el-table :data="tableData.slice((currentPage-1)*pageSize,currentPage*pageSize)">
      <el-table-column prop="id" label="id" width="80">
      </el-table-column>
      <el-table-column prop="template1" label="项目1" width="100">
      </el-table-column>
      <el-table-column prop="template2" label="项目2" width="100">
      </el-table-column>
      <el-table-column prop="template3" label="项目3" width="100">
      </el-table-column>
      <el-table-column prop="template4" label="项目4" width="100">
      </el-table-column>
      <el-table-column prop="template5" label="项目5" width="100">
      </el-table-column>
      <el-table-column prop="template6" label="项目6" width="100">
      </el-table-column>
      <el-table-column prop="template7" label="项目7" width="100">
      </el-table-column>
      <el-table-column prop="template8" label="项目8" width="100">
      </el-table-column>
      <el-table-column prop="template9" label="项目9" width="100">
      </el-table-column>
      <el-table-column prop="template10" label="项目10" width="100">
      </el-table-column>
      <el-table-column prop="template11" label="项目11" width="100">
      </el-table-column>
      <el-table-column prop="template12" label="项目12" width="100">
      </el-table-column>
      <el-table-column prop="template13" label="项目13" width="100">
      </el-table-column>
      <el-table-column prop="template14" label="项目14" width="100">
      </el-table-column>
      <el-table-column prop="template15" label="项目15" width="100">
      </el-table-column>
      <el-table-column prop="template16" label="项目16" width="100">
      </el-table-column>
      <el-table-column prop="template17" label="项目17" width="100">
      </el-table-column>
      <el-table-column prop="template18" label="项目18" width="100">
      </el-table-column>
      <el-table-column prop="template19" label="项目19" width="100">
      </el-table-column>
      <el-table-column prop="template20" label="项目20" width="100">
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
      <el-form ref="form" :model="newTemplateInfo" label-width="80px">
        <el-form-item label="ID">
          <el-input v-model="newTemplateInfo.id" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="1.">
          <el-input v-model="newTemplateInfo.template1" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="2.">
          <el-input v-model="newTemplateInfo.template2" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="3.">
          <el-input v-model="newTemplateInfo.template3" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="4.">
          <el-input v-model="newTemplateInfo.template4" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="5.">
          <el-input v-model="newTemplateInfo.template5" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="6.">
          <el-input v-model="newTemplateInfo.template6" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="7.">
          <el-input v-model="newTemplateInfo.template7" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="8.">
          <el-input v-model="newTemplateInfo.template8" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="9.">
          <el-input v-model="newTemplateInfo.template9" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="10.">
          <el-input v-model="newTemplateInfo.template10" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="11.">
          <el-input v-model="newTemplateInfo.template11" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="12.">
          <el-input v-model="newTemplateInfo.template12" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="13.">
          <el-input v-model="newTemplateInfo.template13" autocomplete="off" :rows="4"></el-input>
        </el-form-item>
        <el-form-item label="14.">
          <el-input v-model="newTemplateInfo.template14" autocomplete="off" :rows="4"></el-input>
        </el-form-item>
        <el-form-item label="15.">
          <el-input v-model="newTemplateInfo.template15" autocomplete="off" :rows="4"></el-input>
        </el-form-item>
        <el-form-item label="16.">
          <el-input v-model="newTemplateInfo.template16" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="17.">
          <el-input v-model="newTemplateInfo.template17" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="18.">
          <el-input v-model="newTemplateInfo.template18" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="19.">
          <el-input v-model="newTemplateInfo.template19" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="20.">
          <el-input v-model="newTemplateInfo.template20" autocomplete="off"></el-input>
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
import qs from "qs";

export default {
  data() {
    return {
      tableData: [],
      currentPage: 1,
      pageSize: 10,
      search: '',
      delDialogVisible: false,
      editDialogVisible: false,
      templateInfo: {
        id : '',
        template1: '',
        template2: '',
        template3: '',
        template4: '',
        template5: '',
        template6: '',
        template7: '',
        template8: '',
        template9: '',
        template10: '',
        template11: '',
        template12: '',
        template13: '',
        template14: '',
        template15: '',
        template16: '',
        template17: '',
        template18: '',
        template19: '',
        template20: ''
      },
      newTemplateInfo: {
        id : '',
        template1: '',
        template2: '',
        template3: '',
        template4: '',
        template5: '',
        template6: '',
        template7: '',
        template8: '',
        template9: '',
        template10: '',
        template11: '',
        template12: '',
        template13: '',
        template14: '',
        template15: '',
        template16: '',
        template17: '',
        template18: '',
        template19: '',
        template20: ''
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
        url: "http://localhost:8080/getAllReportTemplate",
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
      this.templateIndex = index
      console.log("index:" + index)
      this.newTemplateInfo = {
        id: item.id,
        template1: item.template1,
        template2: item.template2,
        template3: item.template3,
        template4: item.template4,
        template5: item.template5,
        template6: item.template6,
        template7: item.template7,
        template8: item.template8,
        template9: item.template9,
        template10: item.template10,
        template11: item.template11,
        template12: item.template12,
        template13: item.template13,
        template14: item.template14,
        template15: item.template15,
        template16: item.template16,
        template17: item.template17,
        template18: item.template18,
        template19: item.template19,
        template20: item.template20,
      }
      this.editDialogVisible = true
    },
    saveUser() {
      this.editDialogVisible = false;
      this.$set(this.tableData, this.templateIndex, this.newTemplateInfo);
      axios({
        method: "POST",
        url: "http://localhost:8080/updateReportTemplate",
        data: qs.stringify(this.newTemplateInfo),
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
              url: "http://localhost:8080/deleteReportTemplateById",
              data: data,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }).then((res) => {
              axios({
                method: "GET",
                url: "http://localhost:8080/getReportTemplateById?id=" + this.id,
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