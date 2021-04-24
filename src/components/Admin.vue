<template>
  <div>
    <el-container style="height: 100%; border: 1px solid #eee">
      <el-aside width="10%" style="background-color: rgb(238, 241, 246)">
        <el-menu :default-openeds="['1', '2']" :default-active="$route.path" router>
          <el-submenu index="1">
            <template slot="title"><i class="el-icon-menu"></i>导航</template>
            <el-menu-item-group>
              <el-menu-item index="/home/infoList">列表</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="2">
            <template slot="title"><i class="el-icon-setting"></i>设置</template>
            <el-menu-item-group>
              <el-menu-item index="/home/modifyHeader">修改Header</el-menu-item>
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
              <el-dropdown-item @click.native="gotoLogin">退出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <span>Admin</span>
        </el-header>

        <el-main>
          <router-view></router-view>
        </el-main>

      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  methods: {
    gotoLogin() {
      this.$store.commit('$_setStorage', "")
      this.$router.push("/admin")
    },
  }
}
</script>
