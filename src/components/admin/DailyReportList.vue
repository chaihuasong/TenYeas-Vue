<template>
  <div>
    <el-input v-model="search" placeholder="请输入姓名或昵称" style="width: 200px;float: left"  v-on:input ="searchData"></el-input>
    <el-button type="primary" icon="el-icon-search" style="margin-left: 20px; float: left" @click="searchData">搜索</el-button>
    <el-date-picker
        v-model="filterDate"
        type="date"
        format="yyyy-MM-dd"
        placeholder="选择日期"
        icon="el-icon-search"
        @change="searchByDate"
        style="margin-left: 20px; float: left" />
    <el-button type="primary" icon="el-icon-download" @click="outTab" style="float: right;margin-right: 20px; text-align: center">导出</el-button>

    <el-table :data="tableData" id="out-table" style="height: 0px;width: 0px">>
      <el-table-column prop="id" label="id" width="80">
      </el-table-column>
      <el-table-column prop="date" label="日期" width="80">
      </el-table-column>
      <el-table-column prop="userId" label="用户ID" width="100">
      </el-table-column>
      <el-table-column prop="wechatid" label="微信号" width="100">
      </el-table-column>
      <el-table-column prop="name" label="姓名" width="100">
      </el-table-column>
      <el-table-column prop="nickname" label="昵称" width="100">
      </el-table-column>
      <el-table-column prop="gender" label="性别" width="100" :formatter="genderFormatter">
      </el-table-column>
      <el-table-column prop="note" label="总结" width="100">
      </el-table-column>
      <el-table-column prop="templateId" label="模板" width="100">
      </el-table-column>
      <el-table-column prop="state" label="状态" width="80" :formatter="stateFormatter">
      </el-table-column>
      <el-table-column prop="value1" label="项目1" width="100" :formatter="value1Formatter">
      </el-table-column>
      <el-table-column prop="value2" label="项目2" width="100" :formatter="value2Formatter">
      </el-table-column>
      <el-table-column prop="value3" label="项目3" width="100" :formatter="value3Formatter">
      </el-table-column>
      <el-table-column prop="value4" label="项目4" width="100" :formatter="value4Formatter">
      </el-table-column>
      <el-table-column prop="value5" label="项目5" width="100" :formatter="value5Formatter">
      </el-table-column>
      <el-table-column prop="value6" label="项目6" width="100" :formatter="value6Formatter">
      </el-table-column>
      <el-table-column prop="value7" label="项目7" width="100" :formatter="value7Formatter">
      </el-table-column>
      <el-table-column prop="value8" label="项目8" width="100" :formatter="value8Formatter">
      </el-table-column>
      <el-table-column prop="value9" label="项目9" width="100" :formatter="value9Formatter">
      </el-table-column>
      <el-table-column prop="value10" label="项目10" width="100" :formatter="value10Formatter">
      </el-table-column>
      <el-table-column prop="value11" label="项目11" width="100" :formatter="value11Formatter">
      </el-table-column>
      <el-table-column prop="value12" label="项目12" width="100" :formatter="value12Formatter">
      </el-table-column>
      <el-table-column prop="value13" label="项目13" width="100" :formatter="value13Formatter">
      </el-table-column>
      <el-table-column prop="value14" label="项目14" width="100" :formatter="value14Formatter">
      </el-table-column>
      <el-table-column prop="value15" label="项目15" width="100" :formatter="value15Formatter">
      </el-table-column>
<!--      <el-table-column prop="value16" label="项目16" width="100" :formatter="value16Formatter">-->
<!--      </el-table-column>-->
<!--      <el-table-column prop="value17" label="项目17" width="100" :formatter="value17Formatter">-->
<!--      </el-table-column>-->
<!--      <el-table-column prop="value18" label="项目18" width="100" :formatter="value18Formatter">-->
<!--      </el-table-column>-->
<!--      <el-table-column prop="value19" label="项目19" width="100" :formatter="value19Formatter">-->
<!--      </el-table-column>-->
<!--      <el-table-column prop="value20" label="项目20" width="100" :formatter="value20Formatter">-->
<!--      </el-table-column>-->
      <el-table-column prop="share" label="每日分享" width="120">
      </el-table-column>
    </el-table>

    <el-table :data="tableData">
      <el-table-column prop="id" label="id" width="80">
      </el-table-column>
      <el-table-column prop="date" label="日期" width="80">
      </el-table-column>
      <el-table-column prop="userId" label="用户ID" width="100">
      </el-table-column>
      <el-table-column prop="wechatid" label="微信号" width="100">
      </el-table-column>
      <el-table-column prop="name" label="姓名" width="100">
      </el-table-column>
      <el-table-column prop="nickname" label="昵称" width="100">
      </el-table-column>
      <el-table-column label="头像" width="80">
        <template slot-scope="scope">
          <el-image
              style="width: 60px; height: 60px"
              :src="tableData[scope.$index].headimgurl"
              :preview-src-list="[tableData[scope.$index].headimgurl != null ? tableData[scope.$index].headimgurl.substring(0, tableData[scope.$index].headimgurl.lastIndexOf('/')) + '/0' : null]" />
        </template>
      </el-table-column>
      <el-table-column prop="gender" label="性别" width="100" :formatter="genderFormatter">
      </el-table-column>
      <el-table-column prop="note" label="总结" width="200">
      </el-table-column>
      <el-table-column prop="templateId" label="模板" width="80">
      </el-table-column>
      <el-table-column prop="state" label="状态" width="80" :formatter="stateFormatter">
      </el-table-column>
      <el-table-column prop="value1" label="项目1" width="100" :formatter="value1Formatter">
      </el-table-column>
      <el-table-column prop="value2" label="项目2" width="100" :formatter="value2Formatter">
      </el-table-column>
      <el-table-column prop="value3" label="项目3" width="100" :formatter="value3Formatter">
      </el-table-column>
      <el-table-column prop="value4" label="项目4" width="100" :formatter="value4Formatter">
      </el-table-column>
      <el-table-column prop="value5" label="项目5" width="100" :formatter="value5Formatter">
      </el-table-column>
      <el-table-column prop="value6" label="项目6" width="100" :formatter="value6Formatter">
      </el-table-column>
      <el-table-column prop="value7" label="项目7" width="100" :formatter="value7Formatter">
      </el-table-column>
      <el-table-column prop="value8" label="项目8" width="100" :formatter="value8Formatter">
      </el-table-column>
      <el-table-column prop="value9" label="项目9" width="100" :formatter="value9Formatter">
      </el-table-column>
      <el-table-column prop="value10" label="项目10" width="100" :formatter="value10Formatter">
      </el-table-column>
      <el-table-column prop="value11" label="项目11" width="100" :formatter="value11Formatter">
      </el-table-column>
      <el-table-column prop="value12" label="项目12" width="100" :formatter="value12Formatter">
      </el-table-column>
      <el-table-column prop="value13" label="项目13" width="100" :formatter="value13Formatter">
      </el-table-column>
      <el-table-column prop="value14" label="项目14" width="100" :formatter="value14Formatter">
      </el-table-column>
      <el-table-column prop="value15" label="项目15" width="100" :formatter="value15Formatter">
      </el-table-column>
<!--      <el-table-column prop="value16" label="项目16" width="100" :formatter="value16Formatter">-->
<!--      </el-table-column>-->
<!--      <el-table-column prop="value17" label="项目17" width="100" :formatter="value17Formatter">-->
<!--      </el-table-column>-->
<!--      <el-table-column prop="value18" label="项目18" width="100" :formatter="value18Formatter">-->
<!--      </el-table-column>-->
<!--      <el-table-column prop="value19" label="项目19" width="100" :formatter="value19Formatter">-->
<!--      </el-table-column>-->
<!--      <el-table-column prop="value20" label="项目20" width="100" :formatter="value20Formatter">-->
<!--      </el-table-column>-->
      <el-table-column prop="share" label="每日分享" width="120">
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" @click="editUser(scope.$index, scope.row)">编辑</el-button>
          <br/>
          <br/>
          <el-button size="mini" type="danger" @click="delUser(scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="this.totalCount===0" style="color: #8c939d;font-size: 20px;margin-top: 20px;margin-bottom: 20px">正在加载... <i class="el-icon-loading"></i></div>

    <el-pagination v-if="this.totalCount>0"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[50, 100, 200, 500, 1000, 10000]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalCount">
    </el-pagination>

    <!-- 编辑 -->
    <el-dialog title="编辑" :visible.sync="editDialogVisible">
      <el-form ref="form" :model="newValueInfo" label-width="80px">
        <el-form-item label="ID">
          <el-input v-model="newValueInfo.id" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input v-model="newValueInfo.userId" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="日期">
          <el-input v-model="newValueInfo.date" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="总结">
          <el-input v-model="newValueInfo.note" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="模板">
          <el-input v-model="newValueInfo.templateId" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-input v-model="newValueInfo.state" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="1.">
          <el-input v-model="newValueInfo.value1" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="2.">
          <el-input v-model="newValueInfo.value2" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="3.">
          <el-input v-model="newValueInfo.value3" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="4.">
          <el-input v-model="newValueInfo.value4" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="5.">
          <el-input v-model="newValueInfo.value5" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="6.">
          <el-input v-model="newValueInfo.value6" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="7.">
          <el-input v-model="newValueInfo.value7" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="8.">
          <el-input v-model="newValueInfo.value8" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="9.">
          <el-input v-model="newValueInfo.value9" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="10.">
          <el-input v-model="newValueInfo.value10" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="11.">
          <el-input v-model="newValueInfo.value11" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="12.">
          <el-input v-model="newValueInfo.value12" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="13.">
          <el-input v-model="newValueInfo.value13" autocomplete="off" :rows="4"></el-input>
        </el-form-item>
        <el-form-item label="14.">
          <el-input v-model="newValueInfo.value14" autocomplete="off" :rows="4"></el-input>
        </el-form-item>
        <el-form-item label="15.">
          <el-input v-model="newValueInfo.value15" autocomplete="off" :rows="4"></el-input>
        </el-form-item>
        <el-form-item label="16.">
          <el-input v-model="newValueInfo.value16" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="17.">
          <el-input v-model="newValueInfo.value17" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="18.">
          <el-input v-model="newValueInfo.value18" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="19.">
          <el-input v-model="newValueInfo.value19" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="20.">
          <el-input v-model="newValueInfo.value20" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="每日分享.">
          <el-input v-model="newValueInfo.share" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveUser">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 删除 -->
    <el-dialog title="提示" :visible.sync="delDialogVisible" width="30%">
        <span slot="footer" class="dialog-footer">
          <el-button @click="delDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="delDialogVisible = false">确 定</el-button>
        </span>
    </el-dialog>
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
import axios from "axios"
import qs from "qs"
import global from '../Common.vue'
import XLSX from "xlsx";
import FileSaver from 'file-saver'

export default {
  data() {
    return {
      serverUrl: global.httpUrl,
      tableData: [],
      currentPage: 1,
      pageSize: 100,
      search: '',
      delDialogVisible: false,
      editDialogVisible: false,
      filterDate: '',
      totalCount: 0,
      valueInfo: {
        id : '',
        userId: '',
        date: '',
        note: '',
        templateId: '',
        state: '',
        share: '',
        value1: '',
        value2: '',
        value3: '',
        value4: '',
        value5: '',
        value6: '',
        value7: '',
        value8: '',
        value9: '',
        value10: '',
        value11: '',
        value12: '',
        value13: '',
        value14: '',
        value15: '',
        value16: '',
        value17: '',
        value18: '',
        value19: '',
        value20: ''
      },
      newValueInfo: {
        id : '',
        userId: '',
        date: '',
        note: '',
        templateId: '',
        state: '',
        share: '',
        value1: '',
        value2: '',
        value3: '',
        value4: '',
        value5: '',
        value6: '',
        value7: '',
        value8: '',
        value9: '',
        value10: '',
        value11: '',
        value12: '',
        value13: '',
        value14: '',
        value15: '',
        value16: '',
        value17: '',
        value18: '',
        value19: '',
        value20: ''
      },
      valueIndex: 0,
    }
  },

  mounted: function () {
    console.log("login?" + this.checkLogin())
    if (this.checkLogin()) {
      this.getTotalReportCount()
    } else {
      let loginUser = this.$store.getters.getUser
      if (loginUser === 'admin') {
        this.$router.push("/admin")
      } else {
        this.$router.push("/role")
      }
    }
    document.title = this.$route.meta.title
  },
  methods: {
    getTotalReportCount() {
      axios({
        method: "GET",
        url: this.serverUrl + "getAllReportInfoCount?withUser=true",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.totalCount = res.data
        this.currentPage = parseInt(this.totalCount / this.pageSize)
        this.getData()
      })
    },
    value1Formatter(row) {
      if(row.value1 == null || row.template1 == null) return null;
      return row.template1.replace("_", row.value1);
    },
    value2Formatter(row) {
      if(row.value2 == null || row.template2 == null) return null;
      return row.template2.replace("_", row.value2);
    },
    value3Formatter(row) {
      if(row.value3 == null || row.template3 == null) return null;
      return row.template3.replace("_", row.value3);
    },
    value4Formatter(row) {
      if(row.value4 == null || row.template4 == null) return null;
      return row.template4.replace("_", row.value4);
    },
    value5Formatter(row) {
      if(row.value5 == null || row.template5 == null) return null;
      return row.template5.replace("_", row.value5);
    },
    value6Formatter(row) {
      if(row.value6 == null || row.template6 == null) return null;
      return row.template6.replace("_", row.value6);
    },
    value7Formatter(row) {
      if(row.value7 == null || row.template7 == null) return null;
      return row.template7.replace("_", row.value7);
    },
    value8Formatter(row) {
      if(row.value8 == null || row.template8 == null) return null;
      return row.template8.replace("_", row.value8);
    },
    value9Formatter(row) {
      if(row.value9 == null || row.template9 == null) return null;
      return row.template9.replace("_", row.value9);
    },
    value10Formatter(row) {
      if(row.value10 == null || row.template10 == null) return null;
      return row.template10.replace("_", row.value10);
    },
    value11Formatter(row) {
      if(row.value11 == null || row.template11 == null) return null;
      return row.template11.replace("_", row.value11);
    },
    value12Formatter(row) {
      if(row.value12 == null || row.template12 == null) return null;
      return row.template12.replace("_", row.value12);
    },
    value13Formatter(row) {
      if(row.value13 == null || row.template13 == null) return null;
      return row.template13.replace("_", row.value13);
    },
    value14Formatter(row) {
      if(row.value14 == null || row.template14 == null) return null;
      return row.template14.replace("_", row.value14);
    },
    value15Formatter(row) {
      if(row.value15 == null || row.template15 == null) return null;
      return row.template15.replace("_", row.value15);
    },
    value16Formatter(row) {
      if(row.value16 == null || row.template16 == null) return null;
      return row.template16.replace("_", row.value16);
    },
    value17Formatter(row) {
      if(row.value17 == null || row.template17 == null) return null;
      return row.template17.replace("_", row.value17);
    },
    value18Formatter(row) {
      if(row.value18 == null || row.template18 == null) return null;
      return row.template18.replace("_", row.value18);
    },
    value19Formatter(row) {
      if(row.value19 == null || row.template19 == null) return null;
      return row.template19.replace("_", row.value19);
    },
    value20Formatter(row) {
      if(row.value20 == null || row.template20 == null) return null;
      return row.template20.replace("_", row.value20);
    },
    stateFormatter(row) {
      if (row.state === '1') {
        return "+";
      }
      return "-";
    },
    genderFormatter(row) {
      if (row.gender === 1) {
        return "男";
      } else {
        return "女";
      }
    },
    getData() {
      axios({
        method: "GET",
        url: this.serverUrl + "getAllReportInfoWithUserInfoByPage?page=" + this.currentPage + "&size=" + this.pageSize,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.tableData = res.data
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
    editUser(index, item) {
      this.valueIndex = index
      console.log("index:" + index)
      this.newValueInfo = {
        id: item.id,
        userId: item.userId,
        date: item.date,
        note: item.note,
        templateId: item.templateId,
        state: item.state,
        value1: item.value1,
        value2: item.value2,
        value3: item.value3,
        value4: item.value4,
        value5: item.value5,
        value6: item.value6,
        value7: item.value7,
        value8: item.value8,
        value9: item.value9,
        value10: item.value10,
        value11: item.value11,
        value12: item.value12,
        value13: item.value13,
        value14: item.value14,
        value15: item.value15,
        value16: item.value16,
        value17: item.value17,
        value18: item.value18,
        value19: item.value19,
        value20: item.value20,
        share: item.share,
      }
      this.editDialogVisible = true
    },
    saveUser() {
      this.editDialogVisible = false;
      this.$set(this.tableData, this.valueIndex, this.newValueInfo);
      axios({
        method: "POST",
        url: this.serverUrl + "updateReportInfo",
        data: qs.stringify(this.newValueInfo),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(() => {
        this.$message.success("已更新")
        this.getData()
      })
    },
    delUser(index) {
      let id = index
      this.$confirm('确认删除 id 为 ' + this.tableData[id].id + ' 的记录吗？')
          .then(() => {
            console.log("delete:" + this.tableData[id].id)
            let data = qs.stringify({
              id: this.tableData[id].id,
            })
            axios({
              method: "POST",
              url: this.serverUrl + "deleteReportInfoById",
              data: data,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }).then((res) => {
              axios({
                method: "GET",
                url: this.serverUrl + "getReportInfoById?id=" + this.id,
                data: null,
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                }
              }).then((res) => {
                console.log(res)
                console.log(res.data)
                if (res.data != null && res.data !== '') {
                  this.$message.warning('删除失败！')
                } else {
                  this.$message.success('已删除！')
                  this.tableData.splice(id, 1)
                }
              })
              console.log(res)
            })
          })
          .catch(() => { })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.getData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getData()
    },
    searchByDate() {
      if (this.filterDate ==='') {
        this.getData()
        return
      }
      axios({
        method: "GET",
        url: this.serverUrl + "getReportInfoByDateForAdmin?date=" + this.getDateFormat(this.filterDate),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        console.log(res.data)
        if (res.data !== null && res.data !== '') {
          this.currentPage = 1
          this.tableData = res.data
        } else {
          this.$message.warning("无数据")
        }
      })
    },
    searchData() {
      if (this.search ==='') {
        this.getData()
        return
      }
      let formatDate = null;
      if (this.filterDate !== null && this.filterDate !== '' ) {
        formatDate = this.getDateFormat(this.filterDate)
      }
      axios({
        method: "GET",
        url: this.serverUrl + "getReportInfoByNameOrNickNameLike?name=" + this.search + "&date=" + formatDate,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res.data !== null && res.data !== '') {
          this.currentPage = 1
          this.tableData = res.data
        } else {
          this.$message.warning("无数据")
        }
      })
    },
    outTab () {
      let xlsxParam = {raw: true}
      /* generate workbook object from table */
      let wb = XLSX.utils.table_to_book(document.querySelector("#out-table"), xlsxParam)
      /* get binary string as output */
      let wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' })
      let time = new Date(Date.now())
      let month = (time.getMonth() + 1) < 10 ? '0' + (time.getMonth() + 1) : (time.getMonth() + 1)
      let day = time.getDate() < 10 ? '0' + time.getDate() : time.getDate()
      let hours = time.getHours() < 10 ? '0' + time.getHours() : time.getHours()
      let minutes = time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()
      let fileStr = time.getFullYear() + '' + month + '' + day + '' + hours + '' + minutes + '_' + this.currentPage
      try {
        FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'DailyReport_Info_' + fileStr + '.xlsx')
      } catch (e) { if (typeof console !== 'undefined') console.log(e, wbout) }
      return wbout
    },
    getDateFormat(date) {
      let year = date.getFullYear()
      let month = date.getMonth() + 1
      if (month < 10) month = '0' + month
      let day = date.getDate()
      if (day < 10) day = '0' + day
      return year + "-" + month + "-" + day
    },
  }
}
</script>