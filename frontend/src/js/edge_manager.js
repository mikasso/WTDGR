
import Konva  from 'konva'

export default{
    EdgeManager
}

const RightClickType = 3

function EdgeManager(layer){
    this.layer = layer
    this.currentVertex =  null
    this.isDrawing = false
    this.currentLine = null;
}

EdgeManager.prototype.redrawTo = function(x,y){
    this.currentLine.attrs.points[2] =  x;
    this.currentLine.attrs.points[3] = y;
    this.layer.draw();
}

EdgeManager.prototype.startDrawing = function(event){
    if(!isRightClick(event)) 
        return
    this.isDrawing = true;
    this.currentVertex = event.target;

    const start = this.currentVertex.attrs;
    const end = { 
        x: event.evt.layerX,
        y: event.evt.layerY }
    this.currentLine = this.getLine(start, end);
    this.layer.add(this.currentLine);
    this.layer.draw();  
}

EdgeManager.prototype.tryToConnectVertices = function(event){
    if( !isRightClick(event) || this.currentVertex === null) //is not righ click
        return 
    const v1 = event.currentTarget;
    const v2 = this.currentVertex; 
    const cord = v1.attrs;
    this.redrawTo(cord.x, cord.y);
    const edge = {
        v1:  v1,
        v2:  v2,
        line: this.currentLine
    }
    v1.edges.push(edge);
    v2.edges.push(edge);
    this.currentLine = null;
}

EdgeManager.prototype.dragEdges = function(event){
    const vertex = event.target;
    var edge,line,toChange;
    for(var i=0;i<vertex.edges.length;i++){
        edge = vertex.edges[i];
        toChange = 2;
        line = edge.line;

        if(edge.v1.id !== vertex.id)
            toChange = 0;

        line.attrs.points[toChange] = vertex.attrs.x;
        line.attrs.points[toChange+1] = vertex.attrs.y;
    }
    this.layer.draw();
}

EdgeManager.prototype.getLine = function(start,end){
    var line = new Konva.Line({
        points: [start.x, start.y, end.x, end.y],
        stroke: 'black',
        strokeWidth: 2,
        lineCap: 'round',
        lineJoin: 'round',
    });
    return line;
}

EdgeManager.prototype.handleMouseUp = function(){
    this.isDrawing = false;
    this.currentVertex = null;
    if(this.currentLine !== null){
        this.currentLine.destroy();
        this.layer.draw();
        }
}

EdgeManager.prototype.handleMouseMove = function(event) {
    if(this.isDrawing)
        this.redrawTo(event.evt.layerX, event.evt.layerY);            
}

function isRightClick(event){
    return event.evt.which == RightClickType;
}