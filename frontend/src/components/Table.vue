<template>
<div id='root'>
  <v-stage ref="stage" :config="configKonva" v-on:click = "createVertex()">
    <v-layer>
        <!-- <v-circle :config="configCircle"></v-circle> -->
        <!-- <v-circle v-for="(child, index) in children" v-bind:key='index' :config='child.config'></v-circle> -->
        <template v-for="(child, index) in children" v-bind:index='index'>
            <component :is="child.type" :key="child.name" :config='child.config'></component>
        </template>
    </v-layer>
  </v-stage>
</div>
</template>


<script>

export default {
    name: 'Table',
    mounted(){
         // Do wyjebania ale pokazuje schemat jak uzywać
                const SignalR = require('@aspnet/signalr');
                var loginToken = "token";
                this.connection = new SignalR.HubConnectionBuilder()
                .withUrl('/graphHub',
                { accessTokenFactory: () => loginToken })
                .configureLogging(SignalR.LogLevel.Information)
                .build()
                this.connection.start()
                .then( () => {
                    var User = {
                        "id": "603bda74d255b2b9a27ffada",
                        "username": "Kortas",
                        "role": "User",
                        "roomId": "603bda5fd255b2b9a27ffad8"
                    }
                    this.connection.invoke("JoinRoom",User)
                    .catch( 
                        (err) => alert(err.toString())
                    )
                    .then( () => {
                        this.connection.on("ReceiveVertex", (Vertex) => {
                            this.draw(Vertex)
                        });
                        this.connection.on("ReceiveText", (text) => console.log(text));  
                    });
                }).catch( (err) =>  alert(err));      
    },
    props: {
        toolbar: {
            default: null
        },
    },
    data: () => ({
        configKonva: {
            width: (window.innerWidth * 0.8),
            height: (window.innerHeight * 0.92)
        },
        configCircle: {
            x: 100,
            y: 100,
            radius: 70,
            fill: "red",
            stroke: "black",
            strokeWidth: 4
        },
        children: [
            {   
                type: 'v-line',
                name: 'xd3',
                config:{
                    points: [100, 100, 200, 150],
                    stroke: 'black',
                    strokeWidth: 2,
                    lineCap: 'round',
                    lineJoin: 'round',
                }
            },
            {   
                type: 'v-circle',
                name: 'xd',
                config:{
                    x: 100,
                    y: 100,
                    radius: 30,
                    fill: "gray",
                    stroke: "black",
                    strokeWidth: 2,
                    draggable: true,
                }
            },
            {   
                type: 'v-circle',
                name: 'xd2',
                config:{
                    x: 200,
                    y: 150,
                    radius: 30,
                    fill: "gray",
                    stroke: "black",
                    strokeWidth: 2
                }
            },
        ]

        
    }),

    methods: {
        toolbarButton(name){
            console.log('table ' + name);
        },
        sendVertex(vertex){
            console.log('sending vertex ' + vertex.name);
             this.connection.invoke("SendVertex", vertex).catch( 
                (err) =>  alert(err.toString()));
        },
        createVertex(){
            const mousePos = this.$refs.stage.getNode().getPointerPosition();
            const x = mousePos.x;
            const y = mousePos.y;
            console.log('create vertex '+x+' '+y);
            var vertex = ({
                type: 'v-circle',
                name: 'xd2',
                config:{
                    x: Math.round(x),
                    y: Math.round(y),
                    radius: 30,
                    fill: "gray",
                    stroke: "black",
                    strokeWidth: 2
                }});
            this.sendVertex(vertex);
        },
        draw(Vertex){
            this.children.push(Vertex);
        }
    }
}
</script>

<style scoped>
.stage{
    width: 100%;
    height: 100%;
}
</style>