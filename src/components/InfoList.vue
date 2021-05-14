<template>
  <div>
    <el-input v-model="search" placeholder="请输入姓名" style="width: 200px;float: left"></el-input>
    <el-button type="primary" icon="el-icon-search" style="margin-left: 20px; float: left" @click="searchData">搜索</el-button>
    <el-button type="primary" icon="el-icon-download" @click="outTab" style="float: right;margin-right: 20px; text-align: center">导出</el-button>
    <el-table :data="tableData" id="out-table" style="height: 0px;width: 0px">
      <el-table-column prop="id" label="id" width="80">
      </el-table-column>
      <el-table-column prop="number" label="NO." width="60">
      </el-table-column>
      <el-table-column prop="name" label="姓名" width="70">
      </el-table-column>
      <el-table-column prop="wechatid" label="微信号" width="110">
      </el-table-column>
      <el-table-column prop="nickname" label="昵称" width="80">
      </el-table-column>
      <el-table-column prop="wechatgroup" label="微信群" width="80">
      </el-table-column>
      <el-table-column prop="birthday" label="生日" width="60" :formatter="birthdayFormatter">
      </el-table-column>
      <el-table-column prop="gender" label="性别" width="40" :formatter="genderFormatter">
      </el-table-column>
      <el-table-column prop="province" label="城市" width="60">
      </el-table-column>
      <el-table-column prop="telephone" label="手机" width="70">
      </el-table-column>
      <el-table-column prop="chujie" label="初阶" width="60" :formatter="chujieFormatter">
      </el-table-column>
      <el-table-column prop="daixie" label="代写" width="60" :formatter="daixieFormatter">
      </el-table-column>
      <el-table-column prop="open" label="公开" width="60" :formatter="gongkaiFormatter">
      </el-table-column>
      <el-table-column prop="info" label="立志信息">
      </el-table-column>
      <el-table-column prop="stepInfo" label="实施步骤">
      </el-table-column>
      <el-table-column prop="path" label="文件名" width="80">
      </el-table-column>
      <el-table-column prop="createDate" label="创建时间" width="200">
      </el-table-column>
    </el-table>
    <el-table :data="tableData.slice((currentPage-1)*pageSize,currentPage*pageSize)">
      <el-table-column prop="id" label="id" width="80">
      </el-table-column>
      <el-table-column prop="number" label="NO." width="60">
      </el-table-column>
      <el-table-column prop="name" label="姓名" width="70">
      </el-table-column>
      <el-table-column prop="wechatid" label="微信号" width="110">
      </el-table-column>
      <el-table-column prop="nickname" label="昵称" width="80">
      </el-table-column>
      <el-table-column label="头像" width="80">
        <template slot-scope="scope">
          <el-image
              style="width: 60px; height: 60px"
              :src="tableData[(currentPage - 1) * pageSize + scope.$index].headimgurl"
              :preview-src-list="[tableData[(currentPage - 1) * pageSize + scope.$index].headimgurl != null ? tableData[(currentPage - 1) * pageSize + scope.$index].headimgurl.substring(0, tableData[(currentPage - 1) * pageSize + scope.$index].headimgurl.lastIndexOf('/')) + '/0' : null]"
              :fit="none" />
        </template>
      </el-table-column>
      <el-table-column prop="wechatgroup" label="微信群" width="80">
      </el-table-column>
      <el-table-column prop="birthday" label="生日" width="60" :formatter="birthdayFormatter">
      </el-table-column>
      <el-table-column prop="gender" label="性别" width="40" :formatter="genderFormatter">
      </el-table-column>
      <el-table-column prop="province" label="城市" width="60">
      </el-table-column>
      <el-table-column prop="telephone" label="手机" width="70">
      </el-table-column>
      <el-table-column prop="chujie" label="初阶" width="40" :formatter="chujieFormatter">
      </el-table-column>
      <el-table-column prop="daixie" label="代写" width="40" :formatter="daixieFormatter">
      </el-table-column>
      <el-table-column prop="open" label="公开" width="40" :formatter="gongkaiFormatter">
      </el-table-column>
      <el-table-column prop="info" label="立志信息">
      </el-table-column>
      <el-table-column prop="stepInfo" label="实施步骤">
      </el-table-column>
      <el-table-column prop="path" label="文件名" width="80">
      </el-table-column>
      <el-table-column prop="planInfoFlag" label="是否展开" width="80">
      </el-table-column>
      <el-table-column prop="createDate" label="创建时间" width="100">
      </el-table-column>
      <el-table-column label="图片" width="120">
        <template slot-scope="scope">
          <el-image
              style="width: 60px; height: 120px"
              :src="'http://htzchina.org/imgs/tenyears/' + scope.row.path"
              :preview-src-list="['http://htzchina.org/imgs/tenyears/' + scope.row.path]"
              :fit="none" />
        </template>
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
      <el-form ref="form" :model="newUserInfo" label-width="80px">
        <el-form-item label="ID">
          <el-input v-model="newUserInfo.id" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="NO.">
          <el-input v-model="newUserInfo.number" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="newUserInfo.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="微信号">
          <el-input v-model="newUserInfo.wechatid" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="newUserInfo.nickname" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="微信群">
          <el-input v-model="newUserInfo.wechatgroup" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="生日">
          <el-input v-model="newUserInfo.birthday" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-input v-model="newUserInfo.gender" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="newUserInfo.telephone" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="newUserInfo.province" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="初阶">
          <el-input v-model="newUserInfo.chujie" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="代写">
          <el-input v-model="newUserInfo.daixie" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="公开">
          <el-input v-model="newUserInfo.open" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="立志信息">
          <el-input v-model="newUserInfo.info" autocomplete="off" :rows="4"></el-input>
        </el-form-item>
        <el-form-item label="实施步骤">
          <el-input v-model="newUserInfo.stepInfo" autocomplete="off" :rows="4"></el-input>
        </el-form-item>
        <el-form-item label="文件名称">
          <el-input v-model="newUserInfo.path" autocomplete="off" :rows="4"></el-input>
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
        number: '',
        name  : '',
        wechatid: '',
        nickname: '',
        gender: '',
        telephone: '',
        province: '',
        wechatgroup: '',
        birthday: '',
        chujie: '',
        daixie: '',
        open: '',
        info: '',
        stepInfo: '',
        path: '',
        createDate: '',
      },
      newUserInfo: {
        id : '',
        number: '',
        name  : '',
        wechatid: '',
        nickname: '',
        gender: '',
        telephone: '',
        province: '',
        wechatgroup: '',
        birthday: '',
        chujie: '',
        daixie: '',
        open: '',
        info: '',
        stepInfo: '',
        path: '',
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
    birthdayFormatter(row) {
      let date = new Date(Date.parse(row.birthday) + 8 * 3600 * 1000)
      let year = date.getFullYear()
      let month = date.getMonth() + 1
      if (month < 10) month = "0" + month
      let dates = date.getDate()
      if (dates < 10) dates = "0" + dates
      return year + "-" + month + "-" + dates
    },
    genderFormatter(row) {
      if (row.gender == 1) {
        return "男";
      } else {
        return "女";
      }
    },
    chujieFormatter(row) {
      if (row.chujie == 1) {
        return "是";
      } else {
        return "否";
      }
    },
    daixieFormatter(row) {
      if (row.daixie == 1) {
        return "是";
      } else {
        return "否";
      }
    },
    gongkaiFormatter(row) {
      if (row.open == 1) {
        return "是";
      } else {
        return "否";
      }
    },
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
    searchData() {
      if (this.search ==='') {
        this.getData()
        return
      }
      axios({
        method: "GET",
        url: "http://htzchina.org:8080/getByNameLike?name=" + this.search,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        console.log(res.data)
        if (res.data !== null && res.data !== '') {
          this.tableData = res.data
        } else {
          axios({
            method: "GET",
            url: "http://htzchina.org:8080/getByNicknameLike?name=" + this.search,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }).then((res) => {
            console.log(res.data)
            if (res.data !== null && res.data !== '') {
              this.tableData = res.data
            }
          })
        }
      })
    },
    outTab () {
      let xlsxParam = {raw: true}
      /* generate workbook object from table */
      let wb = XLSX.utils.table_to_book(document.querySelector("#out-table"), xlsxParam)
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
        number: item.number,
        name: item.name,
        wechatid: item.wechatid,
        nickname: item.nickname,
        gender: item.gender,
        telephone: item.telephone,
        province: item.province,
        wechatgroup: item.wechatgroup,
        birthday: item.birthday,
        chujie: item.chujie,
        daixie: item.daixie,
        open: item.open,
        info: item.info,
        stepInfo: item.stepInfo,
        path: item.path,
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
      let id = (this.currentPage - 1) * this.pageSize + index
      this.$confirm('确认删除' + this.tableData[id].number + ':' + this.tableData[id].name + '？')
          .then(() => {
            console.log("delete:" + this.tableData[id].unionid)
            let data = qs.stringify({
              id: this.tableData[id].unionid,
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
                if (res.data != null && res.data !== '') {
                  this.$message.warning('删除失败！')
                } else {
                  this.$message.success('已删除！')
                  this.tableData.splice(id, 1)
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