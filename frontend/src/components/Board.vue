<template>
<div id='root'>
    <button v-on:click = "createRoom()"> Create room </button>
     <button v-on:click = "joinRoom()"> Join room </button>
     <div id='board' @contextmenu="blockContextMenu($event)" ></div>
</div>
</template>


<script>
import GraphHub from '../js/hub'
import EdgeManager from '../js/edge_manager'
import VertexManager from '../js/vertex_manager'

export default {
    name: 'Board',
    mounted: function(){
        this.hub = new GraphHub.Hub( this );
        this.hub.joinRoom(this.getRandomUserName(), '1');
        // Create and configure stage, layers, to draw
        this.stage = new this.Konva.Stage (this.stageConfig);
        this.vertexLayer = new this.Konva.Layer();
        this.edgesLayer = new this.Konva.Layer();
        this.configLayers();
        this.bindStage();
        // Create managers objects to manage vertices and lines
        this.edgeManager = new EdgeManager.EdgeManager(this.edgesLayer);
        this.vertexManager = new VertexManager.VertexManager(this.vertexLayer);
    },
    props: {
        toolbar: {
            default: null
        }
    },
    data: () => ({ 
        stageConfig: {
                container: 'board',
                width:  window.innerWidth * 0.8,
                height:  window.innerHeight * 0.92
        }     
    }),
    methods: {
        getRandomUserName(){
            const id = Math.floor((Math.random()*10000)); 
            return 'User_'+id.toString();
        },
        blockContextMenu: function(e) {
            e.preventDefault(); //disable context menu when right click
        },
        handleClik(event){
            if(event.evt.which !== 1)   //is not right click
                return 
            const mousePos = this.stage.getPointerPosition();
            const vertex = this.vertexManager.getConfig(mousePos);
            this.hub.sendVertex(vertex)
        },
        toolbarButton(name){
            console.log('Board: ' + name);
        },
        bindStage(){
        this.stage.on('click', (event) => 
            this.handleClik(event));

        this.stage.on('mouseup',(event) =>
            this.edgeManager.handleMouseUp(event));
        
        this.stage.on('mousemove', (event) => 
            this.edgeManager.handleMouseMove(event));
        },
        configLayers(){  
            this.stage.add(this.edgesLayer);
            this.stage.add(this.vertexLayer);
            this.vertexLayer.moveToTop()
        },
        bindVertexEvents(vertex){
            vertex.on('mousedown', (event) => 
                this.edgeManager.startDrawing(event));
            
            vertex.on('mouseup', (event) => 
                this.edgeManager.tryToConnectVertices(event));
            
            vertex.on('dragmove', (event) =>
                this.edgeManager.dragEdges(event));
        },
        receiveVertex(config){
            const vertex = this.vertexManager.create(config)
            this.bindVertexEvents(vertex);
            this.vertexManager.draw(vertex);
        },
    }
}
</script>

<style scoped>
.stage{
    width: 100%;
    height: 100%;
}
</style>