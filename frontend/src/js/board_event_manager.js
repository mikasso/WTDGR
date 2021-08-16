import BoardManager from "./board_manager"

export default class BoardEventManager {
  constructor(parentComponent){
    this.boardManager = new BoardManager(parentComponent, this)
    this.handlers = null
    this.clearHandlers()    
    this.setSelectToolHandlers()
  }

  clearHandlers(){
    this.handlers = {
      click: () => {},
      mouseMove: () => {},
      mouseDown: () => {},
      mouseUp: () => {},
      vertexMouseUp: () => {},
      vertexMouseDown: () => {},
      vertexDrag: () => {},
      edgeClick: () => {},
      pencilClick: () => {},
    }
  }

  bindStageEvents(stage) {
    stage.on("click", (event) => 
      this.handlers.click(event)
    )
    stage.on("mousedown", (event) =>
      this.handlers.mouseDown(event)
    )
    stage.on("mouseup", (event) =>
      this.handlers.mouseUp(event)
    )
    stage.on("mousemove", (event) =>
      this.handlers.mouseMove(event)
    )
  }

  bindVertexEvents(vertex) {
    vertex.on("mousedown", (event) => {
      this.handlers.vertexMouseDown(event)
    })
    vertex.on("mouseup", (event) => {
      this.handlers.vertexMouseUp(event)
    })
    vertex.on("dragmove", (event) => {
      this.handlers.vertexDrag(event)
    })
  }

  bindEdgeEvents(edge) {
    edge.on("click", (event) => {
      this.handlers.edgeClick(event)
    })
  }

  bindPencilEvents(pencil){
    pencil.on("click", (event) => {
      this.handlers.pencilClick(event);
    });
  }

  toolChanged(toolName) {
    this.boardManager.vertexManager.disableDrag(this.boardManager.layerManager.layers)
    this.clearHandlers()
    switch(toolName){
      case "Select":
        this.setSelectToolHandlers()
        break
      case "Vertex":
        this.setVertexToolHandlers()
        break      
      case "Edge":
        this.setEdgeToolHandlers()
        break
      case "Erase":
        this.setEraseToolHandlers()
        break
      case "Pencil":
        this.setPencilToolHandlers()
        break
    }
  }

  setSelectToolHandlers(){
    this.boardManager.enableDrag()
    this.handlers.vertexDrag = (event) => {
      this.boardManager.dragEdges(event.target)
    }
  }

  setVertexToolHandlers(){
    this.handlers.click = (event) => {
      if(!this.isLeftClick(event)) return
      const mousePos = this.boardManager.stage.getPointerPosition()
      this.boardManager.createVertex(mousePos)
    }
  }
  
  setEdgeToolHandlers(){
    this.handlers.mouseUp = () => {
      this.boardManager.stopDrawingEdge()
    }

    this.handlers.mouseMove = (event) => {
      const point = this.getPointFromEvent(event)
      this.boardManager.moveCurrentEdge(point)
    }

    this.handlers.vertexMouseDown = (event) => {
      if (!this.isLeftClick(event)) return
      const vertex = event.target
      this.boardManager.startDrawingEdge(vertex)
    }

    this.handlers.vertexMouseUp = (event) =>{
      const vertex = event.target
      this.boardManager.connectVertexes(vertex) 
    }
  }

  setEraseToolHandlers(){
    this.handlers.vertexMouseDown = (event) => {
      const vertex = event.target
      this.boardManager.eraseVertex(vertex)
    }

    this.handlers.edgeClick = (event) => {
      const edge = event.target
      this.boardManager.eraseEdge(edge)
    }
    
    this.handlers.pencilClick = (event) => {
      const drawing = event.target
      this.boardManager.eraseDrawing(drawing)
    }
  }

  setPencilToolHandlers() {
    this.handlers.mouseDown = (event) => {
      if (!this.isLeftClick(event)) return;
      const mousePos = this.boardManager.stage.getPointerPosition();
      this.boardManager.startPencil(mousePos);
    };
    this.handlers.mouseMove = (event) => {      
      if (!this.isLeftClick(event)) return;
      const mousePos = this.boardManager.stage.getPointerPosition();
      this.boardManager.movePencil(mousePos);
    };
    this.handlers.mouseUp = () => {      
      this.boardManager.finishPencilDrawing();
    };
  }

  toolbarButton(buttonName){    
    switch(buttonName){
      case "Layer":
        this.boardManager.addLayer()        
        break      
    }
  }

  toolbarSelect(selected){    
    switch(selected.type){
      case "layer":
        this.boardManager.selectLayer(selected.value)
        break      
    }
  }

  isLeftClick(event) {
    return event.evt.which === 1
  }

  isRightClick(event) {
    return event.evt.which === 3
  }

  getPointFromEvent(event) {
    return {
      x: event.evt.layerX,
      y: event.evt.layerY,
    }
  }
}