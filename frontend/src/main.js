import Vue from 'vue'
import App from './App.vue'
import VueKonva from 'vue-konva'
import config from './config'
import './question-hub'

import { HubConnectionBuilder, LogLevel } from '@aspnet/signalr'
console.log("hello js");
const connection = new HubConnectionBuilder()
  .withUrl('/chathub')
  .configureLogging(LogLevel.Information)
  .build()
connection.start().then( () => {

  connection.on("ReceiveMessage", (user, message) => {
    console.log(message);
  });  

connection.invoke("SendMessage", "user1", "wiadomosc").catch(function (err) {
  alert(err.toString());
});

});

Vue.use(VueKonva)
Vue.config.productionTip = false;
Vue.prototype.$config = config;
new Vue({
  render: h => h(App),
}).$mount('#app')
