import Vue from 'vue'
import Router from 'vue-router'
import TenYears from '@/components/TenYears'
import Admin from '@/components/Admin'
import Login from '@/components/Login'
import Redirect from '@/components/Redirect'

Vue.use(Router)

export default new Router({
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
      component: Admin,
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
