<template>
    <div class='toolbar'>
          <div class='tools'>
            <div v-for='(tool, index) in toolbar.tools' v-bind:key='index' 
              class='tool' :class="{selected: tool == selected_tool}"
              @click='selected_tool = tool'>

                <img :src="require('../assets/tools/' + tool + '.png')">
                {{tool}}
            </div>

            <div class="tool" style="margin-left:15px" 
              @click='handleButton("Layer")'>
                Add layer
            </div>

            Layer:
            <select
                class="select"
                v-if="toolbar.currentLayer"
                v-model="toolbar.currentLayer"
                @change='handleSelect("layer", toolbar.currentLayer)'
            >
                <option
                v-for="(layer, index) in toolbar.layers"
                v-bind:key="index"
                :value="layer"
                >          
                {{ layer }}
                </option>
            </select>
          </div>
      </div>
</template>

<script>
export default {
    name: 'Toolbar',
    data: () => ({
        selected_tool: 'Select',
        toolbar: {
            tools: [
                'Select',
                'Vertex',
                'Edge',
                'Pencil',
                'Erase'
            ],

            vertex_styles: [
                'circle',
            ],
            vertex_style: 'circle',

            edge_styles: [
                'line',
            ],
            edge_style: 'line',

            currentLayer: null,
            layers: []

            // directions: [
            //     'undirected',
            //     'forward',
            //     'backwords',
            // ],
            // direction: 'undirected',      
        }  
    }),

    watch: {
        selected_tool: function(){
            this.$emit('toolSelected', this.selected_tool)
        }
    },

    methods: {
        handleButton(buttonName) {
            this.$emit('buttonPressed', buttonName)
        },
        handleSelect(type, value) {
            this.$emit('select', {type: type, value: value})
        },
        layerStateChanged(layerState){
            this.toolbar.currentLayer = layerState.currentLayer.attrs.name
            this.toolbar.layers = []
            for(const layer of layerState.layers){
                if(layer.attrs)
                    this.toolbar.layers.push(layer.attrs.name)
            }
        }
    }
    
}
</script>

<style scoped lang='scss'>
.toolbar{
    grid-column-start: 1;
    grid-column-end: 1;
    grid-row-start: 1;            
    grid-row-end: 1;     

    height: 7vh;
    white-space: nowrap;
    color: black;

    padding: 5px;
    background-color: rgb(250, 250, 250);
    border-bottom: rgb(180, 180, 180) 1px solid ;
    
    .tools{
        width: 100%;
        height: 100%;

        padding: 5px;

        display: flex;
        justify-content: flex-start;
        align-items: center;

        .tool{
            margin-right: 5px;
            min-width: 50px;
            min-height: 30px;
            padding: 0px 10px;

            background-color: white;
            cursor: pointer;
            &:hover{
                background: rgb(240, 240, 240);
            }

            border: rgb(180, 180, 180) 1px solid;
            border-radius: 4px;

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
            background: rgb(230, 230, 230);
            &:hover{
                background: rgb(230, 230, 230);
            }
        }

        .select{
            border: rgb(170, 170, 170) 1px solid;
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
</style>