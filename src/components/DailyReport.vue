<template>
  <div>
    <el-card style="float: left;width: 100%;margin-top: 5px">
      <span style="font-size: 22px;color: #66b1ff">每日打卡</span>
      <br/>
      <br/>
      <br/>
      <el-date-picker
          v-model="date"
          align="right"
          type="date"
          placeholder="选择日期"
          style="margin-left: 30%;width: 150px"
          :picker-options="pickerOptions">
      </el-date-picker>
      <i :class="[editMode ?'el-icon-finished' : 'el-icon-edit']" style="float: right;margin-right: 30%;margin-top: 20px" @click="changeMode"></i>
      <br/>
      <br/>
      <form action="" class="ready-form">
        <ul v-for='(list,index) in lists' v-bind:key='list.id'>
          <li>
            <span v-if="!editMode" style="display: inline-block;width: 120px;text-align: right">{{list.title}}</span>
            <el-input v-if="editMode" style="display: inline-block;width: 120px;" v-model="list.title" placeholder="请输入项目"></el-input>
            <el-input :disabled="editMode" v-model="input" placeholder="请输入" style="display: inline-block;width: 30%;margin: 0 20px"></el-input>
            <el-input v-if="editMode" style="display: inline-block;width: 120px;" v-model="list.unit" placeholder="请输入单位"></el-input>
            <span v-if="!editMode" style="display: inline-block;width: 100px;text-align: left">{{list.unit}}</span>
            <el-button v-if="editMode" icon="el-icon-minus" circle @click="del(index)" style="background: hotpink;margin-left: 20px;display: inline-block"></el-button>
          </li>
        </ul>
      </form>
      <div style="position: relative;top: 5%;">
        <el-button v-if="editMode" icon="el-icon-plus" circle @click="addEl" style="background: lightcyan;margin-top: 10px"></el-button>
      </div>
      <div style="margin-top: 30px">
        <el-button v-if="!editMode" type="primary">打卡</el-button>
      </div>
    </el-card>
  </div>
</template>


<script>

export default {
  name: 'DailyReport',
  props: {
    msg: String
  },
  data() {
    return {
      date: Date.now(),
      editMode: false,
      tables: [],
      lists: [
        { title: "站桩",unit:'分钟'},
        { title: "静坐",unit:'分钟'},
        { title: "诵读经典",unit:'分钟'},
        { title: "经典学习",unit:'分钟'},
        { title: "运动",unit:'分钟'},
        { title: "善本",unit:'条'},
        { title: "款两秒",unit:'次'}
      ],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', new Date());
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24);
            picker.$emit('pick', date);
          }
        }, {
          text: '前天',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 2);
            picker.$emit('pick', date);
          }
        }]
      },
    };
  },
  mounted: function () {
    document.title = this.$route.meta.title
    console.log("pyq getInfo")
    this.getUserInfo()
    this.getData()
  },
  methods: {
    changeMode() {
      if (this.editMode) {
        for (let i = 0; i < this.lists.length; i++) {
          if(this.lists[i].title.trim() === '') {
            this.$message.warning("请输入项目")
            return
          }
          if(this.lists[i].unit.trim() === '') {
            this.$message.warning("请输入单位")
            return
          }
        }
      }
      this.editMode = !this.editMode
    },
    addEl: function () {
      let cope = {
        title: "",
        unit: ""
      }
      this.lists.push(cope);
    },
    del: function(index) {
      this.lists.splice(index, 1);
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
