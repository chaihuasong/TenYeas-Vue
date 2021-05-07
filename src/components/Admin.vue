<template>
  <div>
    <el-container style="height: 100%; border: 1px solid #eee">
      <el-aside width="auto"
                @mouseenter.native="collapseOpen"
                @mouseleave.native="collapseClose"
                style="background-color: rgb(238, 241, 246);">
        <el-menu :collapse="isCollapse" :default-active="$route.path" router>
          <el-submenu index="1">
            <template slot="title"><i class="el-icon-menu"></i>导航</template>
            <el-menu-item-group>
              <el-menu-item index="/home/infoList">立志列表</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group>
              <el-menu-item index="/home/templateList">打卡模板</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="2">
            <template slot="title"><i class="el-icon-setting"></i>设置</template>
            <el-menu-item-group>
              <el-menu-item index="/home/modifyHeader">修改Header</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group>
              <el-menu-item index="/home/modifyFooter">修改Footer</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header style="text-align: left; font-size: 12px">
          <i @click="collapseStatus" class="el-icon-menu"></i>
          <span style="text-align: center; font-size: 30px; margin-left: 45%">管理后台</span>
          <div style="float: right">
            <el-dropdown>
              <i class="el-icon-setting" style="margin-right: 15px; font-size: 20px"></i>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="gotoLogin">退出</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <span style="font-size: 16px; color: #3535c6">Admin</span>
          </div>
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
  data() {
    return {
      collapseBtnClick: false,
      isCollapse: true,
    }
  },
  methods: {
    collapseStatus() {
      this.collapseBtnClick = this.isCollapse;
      this.isCollapse = !this.isCollapse;
    },
    collapseOpen() {
      if (this.collapseBtnClick) return;
      this.isCollapse = false;
    },
    collapseClose() {
      if (this.collapseBtnClick) return;
      this.isCollapse = true;
    },
    gotoLogin() {
      this.$store.commit('$_setStorage', "")
      this.$router.push("/admin")
    },
  }
}
</script>
