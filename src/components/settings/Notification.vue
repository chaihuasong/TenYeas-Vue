<template>
  <div>
    <el-card>
      <el-transfer
          filterable
          filter-placeholder="请输入姓名"
          v-model="value"
          :titles="['名称列表', '通知列表']"
          :data="data">
      </el-transfer>
      <el-form ref="form" :model="notificationInfo" label-width="120px" style="margin-top: 50px">
        <el-form-item label="first">
          <el-input v-model="notificationInfo.first" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="firstColor">
          <el-input v-model="notificationInfo.firstColor" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="keyword1">
          <el-input v-model="notificationInfo.keyword1" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="keyword1Color">
          <el-input v-model="notificationInfo.keyword1Color" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="keyword2">
          <el-input v-model="notificationInfo.keyword2" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="keyword2Color">
          <el-input v-model="notificationInfo.keyword2Color" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="remark">
          <el-input v-model="notificationInfo.remark" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="remarkColor">
          <el-input v-model="notificationInfo.remarkColor" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="url">
          <el-input v-model="notificationInfo.url" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <el-button type="primary" icon="el-icon-search" style="margin-right: 20%;margin-top: 20px;margin-bottom: 20%; float: right" @click="onNotify">通知</el-button>
    </el-card>
  </div>
</template>

<script>

import axios from "axios";
import global from "@/components/Common";

export default {
  data() {
    return {
      serverUrl: global.httpUrl,
      data: [],
      value: [],
      users: [],
      notificationInfo: {
        first: '每日养气功课，一起来完成今日打卡！',
        firstColor: '#743A3A',
        keyword1: '养气功课',
        keyword1Color: '#FF0000',
        keyword2: '00:00-24:00',
        keyword2Color: '#C4C400',
        remark: '自律从打卡开始~',
        remarkColor: '',
        url: 'http://htzchina.org/tenyears/#/tenyearsHome',
      },
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
    onNotify() {
      let notifyList = []
      this.value.forEach(index => {
        let item = this.data[index]
        notifyList.push(item)
      })

      let requestData = {
        notifyList: notifyList,
        notificationInfo: this.notificationInfo,
      }
      axios({
        method: "POST",
        url: this.serverUrl + "notify",
        data: requestData,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        }
      }).then((res) => {
        if (res.data === 'success') {
          this.$message.success("操作成功！")
        } else {
          this.$message.warning("操作失败！")
        }
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
    getData() {
      axios({
        method: "GET",
        url: this.serverUrl + "getAll",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.users = res.data
        this.users.forEach((user, index) => {
          this.data.push({
            label: user.name,
            key: index,
            openid: user.openid,
          });
        });
      })
    },
  }
}
</script>
<style>
.el-transfer-panel__item {
  text-align: left;
}
</style>