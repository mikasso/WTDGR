<template>
  <div class="main-panel">
      <Toolbar
        @buttonPressed='toolbarButton($event)'
        v-model='toolbar'>
      </Toolbar>

      <Table 
        class='table'
        ref='tableComponent'
        :toolbar="toolbar">          
      </Table>

      <div class='users'>
          userzy
      </div>
  </div>
</template>


<script>
import Table from './Table.vue'
import Toolbar from './Toolbar.vue'

export default {
    name: 'MainPanel',
    mounted(){

    },

    components: {
        Table,
        Toolbar,
    },
    
    data: ()=> ({
        toolbar: null,
    }),

    methods: {
        toolbarButton({name}){
            console.log(this.toolbar)
            this.$refs.tableComponent.toolbarButton(name);
        }
    },
}
</script>


<style scoped lang='scss'>
    .main-panel{
        width: 100%;
        min-height: 100%;

        display: inline-grid;
        grid-template-columns: auto 20%;
        grid-template-rows: 8% auto;

        .table{
            grid-column-start: 1;
            grid-column-end: 1;
            grid-row-start: 2;            
            grid-row-end: 2;       

            height: 100%;
            width: 100%;
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