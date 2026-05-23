import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import router from './router'
import store from  './store'
import VueClipboard from 'vue-clipboard2'
import { showQuickTip } from '@/utils/message'

Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.prototype.$quickMessage = showQuickTip
Vue.use(VueClipboard)

new Vue({
  render: h => h(App),
  router,
  store,
}).$mount('#app')