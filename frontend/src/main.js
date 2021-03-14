import Vue from "vue";
import App from "./App.vue";
import config from "./vue.config";
import "./js/EventsExtensions/events_ext";
import "./js/KonvaExtensions/konva_ext";

Vue.config.productionTip = false;
Vue.prototype.$config = config;

Vue.prototype.Konva = require("konva");
new Vue({
  render: (h) => h(App),
}).$mount("#app");
