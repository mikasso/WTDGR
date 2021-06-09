<template>
    <b-container fluid class='main-panel'>
      <b-row class='mainrow'>
        <b-col class="boardcol">
          <b-row>
            <Toolbar
              @stateChanged='toolbarState($event)'
              class="toolbar"
              ref='ToolbarComponent'>
            </Toolbar>
          </b-row>
          <b-row>
            <Board 
              @layersChanged='layersChanged($event)'
              class='board'
              ref='BoardComponent'>          
            </Board>
          </b-row>
        </b-col>
        <b-col class='usercol'>
          <div class='users'>
            userzy
            <button v-on:click="createRoom()">Create room</button>
            <button v-on:click="joinRoom()">Join room</button>  
          </div>
        </b-col>
      </b-row>
    </b-container>
</template>


<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Board from './Board.vue'
import Toolbar from './Toolbar.vue'

@Component({
  components: {
    Board,
    Toolbar,
  }
})

export default class MainPanel extends Vue {
  name: string = "MainPanel";
  mounted(){
  }

  $refs!: {
    BoardComponent: HTMLFormElement,
    ToolbarComponent: HTMLFormElement,
  }

  layersChanged(state: string){
    this.$refs.ToolbarComponent.layersChanged(state);
  }

  toolbarState(state: string){
    this.$refs.BoardComponent.toolbarStateChanged(state);
  }
}
</script>

<style scoped lang='scss'>
    .main-panel{
        height: 100%;
        padding: 0px;
        .boardcol{
          min-width: 83%;
        }
        .toolbar{
          width: 100%;
        }
        .row{
          margin: 0px 0px;
        }
        .col{
          padding: 0px;
        }
        .mainrow{
          height: 100%;
        }
        .board{
          width: 100%;
        }
        .usercol{
          min-height: 100%;
            border-left: rgb(140, 140, 140) 2px solid ;
        }
    }
</style>
