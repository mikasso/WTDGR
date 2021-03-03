import Vue from 'vue'
import App from './App.vue'
import config from './vue.config'

import VueKonva from 'vue-konva'

Vue.config.productionTip = false;
Vue.prototype.$config = config;

Vue.use(VueKonva)

new Vue({
  render: h => h(App),
}).$mount('#app')