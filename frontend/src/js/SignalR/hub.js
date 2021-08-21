import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

export default class BoardHub {
  constructor(apiManager, credentials) {
    this.apiManager = apiManager;
    this.userId = credentials.userId;
    this.roomId = credentials.roomId;
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
    this.connection.on("ReceiveActionResponse", (actionResponse) => {
      this.apiManager.receiveActionResponse(actionResponse);
    });
    this.connection.on("ReceiveText", (text) => {
      console.log(text);
    });

    //Reconnection with exponential time
    let attempt = 0;
    const start = async () => {
      attempt++;
      console.warn("SignalR: attemp to reconnect");
      try {
        this.joinRoom();
      } catch (err) {
        console.error(err);
        setTimeout(start, Math.pow(2, attempt) * 1000);
      }
    };
    this.connection.onclose(async () => {
      await start();
    });
    this.connection.onreconnected((connectionId) => {
      console.log("Download the room image " + connectionId); ///TODO
    });
  }

  sendAction(action) {
    console.log("sending action");
    console.log(action);
    return this.connection
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

  joinRoom() {
    this.connection
      .start()
      .then(() => {
        const roomId = this.roomId.toString();
        console.log("Joining room id=" + roomId);
        const request = {
          Id: this.userId,
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
