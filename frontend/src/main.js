import Vue from 'vue'
import App from './App.vue'
import VueKonva from 'vue-konva'
import config from './config'

Vue.use(VueKonva)
Vue.config.productionTip = false;
Vue.prototype.$config = config;

new Vue({
  render: h => h(App),
}).$mount('#app')
