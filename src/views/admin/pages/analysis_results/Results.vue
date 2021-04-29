<template>
<div @click="close_all()">
  <v-data-table
  :footer-props="{
      'items-per-page-options': [25, 50, 100]
    }"
    :items-per-page="25"
    :loading="isLoading" loading-text="Loading... Please wait"
    :headers="computedHeaders"
    :items="filteredItems"
    :search="search"
    :sort-by.sync="sortingBy"
    :sort-desc.sync="descending"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar flat>
          <v-toolbar-title>
              <v-icon class="mt-n1 pr-2">insert_chart</v-icon>
              Results
          </v-toolbar-title>
          <v-flex xs2 style="margin-left: 20px;">
            <v-select v-model="asset_label" :items="available_assetlabels" label="Labels" hide-details clearable></v-select>
          </v-flex>
          <v-flex xs3 style="margin-left: 20px;">
            <template>
            <v-select v-model="accuracies" :items="available_accuracies" label="KPI" multiple hide-details clearable>
              <template v-slot:selection="{ item, index }">
                <v-chip v-if="index === 0">
                  <span>{{ item }}</span>
                </v-chip>
                <span v-if="index === 1" class="grey--text caption">(+{{ accuracies.length - 1 }} others)</span>
              </template>
            </v-select>
          </template>
          </v-flex>
          <v-flex xs3 style="margin-left: 20px;">
            <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
          </v-flex>
      </v-toolbar>
    </template>
    <template v-slot:item="{ item }">
        <tr class="table-row" @click="dialogModel(item)" v-bind:class="{ selected: isSelectedModel(item.model_id), highlighted: show_quick_actions==item.model_id }">
          <td>{{ item.model_id }}</td>
          <td>{{ item.asset_name }} {{ item.json_properties.asset_label }}</td>
          <td>{{ item.environment }}</td>
          <td>{{ item.json_properties.deploy_version }}</td>
          <template v-for="(_, index) in accuracies.length">
            <td :key="index">
              {{ item.json_metadata.models && item.json_metadata.models.scores && item.json_metadata.models.scores[accuracies[index]] && item.json_metadata.models.scores[accuracies[index]].toFixed(2) }}
            </td>
          </template>
          <td>{{ item.created_at | moment(timestampFormat()) }}</td>
          <!-- <td @click="showQuickActions(item.model_id)">
            <div class="dots">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
                <div v-if="show_quick_actions==item.model_id" class="quick_actions_window">
                  <p @click="select_model(item)">Select as best model</p>
                  <p @click="action(item, 'forecast')">Forecast</p>
                  <p @click="action(item, 'retrain')">Retrain</p>
                </div>
            </div>
          </td>           -->
        </tr>
    </template>
    <template v-slot:no-data>
      No data is available
    </template>
    <template v-slot:no-results>
        Your search for "{{ search }}" found no results
    </template>
  </v-data-table>
    
  <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
    <ModelProperties :model="current_model" :json_metadata="json_metadata" v-on:closeDialog="closeDialog"></ModelProperties>
  </v-dialog>
</div>
</template>

<style lang="scss">
  .v-select__slot {
    .v-chip {
      height: 20px !important;
    }
  }
  .selected{
    background-image: linear-gradient(90deg, #222, #333);
  }

  .highlighted{
    background-color: #616161;
  }

  .table-row{
    cursor: pointer;
  }

  .dots{
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    height: 100%;
    cursor: pointer;
    .dot{
      display: block;
      width: 4px;
      height: 4px;
      margin: 2px;
      background-color: #fff;
      border-radius: 4px;
    }
    .quick_actions_window{
          position: absolute;
          right: 20px;
          font-size: 16px;
          height: 160px;
          background-color: #fff;
          border: 1px solid #aaa;
          padding: 15px;
          cursor: default;
      p{
        color: #222;
        &:hover{
          cursor: pointer;
          text-decoration: underline;
        }
      }
    }
  }  
</style>

<script>
import ModelProperties from './ModelProperties.vue'

export default {
  data: () => ({
    dialog: false,
    sortingBy: 'created_at',
    descending: true,
    asset_label: null,
    environment: null,
    accuracies: [],
    headers_left: [
      { text: 'Model ID', value: 'model_id'},
      { text: 'Asset Name & Label', value: 'asset_name'},
      // { text: 'Asset Label', value: 'json_properties.asset_label', width: '20%'},
      { text: 'Environment', value: 'environment'},
      { text: 'Version', value: 'build_number'},                      
    ],
    headers_right: [
      { text: 'Created At', value: 'created_at'},
      // { text: '', value: '', width: '60%' },
    ],
    search: '',
    current_model: {},
    json_metadata: {},
    show_quick_actions: null
  }),

  components:{
    ModelProperties
  },

  computed: {    
    selected_models (){
      return this.$store.getters['models/getSelectedModels'] || [];
    },
    processes (){
      return this.$store.getters['models/getModels'] || [];
    },
    available_asset_names (){
      return this.$store.getters['models/getAvailableAssetNames'] || [];
    },
    available_accuracies (){
      return this.$store.getters['models/getAvailableAccuracies'] || [];
    },
    available_assetlabels (){
      return this.$store.getters['models/getAvailableAssetLabels'] || [];
    },
    currentAsset(){
      return this.$store.getters['templates/getCurrentAsset'] || null;
    },
    currentEnv(){
      return this.$store.getters['environments/getCurrentEnv'] || null;
    },
    filteredItems() {
      return this.processes.filter((i) => {
        return (
          (!this.currentAsset || (i.asset_name == this.currentAsset)) &&
          (!this.asset_label || i.json_properties.asset_label == this.asset_label) &&
          (!this.currentEnv || (i.environment == this.currentEnv))
        );
      })
    },
    available_environments (){
      return ['dev','staging','production']; 
    },
    computedHeaders(){
      var addedHeaders = [];
      for(var i = 0; i < this.accuracies.length; i++){
        addedHeaders.push({ text: this.accuracies[i], value: 'json_metadata.models.scores.' + this.accuracies[i], width: '10%'});
      }
      return this.headers_left.concat(addedHeaders).concat(this.headers_right);
    },
    isLoading (){
      return this.$store.getters['models/isLoading'];
    }
  },

  watch: {
  },

  created () {
    this.initialize()
  },

  methods: {
    initialize() {
      this.$store.dispatch('models/fetchTrainModels')
      this.$store.dispatch('models/fetchModelsHistory')
    },
    timestampFormat() {
      return "MMM Do YYYY, HH:mm:ss";
    },
    dialogModel(model){
      this.current_model = JSON.parse(JSON.stringify(model));
      this.json_metadata = this.current_model['json_metadata'];
      this.current_model['json_metadata'] = undefined;
      this.dialog = true;
    },
    closeDialog(){
      this.dialog = false;
    },
    isSelectedModel (id){
      var selected = this.selected_models.filter((i) => {
        return (id === i.model_id);
      });
      return selected.length>0;
    },
    showQuickActions (id){
      event.stopPropagation();
      this.show_quick_actions = id;
    },
    action (item, pipeline) {     
      event.stopPropagation();
      this.show_quick_actions = null;
      var message = {
          config: {
            pipelines_configs: [
              {
                  data_settings: {},
                  model_settings: {},
                  job_settings: {
                      pipeline: pipeline,
                      asset_name: item.asset_name,
                      model_id: item.model_id
                  }
              }
            ],
          },
          env: this.currentEnv
      }
      this.$store.dispatch('queue/sendMessage', message);
    },
    select_model (current_model) {      
      event.stopPropagation();
      this.show_quick_actions = null;
      this.$store.dispatch('models/selectModel', current_model);
    },
    close_all (){
      this.show_quick_actions = null;
    }
  }
}
</script>
