import Vue from "vue";
import App from "./App.vue";
import { ToggleButton } from "vue-js-toggle-button";
import Vuex from "vuex";

Vue.use(Vuex);
Vue.component("ToggleButton", ToggleButton);
Vue.config.productionTip = false;
Vue.prototype.$config = {
  devServer: {
    proxy: {
      "^/graphHub": {
        target: "https://localhost:44330",
        changeOrigin: true,
      },
    },
  },
};

Vue.prototype.Konva = require("konva");

const store = new Vuex.Store({
  state: {
    isOnline: true,
  },
  getters: {
    isOnline(state) {
      return state.isOnline;
    },
  },
  mutations: {
    setOnline(state) {
      state.isOnline = true;
    },
    setOffline(state) {
      state.isOnline = false;
    },
  },
});

new Vue({
  render: (h) => h(App),
  store: store,
}).$mount("#app");
