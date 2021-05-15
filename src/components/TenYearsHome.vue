<template>
  <div>

    <div>
      <el-image style="width: 100%; height: 180px"
                :src="'http://wechatapppro-1252524126.picsh.myqcloud.com/appw8Gkxo2j3844/image/kk0m31b50iadsj42fbb9.png?imageView2/q/70'"
                fit="cover"/>
    </div>

    <el-card style="float: left; width: 100%;margin-top: 10px">
      <span style="font-weight: bold">十年倒计时，离{{this.getTenYearsDate()}}，还有</span>
      <br/>
      <span style="font-weight:bold;font-size: 22px;color: #66b1ff">{{this.getTenYearsRemaining()}}</span> 天
    </el-card>

<!--    <el-card style="float: left; width: 100%;margin-top: 10px">-->
<!--      <span style="font-weight: bold">生命倒计时，离生命终了 <input class="ageInputStyle" v-model="maxAge" @change="onMaxAgeChange"/> 岁，还有</span>-->
<!--      <br/>-->
<!--      <span style="font-weight:bold;font-size: 22px;color: #66b1ff">{{this.getYearsRemaining()}}</span> 天-->
<!--    </el-card>-->

    <el-collapse v-model="this.planInfoFlag" @change="handlePlanInfoFlagChange" style="float: left; width: 100%;margin-top: 20px;margin-bottom: 20px">
      <el-collapse-item title="计划和总结" name="1">

        <el-card style="float: left; width: 100%;margin-top: 10px">
          <div style="float: left; margin-bottom: 10px;font-weight: bold">十年立志</div>
          <i :class="[editInfoMode ?'el-icon-finished' : 'el-icon-edit']"
             style="float: right; margin-bottom: 10px" @click="changeInfoMode"></i>
          <br/>
          <br/>
          <el-row :gutter="15">
            <el-col :span="this.path !== '' ? 20 : 24">
              <el-input
                  type="textarea"
                  :rows="3"
                  :disabled="!editInfoMode"
                  placeholder="请输入内容"
                  v-model="info" />
            </el-col>
            <el-col v-if="this.path !== ''" :span="4">
              <el-image style="width: 40px; height: 80px;margin-top: 5px"
                        :src="'http://htzchina.org/imgs/tenyears/' + this.path"
                        :preview-src-list="['http://htzchina.org/imgs/tenyears/' + this.path]"/>
            </el-col>
          </el-row>
        </el-card>
        <el-card style="float: left; width: 100%;margin-top: 10px">
          <div style="float: left; margin-bottom: 10px;font-weight: bold">{{ getDateFormat(this.calendarValue).split('-')[0] }}年{{ parseInt(getDateFormat(this.calendarValue).split('-')[1]) > 6 || parseInt(getDateFormat(this.calendarValue).split('-')[0]) === 2021 ? '下' : '上' }}半年践行计划</div>
          <i :class="[editHalfYearInfoMode ?'el-icon-finished' : 'el-icon-edit']"
             style="float: right; margin-bottom: 10px" @click="changeHalfYearInfoMode"></i>
          <el-input
              type="textarea"
              :rows="3"
              :disabled="!editHalfYearInfoMode"
              placeholder="请输入内容"
              v-model="halfYearInfo" />
        </el-card>
        <el-card style="float: left; width: 100%;">
          <div style="float: left; margin-bottom: 10px;font-weight: bold">{{ getLastMonthDateFormat(this.calendarValue).split('-')[0] }}年{{parseInt(getLastMonthDateFormat(this.calendarValue).split('-')[1])}}月总结</div>
          <i :class="[editLastMonthInfoMode ?'el-icon-finished' : 'el-icon-edit']"
             style="float: right; margin-bottom: 10px" @click="changeLastMonthInfoMode"></i>
          <el-input
              type="textarea"
              :rows="3"
              :disabled="!editLastMonthInfoMode"
              placeholder="请输入内容"
              v-model="lastMonthInfo" />
        </el-card>
        <el-card style="float: left; width: 100%;">
          <div style="float: left; margin-bottom: 10px;font-weight: bold">{{ getDateFormat(this.calendarValue).split('-')[0] }}年{{parseInt(getDateFormat(this.calendarValue).split('-')[1])}}月计划</div>
          <i :class="[editMonthInfoMode ?'el-icon-finished' : 'el-icon-edit']"
             style="float: right; margin-bottom: 10px" @click="changeMonthInfoMode"></i>
          <el-input
              type="textarea"
              :rows="3"
              :disabled="!editMonthInfoMode"
              placeholder="请输入内容"
              v-model="monthInfo" />
        </el-card>
      </el-collapse-item>
    </el-collapse>
    <el-calendar v-model="calendarValue">
      <template
          slot="dateCell"
          slot-scope="{date, data}">
        <el-row>
          <div class="calendar-day" style="display:inline-block; font-size: 15px; margin-right: 5px">{{ data.day.split('-').slice(2).join('-') }}</div>
          <span style="font-size: 18px" :class="getState(data) === '-' ? 'red' : 'green'">{{ getState(data) }}</span><br/>
          <span style="font-size: 9px;color: #66b1ff">{{ getDailyNoteFormat(data) }}</span>
        </el-row>
      </template>
    </el-calendar>

    <el-card style="float: left; width: 100%;margin-top: 10px">
      <div style="float: left; margin-bottom: 10px;font-weight: bold;text-align: left">每日反省总结，今天精气神是长养的还是消耗的，心量是开阔了还是狭迫了，表述内容不超过日历框。</div>
      <el-radio-group v-model="state" style="margin-bottom: 10px;text-align: left">
        <el-radio label="1" border style="width: 90%;float: left">精气神得到长养，朝着目标<span style="margin-left: 10px;margin-right: 5px;font-size: 20px;font-weight: bold">+</span></el-radio>
        <br/>
        <el-radio label="0" border style="width: 90%;float: left">精气神没有长养，偏离目标<span style="margin-left: 10px;margin-right: 5px;font-size: 14px;font-weight: bold">一</span></el-radio>
      </el-radio-group>
      <el-input
          type="textarea"
          :rows="3"
          placeholder="请输入内容"
          v-model="note" />
      <el-button style="float: right;margin-top: 10px;margin-bottom: 10px" @click="submitDailyNote">提交</el-button>
    </el-card>

    <el-card style="float: left; width: 100%;margin-bottom: 20px;margin-top: 10px">
      <div style="float: left; margin-bottom: 10px;font-weight: bold;text-align: left">每日养气功课 & 经典实践</div>
      <i :class="[editDailyReportMode ?'el-icon-finished' : 'el-icon-edit']"
         style="float: right;" @click="changeDailyReportTemplateMode"></i>
      <br/>

      <div style="margin-top: 20px;margin-bottom: 20px">
        <el-row :gutter="20" v-for='(list,index) in reportLists' v-bind:key='list.id' style="margin-top: 5px">
          <el-col :span="8"  v-if="!editDailyReportMode" style="text-align: right;margin-top: 10px">
            <span>{{ list.title }}</span>
          </el-col>
          <el-col v-if="editDailyReportMode" :span="8" style="text-align: right">
            <el-input v-model="list.title" placeholder="请输入项目"></el-input>
          </el-col>
          <el-col :span="8" v-if="!editDailyReportMode">
            <el-input v-model="list.value" placeholder="请输入" @change="onDailyReportResultChange"></el-input>
          </el-col>
          <el-col :span="4" v-if="editDailyReportMode">
            <el-input disabled/>
          </el-col>
          <el-col :span="8" v-if="editDailyReportMode">
            <el-input v-model="list.unit" placeholder="请输入单位"></el-input>
          </el-col>
          <el-col :span="4" v-if="!editDailyReportMode" style="margin-top: 10px;text-align: left">
            <span>{{ list.unit }}</span>
          </el-col>
          <el-col :span="4">
            <el-button v-if="editDailyReportMode" icon="el-icon-minus" circle @click="del(index)"></el-button>
          </el-col>
        </el-row>
      </div>
      <div style="position: relative;top: 5%;">
        <el-button v-if="editDailyReportMode" icon="el-icon-plus" circle @click="addEl"
                   style="background: lightcyan;margin-top: 10px"></el-button>
      </div>
      <div style="float: left; margin-bottom: 10px;font-weight: bold;text-align: left">每日分享（选填）</div>
      <el-input
          type="textarea"
          :rows="3"
          placeholder="请输入内容"
          @change="onDailyReportResultChange"
          v-model="share" />
      <el-button v-if="!editDailyReportMode" style="float: right;margin-top: 10px;margin-bottom: 15px" @click="submitDailyReport"
                 v-clipboard:copy="dailyReportResult">提交</el-button>
    </el-card>
  </div>
</template>

<script>
import axios from "axios";
import qs from "qs";
import wx from 'weixin-js-sdk'
import global from './Common.vue'

export default {
  name: 'TenYears',
  props: {
    msg: String
  },
  data() {
    return {
      serverUrl: global.httpUrl,
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
      path: '',
      planInfoFlag: [''],

      submitDisable: false,
      daixieDisabled: false,
      htmlsHeader: '',
      htmlsFooter: '',
      dialogVisible: false,
      dialogTableVisible: false,
      imgUrl: '',
      isTimeout: false,
      chujieIndex: '11',
      openIndex: '12',
      smallScreen: false,
      maxAge: 80,
      halfYearInfo: '',
      editInfoMode: false,
      lastMonthInfo: '',
      monthInfo: '',
      editHalfYearInfoMode: false,
      editMonthInfoMode: false,
      editLastMonthInfoMode: false,
      editDailyReportMode: false,
      selectedDate: new Date(),
      calendarValue: new Date(),
      share: '',
      note: '',
      monthsNotesList: [],
      template: {},
      templateId: '0',
      state: '1',
      dailyReportResult: '',
      defaultReportLists: [
        {title: "家人陪伴", unit: '分钟', value: ''},
        {title: "站桩", unit: '分钟', value: ''},
        {title: "静坐", unit: '分钟', value: ''},
        {title: "诵读经典", unit: '分钟', value: ''},
        {title: "经典学习", unit: '分钟', value: ''},
        {title: "运动", unit: '分钟', value: ''},
        {title: "善本", unit: '条', value: ''},
        {title: "宽两秒", unit: '次', value: ''},
        {title: "家务", unit: '分钟', value: ''},
      ],
      reportLists: [],
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
    console.log("TenYearsHome getData")
    this.getData()
    this.getMonthNotes()
    this.configWechat()
  },
  methods: {
    handlePlanInfoFlagChange(val) {
      let flag = val.toString().replace(',', '')
      this.planInfoFlag = []
      this.planInfoFlag.push(flag)
      let data = {
        id: this.unionid,
        planInfoFlag: flag,
      }
      axios({
        method: "POST",
        url: this.serverUrl + 'updatePlanInfoFlag',
        data: qs.stringify(data),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
    },
    onMaxAgeChange() {
      try {
        parseInt(this.maxAge)
      } catch (e) {
        this.$message.warning("年龄输入有误，请重新输入！")
        this.maxAge = 80
        return
      }
      let data = {
        id: this.unionid,
        maxAge: this.maxAge,
      }
      axios({
        method: "POST",
        url: this.serverUrl + 'updateMaxAge',
        data: qs.stringify(data),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res.status !== 200) {
          this.$message.warning("保存出错！\n" + res.statusText)
        } else {
          this.$message.success("保存成功")
        }
      });
    },
    getMonthNotes() {
      if (this.unionid === null || this.unionid === '' || this.unionid === undefined) {
        this.$message.warning("信息获取失败，请关注“黄庭书院”公众号后刷新页面重试！")
        return
      }
      let currentDate = this.getDateFormat(this.calendarValue)
      let monthDate = currentDate.substr(0, currentDate.lastIndexOf('-') + 1)
      axios({
        method: "GET",
        url: this.serverUrl + 'getReportInfoListByIdAndMonth?userId=' + this.unionid + "&monthDate=" + monthDate,
        data: null,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res.data !== null && res.data.length > 0) {
          this.monthsNotesList = []
          for (let i = 0; i < res.data.length; i++) {
            let item = {
              date: res.data[i].date,
              note: res.data[i].note,
              templateId: res.data[i].templateId,
              state: res.data[i].state,
            }
            this.monthsNotesList.push(item)
          }
          this.getDailyReportInfoByDate(this.selectedDate)
        } else {
          //可能是新的月份，获取一次上个月的值
          let lastDate = this.getLastMonthDateFormat(this.calendarValue)
          let lastMonthDate = lastDate.substr(0, lastDate.lastIndexOf('-') + 1)
          axios({
            method: "GET",
            url: this.serverUrl + "getReportInfoListByIdAndMonth?userId=" + this.unionid + "&monthDate=" + lastMonthDate,
            data: null,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }).then((res) => {
            if (res.data !== '' && res.data.length > 0) {
              this.monthsNotesList = []
              for (let i = 0; i < res.data.length; i++) {
                let item = {
                  date: res.data[i].date,
                  note: res.data[i].note,
                  templateId: res.data[i].templateId,
                  state: res.data[i].state,
                }
                this.monthsNotesList.push(item)
              }
              this.getDailyReportInfoByDate(this.selectedDate)
            } else {
              this.initReportTemplateId()
            }
          });
        }
      });
    },
    getReportTemplate(templateId) {
      axios({
        method: "GET",
        url: this.serverUrl + "getReportTemplateById?id=" + templateId,
        data: null,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res.data !== '' && res.data.length > 0) {
          this.reportLists = []
          for (let i = 0; i < res.data.length; i++) {
            let title = res.data[i].split('_')[0]
            let unit = res.data[i].split('_').length === 2 ? res.data[i].split('_')[1] : ''
            let cope = {
              title: title,
              unit: unit,
              value: ''
            }
            this.reportLists.push(cope);
          }
        } else {
          this.reportLists = this.defaultReportLists
        }
      });
    },
    initReportTemplateId() {
      let templateId = -1
      let preDay = 0
      for(let i = 0; i < this.monthsNotesList.length; i++) {
        let tempDay = parseInt(this.monthsNotesList[i].date.split('-')[2])
        if (preDay < tempDay) {
          if (this.monthsNotesList[i].templateId !== null) {
            templateId = parseInt(this.monthsNotesList[i].templateId)
            preDay = tempDay
          }
        }
      }
      if (templateId === -1) {
        this.reportLists = this.defaultReportLists
      } else {
        this.getReportTemplate(templateId)
      }
    },
    getHalfYearFormat(date) {
      let year = date.getFullYear()
      let month = date.getMonth() + 1
      if (month > 6) return year + "-" + '下半年'
      return year + "-" + '上半年'
    },
    getDateFormat(date) {
      let year = date.getFullYear()
      let month = date.getMonth() + 1
      if (month < 10) month = '0' + month
      let day = date.getDate()
      if (day < 10) day = '0' + day
      return year + "-" + month + "-" + day
    },
    getLastMonthDateFormat(date) {
      let year = date.getFullYear()
      let month = date.getMonth()
      if (month === 0) {
        year = year - 1
        month = 12
      }
      if (month < 10) month = '0' + month
      let day = date.getDate()
      if (day < 10) day = '0' + day
      return year + "-" + month + "-" + day
    },
    getDailyReportInfoByDate(val) {
      let date = this.getDateFormat(val)
      axios({
        method: "GET",
        url: this.serverUrl + "getReportInfoByUserIdAndDate?userId=" + this.unionid + "&date=" + date,
        data: null,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res.data !== null && res.data !== '') {
          this.note = res.data.note
          this.share = res.data.share
          this.state = res.data.state
          console.log(res.data)
          let reports = []
          reports.push(res.data.value1)
          reports.push(res.data.value2)
          reports.push(res.data.value3)
          reports.push(res.data.value4)
          reports.push(res.data.value5)
          reports.push(res.data.value6)
          reports.push(res.data.value7)
          reports.push(res.data.value8)
          reports.push(res.data.value9)
          reports.push(res.data.value10)
          reports.push(res.data.value11)
          reports.push(res.data.value12)
          reports.push(res.data.value13)
          reports.push(res.data.value14)
          reports.push(res.data.value15)
          reports.push(res.data.value16)
          reports.push(res.data.value17)
          reports.push(res.data.value18)
          reports.push(res.data.value19)
          reports.push(res.data.value20)
          let templateId = res.data.templateId
          if ((templateId === undefined || templateId === null || templateId === '')
              && this.monthsNotesList !== null && this.monthsNotesList.length > 0) {
            let index = 0
            let temp = 0
            for (let i = 0; i < this.monthsNotesList.length; i++) {
              let day = parseInt(this.monthsNotesList[i].date.split('-')[2])
              let tmpTemplateId = this.monthsNotesList[index].templateId
              if (temp === 0) {
                temp = day
                if (tmpTemplateId !== null && tmpTemplateId !== undefined && tmpTemplateId !== '') {
                  templateId = tmpTemplateId
                }
              } else if (day > temp) {
                temp = day
                index = i
                if (tmpTemplateId !== null && tmpTemplateId !== undefined && tmpTemplateId !== '') {
                  templateId = tmpTemplateId
                }
              }
            }
          }
          if (templateId === null) {
            this.reportLists = this.defaultReportLists
            return
          }
          axios({
            method: "GET",
            url: this.serverUrl + "getReportTemplateById?id=" + templateId,
            data: null,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }).then((resp) => {
            if (reports != null && reports.length > 0  && reports[0] != null && reports[0] !== undefined) {
              this.reportLists = []
              for (let i = 0; i < resp.data.length; i++) {
                let title = resp.data[i].split('_')[0]
                let unit = resp.data[i].split('_').length === 2 ? resp.data[i].split('_')[1] : ''
                let value = reports[i].replace(title, '')
                value = value.replace(unit, '')
                let cope = {
                  title: title,
                  value: value,
                  unit: unit,
                }
                this.reportLists.push(cope);
              }
              this.onDailyReportResultChange()
            } else {
              this.reportLists = this.defaultReportLists
            }
          });
        } else {
          this.initReportTemplateId()
        }
      });
    },
    dateChanged(data) {
      if (data.isSelected) {
        let selectedDate = new Date(data.day)
        if (this.selectedDate.getMonth() !== selectedDate.getMonth()) {
          this.getMonthInfo()
          this.getLastMonthInfo()
          this.getHalfYearInfo()
        }
        if (this.selectedDate.getDate() !== selectedDate.getDate()) {
          this.selectedDate = selectedDate

          this.getDailyReportInfoByDate(selectedDate)
        }
        axios({
          method: "GET",
          url: this.serverUrl + "getReportInfoByUserIdAndDate?userId=" + this.unionid + "&date=" + data.day,
          data: null,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then((res) => {
          this.note = res.data.note
          this.state = res.data.state
        });
      }
      return ''
    },
    submitDailyNote() {
      if (this.unionid === null || this.unionid === '' || this.unionid === undefined) {
        this.$message.warning("信息获取失败，请关注“黄庭书院”公众号后刷新页面重试！")
        return
      }
      if (this.state === '' || this.state === undefined || this.state.trim().length === 0) {
        this.$message.warning("请选择精气神长养情况！")
        return
      }
      if (this.note === '' || this.note === undefined || this.note.trim().length === 0) {
        this.$message.warning("请输入每日反省总结内容！")
        return
      }
      let data = {}
      data['userId'] = this.unionid
      data['date'] = this.getDateFormat(this.selectedDate)
      data['state'] = this.state
      data['note'] = this.note

      axios({
        method: "POST",
        url: this.serverUrl + "saveDailyNote",
        data: qs.stringify(data),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res.status !== 200) {
          this.$message.warning("保存出错！\n" + res.statusText)
        } else {
          this.getMonthNotes()
          this.$message.success("提交成功！")
        }
      });
    },
    onDailyReportResultChange() {
      if (this.reportLists === null || this.reportLists.length === 0) return
      let data = ''
      let index = 0;
      for (let i = 0; i < this.reportLists.length; i++) {
        if (this.reportLists[i].value.trim() === '' || this.reportLists[i].value.trim() === '0') continue
        index++
        let value = index + '. ' + this.reportLists[i].title + this.reportLists[i].value.trim() + this.reportLists[i].unit
        data += '\n' + value
      }

      if (data !== '') {
        data = this.name + ' ' + this.getDateFormat(this.selectedDate) + '\n' + data
      }

      if (this.share !== undefined && this.share !== null && this.share !== '') {
        data = data + '\n\n分享：' + this.share
      }

      this.dailyReportResult = data
    },
    submitDailyReport() {
      let data = {}
      let inputted = false
      for (let i = 0; i < this.reportLists.length; i++) {
        let value = this.reportLists[i].value.trim() === '' ? 0 : this.reportLists[i].value.trim()
        if (value !== 0) {
          inputted = true
        }
        data['value' + (i + 1)] = this.reportLists[i].title.trim() + value + this.reportLists[i].unit.trim()
      }

      if (!inputted) {
        this.$message.warning("汇报内容不能为空！")
        return
      }

      data['userId'] = this.unionid
      data['templateId'] = this.templateId
      data['date'] = this.getDateFormat(this.selectedDate)
      data['state'] = this.state
      data['note'] = this.note
      data['share'] = this.share

      axios({
        method: "POST",
        url: this.serverUrl + "saveReportInfo",
        data: qs.stringify(data),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res.status !== 200) {
          this.$message.warning("保存出错！\n" + res.statusText)
        } else {
          this.$message.success("内容已成功提交并已复制到剪贴板！")
        }
      });
    },
    getState(data) {
      for (let i = 0; i < this.monthsNotesList.length; i++) {
        if (data.day === this.monthsNotesList[i].date) {
          if (this.monthsNotesList[i].state === null || this.monthsNotesList[i].state === '') return ''
          let sign = this.monthsNotesList[i].state === '0' ? '-' : '+'
          return sign
        }
      }
      return ''
    },
    getDailyNoteFormat(data) {
      this.dateChanged(data)
      let maxLength = 15
      for (let i = 0; i < this.monthsNotesList.length; i++) {
        if (data.day === this.monthsNotesList[i].date) {
          if (this.monthsNotesList[i].note === null || this.monthsNotesList[i].note === '') return ''
          if (this.monthsNotesList[i].note.trim().length > maxLength) {
            return this.monthsNotesList[i].note.trim().substring(0, maxLength - 1) + '…'
          } else if (this.monthsNotesList[i].note.trim().length < maxLength) {
            return this.monthsNotesList[i].note
          }
          return this.monthsNotesList[i].note
        }
      }
      return ''
    },
    changeDailyReportTemplateMode() {
      if (this.editDailyReportMode) {
        this.template = {}
        for (let i = 0; i < this.reportLists.length; i++) {
          if (this.reportLists[i].title.trim() === '') {
            this.$message.warning("请输入项目")
            return
          }
          this.template['template' + (i + 1)] = this.reportLists[i].title.trim() + "_" + this.reportLists[i].unit.trim()
        }

        if (this.template['template1'] === undefined) {
          this.$message.warning("至少添加一项功课模板！")
          return
        }

        let data = qs.stringify(this.template)
        axios({
          method: "POST",
          url: this.serverUrl + "saveTemplate",
          data: data,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then((res) => {
          if (res.status !== 200) {
            this.$message.warning("保存出错！\n" + res.statusText)
          } else {
            this.templateId = res.data
          }
        });
      }
      this.editDailyReportMode = !this.editDailyReportMode
    },
    addEl: function () {
      if (this.reportLists.length > 19) {
        this.$message.warning("已达到上限！")
        return
      }
      let cope = {
        title: '',
        unit: '',
        value: ''
      }
      this.reportLists.push(cope);
    },
    del: function (index) {
      this.reportLists.splice(index, 1);
    },
    changeInfoMode() {
      if (this.editInfoMode) {
        let data = {
          id: this.unionid,
          info: this.info,
        }
        axios({
          method: "POST",
          url: this.serverUrl + "updateLiZhiInfo",
          data: qs.stringify(data),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then((res) => {
          if (res.status !== 200) {
            this.$message.warning("保存出错！\n" + res.statusText)
          } else {
            this.$message.success("保存成功")
          }
        });
      }
      this.editInfoMode = !this.editInfoMode
    },
    changeHalfYearInfoMode() {
      if (this.editHalfYearInfoMode && this.halfYearInfo !== '') {
        let halfYearFormat = this.getHalfYearFormat(this.calendarValue)
        let data = {
          date: halfYearFormat,
          userId: this.unionid,
          halfYearInfo: this.halfYearInfo,
        }
        axios({
          method: "POST",
          url: this.serverUrl + "saveHalfYearInfo",
          data: qs.stringify(data),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then((res) => {
          if (res.status !== 200) {
            this.$message.warning("保存出错！\n" + res.statusText)
          } else {
            this.$message.success("保存成功")
          }
        });
      }
      this.editHalfYearInfoMode = !this.editHalfYearInfoMode
    },
    changeMonthInfoMode() {
      if (this.editMonthInfoMode && this.monthInfo !== '') {
        let dateFormat = this.getDateFormat(this.calendarValue)
        let data = {
          date: dateFormat.substr(0, dateFormat.lastIndexOf('-')),
          userId: this.unionid,
          monthInfo: this.monthInfo,
        }
        axios({
          method: "POST",
          url: this.serverUrl + "saveMonthInfo",
          data: qs.stringify(data),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then((res) => {
          if (res.status !== 200) {
            this.$message.warning("保存出错！\n" + res.statusText)
          } else {
            this.$message.success("保存成功")
          }
        });
      }
      this.editMonthInfoMode = !this.editMonthInfoMode
    },
    changeLastMonthInfoMode() {
      if (this.editLastMonthInfoMode && this.lastMonthInfo !== '') {
        let dateFormat = this.getLastMonthDateFormat(this.calendarValue)
        let data = {
          date: dateFormat.substr(0, dateFormat.lastIndexOf('-')),
          userId: this.unionid,
          monthInfo: this.lastMonthInfo,
        }
        axios({
          method: "POST",
          url: this.serverUrl + "saveMonthInfo",
          data: qs.stringify(data),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then((res) => {
          if (res.status !== 200) {
            this.$message.warning("保存出错！\n" + res.statusText)
          } else {
            this.$message.success("保存成功")
          }
        });
      }
      this.editLastMonthInfoMode = !this.editLastMonthInfoMode
    },
    getHalfYearInfo() {
      let halfYearFormat = this.getHalfYearFormat(this.calendarValue)
      let data = {
        date: halfYearFormat,
        userId: this.unionid,
      }
      axios({
        method: "GET",
        url: this.serverUrl + "getHalfYearInfo",
        data: qs.stringify(data),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res != null && res.data != null && res.data !== '') {
          this.halfYearInfo = res.data.halfYearInfo
        }
      });
    },
    getMonthInfo() {
      let dateFormat = this.getDateFormat(this.calendarValue)
      let data = {
        date: dateFormat.substr(0, dateFormat.lastIndexOf('-')),
        userId: this.unionid,
      }
      axios({
        method: "GET",
        url: this.serverUrl + "getMonthInfo",
        data: qs.stringify(data),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res != null && res.data != null && res.data !== '') {
          this.monthInfo = res.data.monthInfo
        }
      });
    },
    getLastMonthInfo() {
      let dateFormat = this.getLastMonthDateFormat(this.calendarValue)
      let data = {
        date: dateFormat.substr(0, dateFormat.lastIndexOf('-')),
        userId: this.unionid,
      }
      axios({
        method: "GET",
        url: this.serverUrl + "getMonthInfo",
        data: qs.stringify(data),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res != null && res.data != null && res.data !== '') {
          this.lastMonthInfo = res.data.lastMonthInfo
        }
      });
    },
    getTenYearsDate() {
      //let createdDate = new Date(this.createDate)
      //let tenYearsLater = new Date((createdDate.getFullYear() + 10) + this.createDate.substr(4))
      let tenYearsLater = new Date('2031-04-17')
      let year = tenYearsLater.getFullYear()
      let month = tenYearsLater.getMonth() + 1
      if (month < 10) month = "0" + month
      let dates = tenYearsLater.getDate()
      if (dates < 10) dates = "0" + dates
      return year + "年" + month + "月" + dates + "日"
    },
    getTenYearsRemaining() {
      // if (this.createDate !== '') {
      //   let createdDate = new Date(this.createDate)
      //   let tenYearsLater = new Date((createdDate.getFullYear() + 10) + this.createDate.substr(4))
      //   let remaining = tenYearsLater.getTime() - Date.now()
      //   return parseInt(remaining / (24 * 3600 * 1000)+"")
      // }
      let tenYearsLater = new Date('2031-04-18')
      let remaining = tenYearsLater.getTime() - Date.now()
      if (remaining < 0) remaining = 0
      return parseInt(remaining / (24 * 3600 * 1000)+"")
    },
    getYearsRemaining() {
      if (this.birthday !== '') {
        let birthday = new Date(this.birthday)
        if (this.maxAge === '') return 0
        let tenYearsLater = new Date((birthday.getFullYear() + parseInt(this.maxAge)) + this.birthday.substr(4))
        let remaining = tenYearsLater.getTime() - Date.now()
        return parseInt(remaining / (24 * 3600 * 1000)+"")
      }
    },
    getOpenId() {
      const str = window.location.href
      if (str == null || !(str.indexOf("?") > 0)) {
        return null
      }
      let openid = window.location.href.split("?")[1].split("=")[1];
      if (openid != null) {
        return openid
      }
      return null
    },
    timeCountDown() {
      this.timer = setInterval(() => {
        this.times--
        if (this.times === 0) {
          this.show = true
          clearInterval(this.timer)
        }
      }, 1000)
    },
    getData() {
      let uid = this.$store.getters.getUnionid
      if (uid != null && uid !== '' && uid !== undefined) {
        this.unionid = uid.replace("\"","").replace("\"","")
        console.log("unionid:" + this.unionid)
        this.getUserInfoByUnionId()
        return;
      }
      let openid = this.getOpenId()
      console.log("openid:" + openid)
      if (openid !== "" && openid != null && openid.length > 0) {
        console.log("begin axios...")
        axios({
          method: "GET",
          url: this.serverUrl + "getUserInfo?openid=" + openid,
          data: null,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then((res) => {
          if (res != null && res.data != null && res.data !== '') {
            console.log("openid:" + res.data)
            console.log("unionid:" + res.data.unionid)
            console.log("sex:" + res.data.sex)
            this.unionid = res.data.unionid
            if (this.unionid === null || this.unionid === '' || this.unionid === undefined) {
              alert("信息获取失败，请关注“黄庭书院”公众号后刷新页面重试！")
            }
            this.$store.commit('$_setUnionid', this.unionid)
            this.nickname = res.data.nickname
            this.openid = res.data.openid
            this.headimgurl = res.data.headimgurl
            this.country = res.data.country
            this.city = res.data.city
            this.province = res.data.province + this.city
            this.language = res.data.language
            this.groupId = res.data.groupId
            this.gender = res.data.sex + ''
            this.getUserInfoByUnionId()
          }
        });
      } else {
        window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx83aec75c3ca58f0e&redirect_uri=http://htzchina.org/wc_redirect4&response_type=code&scope=snsapi_base&state=123#wechat_redirect"
      }
    },
    getUserInfoByUnionId() {
      if (this.unionid === null || this.unionid === '' || this.unionid === undefined) {
        this.$message.warning("信息获取失败，请关注“黄庭书院”公众号后刷新页面重试！")
        return
      }
      axios({
        method: "GET",
        url: this.serverUrl + "getById?id=" + this.unionid,
        data: null,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res != null && res.data != null && res.data !== '') {
          console.log("getById res:" + res)
          console.log("getById res.data:" + res.data)
          this.name = res.data.name
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
          this.path = res.data.path
          let planInfoFlag = res.data.planInfoFlag
          if (planInfoFlag !== undefined && planInfoFlag !== null && planInfoFlag !== '') {
            this.planInfoFlag = ['']
            this.planInfoFlag.push(planInfoFlag)
          }

          let age = res.data.maxAge
          if (age !== undefined && age !== null && age !== '') {
            this.maxAge = parseInt(age)
          } else {
            this.maxAge = 80
          }
        } else {
          this.$alert('您还未填写过立志卡，点击确定跳转到填写界面', '立志信息不存在', {
            confirmButtonText: '确定',
            confirmButtonClass: 'confirmButtonClass',
            callback: action => {
              console.log(action)
              this.$router.push("/index");
            }
          });
        }
      });
    },
    configWechat() {
      axios({
        method: "GET",
        url: this.serverUrl + "getAccessToken?url=" + window.location.href,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res != null && res.data != null && res.data !== '') {
          wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: 'wx83aec75c3ca58f0e', // 必填，公众号的唯一标识
            timestamp: res.data.timestamp, // 必填，生成签名的时间戳
            nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
            signature: res.data.signature,// 必填，签名
            jsApiList: [
              'onMenuShareTimeline',
              'onMenuShareAppMessage',
              'onMenuShareQQ',
              'onMenuShareWeibo',
              'onMenuShareQZone'
            ] // 必填，需要使用的JS接口列表
          });
        }
      });

      wx.ready(function () {   //需在用户可能点击分享按钮前就先调用
        wx.onMenuShareAppMessage({
          title: '黄庭书院"十年持志"', // 分享标题
          desc: '让我们一起 抱团成长~', // 分享描述
          link: "http://htzchina.org/tenyears/#/tenyearsHome", // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: 'http://htzchina.org/imgs/huangtingshuyuan.png', // 分享图标
        })
        wx.onMenuShareTimeline({
          title: '黄庭书院"十年持志"', // 分享标题
          desc: '让我们一起 抱团成长~', // 分享描述
          link: "http://htzchina.org/tenyears/#/tenyearsHome", // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: 'http://htzchina.org/imgs/huangtingshuyuan.png', // 分享图标
        })
      });
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
nav {
  display: flex;
  flex-flow: row wrap;
  /* 交叉轴上的分散对齐 */
  align-content: space-around;
}

nav > div {
  display: flex;
  flex-flow: column nowrap;
  text-align: center;
  width: 25vw;
  margin: 10px 0;
}

nav > div img {
  width: 50%;
}

nav > div > a > p {
  color: #666;
  font-weight: 700;
}

img {
  pointer-events: none;
}

* {
  -webkit-touch-callout: none; /*系统默认菜单被禁用*/
  -webkit-user-select: none; /*webkit浏览器*/
  -khtml-user-select: none; /*早期浏览器*/
  -moz-user-select: none; /*火狐*/
  -ms-user-select: none; /*IE10*/
  user-select: none;
}

input, textarea {
  -webkit-user-select: auto; /*webkit浏览器*/
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
.el-radio-button:focus:not(.is-focus):not(:active) {
  -webkit-box-shadow: 0 0 2px 2px #fff!important;
  box-shadow: 0 0 2px 2px #fff!important;
}

</style>
<style>
.el-input.is-disabled .el-input__inner,.el-textarea.is-disabled .el-textarea__inner,.el-checkbox__input.is-disabled+.el-checkbox__label{
  color: #000000;
  font-size: 15px;
  background: white;
}
.ageInputStyle {
  border-left-width:0px;
  border-top-width:0px;
  border-right-width:0px;
  border-bottom-width:1px;
  border-bottom-color:lightgray;
  width: 35px;
  height: 20px;
  font-size: 18px;
  text-align: center;
  margin: 0 0;
  padding: 0 0;
  -webkit-appearance: none;
  border-radius: 0;
}
.el-collapse .el-collapse-item .el-collapse-item__header {
  margin-left: 20px;
  font-weight: bold;
  font-size: 15px;
}
.el-calendar-table .el-calendar-day {
  height: 95px;
  padding: 0 0px;
  font-weight: bold;
  margin: 0 0px;
}
.red {
  color: red;
}
.green {
  color: green;
}
.confirmButtonClass {
  float: right;
  margin-right: 15%;
  width: 80px;
}
</style>