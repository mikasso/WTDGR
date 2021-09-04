import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import UserAction from "./Action";
import ApiManager from "./ApiHandler";

export default class BoardHub {
  apiManager: any;
  userId: any;
  roomId: any;
  disconnectedCallback: any;
  reconnectedCallback: any;
  connection: any;
  user: any;
  onCloseMethod: (attempt: any) => Promise<void>;
  constructor(
    apiManager: ApiManager,
    credentials: { roomId: string; userId: string },
    disconnectedCallback: () => void,
    reconnectedCallback: () => void
  ) {
    this.apiManager = apiManager;
    this.userId = credentials.userId;
    this.roomId = credentials.roomId;
    this.disconnectedCallback = disconnectedCallback;
    this.reconnectedCallback = reconnectedCallback;
    this.connection = new HubConnectionBuilder()
      .withUrl("https://localhost:5001/graphHub")
      .configureLogging(LogLevel.Information)
      .build();

    this.connection.on("ReceiveJoinResponse", (user: any) => {
      this.user = user;
      console.log(user);
    });
    this.connection.on(
      "ReceiveAction",
      (action: UserAction, isSucceded: boolean) => {
        this.apiManager.receiveAction(action, isSucceded);
      }
    );
    this.connection.on("ReceiveActionResponse", (actionResponse: string) => {
      this.apiManager.receiveActionResponse(actionResponse);
    });

    this.onCloseMethod = this.reJoinRoom;
    const closeHandler = async (that: BoardHub) => {
      that.disconnectedCallback();
      await that.onCloseMethod(0);
    };
    this.connection.onclose(async () => closeHandler(this));
  }

  sendAction(action: UserAction) {
    return this.connection
      .invoke("SendAction", action)
      .catch((err: Error) => alert(err.toString()));
  }

  createRoom(username: string) {
    this.connection.start().then(() => {
      const request = { Name: username };
      this.connection
        .invoke("CreateRoom", request)
        .catch((err: Error) => alert(err.toString()));
    });
  }
  async reJoinRoom(attempt: number) {
    console.warn("SignalR: attemp to reconnect");
    await this.joinRoomPromise()
      .then(() => {
        this.reconnectedCallback();
      })
      .catch((err: Error) => {
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
      this.connection.invoke("JoinRoom", request).catch((err: Error) => {
        throw new Error("Error during joinning the room: " + err);
      });
    });
  }

  disconnectPromise() {
    this.onCloseMethod = () => Promise.resolve();
    return this.connection.stop();
  }
}
