<template>
<div id='root'>
  <v-stage :config="configKonva">
    <v-layer>
        <!-- <v-circle :config="configCircle"></v-circle> -->
        <!-- <v-circle v-for="(child, index) in children" v-bind:key='index' :config='child.config'></v-circle> -->
        <template v-for="(child, index) in children" v-bind:index='index'>
            <component :is="child.type" :key="child.name" :config='child.config'></component>
        </template>
    </v-layer>
  </v-stage>
</div>
</template>


<script>

export default {
    name: 'Table',
    mounted(){
        
    },
    props: {
        toolbar: {
            default: null
        }
    },
    data: () => ({
        configKonva: {
            width: (window.innerWidth * 0.8),
            height: (window.innerHeight * 0.92)
        },
        configCircle: {
            x: 100,
            y: 100,
            radius: 70,
            fill: "red",
            stroke: "black",
            strokeWidth: 4
        },
        children: [
            {   
                type: 'v-line',
                name: 'xd3',
                config:{
                    points: [100, 100, 200, 150],
                    stroke: 'black',
                    strokeWidth: 2,
                    lineCap: 'round',
                    lineJoin: 'round',
                }
            },
            {   
                type: 'v-circle',
                name: 'xd',
                config:{
                    x: 100,
                    y: 100,
                    radius: 30,
                    fill: "gray",
                    stroke: "black",
                    strokeWidth: 2,
                    draggable: true,
                }
            },
            {   
                type: 'v-circle',
                name: 'xd2',
                config:{
                    x: 200,
                    y: 150,
                    radius: 30,
                    fill: "gray",
                    stroke: "black",
                    strokeWidth: 2
                }
            },
        ]

        
    }),

    methods: {
        toolbarButton(name){
            console.log('table ' + name);
        }
    }
}
</script>

<style scoped>
.stage{
    width: 100%;
    height: 100%;
}
</style>