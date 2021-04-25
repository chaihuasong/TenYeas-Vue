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

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'TenYears',
      redirect: '/index',
      meta: {
        title: '十年立志'
      }
    },
    {
      path: '/index',
      name: 'index',
      component: TenYears,
      meta: {
        title: '十年立志'
      }
    },
    {
      path: '/admin',
      name: 'admin',
      component: LoginAdmin,
      meta: {
        title: '登录'
      }
    },
    {
      path: '/home',
      name: 'home',
      component: Admin,
      meta: {
        title: '管理后台'
      },
      children: [
        {
          path: 'modifyHeader',
          name: 'modifyHeader',
          component: ModifyHeader,
          meta: {
            title: '管理后台'
          },
        },
        {
          path: 'modifyFooter',
          name: 'modifyFooter',
          component: ModifyFooter,
          meta: {
            title: '管理后台'
          },
        },
        {
          path: 'infoList',
          name: 'infoList',
          component: InfoList,
          meta: {
            title: '管理后台'
          },
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/wc_redirect',
      name: 'wc_redirect',
      component: Redirect
    }
  ]
})
