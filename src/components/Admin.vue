<template>
  <div>
    <el-container style="height: 500px; border: 1px solid #eee">
      <el-aside width="10%" style="background-color: rgb(238, 241, 246)">
        <el-menu :default-openeds="['1', '3']">
          <el-submenu index="1">
            <template slot="title"><i class="el-icon-menu"></i>导航</template>
            <el-menu-item-group>
              <template slot="title">分组</template>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="3">
            <template slot="title"><i class="el-icon-setting"></i>设置</template>
            <el-menu-item-group>
              <template slot="title">关于</template>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header style="text-align: right; font-size: 12px">
          <span style="text-align: center; font-size: 30px; margin-right: 45%">管理后台</span>
          <el-button type="primary" icon="el-icon-download" @click="outTab" style="margin-right: 20px; text-align: center">导出</el-button>
          <el-dropdown>
            <i class="el-icon-setting" style="margin-right: 15px"></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="gotoLogin">退出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <span>Admin</span>
        </el-header>

        <el-main>
          <el-input v-model="search" placeholder="请输入内容" style="width: 200px"></el-input>
          <el-button type="primary" icon="el-icon-search" style="margin-left: 20px; margin-right: 60%" @click="searchData">搜索</el-button>
          <el-table :data="tableData.slice((currentPage-1)*pageSize,currentPage*pageSize)" id="out-table">
            <el-table-column prop="id" label="id" width="150">
            </el-table-column>
            <el-table-column prop="name" label="姓名" width="80">
            </el-table-column>
            <el-table-column prop="identityCard" label="身份证号" width="180">
            </el-table-column>
            <el-table-column prop="nickname" label="昵称" width="80">
            </el-table-column>
            <el-table-column prop="gender" label="性别" width="60">
            </el-table-column>
            <el-table-column prop="telephone" label="手机" width="120">
            </el-table-column>
            <el-table-column prop="info" label="立志信息">
            </el-table-column>
            <el-table-column prop="createDate" label="创建时间" width="200">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" @click="editUser(scope.$index, scope.row)">编辑</el-button>
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
        </el-main>
        <!-- 编辑 -->
        <el-dialog title="编辑" :visible.sync="editDialogVisible">
          <el-form ref="form" :model="newUserInfo" label-width="80px">
            <el-form-item label="ID">
              <el-input v-model="newUserInfo.id" autocomplete="off" disabled></el-input>
            </el-form-item>
            <el-form-item label="姓名">
              <el-input v-model="newUserInfo.name" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="身份证号">
              <el-input v-model="newUserInfo.identityCard" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="newUserInfo.nickname" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="性别">
              <el-input v-model="newUserInfo.gender" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="newUserInfo.telephone" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="立志信息">
              <el-input v-model="newUserInfo.info" autocomplete="off" :rows="4"></el-input>
            </el-form-item>
            <el-form-item label="创建时间">
              <el-input v-model="newUserInfo.createDate" autocomplete="off"></el-input>
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
      </el-container>
    </el-container>
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
import XLSX from 'xlsx'
import FileSaver from 'file-saver'
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
      userInfo: {
        id : '',
        name  : '',
        identityCard: '',
        nickname: '',
        gender: '',
        telephone: '',
        info: '',
        createDate: '',
      },
      newUserInfo: {
        id : '',
        name  : '',
        identityCard: '',
        nickname: '',
        gender: '',
        telephone: '',
        info: '',
        createDate: '',
      },
      userIndex: 0,
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
        url: "http://htzchina.org:8080/getAll",
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
    gotoLogin() {
      this.$store.commit('$_setStorage', "")
      this.$router.push("/admin")
    },
    searchData() {
      this.$message.warning("暂不支持！")
    },
    outTab () {
      let xlsxParam = {raw: true}
      /* generate workbook object from table */
      let wb = XLSX.utils.table_to_book(document.querySelector('#out-table'), xlsxParam)
      /* get binary string as output */
      let wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' })
      let time = new Date(Date.now())
      let month = (time.getMonth() + 1) < 10 ? '0' + (time.getMonth() + 1) : (time.getMonth() + 1)
      let day = time.getDate() < 10 ? '0' + time.getDate() : time.getDate()
      let hours = time.getHours() < 10 ? '0' + time.getHours() : time.getHours()
      let minutes = time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()
      let fileStr = time.getFullYear() + '' + month + '' + day + '' + hours + '' + minutes
      try {
        FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'TenYears_Info_' + fileStr + '.xlsx')
      } catch (e) { if (typeof console !== 'undefined') console.log(e, wbout) }
      return wbout
    },
    editUser(index, item) {
      this.userIndex = index
      console.log("index:" + index)
      this.newUserInfo = {
        id: item.id,
        name: item.name,
        identityCard: item.identityCard,
        nickname: item.nickname,
        gender: item.gender,
        telephone: item.telephone,
        info: item.info,
        createDate: item.createDate,
      }
      this.editDialogVisible = true
    },
    saveUser() {
      this.editDialogVisible = false;
      this.$set(this.tableData, this.userIndex, this.newUserInfo);
      axios({
        method: "POST",
        url: "http://htzchina.org:8080/update",
        data: qs.stringify(this.newUserInfo),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(() => {
        this.$message.success("已更新")
      })
    },
    delUser(index) {
      this.$confirm('确认删除？')
          .then(() => {
            console.log("delete:" + this.tableData[index].unionid)
            let data = qs.stringify({
              id: this.tableData[index].unionid,
            })
            axios({
              method: "POST",
              url: "http://htzchina.org:8080/delete",
              data: data,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }).then((res) => {
              axios({
                method: "GET",
                url: "http://htzchina.org:8080/getById?id=" + this.unionid,
                data: null,
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                }
              }).then((res) => {
                console.log(res)
                console.log(res.data)
                if (res != null && res.data != null) {
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