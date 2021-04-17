<template>
  <div>
    <el-container style="height: 500px; border: 1px solid #eee">
      <el-aside width="100px" style="background-color: rgb(238, 241, 246)">
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
              <template slot="title">退出</template>
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
              <el-dropdown-item>关于</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <span>Admin</span>
        </el-header>

        <el-main>
          <el-table :data="tableData" id="out-table">
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
        </el-main>
        <!-- 编辑 -->
        <el-dialog title="编辑" :visible.sync="editDialogVisible">
          <el-form ref="form" :model="userInfo" label-width="80px">
            <el-form-item label="姓名">
              <el-input v-model="userInfo.name" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="身份证号">
              <el-input v-model="userInfo.identityCard" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="userInfo.nickname" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="性别">
              <el-input v-model="userInfo.gender" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="userInfo.telephone" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="立志信息">
              <el-input v-model="userInfo.info" autocomplete="off" :rows="4"></el-input>
            </el-form-item>
            <el-form-item label="创建时间">
              <el-input v-model="userInfo.createDate" autocomplete="off" disabled></el-input>
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

export default {
  data() {
    return {
      tableData: [],
      delDialogVisible: false,
      editDialogVisible: false,
      userInfo: {
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
  },
  methods: {
    getData() {
      axios({
        method: "GET",
        url: "http://htzchina.org:8080/get",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.tableData = res.data
      });
    },
    checkLogin() {
      let login = this.$store.getters.getSortage
      console.log(login)
      return login === 'login' || login.replaceAll("\"", "") === 'login'
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
      this.userInfo = {
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
    delUser(index) {
      this.$confirm('确认删除？')
          .then(() => {
            this.UserList.splice(index, 1)
          })
          .catch(() => { });
    }

  }
};
</script>