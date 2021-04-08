<template>
  <div class="hello">
    <h2>{{ msg }}</h2>
    <p>
      For a guide and recipes on how to configure / customize this project,<br>
      check out the
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener">vue-cli documentation</a>.
    </p>
    <h5>请选择您的性别</h5>
    <ul>
      <li>
        <el-radio-group v-model="radio">
          <el-radio label="1">男</el-radio>
          <el-radio label="0">女</el-radio>
        </el-radio-group>
      </li>
    </ul>
    <ul>
      <li>
        <h5>请输入您的手机号</h5>
      </li>
      <el-input placeholder="Please input" prefix-icon="el-icon-mobile-phone" v-model="input" style="width:30%;"></el-input>
    </ul>
    <ul>
      <li>
        <h5>请输入您的身份证号</h5>
      </li>
      <el-input placeholder="Please input" prefix-icon="el-icon-s-custom" v-model="input" style="width:30%;"></el-input>
    </ul>
    <h5 style="margin-right: 30%">请输入立志信息</h5>
    <ul>
      <el-input
          type="textarea"
          :rows="5"
          style="width:40%;"
          placeholder="Please input"
          maxlength="999"
          show-word-limit
          v-model="textarea">
      </el-input>
    </ul>
    <el-button type="primary">提交</el-button>
    <ul>
      <li><a href="http://htz.org.cn" target="_blank" rel="noopener">黄庭禅台湾</a></li>
      <li><a href="https://neixinchan.com" target="_blank" rel="noopener">黄庭禅官网</a></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'TenYears',
  props: {
    msg: String
  },
  data () {
    return {
      radio: '1',
      textarea: '',
    };
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
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
