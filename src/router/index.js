import Vue from 'vue'
import Router from 'vue-router'
import TenYears from '@/components/TenYears'
import LoginAdmin from '@/components/LoginAdmin'
import Login from '@/components/Login'
import Redirect from '@/components/Redirect'
import Home from '@/components/Admin'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'TenYears',
      redirect: '/index'
    },
    {
      path: '/index',
      name: 'index',
      component: TenYears,
    },
    {
      path: '/admin',
      name: 'admin',
      component: LoginAdmin,
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
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
