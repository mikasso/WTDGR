<template>
  <div class="main-panel">
      <div class='toolbar'>
          <div class='menu'>
              menu
          </div>
          <div class='tools'>
            <div 
            v-for='(tool, index) in toolbar.tools' v-bind:key='index' 
            class='tool' :class="{selected: tool.name == toolbar.selected_tool}"
            @click='toolbar.selected_tool = tool.name'>
                <img :src="tool.img ? require('../assets/' + tool.img + '.png') : ''">
                {{tool.name}}
            </div>
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
                {
                    name: 'Select',
                    img: 'select',
                },
                {
                    name: 'Vertex',
                    img: 'vertex',
                },
                {
                    name: 'Edge',
                    img: 'edge',
                },
                {
                    name: 'Path',
                    img: 'path',
                },
                {
                    name: 'Star',
                    img: 'star',
                },
                {
                    name: 'Erase',
                    img: 'earse',
                },
                {
                    name: 'Label',
                    img: 'label',
                },
            ]
        }
    }),

    methods: {
        getImgUrl(pic) {
            return require(`../assets/'${pic}.png`)
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
        grid-template-rows: 8vh auto;

        .toolbar{
            grid-column-start: 1;
            grid-column-end: 1;
            grid-row-start: 1;            
            grid-row-end: 1;     

            height: 8vh;
            
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

                .tool{
                    margin-right: 5px;
                    min-width: 50px;
                    min-height: 25px;
                    min-height: 25px;
                    padding: 0px 10px;

                    cursor: pointer;

                    border: rgb(210, 210, 210) 2px solid;
                    border-radius: 5px;

                    display: flex;
                    justify-content: center;
                    align-items: center;

                    img{
                        max-height: 22px;
                        max-width: 22px;

                        margin-right: 5px;
                    }
                }

                .selected{
                    background: rgb(220, 220, 220);
                }
            }
        }

        .table{
            grid-column-start: 1;
            grid-column-end: 1;
            grid-row-start: 2;            
            grid-row-end: 2;       
        }

        .users{
            grid-column-start: 2;
            grid-column-end: 2;
            grid-row-start: 1;
            grid-row-end: span 2;
        }
    }
</style>