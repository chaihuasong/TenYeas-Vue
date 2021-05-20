<template>
  <div>
    <el-container style="height: 100%; border: 1px solid #eee">
      <el-aside width="auto"
                style="background-color: rgb(238, 241, 246);">
        <el-menu :collapse="isCollapse" :default-active="$route.path" router>
          <el-submenu index="1">
            <template slot="title"><i class="el-icon-menu"></i>导航</template>
            <el-menu-item-group>
              <el-menu-item index="/home/adminHome">首页</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group>
              <el-menu-item index="/home/infoList">立志列表</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group>
              <el-menu-item index="/home/reportList">打卡列表</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group>
              <el-menu-item index="/home/halfYearInfoList">半年践行列表</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group>
              <el-menu-item index="/home/monthInfoList">月度计划列表</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="2">
            <template slot="title"><i class="el-icon-setting"></i>设置</template>
            <el-menu-item-group>
              <el-menu-item index="/home/templateTab">编辑模板</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group>
              <el-menu-item index="/home/tenYearsHtmlTab">页面修改</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header style="text-align: left; font-size: 12px;float: left">
          <img @click="collapseStatus" style="width: 20px;height: 20px" src="../../assets/img/icon/pin.png"/>
          <span style="text-align: center; font-size: 30px; margin-left: 45%">管理后台</span>
          <div style="float: right">
            <span style="font-size: 16px; color: #3535c6">Admin</span>
            <el-dropdown>
              <i class="el-icon-setting" style="margin-right: 15px; font-size: 20px"></i>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="gotoLogin">退出</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
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
      isCollapse: false,
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
