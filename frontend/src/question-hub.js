import { HubConnectionBuilder, LogLevel } from '@aspnet/signalr'



console.log("hello js");
const connection = new HubConnectionBuilder()
  .withUrl('https://localhost:44330/hubs/chat')
  .configureLogging(LogLevel.Information)
  .build()
connection.start()