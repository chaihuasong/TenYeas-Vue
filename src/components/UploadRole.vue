<template>
  <div>
    <el-container style="height: 100%; border: 1px solid #eee">
      <el-container>
        <el-header style="text-align: right; font-size: 12px">
          <span style="text-align: center; font-size: 30px; margin-right: 45%">上传后台</span>
          <el-dropdown>
            <i class="el-icon-setting" style="margin-right: 15px"></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="gotoLogin">退出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <span>Role</span>
        </el-header>

        <el-main>
          <el-input v-model="search" placeholder="请输入姓名" style="width: 200px"></el-input>
          <el-button type="primary" icon="el-icon-search" style="margin-left: 20px; margin-right: 60%" @click="searchData">搜索</el-button>
          <el-table :data="tableData">
            <el-table-column prop="number" label="NO." width="80">
            </el-table-column>
            <el-table-column prop="name" label="姓名" width="100">
            </el-table-column>
            <el-table-column prop="gender" label="性别" width="60" :formatter="genderFormatter">
            </el-table-column>
            <el-table-column prop="info" label="立志信息">
            </el-table-column>
            <el-table-column prop="path" label="文件名" width="120">
            </el-table-column>
            <el-table-column label="操作">

              <el-upload
                  action="http://htzchina.org:8080/uploadFile/"
                  accept="image/jpeg,image/gif,image/png"
                  :on-remove="handleRemove"
                  :before-remove="beforeRemove"
                  :on-success="success"
                  :limit="1"
                  list-type="picture">
                <el-button size="small" type="primary">点击上传图片</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过5M</div>
              </el-upload>
            </el-table-column>
          </el-table>
        </el-main>

      </el-container>
    </el-container>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      search: '',
      tableData: [],
    }
  },
  mounted: function () {
    console.log("login?" + this.checkLogin())
    if (!this.checkLogin()) {
      this.$router.push("/role");
    }
    document.title = this.$route.meta.title
  },
  methods: {
    handleRemove() {
      this.$message.success("已移除")
    },
    beforeRemove(file) {
      return this.$confirm(`确定移除 ${ file.name }？`);
    },
    gotoLogin() {
      this.$store.commit('$_setStorage', "")
      this.$router.push("/role")
    },
    success() {
      this.searchData()
      this.$message.success("上传成功")
    },
    genderFormatter(row) {
      if (row.gender == 1) {
        return "男";
      } else {
        return "女";
      }
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
        this.$message.warning("请输入要查询的姓名！")
        return
      }
      axios({
        method: "GET",
        url: "http://htzchina.org:8080/getByName?name=" + this.search,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        console.log(res.data)
        this.tableData = res.data
      })
    },
  }
}
</script>
