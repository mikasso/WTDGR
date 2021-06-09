export class ToolbarObj {
  selectedTool: string
  tools: Array<string>

  vertexStyles: Array<string>
  vertexStyle: string

  edgeStyles: Array<string>
  edgeStyle: string

  directions: Array<string>
  direction: string

  layers: Array<string>
  currentLayer: string

  pushedButton: string

  constructor(){
    this.selectedTool = "Select"

    this.tools = [
      "Select",
      "Vertex",
      "Edge",
      "Custom",
      // "Path",
      // "Star",
      "Erase",
      // "Label",
      "Pencil",
      // "Layer"
    ]

    this.layers = ["Layer 1"]
    this.currentLayer = "Layer 1"

    // this.vertexStyles = ["circle", "smallcircle"]
    // this.vertexStyle = "circle"
  
    // this.edgeStyles = ["line", "dashed"]
    // this.edgeStyle = "line"
  
    // this.directions = ["undirected", "forward", "backwords"]
    // this.direction ="undirected"
  }
}