import Vue from 'vue'
import Router from 'vue-router'
import TenYears from '@/components/TenYears'
import LoginAdmin from '@/components/admin/LoginAdmin'
import Login from '@/components/Login'
import Redirect from '@/components/Redirect'
import Admin from '@/components/admin/Admin'
import InfoList from '@/components/admin/InfoList'
import UploadRole from "@/components/UploadRole";
import LoginRole from "@/components/LoginRole";
import HomePage from "@/components/HomePage";
import MyHome from "@/components/MyHome";
import Error from "@/components/Error";
import HTQ from "@/components/HTQ";
import DailyReport from "@/components/DailyReport";
import TenYearsHome from "@/components/TenYearsHome";
import HalfYearInfoList from "@/components/admin/HalfYearInfoList";
import MonthInfoList from "@/components/admin/MonthInfoList";
import TemplateTab from "@/components/settings/TemplateTab";
import TenYearsHtmlTab from "@/components/settings/TenYearsHtmlTab";
import AdminHome from "@/components/admin/AdminHome";
import DailyReportTab from "@/components/admin/DailyReportTab";
import Notification from "@/components/settings/Notification";
import Statistics from "@/components/Statistics";

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'TenYears',
      redirect: '/tenyearsHome',
      meta: {
        title: '十年持志',
        footShow: true,
      }
    },
    {
      path: '/index',
      name: 'index',
      component: TenYears,
      meta: {
        title: '十年立志',
        footShow: false,
      }
    },
    {
      path: '/admin',
      name: 'admin',
      component: LoginAdmin,
      meta: {
        title: '登录',
        footShow: false,
      }
    },
    {
      path: '/homePage',
      name: 'homePage',
      component: HomePage,
      meta: {
        title: '主页',
        footShow: true,
      }
    },
    {
      path: '/myHome',
      name: 'myHome',
      component: MyHome,
      meta: {
        title: '我的',
        footShow: true,
      }
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: Statistics,
      meta: {
        title: '我的',
        footShow: true,
      }
    },
    {
      path: '/tenYearsHome',
      name: 'tenYearsHome',
      component: TenYearsHome,
      meta: {
        title: '十年持志',
        footShow: true,
      }
    },
    {
      path: '/dailyReport',
      name: 'dailyReport',
      component: DailyReport,
      meta: {
        title: '每日打卡',
        footShow: false,
      }
    },
    {
      path: '/htq',
      name: 'htq',
      component: HTQ,
      meta: {
        title: '立志圈',
        footShow: false,
      }
    },
    {
      path: '/home',
      name: 'home',
      component: Admin,
      meta: {
        title: '管理后台',
        footShow: false,
      },
      children: [
        {
          path: 'adminHome',
          name: 'adminHome',
          component: AdminHome,
          meta: {
            title: '管理后台',
            footShow: false,
          },
        },
        {
          path: 'infoList',
          name: 'infoList',
          component: InfoList,
          meta: {
            title: '管理后台',
            footShow: false,
          },
        },
        {
          path: 'reportList',
          name: 'reportList',
          component: DailyReportTab,
          meta: {
            title: '管理后台',
            footShow: false,
          }
        },
        {
          path: 'templateTab',
          name: 'templateTab',
          component: TemplateTab,
          meta: {
            title: '管理后台',
            footShow: false,
          },
        },
        {
          path: 'tenYearsHtmlTab',
          name: 'tenYearsHtmlTab',
          component: TenYearsHtmlTab,
          meta: {
            title: '管理后台',
            footShow: false,
          },
        },
        {
          path: 'halfYearInfoList',
          name: 'halfYearInfoList',
          component: HalfYearInfoList,
          meta: {
            title: '管理后台',
            footShow: false,
          },
        },
        {
          path: 'monthInfoList',
          name: 'monthInfoList',
          component: MonthInfoList,
          meta: {
            title: '管理后台',
            footShow: false,
          },
        },
        {
          path: 'notification',
          name: 'notification',
          component: Notification,
          meta: {
            title: '管理后台',
            footShow: false,
          },
        }
      ]
    },
    {
      path: '/roleHome',
      name: 'roleHome',
      component: UploadRole,
      meta: {
        title: '上传后台',
        footShow: false,
      },
    },
    {
      path: '/role',
      name: 'role',
      component: LoginRole,
      meta: {
        title: '登录',
        footShow: false,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        title: '登录',
        footShow: false,
      },
    },
    {
      path: '/wc_redirect',
      name: 'wc_redirect',
      component: Redirect,
      meta: {
        title: 'loading...',
        footShow: false,
      },
    },
    {
      path: '/*',
      name: 'error',
      component: Error,
      meta: {
        title: '上传后台',
        footShow: false,
      },
    },
  ]
})
