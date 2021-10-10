import { State } from "@/store";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { Store } from "vuex";
import UserAction from "./Action";
import ApiManager from "./ApiHandler";

export default class BoardHub {
  private get user() {
    return this.store.state.user;
  }

  private connection: HubConnection;
  onCloseMethod: (attempt: number) => Promise<void>;
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
    this.connection.on("ReceiveActionResponse", (actionResponse: string) => {
      this.apiManager.receiveActionResponse(actionResponse);
    });

    this.onCloseMethod = this.reJoinRoom;
    const closeHandler = async (that: BoardHub) => {
      that.store.commit("setOffline");
      await that.onCloseMethod(0);
    };
    this.connection.onclose(async () => closeHandler(this));
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

  public joinRoomPromise() {
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

  public disconnectPromise() {
    this.onCloseMethod = () => Promise.resolve();
    return this.connection.stop();
  }

  private async reJoinRoom(attempt: number) {
    console.warn("SignalR: attemp to reconnect");
    await this.joinRoomPromise()
      .then(() => {
        this.store.commit("setOnline");
      })
      .catch((err: Error) => {
        console.error(err);
        setTimeout(
          async () => this.reJoinRoom(attempt + 1),
          Math.pow(2, attempt) * 1000
        );
      });
  }
}
