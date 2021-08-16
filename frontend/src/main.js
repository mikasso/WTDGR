import Vue from "vue";
import App from "./App.vue";

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

Vue.prototype.Konva = require("konva");
new Vue({
  render: (h) => h(App),
}).$mount("#app");
