import { createApp } from "vue";
import { store, key } from "./store";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import { VueWindowSizePlugin } from "vue-window-size/option-api";
import App from "./App.vue";
import VueClipboard from 'vue-clipboard2'

const app = createApp(App);
app.use(store, key);
app.use(ElementPlus);
app.use(VueWindowSizePlugin);
app.use(VueClipboard);
app.mount("#app");
