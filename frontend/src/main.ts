import Vue from "vue";
import App from "./App.vue";
import { BootstrapVue } from 'bootstrap-vue'

Vue.config.productionTip = false;
Vue.prototype.$config = {
  devServer: {
    proxy:{
      '^/graphHub': {
        target: 'https://localhost:44330',
        changeOrigin: true
      }
    }
  }
};

Vue.use(BootstrapVue)

Vue.prototype.Konva = require("konva");
new Vue({
  render: (h) => h(App),
}).$mount("#app");
