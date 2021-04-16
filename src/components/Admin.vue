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
          <el-dropdown>
            <i class="el-icon-setting" style="margin-right: 15px"></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>关于</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <span>Admin</span>
        </el-header>

        <el-main>
          <el-table :data="tableData">
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
            <el-table-column prop="createDate" label="创建时间">
            </el-table-column>
          </el-table>
        </el-main>
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
import axios from "axios";

export default {
  data() {
    return {
      tableData: []
    }
  },

  mounted: function () {
    this.getData()
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
    }
  }
};
</script>