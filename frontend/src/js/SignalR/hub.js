import { HubConnectionBuilder , LogLevel } from '@microsoft/signalr'

export default {
    Hub
}

function Hub (board){
    this.board = board; 
    this.connection = new HubConnectionBuilder()
    .withUrl('https://localhost:44330/graphHub')
    .configureLogging(LogLevel.Information)
    .build();

    this.connection.on('ReceiveJoinResponse', (user) =>{
        this.user = user;
        console.log(user); });
    this.connection.on("ReceiveVertex", (vertex) => {
        this.board.receiveVertex(vertex) });
    this.connection.on("ReceiveText", (text) => {
        console.log(text) });
}
    
Hub.prototype.sendVertex = function(vertex){
    console.log('sending vertex ' + vertex.name);
    this.connection.invoke("SendVertex", vertex).catch( 
        (err) =>  alert(err.toString()));
}

Hub.prototype.createRoom = function(username){
    this.connection.start().then( () => {
    const request = { Name: username };
    this.connection.invoke("CreateRoom", request)
    .catch( (err) => alert(err.toString()));
    });
},

/**
 * @param {string} username Unique username in this room 
 * @param {string} roomId Id of the room to join must be string 
 */
Hub.prototype.joinRoom= function(username, roomId ){
    this.connection.start().then( () => {
        roomId = roomId.toString();
        console.log('Joining room id='+roomId)
        const request = { 
            Name: username,  Role: "Owner" , RoomId: roomId};
        console.log(request);
        this.connection.invoke("JoinRoom", request)
        .catch( (err) => 
        {
            alert(err.toString())
            console.log(err);
        });
    });
}
