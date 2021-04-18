import Vue from "vue";
import App from "./App.vue";
import config from "./vue.config";

Vue.config.productionTip = false;
Vue.prototype.$config = config;

Vue.prototype.Konva = require("konva");
new Vue({
  render: (h) => h(App),
}).$mount("#app");
