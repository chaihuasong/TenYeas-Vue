import Vue from 'vue'
import Router from 'vue-router'
import TenYears from '@/components/TenYears'
import LoginAdmin from '@/components/LoginAdmin'
import Login from '@/components/Login'
import Redirect from '@/components/Redirect'
import Admin from '@/components/Admin'
import ModifyHeader from '@/components/ModifyHeader'
import ModifyFooter from '@/components/ModifyFooter'
import InfoList from '@/components/InfoList'
import UploadRole from "@/components/UploadRole";
import LoginRole from "@/components/LoginRole";
import HomePage from "@/components/HomePage";
import MyHome from "@/components/MyHome";
import Error from "@/components/Error";
import HTQ from "@/components/HTQ";
import DailyReport from "@/components/DailyReport";
import TemplateList from "@/components/TemplateList";

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'TenYears',
      redirect: '/index',
      meta: {
        title: '十年立志',
        footShow: false,
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
          path: 'modifyHeader',
          name: 'modifyHeader',
          component: ModifyHeader,
          meta: {
            title: '管理后台',
            footShow: false,
          },
        },
        {
          path: 'modifyFooter',
          name: 'modifyFooter',
          component: ModifyFooter,
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
          path: 'templateList',
          name: 'templateList',
          component: TemplateList,
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
