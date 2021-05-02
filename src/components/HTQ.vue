<template>
  <div>
    <div style="background: #303133;height: 200px">
      <el-image
          style="width: 60px; height: 60px;border-radius:50%;float: left;margin-left: 10%;margin-top: 60px"
          :src="this.headimgurl"
          :preview-src-list="[this.headimgurl.substr(0, this.headimgurl.lastIndexOf('/')) + '/0']"
          fit="cover" />
      <div style="float: left;color: white;font-weight: bold;margin-top: 100px">{{this.nickname}}</div>
      <div style="float: right;color: white;font-weight: bold;margin-top: 20px;margin-right: 20px"><i class="el-icon-camera-solid" @click="camera"></i></div>
    </div>

    <br/>
    <br/>
    <el-card style="float: left;width: 100%;margin-top: 5px">
      <div v-for="(data) in datas" :key='data'>
        <div v-if="data.open === '1' && data.path !== null && data.path !== ''" style="float: left;width: 100%">
          <div style="float: left;width: 15%;height: 220px;">
            <el-image style="width: 50px; height: 50px"
            :src="data.headimgurl"></el-image>
          </div>
          <div style="float: left;margin-left:10px;width:80%;text-align: left;">{{data.nickname}}</div>
          <div style="float: left;margin-left: 50px;margin-top:30px">
            <el-image style="width: 75px; height: 150px"
                      :src="'http://htzchina.org/imgs/tenyears/' + data.path"
                      :preview-src-list="['http://htzchina.org/imgs/tenyears/' + data.path]"/>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'TenYears',
  props: {
    msg: String
  },
  data() {
    return {
      name: '',
      gender: '1',
      telephone: '',
      wechatgroup: '',
      info: '',
      stepInfo: '',
      createDate: '',
      birthday: '1988',
      open: '',
      daixie: '',
      chujie: '',
      wechatid: '',

      unionid: '',
      nickname: '',
      openid: '',
      headimgurl: '',
      country: '',
      province: '',
      city: '',
      language: '',
      groupId: '',
      imgUrl: '',
      datas: [],
    };
  },
  mounted: function () {
    document.title = this.$route.meta.title
    console.log("pyq getInfo")
    this.getUserInfo()
    this.getData()
  },
  methods: {
    camera() {
      this.$message.warning("暂不支持！")
    },
    getUserInfo() {
      this.unionid = this.$store.getters.getUnionid
      if (this.unionid != null) {
        this.unionid = this.unionid.replaceAll("\"", "")
      }
      console.log("getData unionid:" + this.unionid)
      axios({
        method: "GET",
        url: "http://htzchina.org:8080/getById?id=" + this.unionid,
        data: null,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        console.log("getById: res:" + res.data)
        if (res.data != null && res.data !== '') {
          console.log("getById res:" + res)
          console.log("getById res.data:" + res.data)
          this.name = res.data.name
          this.headimgurl = res.data.headimgurl
          this.gender = res.data.gender + ''
          this.wechatgroup = res.data.wechatgroup
          this.telephone = res.data.telephone
          this.info = res.data.info
          this.stepInfo = res.data.stepInfo
          this.createDate = res.data.createDate
          this.birthday = res.data.birthday
          this.open = res.data.open
          this.daixie = res.data.daixie
          this.chujie = res.data.chujie
          this.wechatid = res.data.wechatid
          this.province = res.data.province
        }
      });
    },
    getData() {
      axios({
        method: "GET",
        url: "http://htzchina.org:8080/getAll",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.datas = res.data
        console.log(this.datas)
      })
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

img {
  pointer-events:none;
}

/deep/ .el-radio {
  white-space: normal;
}

*{
  -webkit-touch-callout:none;  /*系统默认菜单被禁用*/
  -webkit-user-select:none; /*webkit浏览器*/
  -khtml-user-select:none; /*早期浏览器*/
  -moz-user-select:none;/*火狐*/
  -ms-user-select:none; /*IE10*/
  user-select:none;
}
input,textarea {
  -webkit-user-select:auto; /*webkit浏览器*/
  outline: none;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
