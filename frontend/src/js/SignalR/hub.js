import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

export default class BoardHub {
  constructor(
    apiManager,
    credentials,
    disconnectedCallback,
    connectedCallback
  ) {
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

    this.onCloseMethod = this.reJoinRoom;
    this.connection.onclose(async () => {
      disconnectedCallback();
      await this.onCloseMethod(0);
    });

    this.connection.onreconnected((connectionId) => {
      console.log("Download the room image " + connectionId); ///TODO
      connectedCallback();
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

  async reJoinRoom(attempt) {
    console.warn("SignalR: attemp to reconnect");
    await this.joinRoomPromise().catch((err) => {
      console.error(err);
      setTimeout(
        async () => this.reJoinRoom(attempt + 1),
        Math.pow(2, attempt) * 1000
      );
    });
  }

  joinRoomPromise() {
    return this.connection.start().then(() => {
      const roomId = this.roomId.toString();
      console.log("Joining room id=" + roomId);
      const request = {
        Id: this.userId,
        Role: "Owner",
        RoomId: roomId,
      };
      this.connection.invoke("JoinRoom", request).catch((err) => {
        throw new Error("Error during joinning the room: " + err);
      });
    });
  }

  disconnectPromise() {
    this.onCloseMethod = () => {};
    return this.connection.stop();
  }
}
