import { State } from "@/store";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { NodeConfig } from "konva/types/Node";
import { Store } from "vuex";
import { getAppConfig } from "../BoardEventManager/utils";
import UserAction from "./Action";
import ApiManager from "./ApiHandler";
export default class BoardHub {
  private connection: HubConnection;
  constructor(private apiManager: ApiManager, private store: Store<State>) {
    const config = getAppConfig();
    this.connection = new HubConnectionBuilder()
      .withUrl(config.hubEndPoint)
      .configureLogging(LogLevel.Information)
      .build();

    this.connection.on("ReceiveJoinResponse", (user) => {});
    this.connection.on(
      "ReceiveAction",
      (action: UserAction, isSucceded: boolean) => {
        this.apiManager.receiveAction(action, isSucceded);
      }
    );
    this.connection.on("GetGraph", (items: NodeConfig[]) => {
      this.apiManager.loadItems(items);
    });
    this.connection.on("ReceiveActionResponse", (actionResponse: string) => {
      this.apiManager.receiveActionResponse(actionResponse);
    });
    this.connection.on("ReceiveText", (text: string) => {});

    this.connection.onclose(() => this.store.commit("setOffline"));
    this.connection.onreconnected(() => this.store.commit("setOnline"));
    this.connection.onreconnecting(() => this.store.commit("setOffline"));
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
      .catch((err: Error) => console.error(err.toString()));
  }

  public createRoom(username: string) {
    this.connection.start().then(() => {
      const request = { Name: username };
      this.connection
        .invoke("CreateRoom", request)
        .catch((err: Error) => alert(err.toString()));
    });
  }

  public joinRoom(roomId: string) {
    return this.connection.start().then(() => {
      const request = {
        Id: this.store.state.user.userId,
        Role: "Owner",
        RoomId:  roomId,
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
