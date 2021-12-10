<template>
  <el-dialog
    v-model="isOpened"
    title="Tutorial"
    width="45%"
    center
    :close-on-click-modal="false"
  >
    <div class="tutorial">
      <el-scrollbar height="600px" style="">
        <h3>Drawing vertices</h3>
        <span>
          In order to draw a vertex:
          <ol class="help-list">
            <li>If you are in synchronized room, make sure you have drawing permissions</li>
            <li>Select the <i>Vertex</i> tool from toolbar at the top of the page</li>
            <li>After left-clicking anywhere within the drawing board, new vertex will appear</li>
            <li>You can change the style of drawn verticies using the <i>Styles</i> tab on the toolbar</li>
          </ol>
        </span>
        <div style="margin-top: 50px">
          <h3>Drawing Edges</h3>
          <p>
            In order to draw an edge:
            <ol class="help-list">
              <li>If you are in synchronized room, make sure you have drawing permissions</li>
              <li>Make sure that both verticies that you wish to connect are on the currently selected layer</li>
              <li>Select the <i>Edge</i> tool from toolbar at the top of the page</li>
              <li>Left-click one of the verticies</li>
              <li>Drag the edge holding left mouse button</li>
              <li>Release the button when the drawn edge will be over the second vertex</li>
            </ol>
          </p>
        </div>
        <div style="margin-top: 50px">
          <h3>Dragging verticies and edges</h3>
          <p>
            In order to change position of the graph element:
            <ol class="help-list">
              <li>If you are in synchronized room, make sure you have drawing permissions</li>
              <li>Make sure that the element you are willing to drag is on the currently selected layer</li>
              <li>Select the <i>Select</i> tool from toolbar at the top of the page</li>
              <li>Left-click the element you are willing to drag</li>
              <li>Drag the element holding left mouse button</li>
              <li>Release the button in order to stop dragging the element</li>
              <li>Pencil drawings cannot be dragged</li>
            </ol>
          </p>
        </div>
        <div style="margin-top: 50px">
          <h3>Drawing with the pencil tool</h3>
          <p>
            In order to create a drawing:
            <ol class="help-list">
              <li>If you are in synchronized room, make sure you have drawing permissions</li>
              <li>Select the <i>Pencil</i> tool from toolbar at the top of the page</li>
              <li>You can draw by holding the left mouse button</li>
              <li>You can change the color of the created drawings using the <i>Styles</i> tab on the toolbar</li>
            </ol>
          </p>
        </div>
        <div style="margin-top: 50px">
          <h3>Removing an element</h3>
          <p>
            In order to remove an element:
            <ol class="help-list">
              <li>If you are in synchronized room, make sure you have drawing permissions</li>
              <li>Make sure that the element you are willing to drag is on the currently selected layer</li>
              <li>Select the <i>Erase</i> tool from toolbar at the top of the page</li>
              <li>Left-click on a vertex, edge or a drawing in order to delete it</li>
              <li>Be careful! Deleting operation cannot be undone!</li>
            </ol>
          </p>
        </div>
        <div style="margin-top: 50px">
          <h3>Dragging multiple elements</h3>
          <p>
            In order to drag multiple elements:
            <ol class="help-list">
              <li>If you are in synchronized room, make sure you have drawing permissions</li>
              <li>Make sure that the elements you are willing to drag are on the currently selected layer</li>
              <li>Select the <i>Multiselect</i> tool from toolbar at the top of the page</li>
              <li>Using the left mouse button, draw an area, with all of the verticies you are willing to drag inside</li>
              <li>If any verticies lay within created area, it will remain on the screen</li>
              <li>Without changing a tool, drag the elements by clicking and holding left mouse button on the area</li>
            </ol>
          </p>
        </div>
        <div style="margin-top: 50px">
          <h3>Managing layers</h3>
          <p>
            In order to manage layers:
            <ol class="help-list">
              <li>If you are in synchronized room, make sure you have drawing permissions</li>
              <li>Hover over the <i>Layer 1</i> button on toolbar at the top of the page, layer list will be displayed</li>
              <li>If you want to select the layer, click on one of the layers on the list</li>
              <li>If you want to view the elements drawn on the layer, hover over the layer name on the layer list</li>
              <li>If you want to add another layer, click <i>Add Layer</i> button</li>
              <li>If you want to remove a layer, click the bin icon, next to the layer you are willing to delete</li>
              <li>If you want to reoder layers, click and drag the arrows icon next to the layer</li>
            </ol>
          </p>
        </div>
        <div style="margin-top: 50px">
          <h3>Importing / Exporting graph</h3>
          <p>
            In order to import/export graph:
            <ol class="help-list">
              <li>If you are in synchronized room and want to import graph, make sure you have drawing permissions</li>
              <li>Click the <i>Import / Export graph</i> button on toolbar at the top of the page, dialog will be displayed</li>
              <li>Select format of the file (only one available at the moment)</li>
              <li>Clicking the <i>Download</i> button will result in dowloading a file in selected format, containing drawn graph</li>
              <li>Clicking the <i>Upload</i> button will open a file window, where you can select proper file. If the format validation succeeds, graph will be displayed on the board</li>
            </ol>
          </p>
        </div>
        <div style="margin-top: 50px">
          <h3>Importing / Exporting graph</h3>
          <p>
            In order to import/export graph:
            <ol class="help-list">
              <li>If you are in synchronized room and want to import graph, make sure you have drawing permissions</li>
              <li>Click the <i>Import / Export graph</i> button on toolbar at the top of the page, dialog will be displayed</li>
              <li>Select format of the file (only one available at the moment)</li>
              <li>Clicking the <i>Download</i> button will result in dowloading a file in selected format, containing drawn graph</li>
              <li>Clicking the <i>Upload</i> button will open a file window, where you can select proper file. If the format validation succeeds, graph will be displayed on the board</li>
            </ol>
          </p>
        </div>
        <div style="margin-top: 50px">
          <h3>Managing connection</h3>
          <p>
            In order to manage connection:
            <ol class="help-list">
              <li>Connection dialog will be displayed after loading the page. After closing, you can open it again using the cog icon at the top-right corner of the page</li>
              <li>In order to create a new room, enter your name and click <i>Create</i> button. Room ID will be diplayed above the users list. It is required to join the room</li>
              <li>In order to join existing room, enter your name and room ID and click the <i>Join</i> button</li>
              <li>You can draw without synchronization after clicking <i>Start drawing</i> button</li>
            </ol>
          </p>
        </div>
        <div style="margin-top: 50px">
          <h3>Managing user</h3>
          <p>
            In order to manage user:
            <ol class="help-list">
              <li>These feature is available only to the room creator</li>
              <li>Users list is diplayed on the right side of the page</li>
              <li>Next to each user name the role icon is displayed</li>
              <li>In order to change a role of the user, click in the role icon</li>
            </ol>
          </p>
        </div>
      </el-scrollbar>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "HelpWindow",
  data() {
    return {
      isOpened: false,
    };
  },
  methods: {
    open() {
      this.isOpened = true;
    },
  },
});
</script>

<style scoped lang="scss">
.tutorial {
  border: 1px lightgray solid;
  padding: 0 15px;
  font-size: 16px;
  margin-top: -20px;
}
.help-list{
  li{
    margin-bottom: 8px;
  }
}
</style>
