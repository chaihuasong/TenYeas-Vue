import Vue from 'vue'
import Router from 'vue-router'
import TenYears from '@/components/TenYears'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'TenYears',
      component: TenYears
    }
  ]
})
