import Vue from 'vue'
import Router from 'vue-router'
import TenYears from '@/components/TenYears'
import Admin from '@/components/Admin'

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
      component: TenYears
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin
    }
  ]
})
