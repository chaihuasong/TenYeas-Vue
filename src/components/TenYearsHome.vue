<template>
  <div class="tenyears-home-page">

    <div>
      <el-image style="width: 100%; height: 180px"
                :src="'http://wechatapppro-1252524126.picsh.myqcloud.com/appw8Gkxo2j3844/image/kk0m31b50iadsj42fbb9.png?imageView2/q/70'"
                fit="cover"/>
    </div>

    <el-card v-if="createDate" class="countdown-card" style="float: left; width: 100%;margin-top: 10px">
      <span style="font-weight: bold">十年倒计时，离{{this.getTenYearsDate()}}，还有</span>
      <br/>
      <span class="countdown-days">{{this.getTenYearsRemaining()}}</span> 天
    </el-card>

<!--    <el-card style="float: left; width: 100%;margin-top: 10px">-->
<!--      <span style="font-weight: bold">生命倒计时，离生命终了 <input class="ageInputStyle" v-model="maxAge" @change="onMaxAgeChange"/> 岁，还有</span>-->
<!--      <br/>-->
<!--      <span style="font-weight:bold;font-size: 22px;color: #66b1ff">{{this.getYearsRemaining()}}</span> 天-->
<!--    </el-card>-->

    <el-collapse v-model="this.planInfoFlag" @change="handlePlanInfoFlagChange" style="float: left; width: 100%;margin-top: 20px;margin-bottom: 15px">
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

                        :preview-src-list="['http://htzchina.org/imgs/tenyears/' + this.path]">
                <div slot="error">
                  <el-image style="width: 40px; height: 50px;margin-top: 5px"
                            :src="require('../assets/img/not_found.jpg')" />
                </div>
              </el-image>
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
    <div>
      <el-image style="width: 100%"
                :src="require('../assets/img/tenyears_tips.jpg')"
                fit="cover"/>
    </div>
    <el-calendar v-model="calendarValue">
      <template
          slot="dateCell"
          slot-scope="{data}">
        <el-row
            @click.native="onCalendarDayClick(data)"
            :class="[
              isFutureCalendarDay(data.day) ? 'disabled-color' : '',
              isSelectedCalendarDay(data.day) ? 'calendar-selected-day' : ''
            ]">
          <div class="calendar-day" style="display:inline-block; font-size: 15px; margin-right: 5px">{{ data.day.split('-').slice(2).join('-') }}</div>
          <span style="font-size: 18px" :class="getState(data) === '-' ? 'red' : 'green'">{{ getState(data) }}</span><br/>
          <span style="font-size: 9px;color: #66b1ff">{{ getDailyNoteFormat(data) }}</span>
        </el-row>
      </template>
    </el-calendar>

    <el-card style="float: left; width: 100%;margin-top: 10px">
      <div style="float: left; margin-bottom: 10px;font-weight: bold;text-align: left">每日反省总结，今天精气神是长养的还是消耗的，心量是开阔了还是狭迫了，表述内容不超过日历框。</div>
      <el-radio-group v-model="state" style="margin-bottom: 10px;text-align: left">
        <el-radio label="1" style="width: 90%;float: left">精气神得到长养，朝着目标<span style="margin-left: 10px;margin-right: 5px;font-size: 18px;font-weight: bold;color: #67c23a">+</span></el-radio>
        <br/>
        <el-radio label="0" style="width: 90%;float: left;margin-top: 10px;margin-bottom: 5px">精气神没有长养，偏离目标<span style="margin-left: 10px;margin-right: 5px;font-size: 20px;font-weight: bold;color: #f56c6c">-</span></el-radio>
      </el-radio-group>
      <el-input
          type="textarea"
          :rows="3"
          maxlength="15"
          show-word-limit
          placeholder="请输入内容"
          v-model="note" />
      <el-button style="float: right;margin-top: 10px;margin-bottom: 10px" @click="submitDailyNote">提交</el-button>
    </el-card>

    <el-card style="float: left; width: 100%;margin-bottom: 20px;margin-top: 10px">
      <div style="float: left; margin-bottom: 10px;font-weight: bold;text-align: left">每日养气功课 & 经典实践</div>
      <i :class="[editDailyReportMode ?'el-icon-finished' : 'el-icon-edit']"
         style="float: right;" @click="changeDailyReportTemplateMode" v-if="canEditDailyReportTemplate()"></i>
      <br/>

      <div style="margin-top: 20px;margin-bottom: 15px">
        <el-row :gutter="5" v-for='(list,index) in reportLists' :key="list.title + '-' + index" style="margin-top: 5px">
          <el-col :span="(zaoQiTimeVisible && list.title === '早起') || ( zaoShuiTimeVisible && list.title === '早睡') ? 5 : (list.title === '诵读经典' || list.title === '经典学习' ? 6 : 7)" v-if="!editDailyReportMode && list.title !== '宽两秒'" style="text-align: right;margin-top: 10px">
            <span>{{ list.title }}</span>
          </el-col>
          <el-col :span="7" v-if="!editDailyReportMode && list.title === '宽两秒'" style="text-align: right;margin-top: 8px">
            <el-select v-model="kuanLiangMiao" size="medium" class="kuanLiangMiaoStyle">
              <el-option
                  v-for="item in kuanLiangMiaoOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-col>
          <el-col v-if="editDailyReportMode" :span="8" style="text-align: right">
            <el-input v-model="list.title" placeholder="请输入项目" disabled></el-input>
          </el-col>
          <el-col :span="(list.title === '站桩' || list.title === '禅坐' || list.title === '静坐' || list.title === '诵读经典' || list.title === '经典学习' || list.title === '宽两秒') ? 4 : 7" v-if="(!editDailyReportMode  && list.title !== '早睡' && list.title !== '早起')">
            <input class="dailyReportInfoInputStyle" type="text" inputmode="numeric" pattern="[0-9]*" v-model="list.value" placeholder="" @input="onDailyReportResultChange" />
          </el-col>
          <el-col :span="1" v-if="!editDailyReportMode && (list.title === '站桩') && zhanZhuangCount === 2" style="margin-top: 10px">
            <span style="color: #909399">+</span>
          </el-col>
          <el-col :span="1" v-if="!editDailyReportMode && (list.title === '禅坐' || list.title === '静坐') && jingZuoCount === 2" style="margin-top: 10px;text-align: center">
            <span style="color: #909399">+</span>
          </el-col>
          <el-col :span="list.title === '站桩' || list.title === '禅坐' || list.title === '静坐' ? 4 : 6" v-if="!editDailyReportMode && list.title === '站桩' && zhanZhuangCount === 2">
            <input class="dailyReportInfoInputStyle" type="text" inputmode="numeric" pattern="[0-9]*" v-model="zhanZhuangValue2" @input="onDailyReportResultChange" />
          </el-col>
          <el-col :span="list.title === '站桩' || list.title === '禅坐' || list.title === '静坐' ? 4 : 6" v-if="!editDailyReportMode && (list.title === '禅坐' || list.title === '静坐') && jingZuoCount === 2">
            <input class="dailyReportInfoInputStyle" type="text" inputmode="numeric" pattern="[0-9]*" v-model="jingzuoValue2" @input="onDailyReportResultChange" />
          </el-col>
          <el-col :span="2" v-if="!editDailyReportMode && (list.title === '站桩') && zhanZhuangCount === 1" style="margin-right: 15px">
            <el-button icon="el-icon-plus" circle @click="addValue(list.title)"
                       style="background: lightcyan;margin-top: 6px;" size="mini"></el-button>
          </el-col>
          <el-col :span="2" v-if="!editDailyReportMode && (list.title === '禅坐' || list.title === '静坐') && jingZuoCount === 1" style="margin-right: 15px">
            <el-button icon="el-icon-plus" circle @click="addValue(list.title)"
                       style="background: lightcyan;margin-top: 6px;" size="mini"></el-button>
          </el-col>
          <el-col :span="4" v-if="editDailyReportMode">
            <el-input disabled/>
          </el-col>
          <el-col :span="8" v-if="editDailyReportMode">
            <el-input v-model="list.unit" disabled></el-input>
          </el-col>
          <el-col :span="list.title === '宽两秒' ? 4 : 7" v-if="!editDailyReportMode && list.title !== '诵读经典' && list.title !== '经典学习'" style="margin-top: 10px;text-align: left;padding: 0 0">
            <span>{{ list.unit }}</span><span v-if="list.title === '宽两秒'">，总</span>
          </el-col>
          <el-col :span="7" v-if="!editDailyReportMode && (list.title === '诵读经典' || list.title === '经典学习')" style="margin-top: 10px;text-align: center;padding: 0 0">
            <span>{{ list.unit }}</span><span v-if="list.title === '诵读经典'">，诵读</span><span v-if="list.title === '经典学习'">，学习</span>
          </el-col>
          <el-col :span="6" v-if="!editDailyReportMode && list.title === '诵读经典'" style="text-align: left;padding: 0 0">
            <input class="dailyReportInfoInputTextStyle" v-model="sutraRead" @input="onDailyReportResultChange" />
          </el-col>
          <el-col :span="6" v-if="!editDailyReportMode && list.title === '经典学习'" style="text-align: left;padding: 0 0">
            <input class="dailyReportInfoInputTextStyle" v-model="sutraStudy" @input="onDailyReportResultChange" />
          </el-col>
          <el-col :span="4" v-if="!editDailyReportMode && list.title === '宽两秒'" style="text-align: left;padding: 0 0">
            <input class="dailyReportInfoInputStyle" type="text" inputmode="numeric" pattern="[0-9]*" v-model="kuanLiangMiaoCount" @input="onDailyReportResultChange" />
          </el-col>
          <el-col :span="1" v-if="!editDailyReportMode && list.title === '宽两秒'" style="margin-top: 10px;text-align: left;padding: 0 0">
            <span>次</span>
          </el-col>
          <el-col :span="4">
            <el-button v-if="editDailyReportMode" icon="el-icon-minus" circle @click="del(index)"></el-button>
          </el-col>
          <el-col :span="5" v-if="!editDailyReportMode && list.title === '早睡'" style="position: relative">
            <el-select v-model="zaoShuiValue" size="medium" class="zaoQiStyle" :class="{'zaoQiStyle2': !zaoShuiTimeVisible}" style="width: 90px;" @change="onDailyReportResultChange">
              <el-option
                  v-for="item in doneUndoneOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="4" v-if="!editDailyReportMode && list.title === '早起'" style="position: relative">
            <el-select v-model="zaoQiValue" size="medium" class="zaoQiStyle" :class="{'zaoQiStyle2': !zaoQiTimeVisible}" style="width: 90px;" @change="onDailyReportResultChange">
              <el-option
                  v-for="item in doneUndoneOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-col>

          <el-col :span="2" v-if="!editDailyReportMode && list.title === '早起' && !zaoQiTimeVisible" style="margin-right: 5px">
            <el-button icon="el-icon-plus" circle @click="addTimeValue(list.title)"
                       style="background: lightcyan;margin-top: 6px;" size="mini"></el-button>
          </el-col>

          <el-col :span="2" v-if="!editDailyReportMode && list.title === '早睡' && !zaoShuiTimeVisible" style="margin-right: 5px">
            <el-button icon="el-icon-plus" circle @click="addTimeValue(list.title)"
                       style="background: lightcyan;margin-top: 6px;" size="mini"></el-button>
          </el-col>

          <el-col :span="5" v-if="!editDailyReportMode && list.title === '早起' && zaoQiTimeVisible">
            <el-time-select
                v-model="zaoQiTime"
                :editable="false"
                size="medium"
                style="width: 200%"
                :picker-options="{
                  start: '03:00',
                  step: '00:15',
                  end: '07:00'
                }"
                placeholder="选择时间"
                @change="onDailyReportResultChange">
            </el-time-select>
          </el-col>

          <el-col :span="5" v-if="!editDailyReportMode && list.title === '早睡' && zaoShuiTimeVisible">
            <el-time-select
                v-model="zaoShuiTime"
                :editable="false"
                size="medium"
                style="width: 200%"
                :picker-options="{
                  start: '19:00',
                  step: '00:15',
                  end: '23:00'
                }"
                placeholder="选择时间"
                @change="onDailyReportResultChange">
            </el-time-select>
          </el-col>

        </el-row>
      </div>
      <el-row>
        <el-col :span="12">
          <el-button v-if="editDailyReportMode" @click="resetDefaultTemplate"
                     style="background: lightcyan;margin-top: 10px">还原默认模板</el-button>
        </el-col>
        <el-col :span="12">
          <el-button v-if="editDailyReportMode" icon="el-icon-plus" circle @click="addEl"
                     style="background: lightcyan;margin-top: 10px"></el-button>
        </el-col>
      </el-row>
      <div style="float: left; margin-bottom: 10px;margin-top: 15px;font-weight: bold;text-align: left">心得体会</div>
      <el-input
          type="textarea"
          :rows="5"
          placeholder="请输入内容"
          @input="onDailyReportResultChange"
          v-model="share" />
      <el-button v-if="!editDailyReportMode" style="float: right;margin-top: 10px;margin-bottom: 10px" @click="submitDailyReport">提交</el-button>
    </el-card>
    <el-dialog title="从模板库中选择" :visible.sync="addTemplateDialogVisible" custom-class="templateStyle">
      <el-checkbox-group v-model="newReportLists">
        <el-row style="margin-top: 10px;font-size: 16px;" v-for="item in allDefaultReportsLists" :key="item.id">
          <el-col :span="10">
            <el-checkbox :label="item.template" style="height:30px;width: 100%;text-align: left;margin-left: 30px">
              <span style="font-size: 16px">{{ cleanTemplateTitle(item.template.split('_')[0]) }}</span>
              <span v-if="item.template.split('_').length > 1 && item.template.split('_')[1]" style="font-size: 14px;color: #909399;margin-left: 4px">{{ item.template.split('_')[1] }}</span>
            </el-checkbox>
          </el-col>
        </el-row>
      </el-checkbox-group>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addTemplateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddTemplate()">确 定</el-button>
      </div>
    </el-dialog>
    <el-row style="float: left; text-align: left; margin-left: 20px;margin-top: 10px">
      <el-col :span="16" style="float: left; font-weight: bold">
        <span>打卡提醒</span>
      </el-col>
      <el-col :span="8">
        <el-switch
            style="float: left; margin-left: 100px;margin-top: 2px;margin-bottom: 80px"
            @change="notificationChange"
            v-model="notification">
        </el-switch>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import axios from "axios";
import qs from "qs";
import wx from 'weixin-js-sdk'
import global from './Common.vue'
import { copyToClipboardSync, copyToClipboard } from '@/utils/clipboard'

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
      addTemplateDialogVisible: false,
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
      hasExistingReportData: false,
      selectedDate: new Date(),
      calendarValue: new Date(),
      share: '',
      note: '',
      notification: false,
      monthsNotesList: [],
      dailyReportRequestId: 0,
      template: {},
      templateId: '0',
      state: '1',
      dailyReportResult: '',
      defaultReportLists1: [],
      defaultReportLists2: [],
      allDefaultReportsLists: [],
      reportLists: [],
      newReportLists: [],

      jingZuoCount: 1, //可以多次站桩, 默认一次
      zhanZhuangCount: 1, //可以多次静坐， 默认一次
      jingzuoValue2: '',
      zhanZhuangValue2: '',
      sutraRead: '',
      sutraStudy: '',

      kuanLiangMiao: '宽两秒',
      kuanLiangMiaoCount: '',
      kuanLiangMiaoOptions: [{
        value: '宽两秒',
        label: '宽两秒'
      }, {
        value: '成人成己',
        label: '成人成己'
      }, {
        value: '大小先后',
        label: '大小先后'
      }],
      zaoShuiValue: '1',
      zaoQiValue: '1',
      zaoQiTimeVisible: false,
      zaoShuiTimeVisible: false,
      zaoQiTime: '05:00',
      zaoShuiTime: '22:00',
      doneUndoneOptions:[{
        value: '1',
        label: '做到'
      }, {
        value: '0',
        label: '未做到'
      }],

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
    Promise.all([
      this.getDefaultReportTemplate1(),
      this.getDefaultReportTemplate2()
    ]).then(() => {
      this.getData()
    })
    this.configWechat()
    this.getMonthInfo()
    this.getLastMonthInfo()
    this.getHalfYearInfo()
    this.getAllDefaultReportsLists()
    this.visitedUser()
  },
  watch: {
    calendarValue(newValue, oldValue) {
      this.handleCalendarValueChange(newValue, oldValue)
    }
  },
  methods: {
    addTimeValue(title) {
      if (title === '早起') {
        this.zaoQiTimeVisible = true
      } else if (title === '早睡') {
        this.zaoShuiTimeVisible =true
      }
      this.onDailyReportResultChange()
    },
    cleanTemplateTitle(title) {
      if (!title) return ''
      return title.replace(/[（(]早[）)]/g, '')
    },
    addValue(title) {
      if (title === '站桩') {
        this.zhanZhuangCount = 2
      } else {
        this.jingZuoCount = 2
      }
    },
    visitedUser() {
      // 使用 sessionStorage 防止同一会话重复计数
      const today = this.getDateFormat(new Date())
      const visitedKey = 'uv_visited_' + today + '_' + this.unionid

      if (sessionStorage.getItem(visitedKey)) {
        return // 今天已记录过，跳过
      }

      let data = qs.stringify({
        date: today,
        userId: this.unionid
      })
      axios({
        method: "POST",
        url: this.serverUrl + "visitedUser",
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(() => {
        sessionStorage.setItem(visitedKey, '1')
      })
    },
    notificationChange() {
      let data = qs.stringify({
        id: this.unionid,
        gender: this.gender,
        notification: this.notification ? '1' : '0',
      })
      axios({
        method: "POST",
        url: this.serverUrl + "update",
        data: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(() => {
        console.log("success")
        this.$quickMessage("每日打卡通知提醒功能已" + (this.notification ? "开启" : "关闭"))
      })
    },
    getDefaultReportTemplate1() {
      return axios({
        method: "GET",
        url: this.serverUrl + 'getAllDefaultTemplate1',
        data: null,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res.data !== null && res.data.length > 0) {
          this.defaultReportLists1 = []
          for (let i = 0; i < res.data.length; i++) {
            let item = {
              title: this.cleanTemplateTitle(res.data[i].template.split('_')[0]),
              unit: res.data[i].template.split('_')[1],
              value: '',
            }
            this.defaultReportLists1.push(item)
          }
        }
      }).catch((err) => {
        console.error('获取初阶默认模板失败:', err)
      });
    },
    getDefaultReportTemplate2() {
      return axios({
        method: "GET",
        url: this.serverUrl + 'getAllDefaultTemplate2',
        data: null,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res.data !== null && res.data.length > 0) {
          this.defaultReportLists2 = []
          for (let i = 0; i < res.data.length; i++) {
            let item = {
              title: this.cleanTemplateTitle(res.data[i].template.split('_')[0]),
              unit: res.data[i].template.split('_')[1],
              value: '',
            }
            this.defaultReportLists2.push(item)
          }
        }
      }).catch((err) => {
        console.error('获取默认模板失败:', err)
      });
    },
    confirmAddTemplate() {
      if (this.newReportLists.length === 0) {
        this.$message.warning('至少添加一项内容！')
        return
      }
      const valueByTitle = {}
      for (let i = 0; i < this.reportLists.length; i++) {
        valueByTitle[this.reportLists[i].title] = this.reportLists[i].value
      }
      this.addTemplateDialogVisible = false
      this.reportLists = []
      for (let i = 0; i < this.newReportLists.length; i++) {
        let title = this.cleanTemplateTitle(this.newReportLists[i].split('_')[0])
        let unit = this.newReportLists[i].split('_').length === 2 ? this.newReportLists[i].split('_')[1] : ''
        let value = valueByTitle[title] != null ? valueByTitle[title] : ''
        let cope = {
          title: title,
          value: value,
          unit: unit,
        }
        this.reportLists.push(cope)
      }
      this.syncNewReportList()
    },
    syncNewReportList() {
      this.newReportLists = []
      for(let i = 0; i < this.reportLists.length; i++) {
        this.newReportLists.push(this.reportLists[i].title + '_' + this.reportLists[i].unit)
      }
    },
    itemInList(item, list) {
      for (let i = 0; i < list.length; i++) {
        if (item === list[i]) {
          return true
        }
      }
      return false
    },
    getAllDefaultReportsLists() {
      axios({
        method: "GET",
        url: this.serverUrl + 'getAllDefaultTemplate',
        data: null,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res.data !== null && res.data.length > 0) {
          this.allDefaultReportsLists = []
          for (let i = 0; i < res.data.length; i++) {
            let item = {
              id: res.data[i].id,
              template: res.data[i].template,
            }
            this.allDefaultReportsLists.push(item)
          }
        }
      });
    },
    normalizeDateString(dateStr) {
      if (!dateStr) return ''
      const parts = String(dateStr).trim().split('-')
      if (parts.length !== 3) return String(dateStr).trim()
      return `${parts[0]}-${String(parts[1]).padStart(2, '0')}-${String(parts[2]).padStart(2, '0')}`
    },
    isFutureCalendarDay(day) {
      return this.isAfterToday(new Date(day))
    },
    isSelectedCalendarDay(day) {
      return this.getDateFormat(new Date(day)) === this.getDateFormat(this.selectedDate)
    },
    onCalendarDayClick(data) {
      if (this.isFutureCalendarDay(data.day)) {
        return
      }
      const nextDate = new Date(data.day)
      if (this.getDateFormat(this.selectedDate) === this.getDateFormat(nextDate)) {
        this.getDailyReportInfoByDate(nextDate)
        return
      }
      this.calendarValue = nextDate
    },
    upsertMonthNoteEntry(date, state, note, templateId) {
      const normalizedDate = this.normalizeDateString(date)
      const entry = {
        date: normalizedDate,
        state: state == null ? '' : String(state),
        note: note == null ? '' : String(note),
        templateId: templateId == null ? '' : String(templateId),
      }
      const index = this.monthsNotesList.findIndex(item => this.normalizeDateString(item.date) === normalizedDate)
      if (index >= 0) {
        this.$set(this.monthsNotesList, index, {
          ...this.monthsNotesList[index],
          ...entry,
        })
      } else {
        this.monthsNotesList.push(entry)
      }
    },
    isToday() {
      let now = new Date()
      return this.selectedDate.getFullYear() === now.getFullYear() && this.selectedDate.getMonth() === now.getMonth() && this.selectedDate.getDate() === now.getDate()
    },
    canEditDailyReportTemplate() {
      if (this.isAfterToday(this.selectedDate)) {
        return false
      }
      return !this.hasExistingReportData
    },
    isAfterToday(val) {
      let value = new Date(val)
      let now = new Date()
      if (value.getFullYear() < now.getFullYear()) return false
      if (value.getFullYear() > now.getFullYear()) return true
      if (value.getMonth() > now.getMonth()) return true
      if (value.getMonth() < now.getMonth()) return false
      return value.getDate() > now.getDate()
    },
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
    getMonthNotes(reloadDailyReport = true) {
      if (this.unionid === null || this.unionid === '' || this.unionid === undefined) {
        return Promise.resolve()
      }
      let currentDate = this.getDateFormat(this.calendarValue)
      let monthDate = currentDate.substr(0, currentDate.lastIndexOf('-') + 1)
      return axios({
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
              date: this.normalizeDateString(res.data[i].date),
              note: res.data[i].note,
              templateId: res.data[i].templateId || '',
              state: res.data[i].state,
            }
            this.monthsNotesList.push(item)
          }
          if (reloadDailyReport) {
            this.getDailyReportInfoByDate(this.selectedDate)
          }
          return
        }

        this.monthsNotesList = []
        let lastDate = this.getLastMonthDateFormat(this.calendarValue)
        let lastMonthDate = lastDate.substr(0, lastDate.lastIndexOf('-') + 1)
        return axios({
          method: "GET",
          url: this.serverUrl + "getReportInfoListByIdAndMonth?userId=" + this.unionid + "&monthDate=" + lastMonthDate,
          data: null,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then((res) => {
          if (res.data !== '' && res.data.length > 0) {
            const lastMonthNotes = res.data.map(row => ({
              date: this.normalizeDateString(row.date),
              note: row.note,
              templateId: row.templateId || '',
              state: row.state,
            }))
            this.initReportTemplateId(lastMonthNotes)
          } else {
            this.initReportTemplateId([])
          }
          if (reloadDailyReport) {
            this.getDailyReportInfoByDate(this.selectedDate)
          }
        })
      })
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
            let title = this.cleanTemplateTitle(res.data[i].split('_')[0])
            let unit = res.data[i].split('_').length === 2 ? res.data[i].split('_')[1] : ''
            let cope = {
              title: title,
              unit: unit,
              value: ''
            }
            this.reportLists.push(cope);
          }
        } else {
          this.reportLists = this.cloneDefaultReportLists()
        }
        this.syncNewReportList()
        this.syncReportTemplateMode()
      });
    },
    initReportTemplateId(sourceList) {
      const notesList = sourceList || this.monthsNotesList
      let templateId = -1
      let preDay = 0
      for (let i = 0; i < notesList.length; i++) {
        let tempDay = parseInt(notesList[i].date.split('-')[2])
        if (preDay < tempDay) {
          if (notesList[i].templateId !== null && notesList[i].templateId !== undefined && notesList[i].templateId !== '') {
            templateId = parseInt(notesList[i].templateId)
            preDay = tempDay
          }
        }
      }
      if (templateId === -1 || isNaN(templateId)) {
        this.reportLists = this.cloneDefaultReportLists()
        this.syncNewReportList()
        this.syncReportTemplateMode()
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
    cloneDefaultReportLists() {
      return JSON.parse(JSON.stringify(this.chujie === '1' ? this.defaultReportLists1 : this.defaultReportLists2))
    },
    extractReportsFromData(resData) {
      const reports = []
      for (let i = 1; i <= 20; i++) {
        reports.push(resData['value' + i])
      }
      return reports
    },
    hasReportValues(reports) {
      if (!reports || reports.length === 0) return false
      for (let i = 0; i < reports.length; i++) {
        if (reports[i] != null && reports[i] !== undefined) {
          return true
        }
      }
      return false
    },
    resolveReportTemplateId(resData) {
      let templateId = resData.templateId
      if ((templateId === undefined || templateId === null || templateId === '')
          && this.monthsNotesList !== null && this.monthsNotesList.length > 0) {
        // 用月份记录中最新的有模板ID的日期作为模板
        let latestIndex = -1
        let latestDay = 0
        for (let i = 0; i < this.monthsNotesList.length; i++) {
          let day = parseInt(this.monthsNotesList[i].date.split('-')[2])
          let tmpTemplateId = this.monthsNotesList[i].templateId
          if (tmpTemplateId && day > latestDay) {
            latestDay = day
            latestIndex = i
          }
        }
        if (latestIndex >= 0) {
          let tmpTemplateId = this.monthsNotesList[latestIndex].templateId
          if (tmpTemplateId) {
            templateId = tmpTemplateId
          }
        }
      }
      return templateId
    },
    resetDailyReportTableFields() {
      this.jingZuoCount = 1
      this.zhanZhuangCount = 1
      this.jingzuoValue2 = ''
      this.zhanZhuangValue2 = ''
      this.kuanLiangMiaoCount = ''
      this.sutraRead = ''
      this.sutraStudy = ''
      this.zaoQiTimeVisible = false
      this.zaoShuiTimeVisible = false
      this.zaoQiValue = '1'
      this.zaoShuiValue = '1'
    },
    applyDailyReportExtraFields(resData) {
      this.sutraRead = resData.sutraRead == null ? '' : String(resData.sutraRead)
      this.sutraStudy = resData.sutraStudy == null ? '' : String(resData.sutraStudy)
      this.zaoQiTime = resData.zaoQiTime
      this.zaoShuiTime = resData.zaoShuiTime
      this.zaoShuiTimeVisible = resData.zaoShuiTimeVisible === '1'
      this.zaoQiTimeVisible = resData.zaoQiTimeVisible === '1'
      this.kuanLiangMiao = resData.kuanLiangMiao ? resData.kuanLiangMiao : '宽两秒'
      this.kuanLiangMiaoCount = resData.kuanLiangMiaoCount || ''
    },
    parseReportCellValue(rawValue, title, unit) {
      if (rawValue == null || rawValue === undefined) return ''
      const str = String(rawValue)
      if (title === '早睡' || title === '早起') {
        return str
      }
      let value = str.replace(title, '')
      value = value.replace(unit, '')
      return value.trim()
    },
    buildReportListsFromTemplateAndReports(templateRows, reports) {
      this.resetDailyReportTableFields()
      const reportLists = []
      for (let i = 0; i < templateRows.length; i++) {
        let title = this.cleanTemplateTitle(templateRows[i].split('_')[0])
        let unit = templateRows[i].split('_').length === 2 ? templateRows[i].split('_')[1] : ''
        let rawValue = i < reports.length ? reports[i] : ''
        let value = this.parseReportCellValue(rawValue, title, unit)
        if (title === '早睡') {
          this.zaoShuiValue = value === '' ? '1' : value
          value = ''
        } else if (title === '早起') {
          this.zaoQiValue = value === '' ? '1' : value
          value = ''
        } else if (value !== '' && value.indexOf('+') > 0 && title === '站桩') {
          this.zhanZhuangCount = 2
          this.zhanZhuangValue2 = value.split('+')[1]
          value = value.split('+')[0]
        } else if (value !== '' && value.indexOf('+') > 0 && (title === '静坐' || title === '禅坐')) {
          this.jingZuoCount = 2
          this.jingzuoValue2 = value.split('+')[1]
          value = value.split('+')[0]
        }
        reportLists.push({
          title: title,
          value: value,
          unit: unit,
        })
      }
      return reportLists
    },
    buildEmptyReportListsFromTemplate(templateRows) {
      this.resetDailyReportTableFields()
      const reportLists = []
      for (let i = 0; i < templateRows.length; i++) {
        let title = this.cleanTemplateTitle(templateRows[i].split('_')[0])
        let unit = templateRows[i].split('_').length === 2 ? templateRows[i].split('_')[1] : ''
        reportLists.push({
          title: title,
          value: '',
          unit: unit,
        })
      }
      return reportLists
    },
    applyLoadedDailyReport(date, resData, templateRows, templateId) {
      this.note = resData.note == null ? '' : String(resData.note)
      this.share = resData.share == null ? '' : String(resData.share)
      this.state = resData.state == null ? '' : String(resData.state)
      this.upsertMonthNoteEntry(date, this.state, this.note, resData.templateId)

      const reports = this.extractReportsFromData(resData)
      this.hasExistingReportData = this.hasReportValues(reports)
      if (this.hasExistingReportData) {
        this.editDailyReportMode = false
      }
      if (templateId != null && templateId !== undefined && templateId !== '') {
        this.templateId = templateId
      }

      if (templateRows != null && templateRows.length > 0) {
        if (this.hasReportValues(reports)) {
          this.reportLists = this.buildReportListsFromTemplateAndReports(templateRows, reports)
          this.applyDailyReportExtraFields(resData)
          this.onDailyReportResultChange()
        } else {
          this.reportLists = this.buildEmptyReportListsFromTemplate(templateRows)
        }
      } else {
        this.reportLists = this.cloneDefaultReportLists()
      }
      this.syncNewReportList()
    },
    fetchReportTemplateRows(templateId) {
      return axios({
        method: "GET",
        url: this.serverUrl + "getReportTemplateById?id=" + templateId,
        data: null,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((resp) => {
        if (resp.data !== '' && resp.data != null && resp.data.length > 0) {
          return resp.data
        }
        return null
      })
    },
    getDailyReportInfoByDate(val) {
      let date = this.getDateFormat(val)
      const requestId = ++this.dailyReportRequestId
      axios({
        method: "GET",
        url: this.serverUrl + "getReportInfoByUserIdAndDate?userId=" + this.unionid + "&date=" + date,
        data: null,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (requestId !== this.dailyReportRequestId) {
          return
        }
        if (res.data === null || res.data === '') {
          this.resetDailyReportTableFields()
          this.note = ''
          this.share = ''
          this.state = ''
          this.hasExistingReportData = false
          this.editDailyReportMode = false
          this.initReportTemplateId()
          return
        }

        const templateId = this.resolveReportTemplateId(res.data)
        const applyWithTemplateRows = (templateRows) => {
          if (requestId !== this.dailyReportRequestId) {
            return
          }
          this.applyLoadedDailyReport(date, res.data, templateRows, templateId)
        }

        if (templateId === null || templateId === undefined || templateId === '') {
          applyWithTemplateRows(null)
          return
        }

        this.fetchReportTemplateRows(templateId).then((templateRows) => {
          applyWithTemplateRows(templateRows)
        }).catch((err) => {
          console.error('获取打卡模板失败:', err)
          if (requestId !== this.dailyReportRequestId) {
            return
          }
          applyWithTemplateRows(null)
        })
      }).catch((err) => {
        console.error('获取打卡记录失败:', err)
      })
    },
    handleCalendarValueChange(newValue, oldValue) {
      if (!newValue) {
        return
      }

      let selectedDate = new Date(newValue)
      let previousDate = oldValue ? new Date(oldValue) : this.selectedDate
      let monthChanged = previousDate.getFullYear() !== selectedDate.getFullYear()
          || previousDate.getMonth() !== selectedDate.getMonth()
      let dateChanged = this.getDateFormat(this.selectedDate) !== this.getDateFormat(selectedDate)

      this.selectedDate = selectedDate
      if (dateChanged) {
        this.editDailyReportMode = false
      }

      if (monthChanged) {
        this.getMonthInfo()
        this.getLastMonthInfo()
        this.getHalfYearInfo()
        this.getMonthNotes()
        return
      }

      if (dateChanged) {
        this.getDailyReportInfoByDate(selectedDate)
      }
    },
    dateChanged(data) {
      if (data.isSelected) {
        this.handleCalendarValueChange(new Date(data.day), this.selectedDate)
      }
      return ''
    },
    submitDailyNote() {
      if (this.isAfterToday(this.selectedDate)) {
        this.$message.warning("当前日期不允许打卡")
        return
      }
      if (this.unionid === null || this.unionid === '' || this.unionid === undefined) {
        this.$message.warning("信息获取失败，请刷新页面重试，注意刷新后数据会丢失！")
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
          const date = this.getDateFormat(this.selectedDate)
          const submittedForToday = this.isToday()
          this.getMonthNotes(false).then(() => {
            this.upsertMonthNoteEntry(date, this.state, this.note)
            if (submittedForToday) {
              this.getDailyReportInfoByDate(this.selectedDate)
            }
          })
          this.$message.success("提交成功！")
        }
      });
    },
    normalizeReportValue(value) {
      if (value === null || value === undefined) return ''
      return String(value).trim()
    },
    parseReportNumber(value) {
      const normalized = this.normalizeReportValue(value)
      if (normalized === '') return null
      if (!/^\d+(\.\d+)?$/.test(normalized)) return NaN
      const num = Number(normalized)
      if (!Number.isFinite(num) || num < 0) return NaN
      return num
    },
    validateDailyReportContent() {
      for (let i = 0; i < this.reportLists.length; i++) {
        const item = this.reportLists[i]
        const title = item.title
        const rawValue = this.normalizeReportValue(item.value)

        if (title === '早睡' || title === '早起') {
          continue
        }

        if (rawValue !== '') {
          const num = this.parseReportNumber(rawValue)
          if (Number.isNaN(num)) {
            return { valid: false, message: '「' + title + '」请填写有效的非负数字' }
          }
        }

        if (title === '站桩' && this.zhanZhuangCount === 2) {
          const val2 = this.normalizeReportValue(this.zhanZhuangValue2)
          if (val2 !== '') {
            const num2 = this.parseReportNumber(val2)
            if (Number.isNaN(num2)) {
              return { valid: false, message: '「站桩」第二次时长请填写有效的非负数字' }
            }
          }
        }

        if ((title === '静坐' || title === '禅坐') && this.jingZuoCount === 2) {
          const val2 = this.normalizeReportValue(this.jingzuoValue2)
          if (val2 !== '') {
            const num2 = this.parseReportNumber(val2)
            if (Number.isNaN(num2)) {
              return { valid: false, message: '「' + title + '」第二次时长请填写有效的非负数字' }
            }
          }
        }

        if (title === '宽两秒') {
          const dailyNum = rawValue === '' ? 0 : this.parseReportNumber(rawValue)
          const totalStr = this.normalizeReportValue(this.kuanLiangMiaoCount)
          if (totalStr !== '') {
            const totalNum = this.parseReportNumber(totalStr)
            if (Number.isNaN(totalNum)) {
              return { valid: false, message: '「' + this.kuanLiangMiao + '」总次数请填写有效的非负数字' }
            }
            if (dailyNum > totalNum) {
              return {
                valid: false,
                message: '「' + this.kuanLiangMiao + '」当日次数（' + dailyNum + '）不能大于总次数（' + totalNum + '），请修改后重新提交'
              }
            }
          }
        }
      }

      return { valid: true, message: '' }
    },
    formatSutraName(text) {
      const val = this.normalizeReportValue(text)
      if (!val) return ''
      if (val.indexOf('《') >= 0) return val
      return '《' + val + (val.indexOf('》') > 0 ? '' : '》')
    },
    shouldIncludeReportInCopy(title, rawValue) {
      if (title === '早睡' || title === '早起') return true
      if (rawValue !== '') return true
      if (title === '诵读经典' && this.normalizeReportValue(this.sutraRead) !== '') return true
      if (title === '经典学习' && this.normalizeReportValue(this.sutraStudy) !== '') return true
      if (title === '宽两秒') return true
      if (title === '站桩' && this.zhanZhuangCount === 2 && this.normalizeReportValue(this.zhanZhuangValue2) !== '') return true
      if ((title === '静坐' || title === '禅坐') && this.jingZuoCount === 2 && this.normalizeReportValue(this.jingzuoValue2) !== '') return true
      return false
    },
    formatReportCopyLine(index, item, rawValue) {
      const title = item.title
      const unit = item.unit || ''
      if (title === '站桩' && this.zhanZhuangCount === 2 && this.normalizeReportValue(this.zhanZhuangValue2) !== '') {
        return index + '. ' + title + '：' + rawValue + '+' + this.normalizeReportValue(this.zhanZhuangValue2) + unit
      }
      if ((title === '静坐' || title === '禅坐') && this.jingZuoCount === 2 && this.normalizeReportValue(this.jingzuoValue2) !== '') {
        return index + '. ' + title + '：' + rawValue + '+' + this.normalizeReportValue(this.jingzuoValue2) + unit
      }
      if (title === '诵读经典') {
        let line = index + '. ' + title + '：'
        if (rawValue !== '') {
          line += rawValue + unit
        }
        const sutra = this.formatSutraName(this.sutraRead)
        if (sutra) {
          line += (rawValue !== '' ? '，诵读' : '诵读') + sutra
        }
        return line
      }
      if (title === '经典学习') {
        let line = index + '. ' + title + '：'
        if (rawValue !== '') {
          line += rawValue + unit
        }
        const sutra = this.formatSutraName(this.sutraStudy)
        if (sutra) {
          line += (rawValue !== '' ? '，学习' : '学习') + sutra
        }
        return line
      }
      if (title === '宽两秒') {
        const kuanLiangMiaoCount = this.normalizeReportValue(this.kuanLiangMiaoCount)
        const displayValue = rawValue === '' || rawValue === '0' ? '0' : rawValue
        return index + '. ' + this.kuanLiangMiao + '：' + displayValue + unit + (kuanLiangMiaoCount !== '' ? '，总' + kuanLiangMiaoCount + '次' : '')
      }
      if (title === '早睡') {
        return index + '. ' + title + '：' + (this.zaoShuiTimeVisible ? this.zaoShuiTime : (this.zaoShuiValue === '1' ? '' : '未') + '做到')
      }
      if (title === '早起') {
        return index + '. ' + title + '：' + (this.zaoQiTimeVisible ? this.zaoQiTime : (this.zaoQiValue === '1' ? '' : '未') + '做到')
      }
      return index + '. ' + title + '：' + rawValue + unit
    },
    collectDailyReportSubmit() {
      const data = {}
      const copyLines = []
      let inputted = false
      let copyIndex = 0

      for (let i = 0; i < this.reportLists.length; i++) {
        const item = this.reportLists[i]
        const title = item.title
        const rawValue = this.normalizeReportValue(item.value)
        const submitValue = rawValue === '' ? '0' : rawValue

        if (submitValue !== '0') {
          inputted = true
        }
        if (title === '诵读经典' && this.normalizeReportValue(this.sutraRead) !== '') {
          inputted = true
        }
        if (title === '经典学习' && this.normalizeReportValue(this.sutraStudy) !== '') {
          inputted = true
        }
        if (title === '站桩' && this.zhanZhuangCount === 2 && this.normalizeReportValue(this.zhanZhuangValue2) !== '') {
          data['value' + (i + 1)] = submitValue + '+' + this.normalizeReportValue(this.zhanZhuangValue2)
        } else if ((title === '静坐' || title === '禅坐') && this.jingZuoCount === 2 && this.normalizeReportValue(this.jingzuoValue2) !== '') {
          data['value' + (i + 1)] = submitValue + '+' + this.normalizeReportValue(this.jingzuoValue2)
        } else if (title === '早睡') {
          data['value' + (i + 1)] = this.zaoShuiValue
        } else if (title === '早起') {
          data['value' + (i + 1)] = this.zaoQiValue
        } else {
          data['value' + (i + 1)] = submitValue
        }

        if (this.shouldIncludeReportInCopy(title, rawValue)) {
          copyIndex++
          copyLines.push(this.formatReportCopyLine(copyIndex, item, rawValue))
        }
      }

      let copyText = ''
      if (copyLines.length > 0) {
        copyText = this.nickname + ' ' + this.getDateFormat(this.selectedDate) + '\n' + copyLines.join('\n')
      }
      if (this.normalizeReportValue(this.share) !== '') {
        copyText += (copyText ? '\n\n' : '') + '分享：' + this.share
      }

      return { data, copyText, inputted }
    },
    buildDailyReportResult() {
      if (this.reportLists === null || this.reportLists.length === 0) return ''
      return this.collectDailyReportSubmit().copyText
    },
    onDailyReportResultChange() {
      this.dailyReportResult = this.buildDailyReportResult()
    },
    showCopyFallbackDialog(text) {
      const safeText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      this.$alert(
        `<div style="white-space:pre-wrap;word-break:break-word;text-align:left;max-height:60vh;overflow-y:auto;">${safeText}</div>`,
        '自动复制失败，请长按以下内容手动复制',
        {
          confirmButtonText: '知道了',
          customClass: 'copy-fallback-dialog',
          dangerouslyUseHTMLString: true,
        }
      )
    },
    copyDailyReportText(text) {
      if (copyToClipboardSync(text)) {
        return Promise.resolve(true)
      }
      return copyToClipboard(text, this)
    },
    submitDailyReport() {
      if (this.isAfterToday(this.selectedDate)) {
        this.$message.warning("当前日期不允许打卡")
        return
      }
      if (this.unionid === null || this.unionid === '' || this.unionid === undefined) {
        this.$message.warning("信息获取失败，请刷新页面重试，注意刷新后数据会丢失！")
        return
      }

      const validation = this.validateDailyReportContent()
      if (!validation.valid) {
        this.$message.warning(validation.message)
        return
      }

      const { data, copyText, inputted } = this.collectDailyReportSubmit()

      if (!inputted) {
        this.$message.warning("汇报内容不能为空！")
        return
      }

      if (!copyText) {
        this.$message.warning("复制内容生成失败，请检查填写内容")
        return
      }

      this.dailyReportResult = copyText
      const copyPromise = this.copyDailyReportText(copyText)

      data['userId'] = this.unionid
      data['templateId'] = this.templateId
      data['date'] = this.getDateFormat(this.selectedDate)
      data['state'] = this.state
      data['note'] = this.note
      data['share'] = this.share
      data['sutraRead'] = this.sutraRead
      data['sutraStudy'] = this.sutraStudy
      data['kuanLiangMiao'] = this.kuanLiangMiao
      data['kuanLiangMiaoCount'] = this.kuanLiangMiaoCount || ''
      if (this.zaoShuiTimeVisible) {
        data['zaoShuiTime'] = this.zaoShuiTime
      }
      if (this.zaoQiTimeVisible) {
        data['zaoQiTime'] = this.zaoQiTime
      }
      data['zaoShuiTimeVisible'] = (this.zaoShuiTimeVisible ? '1' : '0')
      data['zaoQiTimeVisible'] = (this.zaoQiTimeVisible ? '1' : '0')
      data['createTime'] = this.getNowTime(new Date())

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
          const submittedForToday = this.isToday()
          this.getMonthNotes(false).then(() => {
            if (submittedForToday) {
              this.getDailyReportInfoByDate(this.selectedDate)
            }
          })
          copyPromise.then((copied) => {
            if (copied) {
              this.$quickMessage("内容已成功提交并已复制，可粘贴到微信群。", 'success', 2000)
            } else {
              this.$quickMessage("内容已提交，但自动复制失败", 'warning', 2000)
              this.showCopyFallbackDialog(copyText)
            }
          })
          if (this.monthsNotesList !== null && this.monthsNotesList.length === 0) {
            if (this.notification === undefined || this.notification === null || this.notification === '' || this.notification === false) {
              this.$confirm('是否打开通知提醒功能？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                confirmButtonClass: 'confirmButtonClass',
                type: 'info'
              }).then(() => {
                let data = qs.stringify({
                  id: this.unionid,
                  gender: this.gender,
                  notification: '1',
                })
                axios({
                  method: "POST",
                  url: this.serverUrl + "update",
                  data: data,
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                  }
                }).then(() => {
                  console.log("success")
                  this.$message.success("每日打卡通知提醒功能已开启")
                })
              })
            }
          }
        }
      }).catch((err) => {
        console.error('保存功课汇报失败:', err)
        this.$message.error('保存失败，请稍后重试')
      });
    },
    getNowTime(date) {
      let yy = date.getFullYear()
      let mm = date.getMonth() + 1
      if (mm < 10) mm = '0' + mm
      let dd = date.getDate()
      if (dd < 10) dd = '0' + dd
      let hh = date.getHours()
      if (hh < 10) hh = '0' + hh
      let mf = date.getMinutes()
      if (mf < 10) mf = '0' + mf
      let ss = date.getSeconds()
      if (ss < 10) ss = '0' + ss
      return yy + '-' + mm + '-' + dd + ' '+ hh + ':' + mf + ':' + ss
    },
    getState(data) {
      const day = this.normalizeDateString(data.day)
      for (let i = 0; i < this.monthsNotesList.length; i++) {
        if (day === this.normalizeDateString(this.monthsNotesList[i].date)) {
          if (this.monthsNotesList[i].state === null || this.monthsNotesList[i].state === '') return ''
          let sign = String(this.monthsNotesList[i].state) === '0' ? '-' : '+'
          return sign
        }
      }
      return ''
    },
    getDailyNoteFormat(data) {
      let maxLength = 15
      const day = this.normalizeDateString(data.day)
      for (let i = 0; i < this.monthsNotesList.length; i++) {
        if (day === this.normalizeDateString(this.monthsNotesList[i].date)) {
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
      if (!this.editDailyReportMode) {
        this.syncNewReportList()
        this.editDailyReportMode = true
        return
      }
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
          return
        }
        this.templateId = res.data
        this.editDailyReportMode = false
        this.syncNewReportList()
      })
    },
    syncReportTemplateMode() {
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
        this.templateId = res.data
      });
    },
    resetDefaultTemplate() {
      this.reportLists = this.cloneDefaultReportLists()
      this.editDailyReportMode = false
      this.syncNewReportList()
      this.template = {}
      for (let i = 0; i < this.reportLists.length; i++) {
        this.template['template' + (i + 1)] = this.reportLists[i].title.trim() + "_" + this.reportLists[i].unit.trim()
      }
      if (this.template['template1'] === undefined) {
        return
      }
      axios({
        method: "POST",
        url: this.serverUrl + "saveTemplate",
        data: qs.stringify(this.template),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        this.templateId = res.data
        this.getDailyReportInfoByDate(this.selectedDate)
      })
    },
    addEl() {
      if (this.reportLists.length > 19) {
        this.$quickMessage("已达到上限！", "warning")
        return
      }
      this.syncNewReportList()
      this.addTemplateDialogVisible = true
    },
    del(index) {
      this.reportLists.splice(index, 1)
      this.syncNewReportList()
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
          monthSummery: this.lastMonthInfo,
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
        userId: this.unionid,
        date: halfYearFormat,
      }
      axios({
        method: "GET",
        url: this.serverUrl + "getHalfYearInfo?" + qs.stringify(data),
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
        userId: this.unionid,
        date: dateFormat.substr(0, dateFormat.lastIndexOf('-')),
      }
      axios({
        method: "GET",
        url: this.serverUrl + "getMonthInfo?" + qs.stringify(data),
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
        url: this.serverUrl + "getMonthInfo?" + qs.stringify(data),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        if (res != null && res.data != null && res.data !== '') {
          if (res.data.monthSummery != null && res.data.monthSummery !== '') {
            this.lastMonthInfo = res.data.monthSummery
          }
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
      console.log(uid)
      if (uid !== null && uid !== "") {
        uid = uid.replace("\"","").replace("\"","")
      }
      if (uid != null && uid !== '' && uid !== undefined && uid !=='undefined') {
        this.unionid = uid
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
            // 若 unionid 为空，说明用户尚未填写立志卡，用 openid 作为打卡标识
            if (this.unionid === null || this.unionid === '' || this.unionid === undefined) {
              this.unionid = res.data.openid
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
              // 将基础微信信息注册到服务端，保证 admin 统计可查到用户
              this.saveWechatUserInfo({
                id: this.unionid,
                openid: res.data.openid,
                nickname: res.data.nickname,
                headimgurl: res.data.headimgurl,
                province: res.data.province,
                city: res.data.city,
                gender: res.data.sex + ''
              })
              // unionid 刚设置好，重新加载日历数据
              this.getMonthNotes()
              return
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
    syncCanonicalUserId(user) {
      if (!user || !user.id) {
        return
      }
      if (user.openid) {
        this.openid = user.openid
      }
      if (this.unionid !== user.id) {
        this.unionid = user.id
        this.$store.commit('$_setUnionid', this.unionid)
      }
    },
    getUserInfoByUnionId() {
      if (this.unionid === null || this.unionid === '' || this.unionid === undefined) {
        this.$message.warning("信息获取失败，请刷新页面重试！")
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
          this.syncCanonicalUserId(res.data)
          this.name = res.data.name
          this.nickname = res.data.nickname
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
          this.notification = res.data.notification === '1'
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
          // 若 mounted 时 unionid 尚未就绪导致 getMonthNotes 被跳过，这里补充调用
          if (this.monthsNotesList.length === 0) {
            this.getMonthNotes()
          }
        } else {
          // 兼容旧缓存误把 openid 存到 unionid 的情况，先反查真实 unionid 再加载日历。
          axios({
            method: "GET",
            url: this.serverUrl + "getByOpenid?openid=" + this.unionid,
            data: null,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }).then((openidRes) => {
            if (openidRes != null && openidRes.data != null && openidRes.data !== '' && openidRes.data.id) {
              this.syncCanonicalUserId(openidRes.data)
              this.getUserInfoByUnionId()
              return
            }

            this.initNewWechatUser()
          });
        }
      });
    },
    initNewWechatUser() {
      // 未填写立志卡，不强制跳转，允许继续打卡
      // 从 Android 注入的 localStorage 读取用户基础信息（H5 直接从微信 OAuth 拿不到时的兜底）
      const readLocal = key => {
        try { return JSON.parse(localStorage.getItem(key) || 'null') || '' } catch { return '' }
      }
      if (!this.nickname)   this.nickname   = readLocal('htz_nickname')
      if (!this.headimgurl) this.headimgurl = readLocal('htz_headimgurl')
      if (!this.city)       this.city       = readLocal('htz_city')
      if (!this.province)   this.province   = readLocal('htz_province')
      if (!this.gender)     this.gender     = readLocal('htz_gender')

      // 将用户基础信息注册到打卡服务端，保证 admin 统计和打卡圈可查到用户昵称、头像
      this.saveWechatUserInfo({
        id: this.unionid,
        openid: this.openid || '',
        nickname: this.nickname,
        headimgurl: this.headimgurl,
        province: this.province,
        city: this.city,
        gender: this.gender
      })
      // unionid 已设置，重新加载日历数据（mounted 时可能因 unionid 未就绪而跳过）
      this.getMonthNotes()
    },
    // 将微信基础信息注册到服务端，使 getById 对新用户也能返回昵称、头像等信息
    saveWechatUserInfo(data) {
      axios({
        method: "POST",
        url: this.serverUrl + "saveWechatUser",
        data: qs.stringify(data),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).catch(err => {
        console.error('保存微信用户基础信息失败:', err)
      })
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
/* 页面整体背景 */
.tenyears-home-page {
  background: #f5f7fa;
  min-height: 100vh;
}

/* 卡片统一样式优化 */
.tenyears-home-page .el-card {
  border-radius: 10px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
}

.tenyears-home-page .el-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* 倒计时卡片特殊样式 */
.countdown-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
}

.countdown-card span {
  color: white !important;
}

.countdown-card .countdown-days {
  font-size: 28px !important;
  font-weight: bold;
  color: #ffd700 !important;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* 折叠面板优化 */
.tenyears-home-page .el-collapse {
  border: none;
  background: transparent;
}

.tenyears-home-page .el-collapse-item__header {
  background: white;
  border-radius: 10px;
  padding: 0 15px;
  font-weight: bold;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tenyears-home-page .el-collapse-item__wrap {
  border: none;
  background: transparent;
}

.tenyears-home-page .el-collapse-item__content {
  padding: 0;
}

/* 日历样式优化 */
.tenyears-home-page .el-calendar {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: none;
}

.tenyears-home-page .el-calendar__header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  padding: 15px;
}

.tenyears-home-page .el-calendar__title {
  color: white;
  font-weight: bold;
}

.tenyears-home-page .el-calendar__button-group .el-button--plain {
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.3);
  color: white;
}

.tenyears-home-page .el-calendar-table td.is-selected:not(.is-today) {
  background: rgba(255, 152, 0, 0.55);
}

.tenyears-home-page .el-calendar-table td.is-today {
  background: rgba(103, 194, 58, 0.15);
}

.tenyears-home-page .el-calendar-table td.is-today.is-selected {
  background: rgba(103, 194, 58, 0.25);
  box-shadow: inset 0 0 0 2px rgba(244, 67, 54, 0.6);
}

.tenyears-home-page .el-calendar-table .calendar-selected-day {
  border-radius: 6px;
}

/* 按钮样式优化 */
.tenyears-home-page .el-button--default {
  border-radius: 20px;
  border-color: #409eff;
  color: #409eff;
  transition: all 0.3s;
}

.tenyears-home-page .el-button--default:hover {
  background: #409eff;
  color: white;
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
.dailyReportInfoInputStyle {
  border-left-width:0px;
  border-top-width:0px;
  border-right-width:0px;
  border-bottom-width:1px;
  border-bottom-color:lightgray;
  width: 100%;
  height: 100%;
  font-size: 18px;
  text-align: center;
  margin: 10px 0;
  padding: 0 0;
  -webkit-appearance: none;
  border-radius: 0;
}
.dailyReportInfoInputTextStyle {
  border-left-width:0px;
  border-top-width:0px;
  border-right-width:0px;
  border-bottom-width:1px;
  border-bottom-color:lightgray;
  width: 100%;
  height: 100%;
  font-size: 14px;
  text-align: center;
  margin: 15px 0;
  padding: 0 0;
  -webkit-appearance: none;
  border-radius: 0;
}
.zaoQiStyle {
  position:absolute;
  clip:rect(2px 85px 30px 2px);
  left: 0;
  top: 2px;
  width:85px;
  font-size:16px;
}
.zaoQiStyle2 {
  position:absolute;
  clip:rect(2px 85px 30px 2px);
  left: 0;
  top: 2px;
  width:85px;
  font-size:16px;
}
.kuanLiangMiaoStyle {
  width: auto;
  min-width: 80px;
  font-size: 16px;
  vertical-align: middle;
}
.kuanLiangMiaoStyle .el-input__inner {
  border: none;
  background: transparent;
  padding-left: 0;
  padding-right: 25px;
  text-align: right;
  height: 28px;
  line-height: 28px;
  color: #000000;
  font-size: 14px;
}
.kuanLiangMiaoStyle .el-input__suffix {
  right: 0;
  display: flex;
  align-items: center;
  height: 100%;
}
.kuanLiangMiaoStyle .el-select__caret {
  color: #c0c4cc;
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
.disabled-color {
  color: lightgray;
}
.templateStyle {
  width: 80%;
}
.el-checkbox {
  width: 100%;
}
.el-checkbox .el-checkbox__label {
  font-size: 18px;
}
</style>