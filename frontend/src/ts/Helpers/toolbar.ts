export class toolbarObj {
    selected_tool: String = "Select"
    tools: Array<String> = [
      "Select",
      "Vertex",
      "Edge",
      "Custom",
      "Path",
      "Star",
      "Erase",
      "Label",
      "Pencil"
    ]

    vertex_styles: Array<String> = ["circle", "smallcircle"]
    vertex_style: String = "circle"

    edge_styles: Array<String> = ["line", "dashed"]
    edge_style: String ="line"

    directions: Array<String> = ["undirected", "forward", "backwords"]
    direction: String ="undirected"
}