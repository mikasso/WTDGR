import Vue from 'vue'
import App from './App.vue'
import VueKonva from 'vue-konva'
import config from './config'
import './question-hub'

import { HubConnectionBuilder, LogLevel } from '@aspnet/signalr'
console.log("hello js");


var loginToken = "token";
const connection = new HubConnectionBuilder()
  .withUrl('/graphHub', { accessTokenFactory: () => loginToken })
  .configureLogging(LogLevel.Information)
  .build()
connection.start().then( () => {

  var User = {
    "id": "603bda74d255b2b9a27ffada",
    "username": "Kortas",
    "role": "User",
    "roomId": "603bda5fd255b2b9a27ffad8"
  }

  connection.invoke("JoinRoom",User).catch( 
    (err) => alert(err.toString())
  ).then( () => {

    connection.on("ReceiveText", (text) => {
      console.log(text);
    });  

    connection.invoke("SendText", "Hello it's me Mario!").catch( 
      (err) =>  alert(err.toString())
    );

  })

});

Vue.use(VueKonva)
Vue.config.productionTip = false;
Vue.prototype.$config = config;
new Vue({
  render: h => h(App),
}).$mount('#app')
