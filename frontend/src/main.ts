import { createApp } from "vue";
import { store, key } from "./store";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import { VueWindowSizePlugin } from "vue-window-size/option-api";
import App from "./App.vue";

const app = createApp(App);
app.use(store, key);
app.use(ElementPlus);
app.use(VueWindowSizePlugin);
app.mount("#app");
