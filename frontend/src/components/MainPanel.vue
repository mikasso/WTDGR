<template>
    <b-container fluid class='main-panel'>
      <b-row class='mainrow'>
        <b-col>
          <b-row >
            <Toolbar
              @stateChanged='toolbarState($event)'
              v-model='toolbar'>
            </Toolbar>
          </b-row>
          <b-row>
            <Board 
              class='board'
              ref='BoardComponent'
              :toolbar="toolbar">          
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


<script>
import Board from './Board.vue'
import Toolbar from './Toolbar.vue'

export default {
    name: 'MainPanel',
    mounted(){
    },

    components: {
        Board,
        Toolbar,
    },
    
    data: ()=> ({
        toolbar: null,
    }),

    methods: {
        toolbarState(state){
            this.$refs.BoardComponent.toolbarStateChanged(state);
        },
    },
}
</script>

<style scoped lang='scss'>
    .main-panel{
        height: 100%;
        padding: 0px;
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