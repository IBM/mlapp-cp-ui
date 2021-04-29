<template>
  <div>
    
    <v-container grid-list-md>
      <v-toolbar flat>
        <v-toolbar-title>
          <v-icon>history</v-icon>
          Models History
        </v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>

      <div>
        <select v-model="selected_asset_name" style="margin:10px 10px 10px 0;height:40px;padding: 0 10px;border: 1px solid #aaa;">
          <option v-for="(el) in asset_names" :key="el" v-bind:value="el">
            {{el}}
          </option>
        </select>
        <select v-model="selected_asset_label" style="margin:10px 10px 10px 0;height:40px;padding: 0 10px;border: 1px solid #aaa;">
          <option v-for="(el) in model_asset_labels" :key="el" v-bind:value="el">
            {{el}}
          </option>
        </select>
        <select v-model="selected_accuracy_name" style="margin:10px 10px 10px 0;height:40px;padding: 0 10px;border: 1px solid #aaa;">
          <option v-for="(el) in availableAccuracies" :key="el" v-bind:value="el">
            {{el}}
          </option>
        </select>
        <input style="border: 1px solid #999;height:40px;padding:0 10px;background-color:#222;" type="button" value="GO" @click="calculate_graph();">
      </div>

      <div>
          <LineChart :data="getSelectedModel()" :layout="mylayout"></LineChart>
      </div>

    </v-container>
  </div>
</template>

<style lang="scss">
  .margin-top-19 .v-chip__content {
    height: 25px !important;
  }
  .margin-top-19 {
    margin-top: 19px;
  }
  .selected{
    background-image: linear-gradient(90deg, #222, #333);
  }
</style>

<script>
import LineChart from './../../../components/charts/LineChart.vue'

export default {
  data: () => ({
    selected_asset_name: "0",
    selected_asset_label: "0",
    selected_accuracy_name: "",
    graphdata: [],
    mylayout: {},
  }),

  components:{
    LineChart
  },

  computed: {    
    models (){
      return this.$store.getters['models/getModels'];
    },
    model_history (){
      return this.$store.getters['models/getModelsHistory'];
    },
    availableAccuracies (){
      return this.$store.getters['models/getAvailableAccuracies'];
    },
    asset_names(){
      var selectedModels = this.$store.getters['models/getSelectedModels'];

      var i=0;
      var ret = [];
      for (i=0;i<selectedModels.length;i++){
        if (ret.indexOf(selectedModels[i].asset_name) == -1){
          ret.push(selectedModels[i].asset_name);
        }
      }

      return ret;
    },
    model_asset_labels(){
      var selectedModels = this.$store.getters['models/getSelectedModels'];

      var i=0;
      var ret = [];
      for (i=0;i<selectedModels.length;i++){
        if (ret.indexOf(selectedModels[i].asset_label) == -1){
          ret.push(selectedModels[i].asset_label);
        }
      }

      return ret;
    }
  },

  watch: {
  },

  created () {
    this.initialize();

  },

  methods: {
    initialize () {
      this.$store.dispatch('models/fetchModels')
      this.$store.dispatch('models/fetchModelsHistory')
      
    }, 
    getAssetNames (){
      return this.asset_names;
    },   
    getSelectedModel (){
      return this.graphdata;
    },   

    get_model_accuracies(model_id){
      var models = this.models;
      for (var j=0;j<models.length;j++){
        if (models[j].model_id == model_id){
          return models[j].json_metadata.models.scores;
        }
      }
    },    

    calculate_graph (){      
      var model_history = this.model_history;
      var graph = [];


      var relevant_models = [];

      //prepare relevant_models data
      for (var i=0;i<model_history.length;i++){
        if (model_history[i].asset_name == this.selected_asset_name &&
            model_history[i].asset_label == this.selected_asset_label){                
              model_history[i].accuracies = this.get_model_accuracies(model_history[i].model_id);
              relevant_models.push(JSON.parse(JSON.stringify(model_history[i])));
        }
      }

      //sort
      relevant_models.sort(function(a, b) {
        var date_a = new Date(a.created_at);
        var date_b = new Date(b.created_at);
        if (date_b < date_a) return 1
        else return -1;
      });

      graph[0] = {x:[],y:[]}
        
      for (var j=0;j<relevant_models.length;j++){
        graph[0].x.push(relevant_models[j].created_at);
        graph[0].y.push(relevant_models[j].accuracies[this.selected_accuracy_name]);
      }
 
      

      this.graphdata = JSON.parse(JSON.stringify(graph));      

    },   

  }
}
</script>
