import { State, store } from "@/store";
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
import { User, UserRole } from "./User";

export default class BoardHub {
  private connection: HubConnection;
  private apiManager: ApiManager;
  private store: Store<State>;
  private static boardHub: BoardHub;
  private set connectionState(state: HubConnectionState) {
    store.commit("setConnectionState", state);
  }

  public static getBoardHub() {
    if (!BoardHub.boardHub) BoardHub.boardHub = new BoardHub();
    return BoardHub.boardHub;
  }

  private constructor() {
    this.store = store;
    this.apiManager = new ApiManager();
    const config = getAppConfig();
    this.connection = new HubConnectionBuilder()
      .withUrl(config.hubEndPoint)
      .configureLogging(LogLevel.Information)
      .build();
    this.connectionState = HubConnectionState.Disconnected;

    this.connection.on("ReceiveRoomId", (roomId: string) => {
      store.commit("setRoomId", roomId);
      store.commit("setOnline");
    });
    this.connection.on("ReceiveJoinResponse", (hasJoined) => {
      if (hasJoined === true)
        this.requestGraph(); /* Warning should be sent by server and shown */
      else;
    });
    this.connection.on("ReceiveWarninig", (warning: string) => {
      alert(warning);
    });
    this.connection.on(
      "ReceiveAction",
      (action: UserAction, isSucceded: boolean) => {
        this.apiManager.receiveAction(action, isSucceded);
      }
    );
    this.connection.on("ReceiveGraph", (items: NodeConfig[]) => {
      this.apiManager.loadItems(items);
    });
    this.connection.on("ReceiveActionResponse", (actionResponse: string) => {
      this.apiManager.receiveActionResponse(actionResponse);
    });
    this.connection.on("ReceiveUsersList", (users: User[]) => {
      this.store.commit("setAllUsers", users);
    });
    this.connection.onclose(() => {
      this.store.commit("setOffline");
      this.connectionState = HubConnectionState.Disconnected;
    });
    this.connection.onreconnected(() => {
      this.store.commit("setOnline");
      this.connectionState = HubConnectionState.Connected;
    });
    this.connection.onreconnecting(() => {
      this.connectionState = HubConnectionState.Reconnecting;
    });
  }

  public sendAction(action: UserAction) {
    return this.connection
      .invoke("SendAction", action)
      .catch((err: Error) => console.error(err.toString()));
  }

  public async setUserRole(id: string, role: UserRole) {
    await this.connection.invoke("SetUserRole", id, role);
  }

  public requestGraph() {
    return this.connection
      .invoke("GetGraph")
      .catch((err: Error) => console.error(err.toString()));
  }

  public async createRoom() {
    try {
      if (this.connection.state !== HubConnectionState.Connected)
        await this.connection.start();
      try {
        await this.connection.invoke("CreateRoom", this.store.state.user.id);
      } catch (e) {
        return false;
      }
    } catch (e) {
      alert("Error during connecting the server, it might be unavaiable.");
      console.error(e);
      return false;
    }
    return true;
  }

  public async joinRoom(): Promise<boolean> {
    try {
      if (this.connection.state !== HubConnectionState.Connected)
        await this.connection.start();
      const request = {
        Id: this.store.state.user.id,
        UserColor: this.store.state.user.userColor,
        RoomId: this.store.state.roomId,
      };
      try {
        await this.connection.invoke("JoinRoom", request);
        this.connectionState = HubConnectionState.Connected;
      } catch (e) {
        alert("Error during joinning the room ");
        return false;
      }
    } catch (e) {
      alert("Error during connecting the hub ");
      return false;
    }
    return true;
  }

  public async disconnect() {
    if (this.connection.state == HubConnectionState.Connected)
      return await this.connection.stop();
  }
}
