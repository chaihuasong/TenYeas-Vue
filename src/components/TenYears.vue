<template>
  <div class="hello">
    <h2>{{ msg }}</h2>
    <p style="color: chocolate;font-style: italic">
      让我们一起 预约十年后更好的自己
    </p>
    <div class="titleNameStyle"><span class='req'>*</span> 1、您的姓名</div>
    <el-input placeholder="请输入" prefix-icon="el-icon-s-custom" v-model="input" class="inputStyle" clearable></el-input>
    <br/>
    <div class="sexTitleStyle"><span class='req'>*</span> 2、您的性别</div>
    <br/>
    <br/>
    <div class="radioButtonStyle2">
      <el-radio-group v-model="radio" >
        <el-radio label="1">男</el-radio>
        <el-radio label="0">女</el-radio>
      </el-radio-group>
    </div>
    <div class="titleNameStyle"><span class='req'>*</span> 3、您的手机号</div>
    <el-input placeholder="请输入" prefix-icon="el-icon-mobile-phone" v-model="input" class="inputStyle" clearable pattern="[0-9]*"></el-input>

    <div class="titleNameStyle"><span class='req'>*</span> 4、您的身份证号</div>
    <el-input placeholder="请输入" prefix-icon="el-icon-postcard" v-model="input" class="inputStyle" clearable pattern="[0-9]*[x]"></el-input>

    <div class="titleNameStyle"><span class='req'>*</span> 5、请输入立志信息</div>
    <el-input
        type="textarea"
        :rows="8"
        placeholder="请输入"
        style="width: 90%"
        maxlength="999"
        show-word-limit
        v-model="textarea">
    </el-input>
    <br/>
    <br/>
    <el-button type="primary" class="submitStyle" @click="submit">提交</el-button>
    <br/>
    <br/>
    <ul>
      <li><a href="http://htz.org.cn" target="_blank" rel="noopener">黄庭禅台湾</a></li>
      <li><a href="https://neixinchan.com" target="_blank" rel="noopener">黄庭禅官网</a></li>
    </ul>
    <br/>
  </div>
</template>

<script>
import axios from 'axios'
import qs from 'qs'

export default {
  name: 'TenYears',
  props: {
    msg: String
  },
  data () {
    return {
      radio: '1',
      textarea: '',
      input: '',
    };
  },
  methods: {
    submit() {
      var data = qs.stringify({
        id: "1",
        name: "chaihuasong",
        gender: 1,
        identityCard: "32423421342421",
        telephone: "234234",
        info: "lizhidashen"
      })
      axios({
        method: "POST",
        url: "http://localhost:8080/save",
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        alert(res)
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

/deep/ .el-radio{
  white-space: normal;
}

.req {
  color: red;
}

.radioButtonStyle {
  float: left;
  margin-left: 50px;
}

.radioButtonStyle2 {
  margin-bottom: 20px;
}

.sexTitleStyle {
  float: left;
  font-size: 18px;
  margin-left: 10px;
}

.titleNameStyle {
  float: left;
  font-size: 18px;
  margin-left: 10px;
  margin-bottom: 10px;
}

.inputStyle {
  width: 90%;
  margin-bottom: 20px;
}

.submitStyle {
  width: 120px;
  font-size: 18px;
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
