<template>
<div id='root'>
    <button v-on:click = "createRoom()"> Create room </button>
     <button v-on:click = "joinRoom()"> Join room </button>
     <div id='board' @contextmenu="rightClickHandle($event)" ></div>
</div>
</template>


<script>
import GraphHub from '../js/hub'

export default {
    name: 'Board',
    mounted: function(){
        this.hub = new GraphHub.Hub( this );
        this.hub.joinRoom(this.getRandomUserName(), '1');

        var width = window.innerWidth * 0.8;
        var height = window.innerHeight * 0.92;
        this.stage = new this.Konva.Stage({
            container: 'board',
            width: width,
            height: height
        });
        this.layer = new this.Konva.Layer();
        this.edgesLayer = new this.Konva.Layer();

        this.stage.add(this.edgesLayer);
        this.stage.add(this.layer);
        this.layer.moveToTop()
        this.stage.on('click', this.createVertex);
        this.stage.on('mouseup', this.mouseUpHandle);
        this.stage.on('mousemove', this.handleMouseMove);

        this.edgeGenerator = {
            vertex: null,
            on: false,
        }
        this.currentLine = null;

    },
    props: {
        toolbar: {
            default: null
        }
    },
    data: () => ({      
    }),
    methods: {
        getRandomUserName(){
            const id = Math.floor((Math.random()*10000)); 
            return 'User_'+id.toString();
        },
        rightClickHandle: function(e) {
            e.preventDefault(); //disable context menu when right click
        },
        mouseUpHandle(){
            console.log('mouse up')
            this.edgeGenerator.on = false;
            this.edgeGenerator.vertex = null;
            if(this.currentLine !== null){
                this.currentLine.destroy();
                this.edgesLayer.draw();
                }
        },
        handleMouseMove(event) {
            if(this.edgeGenerator.on)
                this.reDrawEdegeToXY(event.evt.layerX, event.evt.layerY);            
        },
        toolbarButton(name){
            console.log('Board: ' + name);
        },
        createVertex(event){
            if(event.evt.which !== 1)   //is right
                return;
            const mousePos = this.stage.getPointerPosition();
            const x = mousePos.x;
            const y = mousePos.y;
            var vertex = ({
                type: 'v-circle',
                name: 'unnamed',
                x: Math.round(x),
                y: Math.round(y),
                radius: 10,
                fill: "gray",
                stroke: "black",
                strokeWidth: 2,
                });
            this.hub.sendVertex(vertex);
        },
        getLine(start,end){
                var line = new this.Konva.Line({
                    points: [start.x, start.y, end.x, end.y],
                    stroke: 'black',
                    strokeWidth: 2,
                    lineCap: 'round',
                    lineJoin: 'round',
                });
            return line;
        },
        getKonvaVertex(vertex){
            vertex.draggable = true;
            vertex = new this.Konva.Circle(vertex);
            vertex.on('mousedown', this.startDrawingEdge);
            vertex.on('mouseup', this.tryConnectVertex);
            vertex.on('dragmove',this.dragVertex)
            return vertex;
        },
        dragVertex(event){
            const vertex = event.target;
            for(var i=0;i<vertex.edges.length;i++){
                var toChange = 2;
                const edge = vertex.edges[i];
                var line = edge.line;
                if(edge.v1.id !== vertex.id)
                    toChange = 0;
                line.attrs.points[toChange] = vertex.attrs.x;
                line.attrs.points[toChange+1] = vertex.attrs.y;
            }
            console.log(vertex.attrs.x);
            this.edgesLayer.draw();
        },
        tryConnectVertex(event){
            console.log('mouse up on vertex')
            if(event.evt.which != 3 || this.edgeGenerator.vertex == null) //is not righ click
                return 
            const v1 = event.currentTarget;
            const v2 = this.edgeGenerator.vertex; 
            const cord = v1.attrs;
            this.reDrawEdegeToXY(cord.x, cord.y);
            const edge = {
                v1:  v1,
                v2:  v2,
                line: this.currentLine
            }
            v1.edges.push(edge);
            v2.edges.push(edge);
            this.currentLine = null;
        },
        startDrawingEdge(event){
            if(event.evt.which != 3) //is not righ click
                return
            this.edgeGenerator.on = true;
            this.edgeGenerator.vertex = event.target;

            const start = this.edgeGenerator.vertex.attrs;
            const end = { 
                x: event.evt.layerX,
                y: event.evt.layerY }
            this.currentLine = this.getLine(start, end);
            this.edgesLayer.add(this.currentLine);
            this.edgesLayer.draw();  
        },
        draw(vertexModel){
            var vertex = this.getKonvaVertex(vertexModel);
            vertex.id = parseInt(vertexModel.name);
            vertex.edges = [];
            this.layer.add(vertex)
            this.layer.draw();
        },
        reDrawEdegeToXY(x,y){
            this.currentLine.attrs.points[2] =  x;
            this.currentLine.attrs.points[3] = y;
            this.edgesLayer.draw();
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