import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

export default class BoardHub {
  constructor(apiManager) {
    this.apiManager = apiManager;
    this.connection = new HubConnectionBuilder()
      .withUrl("https://localhost:5001/graphHub")
      .configureLogging(LogLevel.Information)
      .build();

    this.connection.on("ReceiveJoinResponse", (user) => {
      this.user = user;
      console.log(user);
    });
    this.connection.on("ReceiveAction", (action) => {
      this.apiManager.receiveAction(action);
    });
    this.connection.on("ReceiveText", (text) => {
      console.log(text);
    });
  }

  sendAction(action) {
    console.log("sending action");
    console.log(action);
    this.connection
      .invoke("SendAction", action)
      .catch((err) => alert(err.toString()));
  }

  createRoom(username) {
    this.connection.start().then(() => {
      const request = { Name: username };
      this.connection
        .invoke("CreateRoom", request)
        .catch((err) => alert(err.toString()));
    });
  }

  joinRoom({ id, roomId }) {
    this.connection
      .start()
      .then(() => {
        roomId = roomId.toString();
        console.log("Joining room id=" + roomId);
        const request = {
          Id: id,
          Role: "Owner",
          RoomId: roomId,
        };
        this.connection.invoke("JoinRoom", request).catch((err) => {
          alert(err.toString());
          console.log("Error durign joining the room \n" + err);
        });
      })
      .catch((err) => {
        alert(err.toString());
        console.error("Error during joing the hub \n" + err);
      });
  }
}
