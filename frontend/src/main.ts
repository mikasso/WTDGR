import Vue from "vue";
import App from "./A"";
import { createApp } from "vue";
import { store, key } from "./store";

Vue.config.productionTip = false;

Vue.prototype.Konva = require("konva");

const app = createApp(App);
app.use(store, key);
app.mount("#app");
