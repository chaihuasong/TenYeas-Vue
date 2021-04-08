<template>
  <div class="hello">
    <h2>{{ msg }}</h2>
    <p>
      For a guide and recipes on how to configure / customize this project,<br>
      check out the
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener">vue-cli documentation</a>.
    </p>
    <div>请选择您的性别</div>
    <el-radio-group v-model="radio">
      <el-radio label="1">男</el-radio>
      <el-radio label="0">女</el-radio>
    </el-radio-group>
    <div>请输入您的手机号</div>
    <el-input placeholder="Please input" prefix-icon="el-icon-mobile-phone" v-model="input" style="width:50%;"></el-input>
    <div>请输入您的身份证号</div>
    <el-input placeholder="Please input" prefix-icon="el-icon-s-custom" v-model="input"></el-input>
    <div style="margin-left: 10px">请输入立志信息</div>
    <el-input
        type="textarea"
        :rows="5"
        placeholder="Please input"
        maxlength="999"
        show-word-limit
        v-model="textarea">
    </el-input>
    <br/>
    <el-button type="primary">提交</el-button>
    <br/>
    <br/>
    <br/>
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
