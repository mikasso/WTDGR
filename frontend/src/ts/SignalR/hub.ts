import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { VertexConfig } from "../Aliases/aliases";

export class Hub {
  private connection: HubConnection;
  private user: any;
  constructor(private board: any) {
    this.board = board;
    this.connection = new HubConnectionBuilder()
      .withUrl("https://localhost:44330/graphHub")
      .configureLogging(LogLevel.Information)
      .build();

    this.connection.on("ReceiveJoinResponse", (user) => {
      this.user = user;
      console.log(user);
    });
    this.connection.on("ReceiveVertex", (vertex) => {
      this.board.receiveVertex(vertex);
    });
    this.connection.on("ReceiveText", (text) => {
      console.log(text);
    });
  }

  public sendVertex(vertex: VertexConfig) {
    console.log("sending vertex " + vertex.name);
    this.connection
      .invoke("SendVertex", vertex)
      .catch((err) => alert(err.toString()));
  }

  public createRoom(username: string) {
    this.connection.start().then(() => {
      const request = { Name: username };
      this.connection
        .invoke("CreateRoom", request)
        .catch((err) => alert(err.toString()));
    });
  }

  /**
   * @param {string} username Unique username in this room
   * @param {string} roomId Id of the room to join must be string
   */
  public joinRoom(username: string, roomId: string) {
    this.connection.start().then(() => {
      roomId = roomId.toString();
      console.log("Joining room id=" + roomId);
      const request = {
        Name: username,
        Role: "Owner",
        RoomId: roomId,
      };
      console.log(request);
      this.connection.invoke("JoinRoom", request).catch((err) => {
        alert(err.toString());
        console.log(err);
      });
    });
  }
}
