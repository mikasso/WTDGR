
import Line from 'konva'

export default{
    EdegeGenerator
}

function EdegeGenerator(layer){
    this.layer = layer
    this.curentVertex =  null
    this.isDrawing = false
    this.currentLine = null;
}

EdegeGenerator.prototype.redrawTo = function(x,y){
    this.currentLine.attrs.points[2] =  x;
    this.currentLine.attrs.points[3] = y;
    this.layer.draw();
}

EdegeGenerator.prototype.startDrawing = function(event){
    if(event.evt.which != 3) //is not righ click
        return
    this.isDrawing = true;
    this.curentVertex = event.target;

    const start = this.curentVertex.attrs;
    const end = { 
        x: event.evt.layerX,
        y: event.evt.layerY }
    this.currentLine = this.getLine(start, end);
    this.layer.add(this.currentLine);
    this.layer.draw();  
}

EdegeGenerator.prototype.tryConnectVertices = function(event){
    console.log('mouse up on vertex')
    if(event.evt.which != 3 || this.curentVertex == null) //is not righ click
        return 
    const v1 = event.currentTarget;
    const v2 = this.currentVertex; 
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
}

EdegeGenerator.prototype.dragEdges = function(event){
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

EdegeGenerator.prototype.getLine = function(start,end){
    var line = new Line({
        points: [start.x, start.y, end.x, end.y],
        stroke: 'black',
        strokeWidth: 2,
        lineCap: 'round',
        lineJoin: 'round',
    });
    return line;
}