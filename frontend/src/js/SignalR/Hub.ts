import { State } from "@/store";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { NodeConfig } from "konva/types/Node";
import { Store } from "vuex";
import UserAction from "./Action";
import ApiManager from "./ApiHandler";

export default class BoardHub {
  private connection: HubConnection;
  constructor(private apiManager: ApiManager, private store: Store<State>) {
    this.connection = new HubConnectionBuilder()
      .withUrl("http://localhost:5000/graphHub")
      .configureLogging(LogLevel.Information)
      .build();

    this.connection.on("ReceiveJoinResponse", (user) => {
      console.log(user);
    });
    this.connection.on(
      "ReceiveAction",
      (action: UserAction, isSucceded: boolean) => {
        console.log(action);
        this.apiManager.receiveAction(action, isSucceded);
      }
    );
    this.connection.on("GetGraph", (items: NodeConfig[]) => {
      console.log(items);
      this.apiManager.loadItems(items);
    });
    this.connection.on("ReceiveActionResponse", (actionResponse: string) => {
      this.apiManager.receiveActionResponse(actionResponse);
    });
    this.connection.on("ReceiveText", (text: string) => {
      console.log(text);
    });

    this.connection.onclose(() => this.store.commit("setOffline"));
    this.connection.onreconnected(() => this.store.commit("setOnline"));
  }

  public userColor() {
    return this.store.state.userColor;
  }
  private get user() {
    return this.store.state.user;
  }

  public sendAction(action: UserAction) {
    return this.connection
      .invoke("SendAction", action)
      .catch((err: Error) => alert(err.toString()));
  }

  public createRoom(username: string) {
    this.connection.start().then(() => {
      const request = { Name: username };
      this.connection
        .invoke("CreateRoom", request)
        .catch((err: Error) => alert(err.toString()));
    });
  }

  public joinRoom() {
    return this.connection.start().then(() => {
      const request = {
        Id: this.user.userId,
        Role: "Owner",
        RoomId: this.user.roomId,
      };
      this.connection.invoke("JoinRoom", request).catch((err: Error) => {
        throw new Error("Error during joinning the room: " + err);
      });
    });
  }

  public async disconnect() {
    if (this.connection.state == HubConnectionState.Connected)
      return await this.connection.stop();
  }
}
