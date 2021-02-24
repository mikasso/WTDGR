<template>
  <div class="main-panel">
      <div class='toolbar'>
          <div class='menu'>
              górne menu
          </div>
          <div class='tools'>
            <div v-for='(tool, index) in toolbar.tools' v-bind:key='index' 
              class='tool' :class="{selected: tool == toolbar.selected_tool}"
              @click='toolbar.selected_tool = tool'>

                <img :src="require('../assets/tools/' + tool + '.png')">
                {{tool}}
            </div>

            <div class='tool'
              style='margin-left:15px;'
              @click='undo()'>
                <img src='../assets/buttons/undo.png'>
                Undo
            </div>
            <div class='tool'
              style='margin-right:15px;'
              @click='redo()'>
                <img src='../assets/buttons/redo.png'>
                Redo
            </div>

            Vertex style:
            <select class='select'
              v-model='toolbar.vertex_style'>
                <option v-for='(style, index) in toolbar.vertex_styles' v-bind:key='index'
                  :value='style'>
                    <img :src="require('../assets/vertex_styles/' + style + '.png')">
                    {{style}}
                </option>
            </select>
            Edge style:
            <select class='select'
              v-model='toolbar.edge_style'>
                <option v-for='(style, index) in toolbar.edge_styles' v-bind:key='index'
                  :value='style'>
                    {{style}}
                </option>
            </select>
            Direction:
            <select class='select'
              v-model='toolbar.direction'>
                <option v-for='(style, index) in toolbar.directions' v-bind:key='index'
                  :value='style'>
                    {{style}}
                </option>
            </select>
          </div>
      </div>

      <div class='table'>
          tablica
      </div>

      <div class='users'>
          userzy
      </div>
  </div>
</template>


<script>
export default {
    name: 'MainPanel',
    mounted(){

    },
    
    data: ()=> ({
        toolbar: {
            selected_tool: 'Select',
            tools: [
                'Select',
                'Vertex',
                'Edge',
                'Path',
                'Star',
                'Erase',
                'Label'
            ],

            vertex_styles: [
                'circle',
                'smallcircle'
            ],
            vertex_style: 'circle',

            edge_styles: [
                'line',
                'dashed'
            ],
            edge_style: 'line',

            directions: [
                'undirected',
                'forward',
                'backwords',
            ],
            direction: 'undirected',
        }
    }),

    methods: {
        undo(){

        },
        redo(){

        }
    }

}
</script>


<style scoped lang='scss'>
    .main-panel{
        width: 100%;
        min-height: 100%;

        display: inline-grid;
        grid-template-columns: auto 20%;
        grid-template-rows: 9vh auto;

        .toolbar{
            grid-column-start: 1;
            grid-column-end: 1;
            grid-row-start: 1;            
            grid-row-end: 1;     

            height: 7vh;
            white-space: nowrap;

            padding: 5px;
            background-color: rgb(250, 250, 250);
            border-bottom: rgb(140, 140, 140) 1px solid ;
            
            .menu{
                width: 100%;
                height: 30%;
            }
            .tools{
                width: 100%;
                height: 50%;

                padding: 5px;

                display: flex;
                justify-content: flex-start;
                align-items: center;

                .tool{
                    margin-right: 5px;
                    min-width: 50px;
                    min-height: 30px;
                    padding: 0px 10px;

                    cursor: pointer;
                    &:hover{
                        background: rgb(240, 240, 240);
                    }

                    border: rgb(180, 180, 180) 1px solid;
                    border-radius: 5px;

                    display: flex;
                    justify-content: center;
                    align-items: center;

                    img{
                        max-height: 22px;
                        max-width: 22px;

                        margin-right: 3px;
                    }
                }

                .selected{
                    background: rgb(220, 220, 220);
                    &:hover{
                        background: rgb(220, 220, 220);
                    }
                }

                .select{
                    border: rgb(210, 210, 210) 1px solid;
                    border-radius: 5px;

                    min-width: 50px;
                    min-height: 30px;

                    margin-right: 15px;
                    margin-left: 3px;

                    img{
                        max-height: 18px;
                        max-width: 18px;

                        margin-right: 3px;
                    }
                }
            }
        }

        .table{
            grid-column-start: 1;
            grid-column-end: 1;
            grid-row-start: 2;            
            grid-row-end: 2;       

            height: 100%;
        }

        .users{
            grid-column-start: 2;
            grid-column-end: 2;
            grid-row-start: 1;
            grid-row-end: span 2;

            border-left: rgb(140, 140, 140) 2px solid ;
        }
    }
</style>