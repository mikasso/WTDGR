import Vue from 'vue'
import App from './App.vue'
import Interactive from 'vector-js';
Vue.config.productionTip = false


Vue.use(Interactive);

new Vue({
  render: h => h(App),
}).$mount('#app')
